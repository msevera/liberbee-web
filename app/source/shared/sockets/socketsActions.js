/**
 * Created by Mike on 10/30/2017.
 */

'use strict';

import reduxUtils from '../../../../utils/reduxUtils';

export const joinMessagesRoomAction = reduxUtils.createAsyncAction(({socket}) => {
   socket.joinRoom('messagesSocketRoom')
});

export const leaveMessagesRoomAction = reduxUtils.createAsyncAction(({socket}) => {
    socket.leaveRoom('messagesSocketRoom')
});

export const joinDealRequestsSocketRoomAction = reduxUtils.createAsyncAction(({socket}) => {
    socket.joinRoom('dealRequestsSocketRoom')
});

export const leaveDealRequestsSocketRoomAction = reduxUtils.createAsyncAction(({socket}) => {
    socket.leaveRoom('dealRequestsSocketRoom')
});


