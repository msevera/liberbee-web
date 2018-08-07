/**
 * Created by Mike on 9/24/2017.
 */

'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import {addBookManuallyFormVaidators} from './formValidators';
import {clearFormErrors, resetForm} from '../validation/actions';
import {addMessage} from '../../master/notifier/notifierActions';
import {defineMessages} from 'react-intl';
import {authorsAutocomplete, publishersAutocomplete} from '../autocomplete/autocompleteActions';
import {setCreateEditBookCopyDataAction} from "../createEditBookCopy/createEditBookCopyActions";

export const setCreateEditBookManuallyStatusAction = reduxUtils.createAction('SET_CREATE_EDIT_BOOK_MANUALLY_STATUS_ACTION');
export const setCreateEditBookManuallyLoadingStatusAction = reduxUtils.createAction('SET_CREATE_EDIT_BOOK_MANUALLY_LOADING_STATUS');
export const setCreateEditBookManuallyAction = reduxUtils.createAction('SET_CREATE_EDIT_BOOK_MANUALLY');
export const setCreateEditBookManuallyAuthorsAutocompleteAction = reduxUtils.createAction('SET_CREATE_EDIT_BOOK_MANUALLY_AUTHORS_AUTOCOMPLETE');
export const setCreateEditBookManuallyPublishersAutocompleteAction = reduxUtils.createAction('SET_CREATE_EDIT_BOOK_MANUALLY_PUBLISHERS_AUTOCOMPLETE');
export const setShowCreateEditBookManuallyPopupAction = reduxUtils.createAction('SET_SHOW_CREATE_EDIT_BOOK_COPY_POPUP');
export const resetCreateEditBookManuallyPopupAction = reduxUtils.createAction('RESET_CREATE_EDIT_BOOK_MANUALLY_POPUP');

const messages = defineMessages({
    saveFailed: {
        id: 'createEditBookManually.saveFailed',
        defaultMessage: 'Pending book saving failed'
    },
    coverTooLarge: {
        id: 'createEditBookManually.coverTooLarge',
        defaultMessage: 'Cover too large. The size of image should not be greater than 2mb.'
    },
    removeFailed: {
        id: 'createEditBookManually.removeFailed',
        defaultMessage: 'Remove pending book failed'
    },
    draftSaved: {
        id: 'createEditBookManually.draftSaved',
        defaultMessage: 'Pending book saved'
    },
    draftRemoved: {
        id: 'createEditBookManually.draftRemoved',
        defaultMessage: 'Pending book is removed'
    }
});

export const showCreateDraftBookPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, gtm}, {createEditDraftBookURI}) => {
    console.log('Link book');
    return fetchUtils.get('checkFilledRequiredInfo', '/users/me/checkrequiredinfo', {auth})
        .then(() => {
            gtm.sendEvent('addManuallyClick')
            dispatch(setCreateEditBookManuallyAction({
                mode: 'create',
                createEditDraftBookURI
            }))
        })
        .catch((err) => {
            console.log('Required info is not set');
        })
});

export const showEditDraftBookPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, gtm}, {createEditDraftBookURI, cover}) => {
    console.log('Link book');

    return fetchUtils.get('checkFilledRequiredInfo', '/users/me/checkrequiredinfo', {auth})
        .then(() => {
            gtm.sendEvent('editManuallyClick')
            dispatch(setCreateEditBookManuallyAction({
                mode: 'edit',
                createEditDraftBookURI,
                cover
            }))
        })
        .catch((err) => {
            console.log('Required info is not set');
        })
});

export const createDraftBook = (dispatch, auth, intl, gtm, createDraftBookURI, draftBook) => {
    dispatch(setCreateEditBookManuallyLoadingStatusAction(true))
    return fetchUtils.call(createDraftBookURI, auth, draftBook)
        .then((result) => {
            gtm.sendEvent('addedManually', {userId: auth.userId, bookCopyPrice: Math.round(draftBook.amount)});
            dispatch(resetForm({
                model: 'master.createEditBookManually.createEditBookManuallyModel',
                validators: addBookManuallyFormVaidators
            }));
            dispatch(setCreateEditBookManuallyStatusAction({status: 'success'}));
            setTimeout(() => {
                dispatch(setCreateEditBookManuallyLoadingStatusAction(false))
            }, 1000)
            return result;
        })
        .catch((err) => {
            dispatch(setCreateEditBookManuallyLoadingStatusAction(false))

            if (err && err.body && err.body.name == 'UserRequiredInfo') {
                dispatch(hideCreateEditBookManuallyPopupAction())
            } else if (err && err.statusCode == 413) {
                let title = intl.formatMessage(messages.coverTooLarge);
                dispatch(addMessage({title, type: 'error'}));
                throw err;
            } else {
                let title = intl.formatMessage(messages.saveFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));

                throw err;
            }
        })
}


export const editDraftBook = (dispatch, auth, intl, gtm, editDraftBookURI, draftBook) => {
    dispatch(setCreateEditBookManuallyLoadingStatusAction(true))
    return fetchUtils.call(editDraftBookURI, auth, draftBook)
        .then((result) => {
            gtm.sendEvent('editedManually', {userId: auth.userId, bookCopyPrice: Math.round(draftBook.amount)});
            dispatch(resetForm({
                model: 'master.createEditBookManually.createEditBookManuallyModel',
                validators: addBookManuallyFormVaidators
            }));
            dispatch(hideCreateEditBookManuallyPopupAction());
            dispatch(addMessage({text: intl.formatMessage(messages.draftSaved), type: 'success'}));
            setTimeout(() => {
                dispatch(setCreateEditBookManuallyLoadingStatusAction(false))
            }, 1000)
            return result;
        })
        .catch((err) => {
            dispatch(setCreateEditBookManuallyLoadingStatusAction(false))
            if (err && err.body && err.body.name == 'UserRequiredInfo') {
                dispatch(hideCreateEditBookManuallyPopupAction())
            }  else if (err && err.statusCode == 413) {
                let title = intl.formatMessage(messages.coverTooLarge);
                dispatch(addMessage({title, type: 'error'}));
                throw err;
            }  else {
                let title = intl.formatMessage(messages.saveFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
                throw err;
            }
        })
}

export const hideCreateEditBookManuallyPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    dispatch(setShowCreateEditBookManuallyPopupAction(false));
    setTimeout(() => {
        dispatch(clearFormErrors({model: 'master.createEditBookCopy.createEditBookCopyModel'}))
        dispatch(resetCreateEditBookManuallyPopupAction());
    }, 500)
});


export const removeDraftBook = (dispatch, auth, intl, gtm, removeDraftBookURI, track = true) => {
    return fetchUtils.call(removeDraftBookURI, auth)
        .then((result) => {
            track && gtm.sendEvent('removedManually', {
                userId: auth.userId,
                bookCopyPrice: Math.round(result.createCopy.deal.amount)
            });
            dispatch(addMessage({text: intl.formatMessage(messages.draftRemoved), type: 'success'}));
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.removeFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            console.log('Load books failed', err);
            throw err;
        })
}


export const createEditBookManuallyAuthorsAutocompleteAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, author) => {
    authorsAutocomplete(dispatch, getState, auth, author)
        .then((result) => {
            console.log('authorsAutocomplete loaded', result);
            dispatch(setCreateEditBookManuallyAuthorsAutocompleteAction(result));
        })
        .catch(() => {
            console.log('authorsAutocomplete failed');
        })
})


export const createEditBookManuallyPublishersAutocompleteAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, publisher) => {
    publishersAutocomplete(dispatch, getState, auth, publisher)
        .then((result) => {
            console.log('publishersAutocomplete loaded', result);
            dispatch(setCreateEditBookManuallyPublishersAutocompleteAction(result));
        })
        .catch(() => {
            console.log('publishersAutocomplete failed');
        })
})

