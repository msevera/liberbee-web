/**
 * Created by Mike on 10/31/2017.
 */

import {setMessagesNotificationAction,
    incrementUnseenMessageNotificationRequestsAction,
    incrementUnseenMessagesNotificationAction,
    setMessagesNotificationsAsReadAction} from './messagesNotificaitions/messagesNotificationsActions';
import halson from 'halson';

class MasterSockets {
    init(socket, store){
        socket.on('messageCreatedRecipient', (data) => {
            store.dispatch(setMessagesNotificationAction(data));
            let message = halson(data).getEmbed('messages');

            if (message.meta && message.meta.type == 'dealRequestCreated') {
                store.dispatch(incrementUnseenMessageNotificationRequestsAction(data))
            }else{
                store.dispatch(incrementUnseenMessagesNotificationAction(data))
            }
        })

        socket.on('messagesMarkAsRead', (data) => {
            store.dispatch(setMessagesNotificationsAsReadAction(data));
        })
    }
}

export default new MasterSockets();