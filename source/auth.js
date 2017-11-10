const jwt = require('jsonwebtoken');

var autenticate = function(req, res, next) {
   console.log('autentykacja');
   console.log(req.headers['x-auth']);

   next();
}

module.exports = autenticate;
