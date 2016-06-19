import React from 'react';
import ReactDOM from 'react-dom';
import styles from './styles/styles.css';
import GoogleMap from './components/map.js';
import request from './util/rest-helpers.js';

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
