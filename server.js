var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({ port: 8000 });

var io = require('socket.io')(server.listener);

server.register(require('inert'), function(err) {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: function(request, reply) {
            reply.file('index.html');
        }
    });

    server.start(function() {
        console.log('Server is running at:', server.info.uri);
    });
});

var count = 0;

io.on('connection', function(socket) {
    socket.emit('connected', { 'visit': count});
    socket.on('incr', function(data) {
        count++;
        // broadcast to add sockets
        io.sockets.emit('count', { 'visit': count });
    });
    socket.on('disconnect', function() {
        count--;
        io.sockets.emit('count', { 'visit': count });
    });
});





