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
    fs.readFile(__dirname + '/data/Telefony_sklepy.pdf', (err, data) => {
       if (err) {
         res.status(401).send(err);
       } else {
         res.contentType('application/pdf');
         res.send(data);
       } 
    });
});

app.get('/telefonyBiuro', (req, res) => {
  
  fs.readFile(__dirname + '/data/telefony.json', (err, data) => {
     if (err) return res.status(401).send(err);

     let telefony = JSON.parse(data.slice(data.indexOf('[')));
     let dzialy = pobierzDzialy(telefony);
     res.render('tel_biuro', { telefony, dzialy });
  });
//  res.render('index', { tel_biuro });

});

function pobierzDzialy(telefony) {
  let tmp = '';
  let dzialy = [];
  for (let el of telefony) {
    if (el['Dział'] != tmp) {
      dzialy.push(tmp = el['Dział']);
    }
  }
  return dzialy;
}

app.listen(3000);
