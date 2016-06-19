import React from 'react';
import ReactDOM from 'react-dom';
import { default as _ } from 'lodash';
import request from '../util/rest-helpers.js';
import styles from '../styles/styles.css';
import { Grid, Col, Row, Panel, Jumbotron } from 'react-bootstrap';






export default class ClosestListEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const truck = this.props.truck;
    return (
      <div onClick={this.props.handleClick} className={'listEntry'}>
        <h4>{truck.info.applicant}</h4>
        <p>Address: {truck.info.address}</p>
        <p>Hours: {truck.info.dayshours}</p>
        <p>{truck.info.fooditems}</p>
      </div>
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
      distThreshold: 250, //Initialize about 3 block distance
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
    //set location for autocomplete searchbar
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
    let markers = [];
    for (let i = 0; i < trucks.length; i++) {
      let truck = trucks[i];
      markers.push({
        info: truck,
        marker: this.formatMarker(truck, map),
      });
    }
    this.setState({trucks: this.state.trucks.concat(markers)});
  }

  findClosest () {
    let center = this.state.mainMarker[0].getPosition();
    let trucks = this.state.trucks;
    let closest = [];
    for (let i = 0; i < trucks.length; i++) {
      let dist = google.maps.geometry.spherical.computeDistanceBetween(center, trucks[i].marker.getPosition());
      if (dist < this.state.distThreshold) {
        closest.push(trucks[i]);
      }
    }
    this.setState({ closestTrucks: closest});
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
      this.state.mainMarker.pop().setMap(null);
      this.setState({mainMarker: this.state.mainMarker.concat([marker])});
      this.findClosest();
      this.addAutocomplete(map);
    });
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
        //  '<p>Get schedule: <a href="' + truck.schedule + '" >'+ truck.applicant + '</a> '+ '</p>' +
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
    map.panTo(marker.getPosition())
    map.setCenter(marker.getPosition())
    map.setZoom(17)

    infowindow.open(map, marker);
    this.setState({ previousSelection: this.state.previousSelection.concat([{ marker, infowindow }]) })
  }


  render() {
    return (
      <Grid>
        <Row>
          <Jumbotron>
            <h1>Find Food Trucks Near You!</h1>
          </Jumbotron>
        </Row>
        <Row>
          <Col md={4}>
            <Panel id={'listConatiner'} header={<h1>Within a 10 minute walk: </h1>}>
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
    )
  }
}

Map.defaultProps = {
  initialZoom: 17,
  mapCenterLat: 37.774929,
  mapCenterLng: -122.419416,
}
