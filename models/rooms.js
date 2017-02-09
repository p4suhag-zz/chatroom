'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatroom');
var Schema = mongoose.Schema;

var msgSchema = new Schema({
    room: String,
    user: String,
    message: String,
    image: String
});

var Msg = mongoose.model('Msg', msgSchema);

module.exports = Msg;