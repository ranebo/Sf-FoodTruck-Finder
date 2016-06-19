const app = require('./server.js');
const port = process.env.PORT || 8000;

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('Error connecting server', err);
  }
  console.info('==> 🌎  Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
