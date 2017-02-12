var Hapi = require('hapi');
var server = new Hapi.Server();
var Msg = require('./models/rooms.js');
var Msgs = require('mongoose').model('Msg');
var users = {};
var currentuser = '';
var currentRoom = '';
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
        location: server.info.uri,
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
      path: '/assets/{file*}',
      config: {
          auth: false
      },
      handler: {
        directory: { 
          path: 'assets'
        }
      }
    })

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
                reply.redirect('/chatroom');
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/{chatroom}',
        config: {
            auth: {
                strategy: 'twitter',
                mode: 'try'
            },
            handler: function (request, reply) {
                currentRoom = request.path.replace('/', '');
                if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }
                var username = '' + request.auth.credentials.profile.displayName + ' ';
                if(!users[currentRoom]) {
                    users[currentRoom] = {};
                }
                users[currentRoom][username] = request.auth.credentials.profile.raw.profile_image_url;
                currentuser = username;
                reply.file('index.html');
            }
        }
    });

    server.start(function() {
        console.log('Server is running at:', server.info.uri);
    });
});

var count = {};

io.on('connection', function(socket) {
    // set current user display name
    socket.username = currentuser;

    // join room 
    socket.on('join room', function(data) {
        
        // set current requested room
        socket.roomname = data;
        this.join(data);
        if(!count[socket.roomname]){
            count[socket.roomname] = 0;
        }
        count[socket.roomname]++;
        io.to(socket.roomname).emit('count', { 'visit': count[socket.roomname] });
        // list users info
        io.sockets.in(socket.roomname).emit('list users', { 'users': users[socket.roomname] });

        // load previous messages
        Msgs.find({room: socket.roomname}).exec(function(err, oldmsgs) {
            socket.emit('old message', oldmsgs);
        });

    });

    // delete user logic
    function filterObject(obj, key) {
        for (var i in obj) {
            if (i == key) {
                delete obj[key];
            }
        }
        return obj;
    }
    // disconnect
    socket.on('disconnect', function() {
        count[socket.roomname]--;
        
        users[socket.roomname] = filterObject(users[socket.roomname], socket.username);

        io.to(socket.roomname).emit('count', { 'visit': count[socket.roomname] });
        io.to(socket.roomname).emit('list users', { 'users': users[socket.roomname] });
    });

    // send message to all users
    socket.on('send message', function(data) {
        io.sockets.in(socket.roomname).emit('new message', { msg: data, userimage: users[socket.roomname][socket.username] });
        // create new message
        var newMsg = new Msg({
            room: socket.roomname,
            user: socket.username,
            message: data,
            image: users[socket.roomname][socket.username]
        });
        // save the new message
        newMsg.save(function(err) {
          if (err) throw err;
          console.log('User saved successfully!');
        });
    });
});





