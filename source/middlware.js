const fs = require('fs');
const path = require('path');


// Pobiera dane słownikowe potrzebne w czasie generowania strony HTML
function pobierzSlownik(telefony, wartosc) {
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

//Middlware do czytania plikow z telefonami oraz budowania słownika wg lokalizacji lub działu, dane są dodane do req
function czytajPlik(plik, parametr) {

    return function(req, res, next) {
    let sciezka = path.join(__dirname, '..', '/data/');
    fs.readFile(sciezka + plik, (err, data) => {
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

module.exports = { czytajPlik };
