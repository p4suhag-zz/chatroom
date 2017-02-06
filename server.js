var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({ port: 8000 });

var io = require('socket.io')(server.listener);

server.register([
        {
            register: require('inert')
        },{
            register: require('bell')
        }
    ], function(err) {
    if (err) {
        throw err;
    }


    server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: 'cookie_encryption_password_secure',
        isSecure: false,
        // You'll need to go to https://console.developers.google.com and set up an application to get started
        // Once you create your app, fill out "APIs & auth >> Consent screen" and make sure to set the email field
        // Next, go to "APIs & auth >> Credentials and Create new Client ID
        // Select "web application" and set "AUTHORIZED JAVASCRIPT ORIGINS" and "AUTHORIZED REDIRECT URIS"
        // This will net you the clientId and the clientSecret needed.
        // Also be sure to pass the location as well. It must be in the list of "AUTHORIZED REDIRECT URIS"
        // You must also enable the Google+ API in your profile.
        // Go to APIs & Auth, then APIs and under Social APIs click Google+ API and enable it.
        clientId: '916665654977-947nfl0qkeg47qr3qb5up2jvltjjv7gv.apps.googleusercontent.com',
        clientSecret: 'hL127SompfZIiYz_24HRL7Uz',
        location: server.info.uri
    });


    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: {
                strategy: 'google',
                mode: 'try'
            },
            handler: function (request, reply) {

                if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }
                reply.redirect('/chatroom');
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/chatroom',
        config: {
            auth: {
                strategy: 'google',
                mode: 'try'
            },
            handler: function (request, reply) {

                if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }
                reply.file('index.html');
            }
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





