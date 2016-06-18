import React from 'react';
import ReactDOM from 'react-dom';
import { default as _ } from 'lodash';
import request from '../util/rest-helpers.js';
import styles from '../styles/styles.css';
import GoogleMap from './map.js';


export class App extends React.Component {
  render () {
    return (
      <div>
        <GoogleMap />
      </div>
    )
  }
}


ReactDOM.render(<App/>, document.getElementById('app'));
