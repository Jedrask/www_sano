const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const compression = require('compression');

const jwt = require('./source/auth');

const { request } = require('./source/request');

const uri = 'https://api.darksky.net/forecast/6293f1582af50d6ff62190dc65b06607/54.1943800,16.1722200?units=si&lang=pl';
 
app.disable('x-powered-by');

app.use(compression());
app.use(express.static(__dirname + '/public'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded( { extended: true } ));
//app.use(jwt);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
   request(uri).then((data) => {
     let pogoda = JSON.parse(data);
     res.render('index', { pogoda });
   }, (e) => {
     let pogoda = { Błąd: 'Brak pogody'};
   });
});

app.get('/telefonySklepy', (req, res) => {
    fs.readFile(__dirname + '/data/telefony_sklepy.json', (err, data) => {
       if (err) return res.status(401).send(err);


       let telefony = parsujPlik(data);

       if (telefony !== 'Error') {
          let lokalizacje = pobierzSlownik(telefony, 'Lokalizacja');
          res.render('tel_sklepy', { telefony, lokalizacje });
       } else {
         console.log(lokalizacje);
         res.send('Bład parsowania pliku - sprawdź składnie');

  //     res.contentType('application/json');
       };
    });
});

app.get('/telefonyBiuro', (req, res) => {

  fs.readFile(__dirname + '/data/telefony_biuro.json', (err, data) => {
     if (err) return res.status(401).send(err);

     let telefony = parsujPlik(data);

     if (telefony !== 'Error') {
     let dzialy = pobierzSlownik(telefony,'Dział');
     res.render('tel_biuro', { telefony, dzialy });
     } else {
       res.send('Bład parsowania pliku - sprawdź składnię');
     };
  });
});

app.get('/dokumenty', (req, res) => {
    res.render('main_files')
});

// Wyświetlamlistę dokumentów do pobrania w zależności od kategorii dokumentu jaka zostanie wybrana
app.get('/dokumenty/:id', (req, res) => {
  
  let path = req.params.id;
  fs.readdir(__dirname + '/public/dokumenty/' + path + '/', (err, files) => {
    if (err) {
      res.status(400).send('Problem z odczytaniem listy plików');
    } else {
      res.render('dokumenty', { files, path });
    }
  });
  
});

// Pobiera dane słownikowe potrzebne w czasie generowania strony HTML
function pobierzSlownik(telefony, wartosc) {
  let tmp = '';
  let slownik = new Set();
  for (let el of telefony) {
    if (!slownik.has(el[wartosc])) {
          slownik.add(el[wartosc]);
    }
  }
  return slownik;
}

// Parsowanie JSON w klauzuli try - catch na wypadek błędów logicznych w strukturze danych JSON
function parsujPlik(data) {

  try {
    var telefony = JSON.parse(data.slice(data.indexOf('[')));
  } catch(e) {
    var telefony = 'Error';
    console.log(e);
    }

  return telefony;

};


app.listen(3000);
