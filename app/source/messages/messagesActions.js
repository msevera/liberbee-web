/**
 * Created by Mike on 10/16/2017.
 */

'use strict';

import reduxUtils from '../../../utils/reduxUtils';
import fetchUtils from '../../../utils/fetchUtils';
import history from '../../../utils/history';
import {submitForm, clearFormErrors, resetForm} from '../shared/validation/actions';
import {conversationMessageFormValidators} from './formValidators';
import AppUtils from '../../../utils/appUtils';
import halson from 'halson';
import {removeBookCopy} from '../shared/createEditBookCopy/createEditBookCopyActions';

export const setUsersConversationsAction = reduxUtils.createAction('SET_USERS_CONVERSATIONS');
export const setConversationAction = reduxUtils.createAction('SET_CONVERSATION');
export const setConversationMessageAction = reduxUtils.createAction('SET_CONVERSATION_MESSAGE');
export const setSelectedRecipientAction = reduxUtils.createAction('SET_SELECTED_RECIPIENT');
export const moreMessagesLoadedAction = reduxUtils.createAction('MORE_MESSAGES_LOADED');
export const setMoreMessagingLoadingAction = reduxUtils.createAction('SET_MORE_MESSAGES_LOADING');
export const setScrollAction = reduxUtils.createAction('SET_SCROLL_ACTION');
export const moreUsersConversationsLoadedAction = reduxUtils.createAction('MORE_USERS_CONVERSATIONS_LOADED');
export const setMoreUsersConversationsAreLoadingAction = reduxUtils.createAction('SET_MORE_USERS_CONVERSATIONS_LOADING');
export const setConversationAsReadAction = reduxUtils.createAction('SET_CONVERSATION_AS_READ');
export const setDealRequestsAction = reduxUtils.createAction('SET_DEAL_REQUESTS_ACTION');
export const setReceivedDealRequestAction = reduxUtils.createAction('SET_RECEIVED_DEAL_REQUEST');
export const setSentDealRequestAction = reduxUtils.createAction('SET_SENT_DEAL_REQUEST');
export const updateReceivedDealRequestLineAction = reduxUtils.createAction('UPDATE_RECEIVED_DEAL_REQUEST_LINE');
export const updateSentDealRequestLineAction = reduxUtils.createAction('UPDATE_SENT_DEAL_REQUEST_LINE');
export const incrementUnseenMessagesAction = reduxUtils.createAction('INCREMENT_UNSEEN_MESSAGES');
export const incrementUnseenRequestsAction = reduxUtils.createAction('INCREMENT_UNSEEN_REQUESTS');
export const showDeactivateBookCopyPopupAction = reduxUtils.createAction('DEACTIVATE_BOOK_COPY_POPUP');
export const setDeactivateBookCopyAction = reduxUtils.createAction('SET_DEACTIVATE_BOOK_COPY');
export const setReceivedDealRequestLoadingStatusAction = reduxUtils.createAction('SET_RECEIVED_DEAL_REQUEST_LOADING_STATUS');
export const setSentDealRequestLoadingStatusAction = reduxUtils.createAction('SET_SENT_DEAL_REQUEST_LOADING_STATUS');
export const setConversationLoadingStatusAction = reduxUtils.createAction('SET_CONVERSATION_LOADING_STATUS');
export const setInitializedAction = reduxUtils.createAction('SET_MESSAGES_INITIALIZED');
export const setSentConversationMessageAction = reduxUtils.createAction('SET_SENT_CONVERSATION_MESSAGE');
export const setRecipientReadMessageAction = reduxUtils.createAction('SET_RECIPIENT_READ_MESSAGE');
export const setConversationMessageUnsentStatusAction = reduxUtils.createAction('SET_CONVERSATION_MESSAGE_UNSENT_STATUS');
export const setMarkAsReadLoadingStatusAction = reduxUtils.createAction('SET_MARK_AS_READ_LOADING_STATUS');
export const setNotFoundAction = reduxUtils.createAction('SET_MESSAGES_NOT_FOUND');
export const showConversationsListAction = reduxUtils.createAction('SHOW_MESSAGES_CONVERSATIONS_LIST');
export const showMessagesListAction = reduxUtils.createAction('SHOW_MESSAGES_LIST');
export const showUserInfoAction = reduxUtils.createAction('SHOW_USER_INFO');

export const loadUsersWithLastMessageAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}) => {
    let state = getState();
    let actions = state.master.general.actions;

    if (actions.getUsersWithLastMessage) {
        return fetchUtils.call(actions.getUsersWithLastMessage, auth).then((result) => {

            let conversations = halson(result).getEmbeds('usersConversations');
            if (conversations.length == 0){
                dispatch(setInitializedAction(true));
            }

            dispatch(setUsersConversationsAction(result));
            console.log('Users with last message loaded');
        }).catch((err) => {
            dispatch(setInitializedAction(true));
            console.log('Users with last message load failed', err);
        })
    }
});

export const selectUserConversationAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver}, {recipient}) => {

    dispatch(setSelectedRecipientAction(recipient.slug));

    history.push(routeResolver.buildRouteFor('receivedFromUserRequests', {
        type: 'u',
        data: recipient.slug
    }, {redirect: true, override: {usersWithConversations: {redirect: false, reload: false}}}))
});

export const loadConversationByUserAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {user}) => {
    let state = getState();
    let actions = state.master.general.actions;
    dispatch(setScrollAction('scrollToBottom'))
    dispatch(setSelectedRecipientAction(user));

    let actionsToCall = []

    if (actions.getDealRequests) {
        actionsToCall.push(
            fetchUtils.call(actions.getDealRequests, auth, {}, {uriParams: {user}}).then((result) => {
                dispatch(setDealRequestsAction(result));
                console.log('Deal requests loaded');
            }).catch((err) => {
                console.log('Deal requests load failed', err);
            })
        )

    }

    if (actions.getMessagesWithUser) {
        actionsToCall.push(
            fetchUtils.call(actions.getMessagesWithUser, auth, {}, {uriParams: {user}}).then((result) => {
                dispatch(setConversationAction(result));
                AppUtils.isBrowser && dispatch(setScrollAction(''))
                console.log('Users with last message loaded');
            }).catch((err) => {
                if (err.statusCode == 404)
                {
                    dispatch(setNotFoundAction(true))
                }
                console.log('Users with last message load failed', err);
            })
        )
    }

    return Promise.all(actionsToCall)
});

export const loadConversationByIncRequestAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, request) => {

});

export const loadConversationByOutRequestAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, request) => {

});

export const onConversationMessageSendRepeatAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, message) => {
    let state = getState();
    let actions = state.master.general.actions;

    dispatch(setSentConversationMessageAction({
        ...message,
        unSent: false
    }));

    if (actions.createMessage) {
        return fetchUtils.call(actions.createMessage, auth, {message: message.text, to: message.to, tempId: message.tempId}).then((result) => {
            gtm.sendEvent('messageSent', {userId: auth.userId, wordsCount: message.text.split(' ').length})

            dispatch(setConversationMessageAction({...result}));

            dispatch(setScrollAction(''))
            console.log('Users with last message loaded');
        }).catch((err) => {
            console.log('Users with last message load failed', err);
            dispatch(setConversationMessageUnsentStatusAction({status: true, tempId: message.tempId}))
        })
    }
});

export const onConversationMessageSendAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, {message}) => {
    let state = getState();
    let actions = state.master.general.actions;
    let conversation = state.messages.conversation;
    let recipient = conversation.recipient;
    let selectedConversation = state.messages.usersConversations.items.find((conv) => {
        return conv.recipient.slug == recipient.slug;
    })

    dispatch(resetForm({model: 'messages.conversationMessage', validators: conversationMessageFormValidators}));
    let created = new Date();
    let tempId = created.getTime();
    dispatch(setSentConversationMessageAction({
        conversationId: selectedConversation._id,
        tempId,
        to: recipient._id,
        seen: false,
        text: message,
        from: state.master.user._id,
        created: created.toISOString()

    }));
    dispatch(setScrollAction('scrollToBottom'))

    if (actions.createMessage) {
        return fetchUtils.call(actions.createMessage, auth, {message, to: recipient._id, tempId}).then((result) => {
            gtm.sendEvent('messageSent', {userId: auth.userId, wordsCount: message.split(' ').length})

            dispatch(setConversationMessageAction({...result}));

            dispatch(setScrollAction(''))
            console.log('Users with last message loaded');
        }).catch((err) => {
            console.log('Users with last message load failed', err);
            dispatch(setConversationMessageUnsentStatusAction({status: true, tempId}))
        })
    }
});

export const loadMoreMessagesAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, loadMoreMessagesURI) => {
    dispatch(setScrollAction(''))
    dispatch(setMoreMessagingLoadingAction(true));

    if (loadMoreMessagesURI) {
        return fetchUtils.call(loadMoreMessagesURI, auth).then((result) => {
            dispatch(setMoreMessagingLoadingAction(false));
            dispatch(moreMessagesLoadedAction(result));
            dispatch(setScrollAction('updateScrollPosition'))
            dispatch(setScrollAction(''))
            console.log('More messages loaded');
        }).catch((err) => {
            dispatch(setMoreMessagingLoadingAction(false));
            console.log('More messages load failed', err);
        })
    }
});

export const loadMoreUsersConversationsAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, loadMoreUsersConversations) => {
    dispatch(setMoreUsersConversationsAreLoadingAction(true));
    if (loadMoreUsersConversations) {
        return fetchUtils.call(loadMoreUsersConversations, auth).then((result) => {
            dispatch(setMoreUsersConversationsAreLoadingAction(false));
            dispatch(moreUsersConversationsLoadedAction(result))
            console.log('More messages loaded');
        }).catch((err) => {
            dispatch(setMoreUsersConversationsAreLoadingAction(false));
            console.log('More messages load failed', err);
        })
    }
});

export const markAsReadAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}) => {
    let state = getState();
    let recipient = state.messages.usersConversations.selectedRecipient;
    let selectedConversation = state.messages.usersConversations.items.find((conv) => {
        return conv.recipient.slug == recipient;
    })

    if (!selectedConversation)
        return;

    let conversationMessage = halson(selectedConversation).getEmbed('messages');
    let markAsReadURI = conversationMessage.getLink('markAsRead');

    //let markAsReadURI = halson(selectedConversation).getLink('markAsRead');
    if (markAsReadURI) {
        dispatch(setMarkAsReadLoadingStatusAction(true))
        return fetchUtils.call(markAsReadURI, auth).then(() => {
            dispatch(setConversationAsReadAction(selectedConversation))
            console.log('More messages loaded');
        }).catch((err) => {
            console.log('More messages load failed', err);
        }).then(() => {
            dispatch(setMarkAsReadLoadingStatusAction(false))
        })
    }
});


export const markAsReceivedDealRequestLineAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, markAsReceivedDealRequestLineURI, bookCopy, dealRequestId, bookCopyId) => {
    if (markAsReceivedDealRequestLineURI) {
        dispatch(setSentDealRequestLoadingStatusAction({
            dealRequestId,
            bookCopyId,
            loading: true
        }))

        return fetchUtils.call(markAsReceivedDealRequestLineURI, auth).then((result) => {
            let bookCopyHal = halson(bookCopy);
            let book = bookCopyHal.getEmbed('book');

            gtm.ee.purchase(result.dealRequestId, bookCopy);
            gtm.sendEvent('markedAsReceived', {
                bookSlug: book.slug,
                bookCopyPrice: Math.round(bookCopy.deal.amount),
                userId: auth.userId
            });
            dispatch(updateSentDealRequestLineAction(result));
        }).catch((err) => {
            console.log('Failed to mark as received deal request line')
        }).then(() => {
            dispatch(setSentDealRequestLoadingStatusAction({
                dealRequestId,
                bookCopyId,
                loading: false
            }))
        })
    }
});

export const undoReceivedDealRequestLineAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, undoReceivedDealRequestLineURI, bookCopy, dealRequestId, bookCopyId) => {
    if (undoReceivedDealRequestLineURI) {
        dispatch(setSentDealRequestLoadingStatusAction({
            dealRequestId,
            bookCopyId,
            loading: true
        }))
        return fetchUtils.call(undoReceivedDealRequestLineURI, auth).then((result) => {
            let bookCopyHal = halson(bookCopy);
            let book = bookCopyHal.getEmbed('book');

            gtm.ee.refund(result.dealRequestId, bookCopy);
            gtm.sendEvent('markedAsUndoReceived', {
                bookSlug: book.slug,
                bookCopyPrice: Math.round(bookCopy.deal.amount),
                userId: auth.userId
            });
            dispatch(updateSentDealRequestLineAction(result));
        }).catch((err) => {
            console.log('Failed to undo received deal request line')
        }).then(() => {
            dispatch(setSentDealRequestLoadingStatusAction({
                dealRequestId,
                bookCopyId,
                loading: false
            }))
        })
    }
});

export const undoSentDealRequestLineAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, undoSentDealRequestLineURI, bookSlug, amount, dealRequestId, bookCopyId) => {
    if (undoSentDealRequestLineURI) {
        dispatch(setReceivedDealRequestLoadingStatusAction({
            dealRequestId,
            bookCopyId,
            loading: true
        }))
        return fetchUtils.call(undoSentDealRequestLineURI, auth).then((result) => {
            gtm.sendEvent('markedAsUndoSent', {bookSlug, bookCopyPrice: Math.round(amount), userId: auth.userId});
            dispatch(updateReceivedDealRequestLineAction(result));
        }).catch((err) => {
            console.log('Failed to undo sent deal request line')
        }).then(() => {
            dispatch(setReceivedDealRequestLoadingStatusAction({
                dealRequestId,
                bookCopyId,
                loading: false
            }))
        })
    }
});

export const markAsSentDealRequestLineAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, markAsSentDealRequestLineURI, bookSlug, amount, dealRequestId, bookCopyId) => {
    if (markAsSentDealRequestLineURI) {
        dispatch(setReceivedDealRequestLoadingStatusAction({
            dealRequestId,
            bookCopyId,
            loading: true
        }))
        return fetchUtils.call(markAsSentDealRequestLineURI, auth).then((result) => {
            gtm.sendEvent('markedAsSent', {bookSlug, bookCopyPrice: Math.round(amount), userId: auth.userId});

            dispatch(updateReceivedDealRequestLineAction(result));

            let resultHal = halson(result);
            let bookCopySnapshot = resultHal.getEmbed('bookCopySnapshot');
            let removeBookCopyURI = resultHal.getLink('removeBookCopy');
            if (removeBookCopyURI) {
                dispatch(showDeactivateBookCopyPopupAction(true));
                dispatch(setDeactivateBookCopyAction({
                    dealRequestId: result.dealRequestId,
                    bookCopyId: bookCopySnapshot._id,
                    bookCopySlug: bookSlug,
                    removeBookCopy: removeBookCopyURI
                }))
            }
        }).catch((err) => {
            console.log('Failed to mark as sent deal request line')
        }).then(() => {
            dispatch(setReceivedDealRequestLoadingStatusAction({
                dealRequestId,
                bookCopyId,
                loading: false
            }))
        })
    }
});


export const removeBookCopyAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, removeBookCopyURI, bookSlug) => {
    if (removeBookCopyURI) {
        return removeBookCopy(dispatch, auth, intl, gtm, removeBookCopyURI, bookSlug)
            .then(() => {
                dispatch(showDeactivateBookCopyPopupAction(false));
                setTimeout(() => {
                    dispatch(setDeactivateBookCopyAction({}));
                }, 500)
            })
            .catch((err) => {
                console.log('Book unlink failed', err);
            })
    }
})