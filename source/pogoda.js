const fs = require('fs');
const path = require('path');

const logFile = 'request.log';

const url = 'https://api.darksky.net/forecast/6293f1582af50d6ff62190dc65b06607/';

const wspolrzedne = { Koszalin :
                        {
                          lat: '54.1943800',
                          lng: '16.1722200'
                        }
                    };

const parameters = {
                     units: 'units=si',
                     lang: 'lang=pl'
                   }

function uri(req, res, next) {

  req.uri = url + wspolrzedne[req.miasto].lat + ',' + wspolrzedne[req.miasto].lng + '?' + parameters.units + '&' + parameters.lang;
//  req.uri = 'https://api.darksky.net/forecast/6293f1582af50d6ff62190dc65b06607/54.1943800,16.1722200?units=si&lang=pl';
  let teraz = new Date();
  fs.appendFile(path.join(__dirname, '..', 'logs', logFile), `${teraz.toLocaleDateString()} ${teraz.toLocaleTimeString()} - ${req.ip.substr(7)} - ${req.miasto}\n`, (err) => {
    if (err) {
      console.log('Błąd zapisu do pliku: ' + err);
    };
  });
  next();
};



module.exports = { uri };
