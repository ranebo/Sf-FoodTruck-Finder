const path =require('path');
const webpack = require('webpack');
const express = require('express');
const request = require('request-promise');
const config = require('../webpack.config.js');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = express();
const port = process.env.PORT || 8000;
const isDeveloping = process.env.NODE_ENV !== 'production';

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
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, '/../public/index.html'));
  });
} else {
  app.use(express.static(__dirname + '/../public'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, '/../public/index.html'));
  });
}

app.use('/api/sfFoodTrucks', (req, res) => {
  request({uri: 'https://data.sfgov.org/resource/6a9r-agq8.json'})
  .then((body) => {
    console.error('Recieved Food Truck data. Sending to client...');
    res.send(JSON.parse(body));
  })
  .catch((err) => {
    console.log('Error getting food truck list (API request): ', err);
    res.send(err);
  });
});



app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.error(err);
  }
  console.info('==> 🌎  Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
