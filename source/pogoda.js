const fs = require('fs');
const path = require('path');

const logFile = 'request.log';

const url = 'https://api.darksky.net/forecast/';
const KEY = '6293f1582af50d6ff62190dc65b06607/'

const wspolrzedne = { Koszalin :
                        {
                          lat: '54.1943800',
                          lng: '16.1722200'
                        },
                      Słupsk :
                        {
                          lat: '54.4640500',
                          lng: '17.0287200'
                        },
                      Bydgoszcz :
                        {
                          lat: '53.1235000',
                          lng: '18.0076200'
                        },
                      Człuchów :
                        {
                          lat: '53.6672200',
                          lng: '17.3588300'
                        },
                      Szczecinek :
                        {
                          lat: '53.7079100',
                          lng: '16.6993700'
                        },
                      Kolobrzeg :
                        {
                          lat: '54.1756500',
                          lng: '15.5834200'
                        },
                      Białogard :
                        {
                          lat: '54.0069600',
                          lng: '15.9875100'
                        },
                      'Połczyn-Zdrój' :
                        {
                          lat: '53.7642400',
                          lng: '16.0957400'
                        },
                      Gryfice :
                        {
                          lat: '53.9165000',
                          lng: '15.2002700'
                        },
                      Świdwin :
                        {
                          lat: '53.7746400',
                          lng: '15.7767100'
                        },
                      Chojnice :
                        {
                          lat: '53.6955400',
                          lng: '17.5570100'
                        },
                      Gdańsk :
                        {
                          lat: '54.3520500',
                          lng: '18.6463700'
                        }
                    };

const parameters = {
                     units: 'units=si',
                     lang: 'lang=pl'
                   }

function uri(req, res, next) {

  req.uri = url + KEY + wspolrzedne[req.miasto].lat + ',' + wspolrzedne[req.miasto].lng + '?' + parameters.units + '&' + parameters.lang;
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
