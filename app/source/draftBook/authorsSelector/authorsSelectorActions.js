import reduxUtils from "../../../../utils/reduxUtils";
import {authorsAutocomplete} from "../../shared/autocomplete/autocompleteActions";
import {
    createAuthor, editAuthor, removeAuthor,
    searchAuthor, showCreateEditAuthorPopupAction
} from "../../shared/createEditAuthor/createEditAuthorActions";

export const setDraftAuthorsAutocompleteAction = reduxUtils.createAction('SET_DRAFT_AUTHORS_AUTOCOMPLETE');
export const setDraftAuthorFoundAction = reduxUtils.createAction('SET_DRAFT_AUTHOR_FOUND');
export const removeAuthorFromRevisionAction = reduxUtils.createAction('REMOVE_DRAFT_AUTHOR_FROM_REVISION');
export const editAuthorInRevisionAction = reduxUtils.createAction('EDIT_DRAFT_AUTHOR_IN_REVISON');
export const addAuthorToRevisionAction = reduxUtils.createAction('ADD_DRAFT_AUTHOR_TO_REVISON');
export const setAuthorLoadingStatusAction = reduxUtils.createAction('SET_AUTHOR_LOADING_STATUS');

export const authorSelectorShowPopupAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {index, name, revisionId}) => {
    dispatch(setAuthorLoadingStatusAction({
        index,
        revisionId,
        loading: true
    }));
   return dispatch(showCreateEditAuthorPopupAction({name})).then(() => {
       dispatch(setAuthorLoadingStatusAction({
           index,
           revisionId,
           loading: false
       }))
   })
})

export const draftAuthorsAutocompleteAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {name, index, revisionId}) => {
    dispatch(editAuthorInRevisionAction({name, index, revisionId}))
    authorsAutocomplete(dispatch, getState, auth, name)
        .then((result) => {
            console.log('authorsAutocomplete loaded', result);
            dispatch(setDraftAuthorsAutocompleteAction(result));
        })
        .catch(() => {
            console.log('authorsAutocomplete failed');
        })
})

export const searchAuthorAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {name, index, revisionId}) => {
    searchAuthor(auth, getState, name)
        .then((result) => {
            dispatch(setDraftAuthorFoundAction({found: true, index, revisionId}))
        }).catch((err) => {
        if (err && err.body && err.body.status == 404) {
            dispatch(setDraftAuthorFoundAction({found: false, index, revisionId}));
        }
    })
})

export const createAuthorAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}, {intl, names, createAuthorURI, index, revisionId}) => {
    return createAuthor(dispatch, auth, intl, createAuthorURI, {names})
        .then((result) => {
            //dispatch(changeAction({model: 'draftBook.bookModel', prop: 'authors', value: result.name.en, cleanMessage: true}))
            //dispatch(addAuthorToRevisionAction({name: result.name.en, index, revisionId}))
            dispatch(editAuthorInRevisionAction({name: result.name.en, index, revisionId}))
            dispatch(setDraftAuthorFoundAction({found: true, index, revisionId}))
        })
        .catch((err) => {
            console.log('Create author failed')
        })
});

export const editAuthorAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}, {intl, names, editAuthorURI, index, revisionId}) => {
    return editAuthor(dispatch, auth, intl, editAuthorURI, {names})
        .then((result) => {
            //dispatch(changeAction({model: 'draftBook.bookModel', prop: 'authors', value: result.name.en, cleanMessage: true}))
            dispatch(editAuthorInRevisionAction({name: result.name.en, index, revisionId}))
            dispatch(setDraftAuthorFoundAction({found: true, index, revisionId}))
        })
        .catch((err) => {
            console.log('Edit author failed')
        })
});

export const removeAuthorAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}, {intl, removeAuthorURI, index, revisionId}) => {
    return removeAuthor(dispatch, auth, intl, removeAuthorURI)
        .then((result) => {
            dispatch(setDraftAuthorFoundAction({found: false, index, revisionId}));
            //dispatch(removeAuthorFromRevisionAction({index, revisionId}))
        })
        .catch((err) => {
            console.log('Edit author failed')
        })
});