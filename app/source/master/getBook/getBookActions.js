/**
 * Created by Mike on 10/3/2017.
 */

'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import {submitForm, clearFormErrors, resetForm} from '../../shared/validation/actions';
import {requestModelFormValidators} from './formValidators';
import history from '../../../../utils/history';
import halson from 'halson';
import {addMessage} from "../notifier/notifierActions";
import {defineMessages} from 'react-intl';

const messages = defineMessages({
    createDealRequestFailed: {
        id: 'getBook.createDealRequestFailed',
        defaultMessage: 'Send book request failed'
    },
    createDealRequestSuccess: {
        id: 'getBook.createDealRequestSuccess',
        defaultMessage: 'The book request is sent to user'
    }
})


export const setUserBookCopiesAction = reduxUtils.createAction('GET_BOOK_SET_USER_BOOK_COPIES');
export const showGetBookPopupAction = reduxUtils.createAction('SHOW_GET_BOOK_POPUP_ACTION');
export const setValidatedDealRequestAction = reduxUtils.createAction('SET_VALIDATED_DEAL_REQUEST');
export const setGetBookCopyLoadingStatusAction = reduxUtils.createAction('SET_GET_BOOK_CPY_LOADING_STATUS');
export const setCreateDealRequestLoadingStatusAction = reduxUtils.createAction('SET_CREATE_DEAL_REQUEST_LOADING_STATUS')

export const loadUserBookCopiesAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {userId, bookCopyId}) => {
    let state = getState();
    let actions = state.master.general.actions;

    return actions.getUserBookCopies && fetchUtils.call(actions.getUserBookCopies, auth, {includeuser: true}, {uriParams: {userId}}).then((result) => {
        if (!state.master.getBook.general.show) {
            gtm.sendEvent('requestBookClick');
        }

        if (bookCopyId) {
            let resultHal = halson(result);
            let bookCopies = resultHal.getEmbeds('bookCopies');
            let bookCopy = bookCopies.find(bc => bc._id == bookCopyId);
            gtm.ee.addToCart(bookCopy);
        }

        dispatch(setUserBookCopiesAction({...result}));
        dispatch(showGetBookPopupAction(true))
    }).catch((err) => {
        console.log('Load books failed', err);
    })
});

export const validateDealRequestAndLoadUserBookCopiesAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {userId, bookCopyId}) => {
    let state = getState();

    dispatch(setGetBookCopyLoadingStatusAction({
        bookCopyId,
        loading: true
    }))

    let bookCopies = [...state.master.getBook.general.inRequest, bookCopyId];

    return fetchUtils.post('validateDealRequest', '/dealrequests/validate', {
        requestedFrom: userId,
        bookCopies
    }, {auth}).then((result) => {

        Promise.all([
            dispatch(setValidatedDealRequestAction(result)),
            dispatch(loadUserBookCopiesAction({userId, bookCopyId}))
        ]).then(() => {
            setTimeout(() => {
                dispatch(setGetBookCopyLoadingStatusAction({
                    bookCopyId,
                    loading: false
                }))
            }, 1000)
        })
    }).catch((err) => {
        if (err && err.statusCode != 403 && err.body.name != 'UserRequiredInfo') {
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, type: 'error'}));
        }

        console.log('Load books failed', err);
        dispatch(setGetBookCopyLoadingStatusAction({
            bookCopyId,
            loading: false
        }))
    })
});

export const removeBookCopyAndValidateDealRequest = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {bookCopyId}) => {
    let state = getState();

    let bookCopies = state.master.getBook.general.inRequest.filter((bookCopy) => {
        return bookCopy != bookCopyId;
    });

    if (bookCopies.length == 0) {
        dispatch(showGetBookPopupAction(false));
        let removedBookCopy = state.master.getBook.general.bookCopies.filter((bookCopy) => {
            return bookCopy._id == bookCopyId;
        });

        gtm.ee.removeFromCart(removedBookCopy);
        return;
    }

    let userId = state.master.getBook.general.user._id;

    return fetchUtils.post('validateDealRequest', '/dealrequests/validate', {
        requestedFrom: userId,
        bookCopies
    }, {auth}).then((result) => {
        let removedBookCopy = state.master.getBook.general.bookCopies.filter((bookCopy) => {
            return bookCopy._id == bookCopyId;
        });

        gtm.ee.removeFromCart(removedBookCopy);

        dispatch(setValidatedDealRequestAction(result));
    }).catch((err) => {
        console.log('Load books failed', err);
    })
});

export const createDealRequestAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, routeResolver, gtm}, {message}, intl) => {
    dispatch(setCreateDealRequestLoadingStatusAction(true))
    let state = getState();
    let actions = state.master.general.actions;

    let bookCopies = [...state.master.getBook.general.inRequest];
    let requestedFrom = state.master.getBook.general.user;

    return actions.createDealRequest && fetchUtils.call(actions.createDealRequest, auth, {
        bookCopies,
        requestedFrom: requestedFrom._id,
        message
    }).then((result) => {
        gtm.ee.checkout(state.master.getBook.general.bookCopies.filter((bc) => state.master.getBook.general.inRequest.includes(bc._id)));
        gtm.sendVirtualPageView('user/requestBook');
        gtm.sendEvent('bookRequestCreated', {
            placeSlug: requestedFrom.geo.citySlug,
            requestTotalPrice: result.total,
            booksCount: bookCopies.length,
            userIdFrom: requestedFrom._id,
            userId: auth.userId
        });
        dispatch(resetForm({model: 'master.getBook.requestModel', validators: requestModelFormValidators}));
        dispatch(showGetBookPopupAction(false));

        let text = intl.formatMessage(messages.createDealRequestSuccess)
        dispatch(addMessage({text, type: 'success'}));

        history.push(routeResolver.buildRouteFor('sentToUserRequests', {
            type: 'u',
            data: requestedFrom.slug
        }, {redirect: true, override: {usersWithConversations: {redirect: true, reload: false}}}))

        setTimeout(() => {
            dispatch(setCreateDealRequestLoadingStatusAction(false))
        }, 1000)

    }).catch((err) => {
        let title = intl.formatMessage(messages.createDealRequestFailed);
        let text = '';
        if (err.body && err.body.message) {
            text = err.body.message;
        }
        dispatch(addMessage({text, title, type: 'error'}));
        dispatch(setCreateDealRequestLoadingStatusAction(false))
    })
});