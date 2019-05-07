let page = 0;
let maxPage = 1;
let isLoading = false;
let socket = io('localhost');
$(document).ready(function(){
    socket.on('connect', (data) => {
        socket.emit('welcomeMessage', 'Hello World from client');
    });

    socket.on('messages', (data) => {
        addMessagesToChat(data);
    });

    socket.on('broadcast', (data) => {
        addMessageToChat(data);
    });

    socket.on('maxPage', (data) => {
        maxPage = data;
    });

    $('.chat').scroll(scrollController);
    sendMessageListener();



});

/**
 * Listens user message.
 * If user type something and press enter it will fire socket and send data.
 */
let sendMessageListener = () => {
    $("textarea").keyup(function(e) {
        let code = e.keyCode ? e.keyCode : e.which;
        if (code === 13) {
            let schema = {
                message: $(this).val().trim(),
                name: $('.nameContain input').val().trim()
            };
            $(this).val('');
            schema = JSON.stringify(schema);
            socket.emit('newMessage', schema);
        }
    });
};

/**
 * Adds one message to chat.
 * @param {object} schema
 */
let addMessageToChat = (schema) => {
    let time = new Date(schema.time);
    $('.messages ul').append('<li><b>' +
        schema.name + ':</b> ' +
        schema.message +
        '<span style="float: right">'+ time.getHours()
        +':'+ time.getMinutes() +'</span>' + '</li>');
    $('.chat').scrollTop($('.chat')[0].scrollHeight);
};

/**
 * Adds many messages to chat.
 * @param {array} schema
 */
let addMessagesToChat = (schema) => {
    schema.forEach(item => {
        let time = new Date(item.time);
        $('.messages ul').prepend('<li><b>' +
            item.name + ':</b> ' +
            item.message +
            '<span style="float: right">'+ time.getHours()
            +':'+ time.getMinutes() +'</span>' + '</li>');
        if(page==0)
            $('.chat').scrollTop($('.chat')[0].scrollHeight);
    });
    isLoading = false;
};

/**
 *Listens chat scroll.
 * If the scroll swipe to up it will fire to socket for get old messages.
 */
let scrollController = () => {
    let scPos = $('.chat').scrollTop();
    let scHeight = $('.chat')[0].scrollHeight;
    if(scPos == 0)
        $('.chat').scrollTop(1);
    if(scPos < scHeight * 0.1){
        if(!isLoading && page <= maxPage){
            console.log("aksdjasd");
            isLoading = true;
            page++;
            console.log(page);
            socket.emit('messages', page);
        }
    }
};

