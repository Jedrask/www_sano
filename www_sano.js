const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const jwt = require('./source/auth');
const { uri } = require('./source/pogoda');
const { request } = require('./source/request');

const { czytajPlik, fromWhere } = require('./source/middlware');

const sklepy = 'telefony_sklepy.json';
const biuro = 'telefony_biuro.json'

const app = express();
const compression = require('compression');

app.disable('x-powered-by');

app.use(compression());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ));
//app.use(jwt);

app.set('view engine', 'ejs');

app.get('/', fromWhere, uri, (req, res) => {
   request(req.uri).then((data) => {
     res.render('index', { pogoda: JSON.parse(data), miasto: req.miasto });
   }, (e) => {
     res.render('index', { pogoda: 'Chwilowy brak pogody', miasto: req.miasto });
   });
});

app.get('/telefonySklepy', czytajPlik(sklepy, 'Lokalizacja'), (req, res) => {

  let mod = {mod: false };

  if (req.slownik) {
    res.render('tel_sklepy', { telefony: req.telefony, lokalizacje: req.slownik, mod });
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
app.get('/dokumenty/:id', fromWhere, (req, res) => {

  let path = req.params.id;
  fs.readdir(__dirname + '/public/dokumenty/' + path + '/', (err, files) => {
    if (err) {
      res.status(400).send('Problem z odczytaniem listy plików');
    } else {
      res.render('dokumenty', { files: files.sort(), path });
    }
  });
});

app.get('/strony', fromWhere, (req,res) => {
  res.render('linkiDoStron', {biuro: req.biuro });
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


app.get('/modsklepy', czytajPlik(sklepy, 'Lokalizacja'), (req, res) => {

  let mod = {mod: true };

  if (req.slownik) {
    res.render('tel_sklepy', { telefony: req.telefony, lokalizacje: req.slownik, mod });
  } else {
     res.send(req.telefony);
  };
});


app.get('/modsklep/:name', czytajPlik(sklepy), (req, res) => {

  let index = req.telefony.findIndex(x => x['Kierownik'] === req.params.name  );
  let dane = req.telefony[index];
  res.render('telSklepForm', { dane, route: index } );
});

app.post('/modsklep/:id', czytajPlik(sklepy), (req, res) => {

  req.telefony[req.params.id]['Kierownik'] = req.body['kierownik'];
  delete req.body.index;
  let save = JSON.stringify(req.telefony);
  fs.writeFile(__dirname + '/data/' + sklepy, save, (err) => {
    if (!err) {
      res.redirect('/modsklepy');
    } else {
      res.send('change not saved!');
    }
  });
});


app.listen(3000);
