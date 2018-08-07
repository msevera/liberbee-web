/**
 * Created by Mike on 9/24/2017.
 */

'use strict';

import reduxUtils from '../../../utils/reduxUtils';
import fetchUtils from '../../../utils/fetchUtils';
import halson from 'halson';
import history from '../../../utils/history';
import {createBookCopy, removeBookCopy} from '../shared/createEditBookCopy/createEditBookCopyActions';
import {debounce} from 'throttle-debounce';
import {
    createDraftBook
} from '../shared/createEditBookManually/createEditBookManuallyActions';

export const addBookSearchSetResultsAction = reduxUtils.createAction('ADD_BOOK_SEARCH_RESULTS');
export const bookCreatedAction = reduxUtils.createAction('BOOK_CREATED_ACTION');
export const bookCopyCreatedAction = reduxUtils.createAction('BOOK_COPY_CREATED_ACTION');
export const clearAddBookResultsAction = reduxUtils.createAction('CLEAR_ADD_BOOK_RESULTS');
export const moreBooksLoadedAction = reduxUtils.createAction('ADD_BOOK_MORE_BOOKS_LOADED');
export const setAddBookSearchLoadingStatus = reduxUtils.createAction('SET_ADD_BOOK_SEARCH_LOADING_STATUS');

let populateHistory = (result, routeResolver, gtm) => {
    let queryStringArray = [];
    result.query && queryStringArray.push(`q=${result.query}`);

    let urlToPush = routeResolver.buildRouteFor('addBook').pathname;
    let queryString = queryStringArray.length > 0 ? `?${queryStringArray.join('&')}` : '';


    if (queryString) {
        urlToPush = `${urlToPush}${queryString}`;
    }

    history.push(urlToPush, routeResolver.getReloadState('addBook', {reload: true}));

    gtm.sendPageView();
}

export const searchBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {searchQuery, history}, track=false) => {
    let state = getState();
    let actions = halson(state.master.general.actions);

    if (actions.getBooks && searchQuery) {
        dispatch(setAddBookSearchLoadingStatus(true));
        track && gtm.sendVirtualPageView('addBook/search');
        return fetchUtils.call(actions.getBooks, auth, {q: searchQuery, currentusercopies: true}).then((result) => {
            dispatch(addBookSearchSetResultsAction(result));

            history && populateHistory(result, routeResolver, gtm);
        }).catch((err) => {
            console.log('searchBook load failed', err);
        }).then(() => {
            dispatch(setAddBookSearchLoadingStatus(false));
        })
    } else {
        dispatch(clearAddBookResultsAction())
        history && populateHistory({}, routeResolver, gtm);
        return Promise.resolve();
    }
});

export const createBookCopyAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, intl, createBookCopyURI, bookId, amount, swap, condition, comment, bookSlug) => {
    gtm.sendVirtualPageView('addBook/addToShelf');
    return createBookCopy(dispatch, auth, intl, gtm, createBookCopyURI, bookId, amount, swap, condition, comment, bookSlug)
        .then((bookCopy) => {
            let bookCopyHal = halson(bookCopy);
            let bookResource = bookCopyHal.getEmbed('book');
            let getBookURI = bookResource.getLink('self');

            return fetchUtils.call(getBookURI, auth, {
                bookcopiestype: 'all',
                onlycurrentuserbookcopies: true
            })
                .then((book) => {
                    dispatch(bookCopyCreatedAction(book));
                })

        })
        .catch((err) => {
            console.log('Create book copy failed')
        })
});

export const removeBookCopyAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, intl, removeBookCopyURI, bookSlug) => {
    return removeBookCopy(dispatch, auth, intl, gtm, removeBookCopyURI, bookSlug).then((bookCopy) => {
        let bookCopyHal = halson(bookCopy);
        let bookResource = bookCopyHal.getEmbed('book');
        let getBookURI = bookResource.getLink('self');

        return fetchUtils.call(getBookURI, auth, {
            bookcopiestype: 'all',
            onlycurrentuserbookcopies: true
        }).then((book) => {
            dispatch(bookCopyCreatedAction(book));
        })
    }).catch((err) => {
        console.log('Book unlink failed', err);
    })
});

export const loadMoreAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, loadMoreURI) => {
    if (loadMoreURI) {
        return fetchUtils.call(loadMoreURI, auth).then((result) => {
            dispatch(moreBooksLoadedAction(result));
        }).catch((err) => {
            console.log(err);
        })
    }
});

export const createDraftBookAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {intl, title, cover, authors, publishers, publishDate, isbn10, isbn13, amount, swap, condition, comment, createDraftBookURI}) => {
    return createDraftBook(dispatch, auth, intl, gtm, createDraftBookURI, {
        title, cover, authors, publishers, publishDate, isbn10, isbn13, amount, swap, condition, comment,
    })
        .catch((err) => {
            console.log('Create draft book failed')
        })
});







