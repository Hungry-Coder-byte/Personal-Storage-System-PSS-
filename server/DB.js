var promise = require('bluebird'); //promise

var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};

var pgp = require('pg-promise')(options); //postgre promise
var cn = {
    host: 'localhost', // 'localhost' is the default;
    port: 5432, // 5432 is the default;
    database: 'bms_v2', // your database name
    user: 'bms', // Your database user
    password: 'password', // Password of above user
    charset: 'UTF8_GENERAL_CI',
};


var knex = require('knex')({
    client: 'pg',
    connection: cn,
    debug: true
});

var Bookshelf = require('bookshelf')(knex);

var DB = pgp(cn);

module.exports.Bookshelf = Bookshelf;
module.exports.DB = DB;