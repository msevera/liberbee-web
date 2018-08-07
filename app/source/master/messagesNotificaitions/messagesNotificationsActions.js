/**
 * Created by Mike on 10/31/2017.
 */

'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import halson from 'halson';

export const setMessagesNotificationsAction = reduxUtils.createAction('SET_MESSAGES_NOTIFICATIONS');
export const setMessagesNotificationAction = reduxUtils.createAction('SET_MESSAGES_NOTIFICATION');
export const incrementUnseenMessageNotificationRequestsAction  = reduxUtils.createAction('INCREMENT_UNSEEN_MESSAGE_NOTIFICATION_REQUEST');
export const incrementUnseenMessagesNotificationAction = reduxUtils.createAction('INCREMENT_UNSEEN_MESSAGE_NOTIFICATION');
export const moreMessagesNotificationsLoadedAction = reduxUtils.createAction('MORE_MESSAGES_NOTIFICATIONS_LOADED');
export const setMoreMessagesNotificationsAreLoading = reduxUtils.createAction('SET_MORE_MESSAGES_NOTIFICATIONS_ARE_LOADING');
export const setMessagesNotificationsAsReadAction = reduxUtils.createAction('SET_MESSAGES_NOTIFICATIONS_AS_READ');

export const loadMessagesNotificationsAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}) => {
    let state = getState();
    let actions = halson(state.master.general.actions);

    if (actions.getUsersWithLastMessage) {
        return fetchUtils.call(actions.getUsersWithLastMessage, auth, {unseen: true, type: 'toMe'}).then((result) => {
            dispatch(setMessagesNotificationsAction(result));
            console.log('Messages notifications loaded');
        }).catch((err) => {
            console.log('Messages notifications load failed', err);
        })
    }
})

