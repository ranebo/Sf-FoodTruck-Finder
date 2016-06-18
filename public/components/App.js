import React from 'react';
import ReactDOM from 'react-dom';
import { default as _ } from 'lodash';
import request from '../util/rest-helpers.js';

console.log("GOOGLE", google);

export class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      trucks: [],
    };
  }

  componentWillMount() {
    request.post('/api/sfFoodTrucks', {}, (err, res) => {
      if (err) { console.log("Error getting food truck list (Map Component: ", err); }
      console.log(res.body);
    });
  }

  componentDidMount() {
    let mapOptions = {
      center: this.mapCenterLatLng(),
      zoom: this.props.initialZoom
    },
    map = new google.maps.Map(ReactDOM.findDOMNode(this), mapOptions);
    let marker = new google.maps.Marker({
      position: this.mapCenterLatLng(),
      title: 'Food Truck',
      map
    });
    this.addPlacesSearchBox(map);
    this.setState({ map });
  }

  addPlacesSearchBox (map) {
    const input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    let infowindow = new google.maps.InfoWindow();
    let marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });
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
    });
  }

  mapCenterLatLng () {
    var props = this.props;
    return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
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
//MYKEY: AIzaSyCsSUzeOJfZmzFg0Y4MqMhDfX8U9OwCrvU
