/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

import reduxUtils from '../../../utils/reduxUtils';
import fetchUtils from '../../../utils/fetchUtils';
import history from '../../../utils/history';
import {showGetBookPopupAction} from '../master/getBook/getBookActions';
import {createBookCopy, removeBookCopy} from '../shared/createEditBookCopy/createEditBookCopyActions';
import {addMessage} from "../master/notifier/notifierActions";
import {defineMessages} from 'react-intl';

export const initBookInfoAction = reduxUtils.createAction('INIT_BOOK_INFO');
export const setInitializedAction = reduxUtils.createAction('SET_BOOK_INFO_INITIALIZED');
export const setNotFoundAction = reduxUtils.createAction('SET_BOOK_INFO_NOT_FOUND');
export const setEditBookLoadingStatusAction = reduxUtils.createAction('SET_EDIT_BOOK_LOADING_STATUS');
export const setBookRatingAction = reduxUtils.createAction('SET_BOOK_RATING_ACTION');

const messages = defineMessages({
    bookPublishFailed: {
        id: 'bookInfo.bookPublishFailed',
        defaultMessage: 'Book publish failed'
    },
    createDraftFromBookFailed: {
        id: 'bookInfo.createDraftFromBookFailed',
        defaultMessage: 'Create draft from book failed'
    },
    bookUnpublishFailed: {
        id: 'bookInfo.bookUnpublishFailed',
        defaultMessage: 'Book unpublish failed'
    },
    bookPublished: {
        id: 'bookInfo.bookPublished',
        defaultMessage: 'Book published'
    },
    bookUnpublished: {
        id: 'bookInfo.bookUnpublished',
        defaultMessage: 'Book unpublished'
    },
    ratingSaved: {
        id: 'bookInfo.ratingSaved',
        defaultMessage: 'Book rating saved'
    },
    saveRatingFailed: {
        id: 'bookInfo.saveRatingFailed',
        defaultMessage: 'Save rating failed'
    }
})

let populateHistory = (result, reviews, bookSlug, routeResolver) => {
    let queryStringArray = [];
    result.geo && queryStringArray.push(`place=${result.geo.slug}`);
    reviews.sort && queryStringArray.push(`rsort=${reviews.sort}`);

    let queryString = queryStringArray.length > 0 ? `?${queryStringArray.join('&')}` : '';
    let urlToPush = `${routeResolver.buildRouteFor('bookInfo', {book: bookSlug}).pathname}${queryString}`;

    history.push(urlToPush, routeResolver.getReloadState('bookInfo', {reload: true}));
}


export const loadBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {placeSlug, bookSlug, history}, track = false) => {
    let state = getState();
    let actions = state.master.general.actions;

    let queryParams = {};
    if (placeSlug) {
        queryParams.geo = placeSlug;
    }

    queryParams.bookcopiestype = 'list';
    queryParams.facets = true;

    dispatch(showGetBookPopupAction(false));

    if (actions.getBook) {
        return fetchUtils.call(actions.getBook, auth, queryParams, {uriParams: {bookId: bookSlug}}).then((result) => {
            if (gtm && track) {
                gtm.ee.productView(result);
            }

            dispatch(initBookInfoAction(result));
            let reviews = state.bookInfo.bookReviews.general;
            history && populateHistory(result, reviews, bookSlug, routeResolver);
            console.log('Book loaded');
        }).catch((err) => {
            if (err.statusCode == 404) {
                dispatch(setNotFoundAction(true))
            }
            dispatch(setInitializedAction(true))
            console.log('Book load failed', err);
        })
    }
});

export const changeGeoAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {placeSlug, bookSlug, history}) => {
    let state = getState();
    let actions = state.master.general.actions;

    let queryParams = {};
    if (placeSlug) {
        queryParams.geo = placeSlug;
    }

    queryParams.bookcopiestype = 'list';
    queryParams.facets = true;

    if (actions.getBook) {
        placeSlug && gtm.sendEvent('changedPlaceInBookInfo', {placeSlug})
        return fetchUtils.call(actions.getBook, auth, queryParams, {uriParams: {bookId: bookSlug}}).then((result) => {
            dispatch(initBookInfoAction(result));

            let reviews = state.bookInfo.bookReviews.general;
            history && populateHistory(result, reviews, bookSlug, routeResolver);
            console.log('Book loaded');
        }).catch((err) => {
            console.log('Book load failed', err);
        })
    }
})

export const createBookCopyAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, createBookCopyURI, id, placeSlug, bookSlug, amount, swap, condition, comment) => {
    return createBookCopy(dispatch, auth, intl, gtm, createBookCopyURI, id, amount, swap, condition, comment, bookSlug)
        .then((result) => {
            dispatch(loadBookAction({placeSlug, bookSlug}));
        })
        .catch((err) => {
            console.log('Create book copy failed')
        })
})

export const removeBookCopyAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, removeBookCopyURI, placeSlug, bookSlug) => {
    if (removeBookCopyURI) {
        return removeBookCopy(dispatch, auth, intl, gtm, removeBookCopyURI, bookSlug).then((result) => {
            dispatch(loadBookAction({placeSlug, bookSlug}));
        })
    }
})

export const editBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, routeResolver, createDraftFromBookURI) => {
    if (createDraftFromBookURI) {
        dispatch(setEditBookLoadingStatusAction(true));
        return fetchUtils.call(createDraftFromBookURI, auth).then((result) => {
            let draftBookURL = routeResolver.buildRouteFor('draftBook', {draftBook: result._id});
            history.push(draftBookURL);
        }).catch((err) => {
            let title = intl.formatMessage(messages.createDraftFromBookFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
        }).then(() => {
            dispatch(setEditBookLoadingStatusAction(false));
        })
    }
})

export const publishBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, publishBookURI, placeSlug, bookSlug) => {
    if (publishBookURI) {
        return fetchUtils.call(publishBookURI, auth).then((result) => {
            let text = intl.formatMessage(messages.bookPublished);
            dispatch(addMessage({text, type: 'success'}));
            dispatch(loadBookAction({placeSlug, bookSlug}));
        }).catch((err) => {
            let title = intl.formatMessage(messages.bookPublishFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
        })
    }
})

export const unpublishBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, unpublishBookURI, placeSlug, bookSlug) => {
    if (unpublishBookURI) {
        return fetchUtils.call(unpublishBookURI, auth).then((result) => {
            let text = intl.formatMessage(messages.bookUnpublished);
            dispatch(addMessage({text, type: 'success'}));
            dispatch(loadBookAction({placeSlug, bookSlug}));
        }).catch((err) => {
            let title = intl.formatMessage(messages.bookUnpublishFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
        })
    }
})

export const rateBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, rateBookURI, rate) => {
    if (rateBookURI) {
        return fetchUtils.call(rateBookURI, auth, {rate}).then((result) => {
            let text = intl.formatMessage(messages.ratingSaved);
            dispatch(addMessage({text, type: 'success'}));

            let state = getState();
            let userId = state.master.user._id;
            let bookSlug = state.bookInfo.general.slug;

            gtm.sendEvent('bookRated', {
                userId: auth.userId,
                bookSlug
            })

            dispatch(setBookRatingAction({...result, userId}))
        }).catch((err) => {
            if (err && (err.statusCode != 403 && (err.body && err.body.name != 'UserRequiredInfo'))) {
                let title = intl.formatMessage(messages.saveRatingFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }
        })
    }
})


