$(document).ready(function() {

var element = function (id){
    return document.getElementById(id);
};

// GET ELEMENTS
var status = element('status');
var messages = element('messages');
var textarea = element('textarea');
var username = element('username');
var clearBtn = element('clear');

// SET DEFAULT STATUS
var statusDefault = status.textContent;

var setStatus = function(status){
    // SET STATUS
    status.textContent = status;
    if(status !== statusDefault){
        var delay = setTimeout(function(){
            setStatus(statusDefault);
        }, 5000);
    }
};

// CONNECT TO SOCKET.IO
var socket = io.connect('http://127.0.0.1:8080');

// CHECK FOR connection
if (socket !== undefined){
    console.log('Connected To Socket...');
    socket.on('output', function(data){
        if(data.length){
            for(var x = 0; x < data.length; x++){
                var message = document.createElement('div');
                message.setAttribute('class', 'chat-message');
                message.textContent = data[x].name + ':' + data[x].message;
                messages.appendChild(message);
                messages.insertBefore(message, messages.firstChild);
            }
        }
    });
    socket.on('status', function(data){
        setStatus((typeof data === 'object')? data.message : data);
        if(data.clear){
            textarea.value = '';
        }
    });
    textarea.addEventListener('keydown', function(event){
        if(event.which === 13 && event.shiftKey == false){
            socket.emit('input', {
                name:username.value,
                message:textarea.value
            });
            event.preventDefault();
        }
    });
    clearBtn.addEventListener('click', function(){
        socket.emit('clear');
    });
    socket.on('cleared', function(){
        messages.textContent = '';
    });
}

});
