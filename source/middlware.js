const fs = require('fs');
const path = require('path');

const Koszalin = new Set([1,2,3,4,5,6,7,8,14,20,36,38,38]);
const Bydgoszcz = new Set([25,26,27,28,29,30,31,32,33]);
const Kolobrzeg = new Set([12,13,24]);
const Szczecinek = new Set([15,18]);
const Czluchow = new Set([11,23]);

const Reszta = new Map();

Reszta.set('Białogard', 9);
Reszta.set('Połczyn-Zdrój', 16);
Reszta.set('Gryfice', 17);
Reszta.set('Świdwin', 19);
Reszta.set('Słupsk', 10);
Reszta.set('Chojnice', 21);
Reszta.set('Gdańsk', 35);

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

//Middlware do czytania plikow z telefonami oraz budowania słownika wg lokalizacji lub działu, 
// dane są dodane do req
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

// Middlware do określania skąd przychodzi request: Biuro, Sklepy, VPN - w celu wyświetlania tylko tego co jest potrzebne
// pliki w dokumentach oraz pogody dla roznych miast.
// properties >biuro< wykorzystuje do filtrowania jakie pliki wyświetlac. Jesli biuro istnieje to wtedy 
// nie wyswietlam plikow przeznaczonych dla sklepow i vice versa.
function fromWhere(req, res, next) {

  const ip = req.ip.substr(7).split('\.');
   switch(parseInt(ip[0])) {
     case 192:
          req.biuro = true;
          break;
     case 172:
          if (ip[2] === '0') {
            req.biuro = true;
            req.miasto = 'Koszalin';
            break;
          };
          if (Koszalin.has(parseInt(ip[2]))) {
            req.miasto = 'Koszalin';
            break;
          };

          if (Bydgoszcz.has(parseInt(ip[2]))) {
            req.miasto = 'Bydgoszcz';
            break;
          };

          if (Kolobrzeg.has(parseInt(ip[2]))) {
            req.miasto = 'Kołobrzeg';
            break;
          }
          if (Szczecinek.has(parseInt(ip[2]))) {
            req.miasto = 'Szczecinek';
            break;
          }
          if (Czluchow.has(parseInt(ip[2]))) {
            req.miasto = 'Człuchów';
            break;
          }

          for (var [key, value] of Reszta.entries()) {
            if (value === parseInt(ip[2])) {
              req.miasto = key;
              break;
            }
          };
          break;
     default:
          req.miasto = 'Koszalin';
   };
   next();
};

module.exports = { czytajPlik,
                   fromWhere
};
