/**
 * Created by Mike on 10/16/2017.
 */

'use strict';

import {combineReducers} from 'redux';
import halson from 'halson';
import {
    setUsersConversationsAction,
    setConversationAction,
    setSelectedRecipientAction,
    setConversationMessageAction,
    moreMessagesLoadedAction,
    setMoreMessagingLoadingAction,
    setScrollAction,
    moreUsersConversationsLoadedAction,
    setMoreUsersConversationsAreLoadingAction,
    setConversationAsReadAction,
    setDealRequestsAction,
    updateReceivedDealRequestLineAction,
    updateSentDealRequestLineAction,
    incrementUnseenMessagesAction,
    incrementUnseenRequestsAction,
    setReceivedDealRequestAction,
    setSentDealRequestAction,
    showDeactivateBookCopyPopupAction,
    setDeactivateBookCopyAction,
    setSentDealRequestLoadingStatusAction,
    setReceivedDealRequestLoadingStatusAction,
    setConversationLoadingStatusAction,
    setInitializedAction,
    setSentConversationMessageAction,
    setRecipientReadMessageAction,
    setConversationMessageUnsentStatusAction,
    setMarkAsReadLoadingStatusAction,
    setNotFoundAction,
    showConversationsListAction,
    showMessagesListAction,
    showUserInfoAction
} from './messagesActions'
import {setRemoveBookCopyLoadingStatusAction} from '../shared/createEditBookCopy/createEditBookCopyActions';
import {validationReducer} from '../shared/validation/validation';

export default {
    messages: combineReducers({
        general: (state = {
            scrollAction: 'scrollToBottom',
            actions: {},
            initialized: false,
            notFound: false,
            showConversationsList: true,
            showMessagesList: false,
            showUserInfo: false,
        }, action) => {
            switch (action.type) {
                case showConversationsListAction.type: {
                    return {
                        ...state,
                        showConversationsList: true,
                        showMessagesList: false,
                        showUserInfo: false
                    }
                }

                case showMessagesListAction.type: {
                    return {
                        ...state,
                        showConversationsList: false,
                        showMessagesList: true,
                        showUserInfo: false
                    }
                }

                case showUserInfoAction.type: {
                    return {
                        ...state,
                        showConversationsList: false,
                        showMessagesList: false,
                        showUserInfo: true
                    }
                }

                case setNotFoundAction.type: {
                    return {
                        ...state,
                        notFound: action.data
                    }
                }

                case setDealRequestsAction.type:
                case setInitializedAction.type: {
                    return {
                        ...state,
                        initialized: action.data
                    }
                }

                case setScrollAction.type: {
                    return {
                        ...state,
                        scrollAction: action.data
                    }
                }

                default: {
                    return state;
                }
            }
        },
        usersConversations: (state = {
            items: [],
            selectedRecipient: null,
            moreUsersConversationsAreLoading: false,
            markAsReadLoading: false,
            actions: {
                loadMoreUsersConversations: null
            }
        }, action) => {
            switch (action.type) {
                case setMarkAsReadLoadingStatusAction.type: {
                    return {
                        ...state,
                        markAsReadLoading: action.data
                    }
                }

                case setUsersConversationsAction.type: {
                    let dataHal = halson(action.data);
                    return {
                        ...state,
                        items: dataHal.getEmbeds('usersConversations'),
                        actions: {
                            ...state.actions,
                            loadMoreUsersConversations: dataHal.getLink('next'),
                        }
                    }
                }

                case setSelectedRecipientAction.type: {
                    return {
                        ...state,
                        selectedRecipient: action.data
                    }
                }

                case setMoreUsersConversationsAreLoadingAction.type: {
                    return {
                        ...state,
                        moreUsersConversationsAreLoading: action.data
                    }
                }

                case moreUsersConversationsLoadedAction.type: {
                    let dataHal = halson(action.data);
                    let userConversations = dataHal.getEmbeds('usersConversations');
                    return {
                        ...state,
                        items: [...state.items, ...userConversations],
                        actions: {
                            ...state.actions,
                            loadMoreUsersConversations: dataHal.getLink('next'),
                        }
                    }
                }

                case setConversationMessageAction.type: {
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

                case incrementUnseenMessagesAction.type: {
                    return {
                        ...state,
                        items: state.items.map((item) => {
                            if (item._id != action.data._id)
                                return item;

                            return {
                                ...item,
                                unseenMessages: typeof item.unseenMessages != 'undefined' ? item.unseenMessages + 1 : 1
                            }
                        })
                    }
                }

                case incrementUnseenRequestsAction.type: {
                    return {
                        ...state,
                        items: state.items.map((item) => {
                            if (item._id != action.data._id)
                                return item;

                            return {
                                ...item,
                                unseenRequests: typeof item.unseenRequests != 'undefined' ? item.unseenRequests + 1 : 1
                            }
                        })
                    }
                }

                case setConversationAsReadAction.type: {
                    return {
                        ...state,
                        items: state.items.map((item) => {
                            if (item._id != action.data._id)
                                return item;

                            return {
                                ...item,
                                unseenMessages: 0,
                                unseenRequests: 0,
                                _embedded: {
                                    ...item._embedded,
                                    messages: halson(item).getEmbeds('messages').map((message) => {
                                        return {
                                            ...message,
                                            seen: true,
                                            _links: message._links && Object.keys(message._links).reduce((result, link) => {
                                                if (link != 'markAsRead') {
                                                    result[item] = item._links[link];
                                                }
                                                return result;
                                            }, {})
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                default: {
                    return state;
                }
            }
        },
        conversation: (state = {
            moreMessagesAreLoading: false,
            recipient: null,
            loading: false,
            messages: [],
            actions: {
                loadMoreMessages: null
            }
        }, action) => {
            switch (action.type) {
                case setConversationLoadingStatusAction.type: {
                    return {
                        ...state,
                        loading: action.data
                    }
                }

                case setConversationAction.type: {
                    let dataHal = halson(action.data);
                    return {
                        ...state,
                        recipient: dataHal.recipient,
                        messages: dataHal.getEmbeds('messages'),
                        actions: {
                            ...state.actions,
                            loadMoreMessages: dataHal.getLink('next'),
                        }
                    }
                }

                case setMoreMessagingLoadingAction.type: {
                    return {
                        ...state,
                        moreMessagesAreLoading: action.data
                    }
                }

                case setSentConversationMessageAction.type: {
                    let messagesFound = false;
                    let tempId = action.data.tempId;

                    let newMessages = state.messages
                        .map(m => {
                            if (tempId && m.tempId == tempId) {
                                messagesFound = true;
                                return {
                                    ...m,
                                    ...action.data
                                };
                            }

                            return m;
                        })

                    if (!messagesFound)
                        newMessages.push(action.data)

                    return {
                        ...state,
                        messages: newMessages
                    }
                }

                case setConversationMessageUnsentStatusAction.type: {
                    return {
                        ...state,
                        messages: state.messages.map(m => {
                            if (m.tempId && m.tempId == action.data.tempId) {
                                return {
                                    ...m,
                                    unSent: action.data.status
                                };
                            }

                            return m;
                        })
                    }
                }

                case setRecipientReadMessageAction.type: {
                    return {
                        ...state,
                        messages: state.messages.map(m => {
                            if (m.to != state.recipient._id)
                                return m;

                            return {
                                ...m,
                                seen: true
                            }
                        })
                    }
                }

                case setConversationMessageAction.type: {
                    let dataHal = halson(action.data);
                    let message = dataHal.getEmbed('messages');
                    let messagesFound = false;
                    let tempId = dataHal.tempId;

                    if (state.recipient && state.recipient._id != action.data.recipient._id)
                        return state;

                    let newMessages = state.messages
                        .map(m => {
                            if ((!tempId && m._id == message._id) ||
                                (tempId && m.tempId == tempId)) {
                                messagesFound = true;
                                return {
                                    ...m,
                                    ...message
                                };
                            }

                            return m;
                        })

                    if (!messagesFound)
                        newMessages.push(message)

                    return {
                        ...state,
                        messages: newMessages
                    }
                }

                case moreMessagesLoadedAction.type: {
                    let dataHal = halson(action.data);
                    let messages = dataHal.getEmbeds('messages');
                    return {
                        ...state,
                        messages: [...messages, ...state.messages],
                        actions: {
                            ...state.actions,
                            loadMoreMessages: dataHal.getLink('next'),
                        }
                    }
                }

                default: {
                    return state;
                }
            }
        },
        dealRequests: (state = {
            received: [],
            sent: [],
            user: null,
            deactivateBookCopy: {
                showDeactivateBookCopyPopup: false,
                dealRequestId: null,
                bookCopyId: null,
                bookCopySlug: null,
                removeBookCopyURI: null,
                removeBookCopyLoading: false
            }
        }, action) => {
            switch (action.type) {
                case setRemoveBookCopyLoadingStatusAction.type: {
                    return {
                        ...state,
                        deactivateBookCopy: {
                            ...state.deactivateBookCopy,
                            removeBookCopyLoading: action.data.loading
                        }
                    }
                }

                case setDealRequestsAction.type: {
                    let dataHal = halson(action.data);
                    let receivedDealRequests = dataHal.getEmbeds('receivedDealRequests');
                    let sentDealRequests = dataHal.getEmbeds('sentDealRequests');
                    let user = dataHal.getEmbed('user');
                    return {
                        ...state,
                        received: receivedDealRequests,
                        sent: sentDealRequests,
                        user
                    }
                }

                case setSentDealRequestAction.type: {
                    let requestFound = false;

                    let newSentRequests = state.sent.map((r) => {
                        if (r._id != action.data._id)
                            return r;

                        requestFound = true;
                        return r;
                    })

                    if (!requestFound)
                        newSentRequests.unshift(action.data)

                    return {
                        ...state,
                        sent: newSentRequests
                    }
                }

                case setReceivedDealRequestAction.type: {
                    let requestFound = false;

                    let newReceivedRequests = state.received.map((r) => {
                        if (r._id != action.data._id)
                            return r;

                        requestFound = true;
                        return r;
                    })

                    if (!requestFound)
                        newReceivedRequests.unshift(action.data)

                    return {
                        ...state,
                        received: newReceivedRequests
                    }
                }

                case updateReceivedDealRequestLineAction.type: {
                    let dealRequestLineHal = halson(action.data);
                    let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
                    return {
                        ...state,
                        received: state.received.map((dealRequest) => {
                            if (dealRequest._id !== dealRequestLineHal.dealRequestId)
                                return dealRequest;

                            return {
                                ...dealRequest,
                                _embedded: {
                                    ...dealRequest._embedded,
                                    dealRequestLines: dealRequest._embedded.dealRequestLines.map((dealRequestLine) => {
                                        if (dealRequestLine._embedded.bookCopySnapshot._id != bookCopySnapshot._id)
                                            return dealRequestLine;

                                        return {
                                            ...dealRequestLine,
                                            _links: dealRequestLineHal._links
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case updateSentDealRequestLineAction.type: {
                    let dealRequestLineHal = halson(action.data);
                    let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
                    return {
                        ...state,
                        sent: state.sent.map((dealRequest) => {
                            if (dealRequest._id !== dealRequestLineHal.dealRequestId)
                                return dealRequest;

                            return {
                                ...dealRequest,
                                _embedded: {
                                    ...dealRequest._embedded,
                                    dealRequestLines: dealRequest._embedded.dealRequestLines.map((dealRequestLine) => {
                                        if (dealRequestLine._embedded.bookCopySnapshot._id != bookCopySnapshot._id)
                                            return dealRequestLine;

                                        return {
                                            ...dealRequestLine,
                                            _links: dealRequestLineHal._links
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case showDeactivateBookCopyPopupAction.type: {
                    return {
                        ...state,
                        deactivateBookCopy: {
                            ...state.deactivateBookCopy,
                            showDeactivateBookCopyPopup: action.data,
                        }
                    }
                }

                case setDeactivateBookCopyAction.type: {
                    return {
                        ...state,
                        deactivateBookCopy: {
                            ...state.deactivateBookCopy,
                            dealRequestId: action.data.dealRequestId,
                            bookCopyId: action.data.bookCopyId,
                            bookCopySlug: action.data.bookCopySlug,
                            removeBookCopy: action.data.removeBookCopy
                        }

                    }
                }

                case setSentDealRequestLoadingStatusAction.type: {
                    return {
                        ...state,
                        sent: state.sent.map((dealRequest) => {
                            if (dealRequest._id !== action.data.dealRequestId)
                                return dealRequest;

                            return {
                                ...dealRequest,
                                _embedded: {
                                    ...dealRequest._embedded,
                                    dealRequestLines: dealRequest._embedded.dealRequestLines.map((dealRequestLine) => {
                                        if (dealRequestLine._embedded.bookCopySnapshot._id != action.data.bookCopyId)
                                            return dealRequestLine;

                                        return {
                                            ...dealRequestLine,
                                            loading: action.data.loading
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case setReceivedDealRequestLoadingStatusAction.type: {
                    return {
                        ...state,
                        received: state.received.map((dealRequest) => {
                            if (dealRequest._id !== action.data.dealRequestId)
                                return dealRequest;

                            return {
                                ...dealRequest,
                                _embedded: {
                                    ...dealRequest._embedded,
                                    dealRequestLines: dealRequest._embedded.dealRequestLines.map((dealRequestLine) => {
                                        if (dealRequestLine._embedded.bookCopySnapshot._id != action.data.bookCopyId)
                                            return dealRequestLine;

                                        return {
                                            ...dealRequestLine,
                                            loading: action.data.loading
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                default: {
                    return state;
                }
            }
        },
        conversationMessage: validationReducer(
            {
                message: '',
            }, 'messages.conversationMessage')
    })
}