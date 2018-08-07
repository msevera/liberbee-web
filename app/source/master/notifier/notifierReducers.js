/**
 * Created by Mike on 9/26/2017.
 */

'use strict';

import {addMessage, removeMessage, markMessageAsActive, markMessageAsRemoved} from './notifierActions';

let generateRnd = () => {
    var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var ID_LENGTH = 8;


    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}

export default (state = {messages: []}, action) => {
    switch (action.type) {
        case addMessage.type: {
            return {
                ...state,
                messages: [...state.messages, {...action.data, id: generateRnd(), status: 'created'}]
            }
        }

        case removeMessage.type: {
            return {
                ...state,
                messages: state.messages.filter((message) => {
                    return message.id != action.data;
                })
            }
        }

        case markMessageAsActive.type: {
            return {
                ...state,
                messages: state.messages.map((message) => {
                    if (message.id != action.data)
                        return message;

                    return {
                        ...message,
                        status: 'active'
                    }
                })
            }
        }

        case markMessageAsRemoved.type: {
            return {
                ...state,
                messages: state.messages.map((message) => {
                    if (message.id != action.data)
                        return message;

                    return {
                        ...message,
                        status: 'removed'
                    }
                })
            }
        }

        default:
            return state;
    }
}