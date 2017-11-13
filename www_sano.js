const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const compression = require('compression');

const jwt = require('./source/auth');

app.disable('x-powered-by');

app.use(compression());
app.use(express.static(__dirname + '/public'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded( { extended: true } ));
//app.use(jwt);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
   res.render('index');
});

app.get('/telefonySklepy', (req, res) => {
    fs.readFile(__dirname + '/data/telefony_sklepy.json', (err, data) => {
       if (err) return res.status(401).send(err);
       
       let telefony = JSON.parse(data.slice(data.indexOf('[')));
       let lokalizacje = pobierzSlownik(telefony, 'Lokalizacja');
  //     res.contentType('application/json');
       res.render('tel_sklepy', { telefony, lokalizacje });
       
    });
});

app.get('/telefonyBiuro', (req, res) => {
  
  fs.readFile(__dirname + '/data/telefony_biuro.json', (err, data) => {
     if (err) return res.status(401).send(err);

     let telefony = JSON.parse(data.slice(data.indexOf('[')));
     let dzialy = pobierzSlownik(telefony,'Dział');
     res.render('tel_biuro', { telefony, dzialy });
  });
//  res.render('index', { tel_biuro });

});


function pobierzSlownik(telefony, wartosc) {
  let tmp = '';
  let slownik = [];
  for (let el of telefony) {
    if (el[wartosc] != tmp) {
      slownik.push(tmp = el[wartosc]);
    }
  }
  return slownik;
}


app.listen(3000);
