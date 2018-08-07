/**
 * Created by Mike on 10/30/2017.
 */

import {
    setConversationMessageAction,
    setScrollAction,
    incrementUnseenMessagesAction,
    incrementUnseenRequestsAction,
    setReceivedDealRequestAction,
    setSentDealRequestAction,
    setConversationAsReadAction,
    setRecipientReadMessageAction
} from './messagesActions';
import halson from 'halson';

class MessagesSockets {
    init(socket, store) {
        socket.on('messageCreatedRecipient', (data) => {
            store.dispatch(setScrollAction('scrollToBottom'));
            store.dispatch(setConversationMessageAction(data));
            store.dispatch(setScrollAction(''));

            let message = halson(data).getEmbed('messages');
            if (message.meta && message.meta.type == 'dealRequestCreated') {
                store.dispatch(incrementUnseenRequestsAction(data))
            } else {
                store.dispatch(incrementUnseenMessagesAction(data))
            }
        });

        socket.on('messageCreatedOwner', (data) => {
            store.dispatch(setScrollAction('scrollToBottom'));
            store.dispatch(setConversationMessageAction(data));
            store.dispatch(setScrollAction(''));
        })

        socket.on('dealRequestCreatedRecipient', (data) => {
            let user = store.getState().messages.dealRequests.user;
            if (!user || user._id == data.requestor) {
                store.dispatch(setReceivedDealRequestAction(data));
            }
        })

        socket.on('dealRequestCreatedOwner', (data) => {
            let user = store.getState().messages.dealRequests.user;
            if (!user || user._id == data.requestedFrom) {
                store.dispatch(setSentDealRequestAction(data));
            }
        })

        socket.on('messagesMarkAsRead', (data) => {
            store.dispatch(setConversationAsReadAction(data));
        })

        socket.on('messagesRecipientReadMessage', (data) => {
            store.dispatch(setRecipientReadMessageAction(data));
        })
    }
}

export default new MessagesSockets();