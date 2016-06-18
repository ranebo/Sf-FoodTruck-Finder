const request = require('superagent');

const get = (url, callback) => {
  request
    .get(url)
    .end((err, res) => {
      if (err) {
        console.log('Err in util/rest-handler ', err);
      }
      callback(err, res);
  });
};

const post = (url, data, callback) => {
  request
    .post(url)
    .send(data)
    .end((err, res) => {
      if (err) {
        console.error('Err in util/restHander ', err);
      }
      callback(err, res);
  });
};

export default {
  get: get,
  post: post
};
