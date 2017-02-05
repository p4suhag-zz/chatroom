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
    // initial number of users
    socket.emit('connected', { 'visit': count});
    // show connected users
    socket.on('incr', function(data) {
        count++;
        // broadcast to all sockets
        io.sockets.emit('count', { 'visit': count });
    });
    // disconnect
    socket.on('disconnect', function() {
        count--;
        io.sockets.emit('count', { 'visit': count });
    });
    // send message to all users
    socket.on('send message', function(data) {
        io.sockets.emit('new message', { msg: data });
    });
});





