const request = require('request-promise');

class Cache {
  constructor() {
    this.storage = [];
  }

  getData() {
    return this.storage.slice();
  }

  setData(data) {
    this.storage = [data];
  }

  deleteData() {
    this.storage = [];
  }
}

//DataSF request
const dataSFRequest = (cache, res) => {
  request({uri: 'https://data.sfgov.org/resource/6a9r-agq8.json'})
  .then((body) => {
    console.error('Recieved Food Truck data from DataSF. Sending to client...');
    let trucks = JSON.parse(body);
    cache.setData(trucks);
    if (res) {
      res.send(trucks);
    }
  })
  .catch((err) => {
    console.log('Error getting food truck list (DataSF API request): ', err);
    if (res) {
      res.send(JSON.parse(err));
    }
  });
};

module.exports = {
  truckCache: new Cache(),
  dataSFRequest
};
