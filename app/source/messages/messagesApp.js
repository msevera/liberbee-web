/**
 * Created by Mike on 10/16/2017.
 */

'use strict';

import messagesReducers from './messagesReducers';
import MessagesContainer from './components/messagesContainer';
import messagesSockets from './messagesSockets';

export default {
    reducers: messagesReducers,
    container: MessagesContainer,
    sockets: messagesSockets
}