import reduxUtils from "../../../../utils/reduxUtils";
import {publishersAutocomplete} from "../../shared/autocomplete/autocompleteActions";
import {
    createPublisher, editPublisher, removePublisher,
    searchPublisher, showCreateEditPublisherPopupAction
} from "../../shared/createEditPublisher/createEditPublisherActions";

export const setDraftPublishersAutocompleteAction = reduxUtils.createAction('SET_DRAFT_PUBLISHERS_AUTOCOMPLETE');
export const setDraftPublisherFoundAction = reduxUtils.createAction('SET_DRAFT_PUBLISHER_FOUND');
export const removePublisherFromRevisionAction = reduxUtils.createAction('REMOVE_DRAFT_PUBLISHER_FROM_REVISION');
export const editPublisherInRevisionAction = reduxUtils.createAction('EDIT_DRAFT_PUBLISHER_IN_REVISON');
export const addPublisherToRevisionAction = reduxUtils.createAction('ADD_DRAFT_PUBLISHER_TO_REVISON');
export const setPublisherLoadingStatusAction = reduxUtils.createAction('SET_PUBLISHER_LOADING_STATUS');

export const publisherSelectorShowPopupAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {index, name, revisionId}) => {
    dispatch(setPublisherLoadingStatusAction({
        index,
        revisionId,
        loading: true
    }));
    return dispatch(showCreateEditPublisherPopupAction({name})).then(() => {
        dispatch(setPublisherLoadingStatusAction({
            index,
            revisionId,
            loading: false
        }))
    })
})

export const draftPublishersAutocompleteAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {name, index, revisionId}) => {
    dispatch(editPublisherInRevisionAction({name, index, revisionId}))
    publishersAutocomplete(dispatch, getState, auth, name)
        .then((result) => {
            console.log('publisherAutocomplete loaded', result);
            dispatch(setDraftPublishersAutocompleteAction(result));
        })
        .catch(() => {
            console.log('publisherAutocomplete failed');
        })
})

export const searchPublisherAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {name, index, revisionId}) => {
    searchPublisher(auth, getState, name)
        .then((result) => {
            dispatch(setDraftPublisherFoundAction({found: true, index, revisionId}))
        }).catch((err) => {
        if (err && err.body && err.body.status == 404) {
            dispatch(setDraftPublisherFoundAction({found: false, index, revisionId}));
        }
    })
})

export const createPublisherAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}, {intl, names, createPublisherURI, index, revisionId}) => {
    return createPublisher(dispatch, auth, intl, createPublisherURI, {names})
        .then((result) => {
            //dispatch(changeAction({model: 'draftBook.bookModel', prop: 'publishers', value: result.name.en, cleanMessage: true}))
            //dispatch(addPublisherToRevisionAction({name: result.name.en, index, revisionId}))
            dispatch(editPublisherInRevisionAction({name: result.name.en, index, revisionId}))
            dispatch(setDraftPublisherFoundAction({found: true, index, revisionId}))
        })
        .catch((err) => {
            console.log('Create publisher failed')
        })
});

export const editPublisherAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}, {intl, names, editPublisherURI, index, revisionId}) => {
    return editPublisher(dispatch, auth, intl, editPublisherURI, {names})
        .then((result) => {
            //dispatch(changeAction({model: 'draftBook.bookModel', prop: 'publishers', value: result.name.en, cleanMessage: true}))
            dispatch(editPublisherInRevisionAction({name: result.name.en, index, revisionId}))
            dispatch(setDraftPublisherFoundAction({found: true, index, revisionId}))
        })
        .catch((err) => {
            console.log('Edit publisher failed')
        })
});

export const removePublisherAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}, {intl, removePublisherURI, index, revisionId}) => {
    return removePublisher(dispatch, auth, intl, removePublisherURI)
        .then((result) => {
            dispatch(setDraftPublisherFoundAction({found: false, index, revisionId}));
            //dispatch(removePublisherFromRevisionAction({index, revisionId}))
        })
        .catch((err) => {
            console.log('Edit publisher failed')
        })
});