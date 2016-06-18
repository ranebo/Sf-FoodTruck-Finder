import React from 'react';
import ReactDOM from 'react-dom';
import { default as _ } from 'lodash';
import request from '../util/rest-helpers.js';
import styles from '../styles/styles.css';

export class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: [],
      mainMarker: [],
      trucks: [],
    };
  }

  componentDidMount() {
    let mapOptions = {
      center: this.mapCenterLatLng(),
      zoom: this.props.initialZoom
    },
    //create map
    map = new google.maps.Map(ReactDOM.findDOMNode(this), mapOptions);
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
      this.setState( {trucks: res.body});
      this.addMarkers(map);
    });
  }

  mapCenterLatLng () {
    let props = this.props;
    return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
  }

  formatMarker (truck, map) {
    //icon hosted from my google drive
    let icon = 'https://049d1e9f5c8486fa15c905c1c2e7feafadc697fd-www.googledrive.com/host/0B781CHOXBe3wVjBPNFZzLVlNRVk/foodTruck.png';

      var contentString = '<div id="content">'+
        '<div id="siteNotice"></div>'+
        '<h1 id="firstHeading" class="firstHeading">' + truck.applicant + '</h1>'+
        '<div id="bodyContent">'+
          '<h4>' + truck.fooditems + '</h4>'+
          '<p>Hours: '+ truck.dayshours +'</p>'+
          '<p>Address: '+ truck.address + '</p>' +
          '<p>Get schedule: <a href="' + truck.schedule + '" >'+ truck.applicant + '</a> '+ '</p>' +
        '</div>'+
      '</div>';
    let infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(truck.latitude, truck.longitude),
      title: truck.applicant,
      icon,
      map
    });
    marker.addListener('click', () => {
      infowindow.open(map, marker);
    });
  }

  addMarkers (map) {
    for (let i = 0; i < this.state.trucks.length; i++) {
      let truck = this.state.trucks[i];
      this.formatMarker(truck, map);
    }
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
    console.log("UDPATE", this.state)
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
      this.addAutocomplete(map);
    });
  }


  render() {
    const style = {
      width: '700px',
      height: '700px'
    }
    return (
      <div style={style}>
      </div>
    )
  }
}

Map.defaultProps = {
  initialZoom: 17,
  mapCenterLat: 37.774929,
  mapCenterLng: -122.419416,
}

export class App extends React.Component {
  render () {
    return (
      <div>
        <input id={"pac-input"} className={"controls"} type={"text"} placeholder={"Enter a location..."} />
          <Map />
      </div>
    )
  }
}


ReactDOM.render(<App/>, document.getElementById('app'));
