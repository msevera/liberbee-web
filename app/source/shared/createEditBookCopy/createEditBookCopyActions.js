'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import {addMessage} from '../../master/notifier/notifierActions';
import {defineMessages} from 'react-intl';
import {clearFormErrors} from "../validation/actions";

export const setCreateEditBookCopyDataAction = reduxUtils.createAction('SET_CREATE_EDIT_BOOK_COPY_DATA_POPUP');
export const setCreateEditBookCopyLoadingStatusAction = reduxUtils.createAction('SET_CREATE_EDIT_BOOK_COPY_LOADING_STATUS');
export const resetCreateEditBookCopyPopupAction = reduxUtils.createAction('RESET_CREATE_BOOK_COPY_POPUP');
export const setShowCreateEditBookCopyPopupAction = reduxUtils.createAction('SET_SHOW_CREATE_EDIT_BOOK_COPY_POPUP');
export const setShowCreateEditBookCopyLoadingStatusAction = reduxUtils.createAction('SET_SHOW_CREATE_EDIT_BOOK_COPY_LOADING_STATUS');
export const setRemoveBookCopyLoadingStatusAction = reduxUtils.createAction('SET_REMOVE_BOOK_COPY_LOADING_STATUS');

const messages = defineMessages({
    createBookCopyFailed: {
        id: 'createEditBookCopy.createBookCopyFailed',
        defaultMessage: 'Adding book to shelf failed'
    },
    editBookCopyFailed: {
        id: 'createEditBookCopy.editBookCopyFailed',
        defaultMessage: 'Price change failed'
    },
    removeBookCopyFailed: {
        id: 'createEditBookCopy.removeBookCopyFailed',
        defaultMessage: 'Remove book copy failed'
    },
    bookCopySaved: {
        id: 'createEditBookCopy.bookCopySaved',
        defaultMessage: 'Price changed'
    },
    bookCopyAddedToShelf: {
        id: 'createEditBookCopy.bookCopyAddedToShelf',
        defaultMessage: 'Book is put up for sale'
    },
    bookCopyRemovedFromShelf: {
        id: 'createEditBookCopy.bookCopyRemovedFromShelf',
        defaultMessage: 'Book is removed from sale'
    }
})

export const showCreateBookCopyPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, gtm}, {createEditBookCopyURI, bookId, bookSlug, cover}) => {
    dispatch(setShowCreateEditBookCopyLoadingStatusAction({
        bookId,
        loading: true
    }))
    return fetchUtils.get('checkFilledRequiredInfo', '/users/me/checkrequiredinfo', {auth})
        .then(() => {
            gtm.sendEvent('addToShelfClick')
            dispatch(setCreateEditBookCopyDataAction({createEditBookCopyURI, bookId, bookSlug, cover}))
        })
        .catch((err) => {
            console.log('Required info is not set');
        })
        .then(() => {
            dispatch(setShowCreateEditBookCopyLoadingStatusAction({
                bookId,
                loading: false
            }))
        })
});

export const showEditBookCopyPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, gtm}, {createEditBookCopyURI, bookId, bookSlug, cover, showComment}) => {
    dispatch(setShowCreateEditBookCopyLoadingStatusAction({
        bookId,
        loading: true
    }))
    return fetchUtils.get('checkFilledRequiredInfo', '/users/me/checkrequiredinfo', {auth})
        .then(() => {
            gtm.sendEvent('editInShelfClick')
            dispatch(setCreateEditBookCopyDataAction({createEditBookCopyURI, bookId, bookSlug, cover, showComment}))
        })
        .catch((err) => {
            console.log('Required info is not set');
        })
        .then(() => {
            dispatch(setShowCreateEditBookCopyLoadingStatusAction({
                bookId,
                loading: false
            }))
        })
});

export const hideCreateEditBookCopyPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    dispatch(setShowCreateEditBookCopyPopupAction(false));
    setTimeout(() => {
        dispatch(clearFormErrors({model: 'master.createEditAuthor.createEditAuthorModel'}))
        dispatch(resetCreateEditBookCopyPopupAction());
    }, 500)
});

export const createBookCopy = (dispatch, auth, intl, gtm, createBookCopyURI, bookId, amount, swap, condition, comment, bookSlug) => {
    dispatch(setCreateEditBookCopyLoadingStatusAction(true));
    return fetchUtils.call(createBookCopyURI, auth, {bookId, amount, swap, condition, comment})
        .then((result) => {
            gtm.sendEvent('addedToShelf', {bookSlug, userId: auth.userId, bookCopyPrice: Math.round(amount)});
            let text = intl.formatMessage(messages.bookCopyAddedToShelf)
            dispatch(addMessage({text, type: 'success'}));
            dispatch(hideCreateEditBookCopyPopupAction());
            setTimeout(() => {
                dispatch(setCreateEditBookCopyLoadingStatusAction(false));
            }, 1000)
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.createBookCopyFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            dispatch(setCreateEditBookCopyLoadingStatusAction(false));
            throw err;
        })
}

export const editBookCopy = (dispatch, auth, intl, gtm, editBookCopyURI, bookId, amount, swap, condition, comment, bookSlug) => {
    dispatch(setCreateEditBookCopyLoadingStatusAction(true));
    return fetchUtils.call(editBookCopyURI, auth, {bookId, amount, swap, condition, comment})
        .then((result) => {
            gtm.sendEvent('editedInShelf', {bookSlug, userId: auth.userId, bookCopyPrice: Math.round(amount)});
            dispatch(addMessage({text: intl.formatMessage(messages.bookCopySaved), type: 'success'}));
            dispatch(hideCreateEditBookCopyPopupAction());
            setTimeout(() => {
                dispatch(setCreateEditBookCopyLoadingStatusAction(false));
            }, 1000)
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.editBookCopyFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            dispatch(setCreateEditBookCopyLoadingStatusAction(false));
            throw err;
        })
}

export const removeBookCopy = (dispatch, auth, intl, gtm, removeBookCopyURI, bookSlug) => {
    dispatch(setRemoveBookCopyLoadingStatusAction({
        bookSlug,
        loading: true
    }))

    return fetchUtils.call(removeBookCopyURI, auth).then((book) => {
        gtm.sendEvent('removedFromShelf', {bookSlug, userId: auth.userId, bookCopyPrice: Math.round(book.deal.amount)});
        let text = intl.formatMessage(messages.bookCopyRemovedFromShelf)
        dispatch(addMessage({text, type: 'success'}));
        setTimeout(() => {
            dispatch(setRemoveBookCopyLoadingStatusAction({
                bookSlug,
                loading: false
            }))
        }, 1000)

        return book;
    }).catch((err) => {
        let title = intl.formatMessage(messages.removeBookCopyFailed);
        let text = '';
        if (err.body && err.body.message) {
            text = err.body.message;
        }
        dispatch(addMessage({text, title, type: 'error'}));
        dispatch(setRemoveBookCopyLoadingStatusAction({
            bookSlug,
            loading: false
        }))
        throw err;
    })
}

