/**
 * Created by Mike on 9/19/2017.
 */


'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import history from '../../../../utils/history';
import halson from 'halson';
import {defineMessages} from 'react-intl';
import {addMessage} from "../../master/notifier/notifierActions";
import {rateBookAction} from '../bookInfoActions';
import {resetModelToInitial} from "../../shared/validation/actions";

export const setBookReviewsAction = reduxUtils.createAction('SET_BOOK_REVIEWS');
export const setInitializedAction = reduxUtils.createAction('SET_BOOK_REVIEWS_INITIALIZED');
export const setCreatedBookReviewAction = reduxUtils.createAction('SET_CREATED_BOOK_REVIEW');
export const setUpdatedBookReviewAction = reduxUtils.createAction('SET_UPDATED_BOOK_REVIEW');
export const setRemovedBookReviewAction = reduxUtils.createAction('SET_REMOVED_BOOK_REVIEW');
export const setCreateEditReviewLoadingStatusAction = reduxUtils.createAction('SET_CREATE_EDIT_REVIEW_LOADING_STATUS');
export const setRemoveReviewLoadingStatusAction = reduxUtils.createAction('SET_REMOVE_REVIEW_LOADING_STATUS');
export const setBookReviewsSortCriteriaActiveAction = reduxUtils.createAction('SET_BOOK_REVIEWS_SORT_CRITERIA_ACTIVE');
export const setLikedBookReviewAction = reduxUtils.createAction('SET_LIKED_BOOK_REVIEW');
export const setLikedMyBookReviewAction = reduxUtils.createAction('SET_LIKED_MY_BOOK_REVIEW');
export const setUnlikedBookReviewAction = reduxUtils.createAction('SET_UNLIKED_BOOK_REVIEW');
export const setUnlikedMyBookReviewAction = reduxUtils.createAction('SET_UNLIKED_MY_BOOK_REVIEW');
export const setBookReviewsContentLoadingStatusAction = reduxUtils.createAction('SET_BOOK_REVIEWS_CONTENT_LOADING_STATUS');
export const moreBookReviewsLoadedAction = reduxUtils.createAction('MORE_BOOK_REVIEWS_LOADED');
export const setTopBookReviewAction = reduxUtils.createAction('SET_TOP_BOOK_REVIEW');
export const setBookReviewsActionsAction = reduxUtils.createAction('SET_BOOK_REVIEWS_ACTION');
export const setShowCreateReviewAction = reduxUtils.createAction('SET_SHOW_CREATE_REVIEW');

const messages = defineMessages({
    bookReviewCreated: {
        id: 'bookReviews.bookReviewCreated',
        defaultMessage: 'Your review created'
    },
    bookReviewSaved: {
        id: 'bookReviews.bookReviewSaved',
        defaultMessage: 'Your review saved'
    },
    bookReviewRemoved: {
        id: 'bookReviews.bookReviewRemoved',
        defaultMessage: 'Your review removed'
    },
    bookReviewCreateFailed: {
        id: 'bookReviews.bookReviewCreateFailed',
        defaultMessage: 'Create review failed'
    },
    bookReviewSaveFailed: {
        id: 'bookReviews.bookReviewSaveFailed',
        defaultMessage: 'Save review failed'
    },
    bookReviewRemoveFailed: {
        id: 'bookReviews.bookReviewRemoveFailed',
        defaultMessage: 'Remove review failed'
    },
    bookReviewLikeFailed: {
        id: 'bookReviews.bookReviewLikeFailed',
        defaultMessage: 'Like review failed'
    },
    bookReviewUnlikeFailed: {
        id: 'bookReviews.bookReviewUnlikeFailed',
        defaultMessage: 'Unlike review failed'
    }
})

let populateHistory = (result, book, bookSlug, routeResolver) => {
    let queryStringArray = [];
    result.sort && queryStringArray.push(`rsort=${result.sort}`);
    book.geo && queryStringArray.push(`place=${book.geo.slug}`);

    let queryString = queryStringArray.length > 0 ? `?${queryStringArray.join('&')}` : '';
    let urlToPush = `${routeResolver.buildRouteFor('bookInfo', {book: bookSlug}).pathname}${queryString}`;

    history.push(urlToPush, routeResolver.getReloadState('bookInfo', {reload: true}));
}

export const loadBookReviewsAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {bookSlug, sort}) => {
    let state = getState();
    let actions = state.master.general.actions;

    if (actions.getBookReviews) {
        let queryParams = {};
        if (sort) {
            queryParams.sort = sort;
        }
        return fetchUtils.call(actions.getBookReviews, auth, queryParams, {uriParams: {bookId: bookSlug}}).then((result) => {
            dispatch(setBookReviewsAction(result));
            console.log('Reviews loaded');
        }).catch((err) => {
            console.log('Book load failed', err);
        })
    }
});

export const filterBookReviewsAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {history, bookSlug}) => {
    let state = getState();
    let actions = state.master.general.actions;

    if (actions.getBookReviews) {
        dispatch(setBookReviewsContentLoadingStatusAction(true))
        let queryParams = {};

        state.bookInfo.bookReviews.general.sortCriterias.reduce((result, criteria) => {
            if (criteria.selected) {
                result['sort'] = criteria.key;
            }

            return result;
        }, queryParams);

        return fetchUtils.call(actions.getBookReviews, auth, queryParams, {
            combineRequests: true,
            uriParams: {bookId: bookSlug}
        }).then((result) => {
            dispatch(setBookReviewsAction(result));
            let book = state.bookInfo.general;
            history && populateHistory(result, book, bookSlug, routeResolver);
            console.log('Reviews loaded');
        }).catch((err) => {
            dispatch(setBookReviewsContentLoadingStatusAction(false))
            console.log('Book load failed', err);
        })
    }
});

export const loadBookReviewActionsAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}) => {
    let state = getState();
    let actions = state.bookInfo.bookReviews.general.actions;

    if (actions.loadReviews) {
        dispatch(setBookReviewsContentLoadingStatusAction(true))
        return fetchUtils.call(actions.loadReviews, auth).then((result) => {
            dispatch(setBookReviewsActionsAction(result));
            console.log('Reviews loaded');
        }).catch((err) => {
            dispatch(setBookReviewsContentLoadingStatusAction(false))
            console.log('Book load failed', err);
        })
    }
});

export const preCreateBookReviewAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}) => {
    return fetchUtils.get('checkFilledRequiredInfo', '/users/me/checkrequiredinfo', {auth});
});

export const removeBookReviewAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {intl, removeBookReviewURI, bookSlug, reviewId}) => {
    dispatch(setRemoveReviewLoadingStatusAction(true));
    return fetchUtils.call(removeBookReviewURI, auth).then((result) => {
        gtm.sendEvent('bookReviewRemoved', {
            userId: auth.userId,
            bookSlug
        })

        return dispatch(loadBookReviewActionsAction()).then(() => {
            dispatch(setRemovedBookReviewAction(reviewId))
            let text = intl.formatMessage(messages.bookReviewRemoved);
            dispatch(addMessage({text, type: 'success'}));
            dispatch(setRemoveReviewLoadingStatusAction(false));
        })
    }).catch((err) => {
        let title = intl.formatMessage(messages.bookReviewRemoveFailed);
        let text = '';
        if (err.body && err.body.message) {
            text = err.body.message;
        }
        dispatch(addMessage({text, title, type: 'error'}));
        dispatch(setRemoveReviewLoadingStatusAction(false));
    })
});

export const saveBookReviewAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {intl, updateBookReviewURI, text, bookSlug}) => {
    dispatch(setCreateEditReviewLoadingStatusAction(true));
    return fetchUtils.call(updateBookReviewURI, auth, {text}).then((result) => {
        gtm.sendEvent('bookReviewUpdated', {
            userId: auth.userId,
            bookSlug
        })

        dispatch(setUpdatedBookReviewAction(result))
        let text = intl.formatMessage(messages.bookReviewSaved);
        dispatch(addMessage({text, type: 'success'}));
        dispatch(setCreateEditReviewLoadingStatusAction(false));
    }).catch((err) => {
        let title = intl.formatMessage(messages.bookReviewSaveFailed);
        let text = '';
        if (err.body && err.body.message) {
            text = err.body.message;
        }
        dispatch(addMessage({text, title, type: 'error'}));
        dispatch(setCreateEditReviewLoadingStatusAction(false));
    })
});

export const createBookReviewAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {intl, createBookReviewURI, text, bookSlug}) => {
    dispatch(setCreateEditReviewLoadingStatusAction(true));
    return fetchUtils.call(createBookReviewURI, auth, {text}).then((result) => {
       return dispatch(loadBookReviewActionsAction()).then(() => {
           gtm.sendEvent('bookReviewCreated', {
               userId: auth.userId,
               bookSlug
           })

            let state = getState();
            let bookRating = state.bookInfo.general.myRating;
            if(!state.bookInfo.bookReviews.general.topReview && (state.bookInfo.bookReviews.general.reviews.length == 0))
            {
                dispatch(setTopBookReviewAction({...result, bookRating}));
            }else{
                dispatch(setCreatedBookReviewAction({...result, bookRating}));
            }

            let text = intl.formatMessage(messages.bookReviewCreated);
            dispatch(addMessage({text, type: 'success'}));
            dispatch(setCreateEditReviewLoadingStatusAction(false));
        });
    }).catch((err) => {
        let title = intl.formatMessage(messages.bookReviewCreateFailed);
        let text = '';
        if (err.body && err.body.message) {
            text = err.body.message;
        }
        dispatch(addMessage({text, title, type: 'error'}));
        dispatch(setCreateEditReviewLoadingStatusAction(false));
    })
});


export const likeBookReviewAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {intl, likeBookReviewURI}) => {
    return fetchUtils.call(likeBookReviewURI, auth).then((result) => {
        let state = getState();
        let bookSlug = state.bookInfo.general.slug;

        gtm.sendEvent('bookReviewLiked', {
            userId: auth.userId,
            bookSlug
        })
        dispatch(setLikedBookReviewAction(result))
    }).catch((err) => {
        if (err && (err.statusCode != 403 && (err.body && err.body.name != 'UserRequiredInfo'))) {
            let title = intl.formatMessage(messages.bookReviewLikeFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
        }
    })
});

export const unlikeBookReviewAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {intl, unlikeBookReviewURI}) => {
    return fetchUtils.call(unlikeBookReviewURI, auth).then((result) => {
        let state = getState();
        let bookSlug = state.bookInfo.general.slug;

        gtm.sendEvent('bookReviewUnliked', {
            userId: auth.userId,
            bookSlug
        })
        dispatch(setUnlikedBookReviewAction(result))
    }).catch((err) => {
        if (err && (err.statusCode != 403 && (err.body && err.body.name != 'UserRequiredInfo'))) {
            let title = intl.formatMessage(messages.bookReviewLikeFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
        }
    })
});

export const loadMoreAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, loadMoreURI) => {
    if (loadMoreURI) {
        return fetchUtils.call(loadMoreURI, auth).then((result) => {
            dispatch(moreBookReviewsLoadedAction(result));
        }).catch((err) => {
            console.log(err);
        })
    }
})

export const showCreateReviewAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, bookSlug) => {
    gtm.sendEvent('addBookReviewClick', {
        userId: auth.userId,
        bookSlug
    })

    dispatch(resetModelToInitial({
        model: 'bookInfo.bookReviews.createEditBookReviewModel',
        initialData: {
            text: ''
        }
    }));

    dispatch(preCreateBookReviewAction()).then(() => {
        dispatch(setShowCreateReviewAction(true));
    })
})