/**
 * Created by Mike on 10/31/2017.
 */


'use strict';

import {
    setMessagesNotificationsAction,
    setMessagesNotificationAction,
    incrementUnseenMessageNotificationRequestsAction,
    incrementUnseenMessagesNotificationAction,
    moreMessagesNotificationsLoadedAction,
    setMoreMessagesNotificationsAreLoading,
    setMessagesNotificationsAsReadAction
} from './messagesNotificationsActions';
import {
    setConversationAsReadAction,
} from '../../messages/messagesActions'
import halson from 'halson';

export default (state = {
    items: [],
    total: 0,
    moreMessagesNotificationsAreLoading: false,
    actions: {
        loadMoreMessagesNotifications: null
    }
}, action) => {
    switch (action.type) {
        case setMessagesNotificationsAction.type: {
            let dataHal = halson(action.data);
            let items = dataHal.getEmbeds('usersConversations');
            return {
                ...state,
                total: dataHal.total,
                items,
                actions: {
                    ...state.actions,
                    loadMoreMessagesNotifications: dataHal.getLink('next'),
                }
            }
        }

        case moreMessagesNotificationsLoadedAction.type: {
            let dataHal = halson(action.data);
            let userConversations = dataHal.getEmbeds('usersConversations');
            return {
                ...state,
                items: [...state.items, ...userConversations],
                actions: {
                    ...state.actions,
                    loadMoreMessagesNotifications: dataHal.getLink('next'),
                }
            }
        }

        case setMoreMessagesNotificationsAreLoading.type: {
            return {
                ...state,
                moreMessagesNotificationsAreLoading: action.data
            }
        }

        case setConversationAsReadAction.type: {
            return {
                ...state,
                items: state.items.filter((item) => {
                    return item._id != action.data._id;
                })
            }
        }

        case setMessagesNotificationAction.type: {
            let dataHal = halson(action.data);
            let conversation = state.items.find(conv => conv._id === dataHal._id);

            let items = [];
            if (conversation) {
                items = state.items.reduce((result, item) => {
                    if (item._id != dataHal._id) {
                        result.push(item);
                    } else {
                        result.unshift(item);
                    }

                    return result;
                }, []).map((item) => {
                    if (item._id != dataHal._id)
                        return item;

                    let messages = dataHal.getEmbed('messages');
                    return {
                        ...item,
                        _embedded: {
                            ...item._embedded,
                            messages
                        }
                    }
                })
            } else {
                items = [action.data, ...state.items];
            }

            return {
                ...state,
                items
            }
        }

        case incrementUnseenMessagesNotificationAction.type: {
            return {
                ...state,
                items: state.items.map((item) => {
                    if (item._id != action.data._id)
                        return item;

                    return {
                        ...item,
                        unseenMessages: item.unseenMessages ? item.unseenMessages + 1 : 1
                    }
                })
            }
        }

        case incrementUnseenMessageNotificationRequestsAction.type: {
            return {
                ...state,
                items: state.items.map((item) => {
                    if (item._id != action.data._id)
                        return item;

                    return {
                        ...item,
                        unseenRequests: item.unseenRequests ? item.unseenRequests + 1 : 1
                    }
                })
            }
        }

        case setMessagesNotificationsAsReadAction.type: {
            return {
                ...state,
                items: state.items.filter((item) => {
                    return item._id != action.data._id;
                })
            }
        }

        default:
            return state;
    }
}