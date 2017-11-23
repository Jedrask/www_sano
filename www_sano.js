const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const compression = require('compression');

const jwt = require('./source/auth');

const { request } = require('./source/request');

const uri = 'https://api.darksky.net/forecast/6293f1582af50d6ff62190dc65b06607/54.1943800,16.1722200?units=si&lang=pl';
const sklepy = 'telefony_sklepy.json';
const biuro = 'telefony_biuro.json'

app.disable('x-powered-by');

app.use(compression());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ));
//app.use(jwt);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
   request(uri).then((data) => {
     let pogoda = JSON.parse(data);
     res.render('index', { pogoda });
   }, (e) => {
     let pogoda = { Błąd: 'Brak pogody'};
     res.render('index', { pogoda });
   });
});

app.get('/telefonySklepy', czytajPlik(sklepy, 'Lokalizacja'), (req, res) => {

  if (req.slownik) {
    res.render('tel_sklepy', { telefony: req.telefony, lokalizacje: req.slownik });
  } else {
     res.send(req.telefony);
  };
});

app.get('/telefonyBiuro', czytajPlik(biuro, 'Dział'), (req, res) => {

     let mod = { mod: false };
     if (req.slownik) {
       res.render('tel_biuro', { telefony: req.telefony, dzialy: req.slownik, mod});
     } else {
       res.send(req.telefony);
     };
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

// routing dla wyświetlenie strony z linkami do POPRAW | USUŃ
app.get('/modbiuro', czytajPlik(biuro, 'Dział'), (req, res) => {

     if (req.slownik) {
     let mod ={mod: true};
     res.render('tel_biuro', { telefony: req.telefony, dzialy: req.slownik, mod });
     } else {
       res.send(req.telefony);
     };
});

// routing do wyświetlenia strony z wypełnionym formularzem do POPRAWY danych
app.get('/Modbiuro/:name', czytajPlik(biuro, 'Dział'), (req, res) => {

       let index = req.telefony.findIndex(x => x['Nazwisko i imię'] === (req.params.name));
       if (index < 0 ) {
         return res.status(400).send('Błąd przy szukaniu: ' + req.params.name);
       }
       let dane = req.telefony[index];
       dane.index = index;

       let route = '/telBiuroUpdate';
       res.render('telBiuroForm', { dane, route });
});

// routing wołany z formularza do poprawienia danych, zapisania na dysk i przekierowania do strony z linkami POPRAW | USUŃ
app.post('/telBiuroUpdate', czytajPlik(biuro), (req, res) => {

    let index = req.body['index'];
    delete req.body.index;
    req.telefony[index] = req.body;
    let save = JSON.stringify(req.telefony);
    fs.writeFile(__dirname + '/data/' + biuro, save, (err) => {
      if (!err) {
        res.redirect('/modbiuro');
      } else {
        res.send('change not saved!');
      }
    });
});

// routing do usunięcia danych, zapisania na dysku o przekierowaniu do strony z linkami POPRAW | USUŃ
app.get('/Delbiuro/:id', czytajPlik(biuro), (req, res) => {

  if (req.params.id < 0) {
    return res.status(400).send('Nie ma takiego indeksu: ' + req.params.id);
  }

    let tel2 = req.telefony.filter((x) => {
      return x != req.telefony[req.params.id];
    });

    fs.writeFile(__dirname + '/data/' + biuro, JSON.stringify(tel2), (err) => {
      if (!err) {
        res.redirect('/modbiuro');
      } else {
        res.send('change not saved');
      }
    });
});


app.get('/addBiuro', (req, res) => {

       let route = '/telBiuroAdd';
       res.render('telBiuroForm', { dane:{}, route });
});


app.post('/telBiuroAdd', czytajPlik(biuro), (req, res) => {

  if (req.body['Nazwisko i imię'] ==='') {
    return res.send('Nazwisko i imię musi być wypełnione');
  }
  req.telefony.push(req.body);
  fs.writeFile(__dirname + '/data/' + biuro, JSON.stringify(req.telefony), (err) => {
    if (!err) {
      res.redirect('/modbiuro');
    } else {
      res.send('Add not saved');
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

//Middlware do czytania plikow z telefonami oraz budowania słownika wg lokalizacji lub działu
function czytajPlik(plik, parametr) {

    return function(req, res, next) {

    fs.readFile(__dirname + '/data/' + plik, (err, data) => {
       if (err) return res.status(401).send(err);


       req.telefony = parsujPlik(data);

       if (req.telefony !== 'Error') {
         if (parametr) {
            req.slownik = pobierzSlownik(req.telefony, parametr);
         }
         next();
       } else {
          req.telefony = 'Bład parsowania pliku - sprawdź składnie';
          next();
       };
    });
   };
};

app.listen(3000);
