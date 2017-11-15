const { URL } = require('url')
const https = require('https');

function request(url) {

return new Promise((resolve, reject) => { 
  var uri = new URL(url);

  var options = {
    hostname: uri.host,
    method: 'GET',
    path: uri.pathname + '/' + uri.search
  };


  const req = https.request(options, (res) => {

    let dane = '';

    res.on('data', (data) => {
      dane += data;
    });

    res.on('end', () => {
      resolve(dane);
    });

  });

  req.on('error', (e) => {
    reject(e);
  });

  req.end();

 });
};

module.exports = { request };
