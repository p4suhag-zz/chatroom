// submit message to server
$('#message-form').submit(function(e) {
    e.preventDefault();
    socket.emit('send message', $('#message').val());
    $('#message').val('');
});

// handle incoming message
socket.on('new message', function(data) {
    $('#message-box').append('<li class="message__list"><img src="' + data.userimage + '">' + '<p class="message__text">' + data.msg + '</p></li>');
});

// handle old messages
socket.on('old message', function(data) {
    data.forEach(function(element) {
        $('#message-box').append('<li class="message__list"><img src="' + element.image + '">' + '<p class="message__text">' + element.message + '</p></li>');
    });
});