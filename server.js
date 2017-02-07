var Hapi = require('hapi');
var server = new Hapi.Server();
var users = {};
var currentuser = '';
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

    server.auth.strategy('twitter', 'bell', {
        provider: 'twitter',
        password: 'cookie_encryption_password_secure',
        isSecure: false,
        // Make sure to set a "Callback URL" and
        // check the "Allow this application to be used to Sign in with Twitter"
        // on the "Settings" tab in your Twitter application
        clientId: 'iA29pBCVRuG2WNzmBfBf13LRi',                               // Set client id
        clientSecret: 'HHomgTdWF2JsYIrMjoJqK2awpP7LdD7w66DwBPbRxcGtTOdLRG'                            // Set client secret
    });

    server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: 'cookie_encryption_password_secure',
        isSecure: false,
        clientId: '916665654977-947nfl0qkeg47qr3qb5up2jvltjjv7gv.apps.googleusercontent.com',
        clientSecret: 'hL127SompfZIiYz_24HRL7Uz',
        location: server.info.uri
    });

    // serve assets
    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
            file: 'style.css'
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: {
                strategy: 'twitter',
                mode: 'try'
            },
            handler: function (request, reply) {

                if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }
                var username = request.auth.credentials.profile.displayName;
                users[username] = request.auth.credentials.profile.raw.profile_image_url;
                currentuser = username;
                reply.redirect('/chatroom');
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/chatroom',
        config: {
            auth: {
                strategy: 'twitter',
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
    // list users info
    socket.emit('list users', { 'users': users });
    // set current user display name
    socket.username = currentuser;
    // show connected users
    socket.on('incr', function(data) {
        count++;
        // broadcast to all sockets
        io.sockets.emit('list users', { 'users': users });
        io.sockets.emit('count', { 'visit': count });
    });
    // disconnect
    socket.on('disconnect', function() {
        count--;
        delete users[socket.username];
        io.sockets.emit('count', { 'visit': count });
        io.sockets.emit('list users', { 'users': users });
    });
    // send message to all users
    socket.on('send message', function(data) {
        io.sockets.emit('new message', { msg: data, userimage: users[socket.username] });
    });
});





