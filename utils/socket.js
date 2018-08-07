var socketIO = require('socket.io-client');

'use strict';

class Socket {
    constructor(auth, apiDomain) {
        this.socket;
        this.auth = auth;
        this.apiDomain = apiDomain;

        this.connect();
    }

    connect() {
        this.auth.resolveToken().then((token) => {
            this.socket = new socketIO(this.apiDomain, {
                query: 'token=' + token.replace('Bearer ', '')
            });
        })
    }

    joinRoom(room){
        this.socket.emit('join room', {room: room})
    }

    leaveRoom(room){
        this.socket.emit('leave room', {room: room})
    }

    on(event, handler){
        this.socket.on(event, handler)
    }
}

module.exports = Socket;