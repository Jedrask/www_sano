const {Client} = require('pg');


const client = new Client({
  user: 'centrala',
  host: 'localhost',
  database: 'centrala',
  password: 'administrator'
});


client.connect();

async function getSql() {
	let total = await client.query('select count(*), dostawca, sum(dostawa - kontrakt) as wartosc from centrala.diff_contract group by dostawca order by wartosc desc');

	if (!total) {
		throw new Error('błąd');
	};


	return(total);
};


function closeConnection() {
   client.end();
};


module.exports = { getSql };
