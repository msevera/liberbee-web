'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import {addMessage} from '../../master/notifier/notifierActions';
import {defineMessages} from 'react-intl';
import {resetModelToInitial, resetForm, clearFormErrors} from '../validation/actions';
import {createEditPublisherModelValidators} from './formValidators';
import halson from 'halson';

export const setCreatePublisherDataAction = reduxUtils.createAction('SET_CRETE_PUBLISHER_DATA');
export const setEditPublisherDataAction = reduxUtils.createAction('SET_EDIT_PUBLISHER_DATA');
export const resetCreateEditPublisherAction = reduxUtils.createAction('RESET_CREATE_EDIT_PUBLISHER');
export const setShowCreateEditPublisherPopupAction = reduxUtils.createAction('SET_SHOW_CREATE_EDIT_POPUP_PUBLISHER');
export const setCreateEditPublisherLoadingStatusAction = reduxUtils.createAction('SET_CREATE_EDIT_PUBLISHER_LOADING_STATUS');

const messages = defineMessages({
    createPublisherFailed: {
        id: 'createEditPublisher.createFailed',
        defaultMessage: 'Create publisher failed'
    },
    editPublisherFailed: {
        id: 'createEditPublisher.editFailed',
        defaultMessage: 'Edit publisher failed'
    },
    publisherSaved: {
        id: 'createEditPublisher.publisherSaved',
        defaultMessage: 'Publisher saved'
    },
    publisherCreated: {
        id: 'createEditPublisher.publisherCreated',
        defaultMessage: 'Publisher created'
    },
    publisherRemoved: {
        id: 'createEditPublisher.publisherRemoved',
        defaultMessage: 'Publisher removed'
    },
    publisherRemoveFailed: {
        id: 'createEditPublisher.publisherRemoveFailed',
        defaultMessage: 'Remove publisher failed'
    }
})

export const showCreateEditPublisherPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}, {name}) => {
    let createPublisher = getState().master.general.actions.createPublisher;
    if (name) {
        return searchPublisher(auth, getState, name, true)
            .then((result) => {
                let editPublisherURI = halson(result).getLink('editPublisher');
                let removePublisherURI = halson(result).getLink('removePublisher');
                if (editPublisherURI) {
                    dispatch(resetModelToInitial({
                        model: 'master.createEditPublisher.createEditPublisherModel',
                        initialData: {
                            uk: result.name.uk,
                            en: result.name.en,
                            ru: result.name.ru,
                        }
                    }));

                    dispatch(setEditPublisherDataAction({
                        createEditPublisherURI: editPublisherURI,
                        removePublisherURI
                    }))
                }
            })
            .catch((err) => {
                if (err && err.body && err.body.status == 404 && createPublisher) {
                    showCreateMode(dispatch, createPublisher);
                }
            })
    } else {
        createPublisher && showCreateMode(dispatch, createPublisher);
        return Promise.resolve();
    }
});

export const hideCreateEditPublisherPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    dispatch(setShowCreateEditPublisherPopupAction(false));
    setTimeout(() => {
        dispatch(clearFormErrors({model: 'master.createEditPublisher.createEditPublisherModel'}))
        dispatch(resetCreateEditPublisherAction());
        dispatch(setCreateEditPublisherLoadingStatusAction(false));
    }, 500)
});

let showCreateMode = (dispatch, createPublisher) => {
    dispatch(resetForm({
        model: 'master.createEditPublisher.createEditPublisherModel',
        validators: createEditPublisherModelValidators
    }));

    dispatch(setCreatePublisherDataAction({createEditPublisherURI: createPublisher}))
}

export const searchPublisher = (auth, getState, name, checkRemove = false) => {
    let state = getState();
    let searchPublisher = state.master.general.actions.searchPublisher;
    return searchPublisher && fetchUtils.call(searchPublisher, auth, {checkRemove}, {uriParams: {search: name}});
}


export const createPublisher = (dispatch, auth, intl, createPublisherURI, publisherModel) => {
    dispatch(setCreateEditPublisherLoadingStatusAction(true));
    return fetchUtils.call(createPublisherURI, auth, publisherModel)
        .then((result) => {
            let text = intl.formatMessage(messages.publisherCreated)
            dispatch(addMessage({text, type: 'success'}));
            dispatch(hideCreateEditPublisherPopupAction());
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.createPublisherFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            dispatch(setCreateEditPublisherLoadingStatusAction(false));
            throw err;
        })
};

export const editPublisher = (dispatch, auth, intl, editPublisherURI, publisherModel) => {
    dispatch(setCreateEditPublisherLoadingStatusAction(true));
    return fetchUtils.call(editPublisherURI, auth, publisherModel)
        .then((result) => {
            let text = intl.formatMessage(messages.publisherSaved);
            dispatch(addMessage({text, type: 'success'}));
            dispatch(hideCreateEditPublisherPopupAction());
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.editPublisherFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            dispatch(setCreateEditPublisherLoadingStatusAction(false));
            throw err;
        })
};

export const removePublisher = (dispatch, auth, intl, removePublisherURI) => {
    return fetchUtils.call(removePublisherURI, auth)
        .then((result) => {
            let text = intl.formatMessage(messages.publisherRemoved);
            dispatch(addMessage({text, type: 'success'}));
            dispatch(hideCreateEditPublisherPopupAction());
            return result;
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.publisherRemoveFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            throw err;
        })
};




