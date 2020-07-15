//
'use strict';
let keys = require('./keys');
let express = require('express');
let bodyParser = require('body-parser');
let redis = require('redis');
let cors = require('cors');

// express set up

let app = express();
app.use(cors()); // cross origin resource request
app.use(bodyParser.json());

// postgres cliwbr set up

let {Pool} = require('pg');

let pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('connect', () => {
    pgClient
        .query('CREATE TABLE IF NOT EXISTS fib_values (number INT);')
        .catch(err => console.log('CREATE TABLE ERROR: ', err));
});

pgClient.connect((err, client, release) => {
    if (err) {
        console.log('Error acquiring client', err.stack);
        return console.error(err.stack);
    }
});
// REDIS client set up
let redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // eslint-disable-next-line camelcase
    retry_strategy: () => 1000
});

let redisPublisher = redisClient.duplicate();

// express route handler

app.get('/', (req, res, next) => {
    res.send('Hi there!');
});

app.get('/values/all', async(req, res, next) => {
    let values = {};
    values.rows = [];
    try {
        values = await pgClient.query('SELECT * FROM fib_values');
    } catch (error) {
        console.log('SQL Query error: ', error);
    }
    res.send(values.rows);
});

app.get('/values/current', async(req, res, next) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async(req, res, next) => {
    let index = req.body.index;
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high!');
    } else {
        redisClient.hset('values', index, 'Nothing yet!');
        redisPublisher.publish('insert', index);
        pgClient.query('INSERT INTO fib_values(number) VALUES($1);', [index]);
        res.send({working: true});
    }
});

app.listen(5000, err => {
    console.log('Listening');
});
