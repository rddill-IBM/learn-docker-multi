/*
* worker script
*/

'use strict';

let keys = require('./keys');

let redis = require('redis');

let redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // eslint-disable-next-line camelcase
    retry_strategy: () => 1000
});

let sub = redisClient.duplicate();

function fib(index) {
    if (index < 2) {
        return 1;
    } else {
        return (fib(index - 1) + fib(index - 2));
    }
}

sub.on('message', (channel, message) => {
    console.log('worker sub on message channel: ', channel, ' message: ', message);
    redisClient.hset('values', message, fib(parseInt(message)));
    redisClient.publish('update', message);
});
sub.subscribe('insert');
