const Server = require('./server');

(async () => {
    const server = new Server();
    server.init();
})();