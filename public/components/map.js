import React from 'react';
import ReactDOM from 'react-dom';
import { default as _ } from 'lodash';
import styles from '../styles/styles.css';
import request from '../util/rest-helpers.js';
import Datalist from 'react-datalist';
import ClosestListEntry from './closest-list-entry.js';
import { Grid, Col, Row, Panel, Jumbotron, Image, Button, FormGroup, FormControl, InputGroup, ControlLabel } from 'react-bootstrap';




export default class TruckSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
    };
  }

  componentWillReceiveProps() {
    let options = [];
    this.props.trucks.forEach((truck) => {
      options.push(truck.info.applicant + ' @ ' + truck.info.address);
    });
    this.setState({options});
  }

  onOptionSelected(truck) {
    this.props.handleSearch(truck);
  }

  render() {
    return (
      <div className={'searchTrucks'}>
        <h2 style={{color: 'lightgrey'}}>Find a Food Truck!</h2>
        <Datalist
          className='truckOptionList'
          list='truckOptions'
          options= {this.state.options}
          placeholder='e.g. Senor Sisig'
          onOptionSelected={this.onOptionSelected.bind(this)}/>
      </div>
    )
  }
}


export default class WalkingTimeForm extends React.Component{
  constructor(props) {
    super(props);
  }

  closest(e) {
    this.props.closest(e);
  }

  distance(e) {
    this.props.distance(e);
  }

  render() {
    return (
      <Col md={4}>
        <form>
          <FormGroup>
            <InputGroup>
              <InputGroup.Button>
                <Button onClick={this.closest.bind(this)} type='submit' bsStyle="primary">Walk Time</Button>
              </InputGroup.Button>
              <FormControl type='number' onChange={this.distance.bind(this)} value={this.props.threshold} />
            </InputGroup>
          </FormGroup>
        </form>
      </Col>
    )
  }
}

export default class NearMeButton extends React.Component{
  constructor(props) {
    super(props);
  }

  findUserLocation() {
    console.log("ITWAS CALLED")
    let map = this.props.map;
    let infoWindow = new google.maps.InfoWindow({map});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        let marker = new google.maps.Marker({
          position: pos,
          title: "Choosen Location",
          map
        });

        // infoWindow.setPosition(pos);
        infoWindow.setContent('found you.');
        map.setCenter(pos);
    }, () => {
      handleLocationError(true, infoWindow, map.getCenter());
    });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    }
  }

  render() {
    return (
      <Col md={8}>
        <Button onClick={this.findUserLocation.bind(this)} bsStyle="primary">Near Me</Button>
      </Col>
    )
  }
}

export default class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: [],
      mainMarker: [],
      trucks: [],
      closestTrucks: [],
      previousSelection: [],
      distThreshold: '',
    };
  }

  componentDidMount() {
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
      let trucks = res.body;
      this.addMarkers(map, trucks);
      this.findClosest();
      this.setState;
    });
  }

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

      var address = '';
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
      this.addAutocomplete(map);
    });
  }

  mapCenterLatLng () {
    let props = this.props;
    return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
  }

  formatMarker (truck, map) {
    //icon hosted from my google drive
    let icon = 'https://049d1e9f5c8486fa15c905c1c2e7feafadc697fd-www.googledrive.com/host/0B781CHOXBe3wVjBPNFZzLVlNRVk/foodTruck.png';

    let infowindow = this.setInfoWindowContent(truck);
    var marker = new google.maps.Marker({
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
    return marker;
  }

  addMarkers (map, trucks) {
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

  findClosest (e) {
    let center = this.state.mainMarker[0].getPosition();
    let threshold = this.state.distThreshold || 10;
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

  updateMainMarker(marker) {
    console.log("MARKER", marker)
    this.state.mainMarker.pop().setMap(null);
    this.setState({mainMarker: this.state.mainMarker.concat([marker])});
    this.findClosest();
    console.log("AFTER SSET STATE MAIN MARKER", this.state)
  }

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

  goToTruck(truck) {
    let map = this.state.map[0];
    let marker = truck.marker;
    let previous = this.state.previousSelection.pop();
    let infowindow = this.setInfoWindowContent(truck.info);
    if (previous) {
      previous.infowindow.close(map, previous.marker);
    }
    map.panTo(marker.getPosition());
    map.setCenter(marker.getPosition());
    map.setZoom(17);
    infowindow.open(map, marker);
    this.setState({ previousSelection: this.state.previousSelection.concat([{ marker, infowindow }]) });
  }

  handleTruckSearch(truck) {
    let dividerIndex = truck.indexOf('@');
    let applicant = truck.slice(0, dividerIndex - 1);
    let address = truck.slice(dividerIndex + 2);
    let trucks = this.state.trucks;
    let foundTruck;
    for (let i = 0; i < trucks.length; i++ ) {
      if (trucks[i].info.applicant === applicant && trucks[i].info.address === address ) {
        foundTruck = trucks[i];
        this.goToTruck(foundTruck);
        // this.updateMainMarker(new google.maps.Marker({
        //   title: foundTruck.info.applicant,
        //   map: this.state.map[0],
        //   position: new google.maps.LatLng(foundTruck.info.latitude, foundTruck.info.longitude)
        // }));
        // console.log(this.state)
        return;
      }
    }
  }

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

Map.defaultProps = {
  initialZoom: 17,
  mapCenterLat: 37.774929,
  mapCenterLng: -122.419416,
}
