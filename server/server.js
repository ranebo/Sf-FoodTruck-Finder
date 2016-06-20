const path =require('path');
const webpack = require('webpack');
const express = require('express');
const request = require('request-promise');
const config = require('../webpack.config.js');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

// Simple cache for faster responses
let cache = [];
const app = express();
const isDeveloping = process.env.NODE_ENV !== 'production';

//Use Webpack dev middleware for development.
if (isDeveloping) {
  console.log('Developing!!!');
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', (req, res) => {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, '../dist/index.html')));
    res.end();
  });
} else {
  console.log('Production Junction!')
  app.use(express.static(__dirname + '/../dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}
//Route to retrieve Food Truck Data
app.use('/api/sfFoodTrucks', (req, res) => {
  if (!cache.length) {
    request({uri: 'https://data.sfgov.org/resource/6a9r-agq8.json'})
    .then((body) => {
      console.error('Recieved Food Truck data from DataSF. Sending to client...');
      let trucks = JSON.parse(body);
      cache.push(trucks);
      res.send(trucks);
    })
    .catch((err) => {
      console.log('Error getting food truck list (DataSF API request): ', err);
      res.send(JSON.parse(err));
    });
  } else {
    console.log('Retrieved Food Truck data from cache. Sending to client...');
    res.send(cache[0]);
  }
});

module.exports = app;
