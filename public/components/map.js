import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/styles.css';
import TruckSearch from './truck-search.js';
import request from '../util/rest-helpers.js';
import NearMeButton from './near-me-button.js';
import WalkingTimeForm from './walking-time-form.js';
import ClosestListEntry from './closest-list-entry.js';
import { Grid, Col, Row, Panel, Jumbotron, Image, Button } from 'react-bootstrap';

export default class GoogleMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: [],
      mainMarker: [],
      trucks: [],
      closestTrucks: [],
      previousSelection: [],
      previousDirections: [],
      distThreshold: '',
    };
  }

//Initializes and Sets up Map and sets Marker to SF lat and lng
//Sends Get Request to fetch Food Truck Data, adds them to Map, and finds Closest Trucks
  componentDidMount() {
    console.log('Initializing Map...');
    let mapOptions = {
      center: this.mapCenterLatLng(),
      zoom: this.props.initialZoom
    },
    //create map
    map = new google.maps.Map(this.refs.map, mapOptions);
    //create search marker
    let marker = new google.maps.Marker({
      position: this.mapCenterLatLng(),
      title: "Choosen Location",
      map
    });
    //set location for location autocomplete searchbar
    const input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    //set map and mainMarker
    this.setState({ map: this.state.map.concat([map]), mainMarker: this.state.mainMarker.concat([marker]) });
    //add autocomplete functionality
    this.addAutocomplete(map);
    //get Food Trucks list
    request.post('/api/sfFoodTrucks', {}, (err, res) => {
      if (err) { console.log("Error getting food truck list (Map Component: ", err); }
      console.log('Getting list of food trucks...')
      let trucks = res.body;
      this.addMarkers(map, trucks);
      this.findClosest();
    });
  }

//Adds Autocomplete to Map Places Search Bar and updates Markers accordingly
  addAutocomplete (map) {
    //Grab input box and add autocomplete
    const input = document.getElementById('pac-input');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    let infowindow = new google.maps.InfoWindow();
    let marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });
    //add listener for when user selects location
    autocomplete.addListener('place_changed', () => {
      infowindow.close();
      marker.setVisible(false);
      let place = autocomplete.getPlace();

      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      let address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }
      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, marker);
      autocomplete.setTypes(['address', 'establishment', 'geocode']);
      //remove old place marker from state and add new one
      this.updateMainMarker(marker);
      if (this.state.previousDirections.length) {
        this.state.previousDirections.pop().setMap(null);
      }
      if (this.state.previousSelection.length) {
        let previous = this.state.previousSelection.pop();
        previous.infowindow.close(map, previous.marker);
      }
      this.addAutocomplete(map);
    });
  }

//Sets initial LatLng Object
  mapCenterLatLng () {
    let props = this.props;
    return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
  }

//Adds All Truck Markers to map
  addMarkers (map, trucks) {
    console.log('Adding truck markers to map...');
    let center = this.state.mainMarker[0].getPosition();
    let markers = [];
    for (let i = 0; i < trucks.length; i++) {
      let truckPosition = new google.maps.LatLng(trucks[i].latitude, trucks[i].longitude)
      let dist = google.maps.geometry.spherical.computeDistanceBetween(center, truckPosition);
      if (!isNaN(dist)) {
        let truck = trucks[i];
        markers.push({
          info: truck,
          marker: this.formatMarker(truck, map),
        });
      }
    }
    this.setState({trucks: this.state.trucks.concat(markers) });
  }

//Formats Truck Markers with info window, icon, and listeners
  formatMarker (truck, map) {
    //icon hosted from my google drive
    let icon = 'https://049d1e9f5c8486fa15c905c1c2e7feafadc697fd-www.googledrive.com/host/0B781CHOXBe3wVjBPNFZzLVlNRVk/foodTruck.png';

    let infowindow = this.setInfoWindowContent(truck);
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(truck.latitude, truck.longitude),
      title: truck.applicant,
      icon,
      map
    });
    marker.addListener('mouseover', () => {
      infowindow.open(map, marker);
    });
    marker.addListener('mouseout', () => {
      infowindow.close(map, marker);
    });
    marker.addListener('dblclick', () => {
      let truckObj = {
        info: truck,
        marker
      };
      this.goToTruck(truckObj);
    });
    return marker;
  }

//Sets info window content for each Truck Marker
  setInfoWindowContent (truck) {
    let contentString = (
      '<div id="content">'+
        '<div id="siteNotice"></div>'+
        '<h2 id="firstHeading" class="firstHeading">' + truck.applicant + '</h2>'+
        '<div id="bodyContent">'+
          '<h5>' + truck.fooditems + '</h5>'+
          '<p>Hours: '+ truck.dayshours +'</p>'+
          '<p>Address: '+ truck.address + '</p>' +
        '</div>'+
      '</div>'
    );
    let infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    return infowindow;
  }

//Finds and Updates list of closest Food Trucks to Main Marker location
  findClosest (e) {
    let threshold = this.state.distThreshold || 10;
    console.log('Finding food trucks within a ' + threshold + ' minute walk...');
    let center = this.state.mainMarker[0].getPosition();
    let trucks = this.state.trucks;
    let closest = [];
    for (let i = 0; i < trucks.length; i++) {
      let dist = google.maps.geometry.spherical.computeDistanceBetween(center, trucks[i].marker.getPosition());
      if (dist < Math.abs(threshold) * 25) {
        closest.push(trucks[i]);
      }
    }
    this.setState({ closestTrucks: closest});
    if (e) {
      e.preventDefault();
    }
  }

//Resets the Main Marker
  updateMainMarker(marker) {
    console.log('Setting new main marker location...');
    this.state.mainMarker.pop().setMap(null);
    this.setState({mainMarker: this.state.mainMarker.concat([marker])});
    this.findClosest();
  }

//Centers the Map on selected Truck
  goToTruck(truck) {
    console.log('Going to truck ', truck.info.applicant, ' at ', truck.info.address + '. Setting route...');
    let map = this.state.map[0];
    let marker = truck.marker;
    let previous = this.state.previousSelection.pop();
    let infowindow = this.setInfoWindowContent(truck.info);
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    if (this.state.previousDirections.length) {
      this.state.previousDirections.pop().setMap(null);
    }
    directionsDisplay.setMap(map);
    directionsService.route({
      origin: marker.getPosition(),
      destination: this.state.mainMarker[0].getPosition(),
      travelMode: google.maps.TravelMode.WALKING
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
    if (previous) {
      previous.infowindow.close(map, previous.marker);
    }
    infowindow.open(map, marker);
    map.panTo(marker.getPosition());
    this.setState({
      previousSelection: this.state.previousSelection.concat([{ marker, infowindow }]),
      previousDirections: this.state.previousDirections.concat([directionsDisplay])
     });
  }

//Updates Map Location based of Food Truck search result
  handleTruckSearch(truck) {
    let map = this.state.map[0];
    let trucks = this.state.trucks;
    let dividerIndex = truck.indexOf('@');
    let address = truck.slice(dividerIndex + 2);
    let applicant = truck.slice(0, dividerIndex - 1);
    let previous = this.state.previousSelection.pop();
    for (let i = 0; i < trucks.length; i++ ) {
      if (trucks[i].info.applicant === applicant && trucks[i].info.address === address ) {
        let marker = trucks[i].marker;
        let info = trucks[i].info;
        console.log('Going to truck ', info.applicant, 'at', info.address);
        let infowindow = this.setInfoWindowContent(info);
        if (previous) {
          previous.infowindow.close(map, previous.marker);
        }
        infowindow.open(map, marker);
        map.setZoom(17);
        map.panTo(marker.getPosition());
        this.setState({
          previousSelection: this.state.previousSelection.concat([{ marker, infowindow }])
        });
        return;
      }
    }
  }

//Updates distance threshold for findClosest Trucks
  updateWalkingDistance(e) {
    this.setState({
      distThreshold: Math.abs(e.target.value)
    })
  }


  render() {
    return (
      <div>
        <Jumbotron className={'header'}>
          <Grid fluid>
            <Row>
              <Col md={5} sm={12}>
                  <Image  className={'logo'} width="140" responsive src='https://049d1e9f5c8486fa15c905c1c2e7feafadc697fd-www.googledrive.com/host/0B781CHOXBe3wVjBPNFZzLVlNRVk/foodTruck.png'/>
              </Col>
              <Col md={7} sm={12}>
                <TruckSearch handleSearch={this.handleTruckSearch.bind(this)} trucks={this.state.trucks}/>
              </Col>
            </Row>
          </Grid>
        </Jumbotron>
        <Grid>
          <Row>
            <WalkingTimeForm  threshold={this.state.distThreshold} distance={this.updateWalkingDistance.bind(this)} closest={this.findClosest.bind(this)}/>
            <NearMeButton map={this.state.map[0]} newMainMarker={this.updateMainMarker.bind(this)} />
          </Row>
          <Row>
            <Col md={4}>
              <Panel id={'listConatiner'} header={<h1>Within a {this.state.distThreshold || 10} minute walk: </h1>}>
                {this.state.closestTrucks.map((truck, i) =>
                  <ClosestListEntry handleClick={this.goToTruck.bind(this, truck)} key={i} truck={truck}/>
                )}
              </Panel>
            </Col>
            <Col md={8}>
              <input id={'pac-input'} className={'controls'} type={'text'} placeholder={'Enter a location...'} />
              <div id={'map'} ref='map'></div>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

GoogleMap.defaultProps = {
  initialZoom: 17,
  mapCenterLat: 37.774929,
  mapCenterLng: -122.419416,
}
