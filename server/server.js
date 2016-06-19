const path =require('path');
const webpack = require('webpack');
const express = require('express');
const request = require('request-promise');
const config = require('../webpack.config.js');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = express();
const isDeveloping = process.env.NODE_ENV !== 'production';

//Use Webpack dev middleware for development.
if (isDeveloping) {
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
    res.sendFile(path.join(__dirname, '/../public/index.html'));
  });
} else {
  app.use(express.static(__dirname + '/../public'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/index.html'));
  });
}

//Route to retrieve Food Truck Data
app.use('/api/sfFoodTrucks', (req, res) => {
  request({uri: 'https://data.sfgov.org/resource/6a9r-agq8.json'})
  .then((body) => {
    console.error('Recieved Food Truck data. Sending to client...');
    res.send(JSON.parse(body));
  })
  .catch((err) => {
    console.log('Error getting food truck list (DataSF API request): ', err);
    res.send(JSON.parse(err));
  });
});

module.exports = app;
