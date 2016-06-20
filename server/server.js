const path =require('path');
const webpack = require('webpack');
const express = require('express');
const config = require('../webpack.config.js');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const dataSFRequest = require('./api-handler.js').dataSFRequest;
const TruckCache = require('./api-handler.js').truckCache;

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
  console.log('Production Junction!');
  app.use(express.static(__dirname + '/../dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}


//Route to retrieve Food Truck Data
app.use('/api/sfFoodTrucks', (req, res) => {
  let cache = TruckCache.getData();
  if (!cache.length) {
    dataSFRequest(TruckCache, res);
  } else {
    console.log('Retrieved Food Truck data from cache. Sending to client...');
    res.send(cache[0]);
  }
});

module.exports = app;
