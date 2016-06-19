import React from 'react';
import { Col, Button } from 'react-bootstrap';


export default class NearMeButton extends React.Component{
  constructor(props) {
    super(props);
  }

  findUserLocation() {
    console.log('Finding your location, may take a few seconds...');
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
        infoWindow.setContent('Found You!');
        infoWindow.open(map, marker);
        map.setCenter(pos);
        this.props.newMainMarker(marker);
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
