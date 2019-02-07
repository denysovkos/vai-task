const express = require('express');
const bodyParser = require('body-parser')
const { handler } = require('./handlers');

module.exports = class Server {
    constructor() {
        this.server = express();
    }

    setRoutes() {
        this.server.post('/complexity', handler);
    }

    setMiddlewares() {
        this.server.use(bodyParser.urlencoded({ extended: false }));
        this.server.use(bodyParser.json());
    }

    init() {
        this.setMiddlewares();
        this.setRoutes();

        this.server.listen(3000, () => {
            console.log('✅  Complexity app listening on port 3000!');
        });
    }
}