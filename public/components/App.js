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

  componentWillMount() {
    request.post('/api/sfFoodTrucks', {}, (err, res) => {
      if (err) { console.log("Error getting food truck list (Map Component: ", err); }
      this.setState( {trucks: res.body});
    });
  }

  componentDidMount() {
    let mapOptions = {
      center: this.mapCenterLatLng(),
      zoom: this.props.initialZoom
    },
    //create map
    map = new google.maps.Map(ReactDOM.findDOMNode(this), mapOptions);
    //create search marker
    let marker = this.addMarker(this.props.mapCenterLat, this.props.mapCenterLng, map, "Choosen Location");
    //set location for autocomplete searchbar
    const input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    //set map and mainMarker
    this.setState({ map: this.state.map.concat([map]), mainMarker: this.state.mainMarker.concat([marker]) });
    //add autocomplete functionality
    this.addAutocomplete(map);
  }

  mapCenterLatLng () {
    var props = this.props;
    return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
  }

  addMarker (lat, long, map, title) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, long),
      title,
      map
    });
    return marker;
  }

  addTruckMarkers (lat, long, map, title) {

    for (let i = 0; i < this.state.mainMarker.length; i++) {
      this.state.mainMarker[i].setMap(map);
    }
  }


  addAutocomplete (map) {
    const input = document.getElementById('pac-input');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    let infowindow = new google.maps.InfoWindow();
    let marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });

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
  initialZoom: 12,
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
