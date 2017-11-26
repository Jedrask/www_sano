const fs = require('fs');
const path = require('path');

const logFile = 'request.log';

function uri(req, res, next) {

  req.uri = 'https://api.darksky.net/forecast/6293f1582af50d6ff62190dc65b06607/54.1943800,16.1722200?units=si&lang=pl';
  let teraz = new Date();
  fs.appendFile(path.join(__dirname, '..', 'logs', logFile), `${teraz.toLocaleDateString()} ${teraz.toLocaleTimeString()} - ${req.ip.substr(7)}\n`, (err) => {
    if (err) {
      console.log('Błąd zapisu do pliku: ' + err);
    };
  });
  next();
};



module.exports = { uri };
