/**
 * Created by Mike on 6/5/2017.
 */

'use strict';

import reduxUtils from '../../../utils/reduxUtils';
import fetchUtils from '../../../utils/fetchUtils';
import halson from 'halson';
import {editBookCopy, removeBookCopy} from '../shared/createEditBookCopy/createEditBookCopyActions';
import {draftBookRemovedAction} from './draftBooks/draftBooksActions';
import {
    editDraftBook,
    createDraftBook,
    removeDraftBook
} from '../shared/createEditBookManually/createEditBookManuallyActions';
import {resetModelToInitial} from "../shared/validation/actions";

export const initUserDataAction = reduxUtils.createAction('INIT_USER_DATA');
export const bookCopyRemovedAction = reduxUtils.createAction('BOOK_COPY_REMOVED_ACTION');
export const setMyBooksAction = reduxUtils.createAction('SET_MY_BOOKS');
export const setFavoriteBooksAction = reduxUtils.createAction('SET_MY_FAVORITE_BOOKS');
export const updateEditedBookCopyAction = reduxUtils.createAction('UPDATE_EDITED_BOOK_COPY');
export const updateEditedDraftBookAction = reduxUtils.createAction('UPDATE_EDITED_DRAFT_BOOK');
export const setUserInitializedAction = reduxUtils.createAction('SET_USER_INITIALIZED');
export const setBooksInitializedAction = reduxUtils.createAction('SET_USER_BOOKS_INITIALIZED');
export const setFavoritesInitializedAction = reduxUtils.createAction('SET_USER_FAVORITES_INITIALIZED');
export const setNotFoundAction = reduxUtils.createAction('SET_USER_NOT_FOUND');

export const loadUserDataAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {userSlug}) => {
    console.log('Load user data');

    let state = getState();
    let actions = halson(state.master.general.actions);

    if (actions.getUser) {
        return fetchUtils.call(actions.getUser, auth, null, {uriParams: {userId: userSlug}}).then((userData) => {
            console.log('User data loaded');
            dispatch(initUserDataAction(userData))
            if (userData.settings){
                dispatch(resetModelToInitial({
                    model: 'userData.userSettings.notificationsModel',
                    initialData: {
                        ...userData.settings.notifications.email
                    }
                }));
            }
        }).catch((err) => {
            if (err.statusCode == 404)
            {
                dispatch(setNotFoundAction(true))
            }
            dispatch(setFavoritesInitializedAction(true));
            console.log('User data failed', err);
        })
    }
});

export const removeBookCopyAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, intl, removeBookCopyURI, bookSlug) => {
    console.log('Unlink book');
    return removeBookCopy(dispatch, auth, intl, gtm, removeBookCopyURI, bookSlug).then((book) => {
        console.log('Book unlinked');
        dispatch(bookCopyRemovedAction(book));
    }).catch((err) => {
        console.log('Book unlink failed', err);
    })
});

export const loadUserBooksAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {userSlug}) => {
    let state = getState();
    let actions = state.master.general.actions;
    let loggedUserSlug = state.master.user.slug;

    return actions.getUserBookCopies && fetchUtils.call(actions.getUserBookCopies, auth, null, {uriParams: {userId: userSlug}}).then((result) => {
        if (gtm && (!loggedUserSlug || loggedUserSlug != userSlug)){
            let resultHal = halson(result);
            let bookCopies = resultHal.getEmbeds('bookCopies');
            gtm.ee.userBookCopiesImpressions(bookCopies)
        }

        dispatch(setMyBooksAction(result));
    }).catch((err) => {
        dispatch(setBooksInitializedAction(true));
        console.log('Load books failed', err);
    })
});

export const loadFavoriteBooksAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    let state = getState();
    let actions = state.master.general.actions;

    return actions.getFavoriteBooks && fetchUtils.call(actions.getFavoriteBooks, auth).then((result) => {
        dispatch(setFavoriteBooksAction(result));
    }).catch((err) => {
        dispatch(setFavoritesInitializedAction(true))
        console.log('Load books failed', err);
    })
});

export const editBookCopyAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, intl, editBookCopyURI, bookId, amount, swap, condition, comment, bookSlug) => {
    return editBookCopy(dispatch, auth, intl, gtm, editBookCopyURI, bookId, amount, swap, condition, comment, bookSlug)
        .then((result) => {
            dispatch(updateEditedBookCopyAction(result))
        })
        .catch((err) => {
            console.log('Edit book copy failed')
        })
});

export const removePendingBookAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, intl, bookDraftAction) => {
    return bookDraftAction && removeDraftBook(dispatch, auth, intl, gtm, bookDraftAction).then((draftBook) => {
        dispatch(draftBookRemovedAction(draftBook));
    }).catch((err) => {
        console.log('Load books failed', err);
    })
});

export const editDraftBookAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {intl, title, removeCover, cover, authors, publishers, publishDate, isbn10, isbn13, amount, swap, condition, comment, editDraftBookURI}) => {
    return editDraftBook(dispatch, auth, intl, gtm, editDraftBookURI, {
        title, cover, removeCover, authors, publishers, publishDate, isbn10, isbn13, amount, swap, condition, comment
    })
        .then((result) => {
            dispatch(updateEditedDraftBookAction(result));
        })
        .catch((err) => {
            console.log('Edit draft book failed')
        })
});









