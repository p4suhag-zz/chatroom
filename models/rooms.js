'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatroom');
// mongoose.connect('mongodb://baatuni:baatuni@ds149049.mlab.com:49049/baatuni');
var Schema = mongoose.Schema;

var msgSchema = new Schema({
    room: String,
    user: String,
    message: String,
    image: String
});

var Msg = mongoose.model('Msg', msgSchema);

module.exports = Msg;