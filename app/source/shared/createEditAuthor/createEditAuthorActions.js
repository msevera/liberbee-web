'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import {addMessage} from '../../master/notifier/notifierActions';
import {defineMessages} from 'react-intl';
import {resetModelToInitial, resetForm, clearFormErrors} from '../validation/actions';
import {createEditAuthorModelValidators} from './formValidators';
import halson from 'halson';

export const setCreateAuthorDataAction = reduxUtils.createAction('SET_CRETE_AUTHOR_DATA');
export const setEditAuthorDataAction = reduxUtils.createAction('SET_EDIT_AUTHOR_DATA');
export const resetCreateEditAuthorAction = reduxUtils.createAction('RESET_CREATE_EDIT_AUTHOR');
export const setShowCreateEditAuthorPopupAction = reduxUtils.createAction('SET_SHOW_CREATE_EDIT_POPUP_AUTHOR');
export const setCreateEditAuthorLoadingStatusAction = reduxUtils.createAction('SET_CREATE_EDIT_AUTHOR_LOADING_STATUS');

const messages = defineMessages({
    createAuthorFailed: {
        id: 'createEditAuthor.createFailed',
        defaultMessage: 'Create author failed'
    },
    editAuthorFailed: {
        id: 'createEditAuthor.editFailed',
        defaultMessage: 'Edit author failed'
    },
    authorSaved: {
        id: 'createEditAuthor.authorSaved',
        defaultMessage: 'Author saved'
    },
    authorCreated: {
        id: 'createEditAuthor.authorCreated',
        defaultMessage: 'Author created'
    },
    authorRemoved: {
        id: 'createEditAuthor.authorRemoved',
        defaultMessage: 'Author removed'
    },
    authorRemoveFailed: {
        id: 'createEditAuthor.authorRemoveFailed',
        defaultMessage: 'Remove author failed'
    }
})

export const showCreateEditAuthorPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}, {name}) => {
    let createAuthor = getState().master.general.actions.createAuthor;
    if (name) {
        return searchAuthor(auth, getState, name, true)
            .then((result) => {
                let editAuthorURI = halson(result).getLink('editAuthor');
                let removeAuthorURI = halson(result).getLink('removeAuthor');
                if (editAuthorURI) {
                    dispatch(resetModelToInitial({
                        model: 'master.createEditAuthor.createEditAuthorModel',
                        initialData: {
                            uk: result.name.uk,
                            en: result.name.en,
                            ru: result.name.ru,
                        }
                    }));

                    dispatch(setEditAuthorDataAction({
                        createEditAuthorURI: editAuthorURI,
                        removeAuthorURI
                    }))
                }
            })
            .catch((err) => {
                if (err && err.body && err.body.status == 404 && createAuthor) {
                    showCreateMode(dispatch, createAuthor);
                }
            })
    } else {
        createAuthor && showCreateMode(dispatch, createAuthor);
        return Promise.resolve();
    }
});

export const hideCreateEditAuthorPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    dispatch(setShowCreateEditAuthorPopupAction(false));
    setTimeout(() => {
        dispatch(clearFormErrors({model: 'master.createEditAuthor.createEditAuthorModel'}))
        dispatch(resetCreateEditAuthorAction());
        dispatch(setCreateEditAuthorLoadingStatusAction(false));
    }, 500)
});

let showCreateMode = (dispatch, createAuthor) => {
    dispatch(resetForm({
        model: 'master.createEditAuthor.createEditAuthorModel',
        validators: createEditAuthorModelValidators
    }));

    return dispatch(setCreateAuthorDataAction({createEditAuthorURI: createAuthor}))
}

export const searchAuthor = (auth, getState, name, checkRemove = false) => {
    let state = getState();
    let searchAuthor = state.master.general.actions.searchAuthor;
    return searchAuthor && fetchUtils.call(searchAuthor, auth, {checkRemove}, {uriParams: {search: name}});
}


export const createAuthor = (dispatch, auth, intl, createAuthorURI, authorModel) => {
    dispatch(setCreateEditAuthorLoadingStatusAction(true));
    return fetchUtils.call(createAuthorURI, auth, authorModel)
        .then((result) => {
            let text = intl.formatMessage(messages.authorCreated)
            dispatch(addMessage({text, type: 'success'}));
            dispatch(hideCreateEditAuthorPopupAction());
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.createAuthorFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            dispatch(setCreateEditAuthorLoadingStatusAction(false));
            throw err;
        })
};

export const editAuthor = (dispatch, auth, intl, editAuthorURI, authorModel) => {
    dispatch(setCreateEditAuthorLoadingStatusAction(true));
    return fetchUtils.call(editAuthorURI, auth, authorModel)
        .then((result) => {
            let text = intl.formatMessage(messages.authorSaved);
            dispatch(addMessage({text, type: 'success'}));
            dispatch(hideCreateEditAuthorPopupAction());
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.editAuthorFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            dispatch(setCreateEditAuthorLoadingStatusAction(false));
            throw err;
        })
};

export const removeAuthor = (dispatch, auth, intl, removeAuthorURI) => {
    return fetchUtils.call(removeAuthorURI, auth)
        .then((result) => {
            let text = intl.formatMessage(messages.authorRemoved);
            dispatch(addMessage({text, type: 'success'}));
            dispatch(hideCreateEditAuthorPopupAction());
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.authorRemoveFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            throw err;
        })
};




