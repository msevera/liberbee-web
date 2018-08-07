/**
 * Created by Mike on 4/13/2017.
 */


'use strict';
import reduxUtils from '../../../utils/reduxUtils';
import fetchUtils from '../../../utils/fetchUtils';
import history from '../../../utils/history';
import {addMessage} from '../master/notifier/notifierActions';
import halson from 'halson';
import {defineMessages} from 'react-intl';
import {authorsAutocomplete, publishersAutocomplete} from '../shared/autocomplete/autocompleteActions';
import {createAuthor, editAuthor, removeAuthor, searchAuthor} from '../shared/createEditAuthor/createEditAuthorActions';
import {createPublisher, editPublisher, removePublisher, searchPublisher} from '../shared/createEditPublisher/createEditPublisherActions';
import {changeAction} from '../shared/validation/actions';

export const initDraftBookAction = reduxUtils.createAction('INIT_DRAFT_BOOK');
export const draftBookAssociateSearchSetResutsAction = reduxUtils.createAction('SET_DRAFT_BOOK_ASSOCIATES');
export const clearDraftBookAssociateResultsAction = reduxUtils.createAction('CLEAR_DRAFT_BOOK_ASSOCIATES');
export const moreBooksLoadedAction = reduxUtils.createAction('DRAFT_BOOK_MORE_ASSOCIATES_LOADED');
export const resetFormsAction = reduxUtils.createAction('DRAFT_BOOK_RESET_FORMS');
export const setAssignedDraftBookAction = reduxUtils.createAction('SET_ASSIGNED_DRAFT_BOOK');
export const setDraftBookAssociateSearchLoadingStatusAction = reduxUtils.createAction('SET_DRAFT_BOOK_ASSOCIATE_SEARCH_LOADING_STATUS');
export const setAssociateLoadingStatusAction = reduxUtils.createAction('SET_ASSOCIATE_LOADING_STATUS');
export const setRemoveAssociateLoadingStatusAction = reduxUtils.createAction('SET_REMOVE_ASSOCIATE_LOADING_STATUS');
export const setAssignLoadingStatusAction = reduxUtils.createAction('SET_ASSIGN_LOADING_STATUS');
export const setPublishLoadingStatusAction = reduxUtils.createAction('SET_PUBLISH_LOADING_STATUS');
export const setSaveLoadingStatusAction = reduxUtils.createAction('SET_SAVE_LOADING_STATUS');
export const setCloneLoadingStatusAction = reduxUtils.createAction('SET_CLONE_LOADING_STATUS');
export const setDraftBookInitializedAction = reduxUtils.createAction('SET_DRAFT_BOOK_INITIALIZED');

const messages = defineMessages({
    draftRemoved: {
        id: 'draftBook.draftRemoved',
        defaultMessage: 'Draft removed'
    },
    removeBookDraftFailed: {
        id: 'draftBook.removeBookDraftFailed',
        defaultMessage: 'Remove book draft failed'
    },
    revisionCopied: {
        id: 'draftBook.revisionCopied',
        defaultMessage: 'Revision copied'
    },
    copyRevisonFailed: {
        id: 'draftBook.copyRevisonFailed',
        defaultMessage: 'Copy revision failed'
    },
    revisionSaved: {
        id: 'draftBook.revisionSaved',
        defaultMessage: 'Revision saved'
    },
    saveRevisionFailed: {
        id: 'draftBook.saveRevisionFailed',
        defaultMessage: 'Save revision failed'
    },
    revisionPublished: {
        id: 'draftBook.revisionPublished',
        defaultMessage: 'Revision published'
    },
    publishRevisionFailed: {
        id: 'draftBook.publishRevisionFailed',
        defaultMessage: 'Publish revision failed'
    },
    bookAssociated: {
        id: 'draftBook.bookAssociated',
        defaultMessage: 'Book associated with draft'
    },
    bookAssociationFailed: {
        id: 'draftBook.bookAssociationFailed',
        defaultMessage: 'Book association failed'
    },
    bookUnlinkedFromDraft: {
        id: 'draftBook.bookUnlinkedFromDraft',
        defaultMessage: 'Book unlinked from draft'
    },
    bookUnlinkFailed: {
        id: 'draftBook.bookUnlinkFailed',
        defaultMessage: 'Book unlink failed'
    },
    draftAssignedToYou: {
        id: 'draftBook.draftAssignedToYou',
        defaultMessage: 'Draft assigned to you'
    },
    draftAssignFailed: {
        id: 'draftBook.draftAssignFailed',
        defaultMessage: 'Assign user to draft failed'
    },
    draftUnassignedFromYou: {
        id: 'draftBook.draftUnassignFromYou',
        defaultMessage: 'Draft unassigned from you'
    },
    draftUnassignFailed: {
        id: 'draftBook.draftUnassignFailed',
        defaultMessage: 'Unassign draft failed'
    }
})

export const searchBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {searchQuery}) => {
    let state = getState();
    let actions = halson(state.master.general.actions);

    if (actions.getBooks && searchQuery) {
        dispatch(setDraftBookAssociateSearchLoadingStatusAction(true));
        return fetchUtils.call(actions.getBooks, auth, {q: searchQuery, currentusercopies: true}).then((result) => {
            dispatch(draftBookAssociateSearchSetResutsAction(result));
        }).catch((err) => {
            console.log('searchBook load failed', err);
        }).then(() => {
            dispatch(setDraftBookAssociateSearchLoadingStatusAction(false));
        })
    } else {
        dispatch(clearDraftBookAssociateResultsAction())
    }
});

export const loadMoreAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, loadMoreURI) => {
    if (loadMoreURI) {
        return fetchUtils.call(loadMoreURI, auth).then((result) => {
            dispatch(moreBooksLoadedAction(result));
        }).catch((err) => {
            console.log(err);
        })
    }
})

export const loadDraftBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {draftBookId}) => {
    let state = getState();
    let actions = state.master.general.actions;

    if (actions.getDraftBook) {
        return fetchUtils.call(actions.getDraftBook, auth, {
            checkAuthor: true,
            checkPublisher: true
        }, {uriParams: {draftBookId}}).then((result) => {
            dispatch(initDraftBookAction(result));
        }).catch((err) => {
            dispatch(setDraftBookInitializedAction(false))
            console.log('Draft book load failed', err);
        })
    }
})

export const removeDraftBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver}, intl) => {
    let state = getState();
    let actions = state.draftBook.general.actions;
    let userSlug = state.master.user.slug;


    if (actions.removeDraftBook) {
        return fetchUtils.call(actions.removeDraftBook, auth)
            .then((result) => {
                dispatch(addMessage({text: intl.formatMessage(messages.draftRemoved), type: 'success'}));
                let urlToPush = routeResolver.buildRouteFor('pending', {user: userSlug}).pathname;
                let routeState = routeResolver.getReloadState('pending', {reload: true});
                history.push(urlToPush, routeState);
            }).catch((err) => {
                let title = intl.formatMessage(messages.removeBookDraftFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            })
    }
});

export const copyDraftBookRevisionAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, copyRevisionURI, intl) => {
    if (copyRevisionURI) {
        dispatch(setCloneLoadingStatusAction(true));
        return fetchUtils.call(copyRevisionURI, auth, {}, {queryParams: {checkAuthor: true, checkPublisher: true}})
            .then((result) => {
                dispatch(initDraftBookAction(result));
                dispatch(addMessage({title: intl.formatMessage(messages.revisionCopied), type: 'success'}));
            }).catch((err) => {
                let title = intl.formatMessage(messages.copyRevisonFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }).then(() => {
                dispatch(setCloneLoadingStatusAction(false));
            })
    }
})

export const saveDraftBookRevisionAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, revision, saveRevisionURI, intl) => {
    if (saveRevisionURI) {
        dispatch(setSaveLoadingStatusAction(true));
        return fetchUtils.call(saveRevisionURI, auth, revision, {
            queryParams: {
                checkAuthor: true,
                checkPublisher: true
            }
        })
            .then((result) => {
                dispatch(initDraftBookAction(result));
                dispatch(addMessage({title: intl.formatMessage(messages.revisionSaved), type: 'success'}));
            }).catch((err) => {
                let title = intl.formatMessage(messages.saveRevisionFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }).then(() => {
                dispatch(setSaveLoadingStatusAction(false));
            })
    }
})

export const publishDraftBookRevisionAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, revision, saveRevisionURI, publishRevisionURI, intl) => {
    let createCopy = getState().draftBook.draft.createCopy;

    if (saveRevisionURI) {
        return dispatch(saveDraftBookRevisionAction(revision, saveRevisionURI, intl))
            .then(() => {
                _publishRevision(publishRevisionURI, dispatch, auth, intl, gtm, createCopy);
            })
    } else {
        _publishRevision(publishRevisionURI, dispatch, auth, intl, gtm, createCopy);
    }
})

let _publishRevision = (publishRevisionURI, dispatch, auth, intl, gtm, createCopy) => {
    if (publishRevisionURI) {
        dispatch(setPublishLoadingStatusAction(true));
        return fetchUtils.call(publishRevisionURI, auth)
            .then((result) => {
                if (createCopy && result.book && result.book.slug)
                {
                    gtm.sendEvent('addedToShelf', {bookSlug: result.book.slug, userId: createCopy.user._id, bookCopyPrice: Math.round(createCopy.deal.amount)});
                }
                dispatch(initDraftBookAction(result));
                dispatch(addMessage({text: intl.formatMessage(messages.revisionPublished), type: 'success'}));
            }).catch((err) => {
                let title = intl.formatMessage(messages.publishRevisionFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }).then(() => {
                dispatch(setPublishLoadingStatusAction(false));
            })
    }
}

export const associateDraftWithBookAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, associateDraftWithBookURI, bookId, intl) => {
    if (associateDraftWithBookURI) {
        dispatch(setAssociateLoadingStatusAction(true))
        return fetchUtils.call(associateDraftWithBookURI, auth, {bookId})
            .then((result) => {
                dispatch(initDraftBookAction(result));
                dispatch(addMessage({text: intl.formatMessage(messages.bookAssociated), type: 'success'}));
            }).catch((err) => {
                let title = intl.formatMessage(messages.bookAssociationFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }).then(() => {
                dispatch(setAssociateLoadingStatusAction(false))
            })
    }
})

export const removeBookAssociationAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, removeBookAssociationURI, intl) => {
    if (removeBookAssociationURI) {
        dispatch(setRemoveAssociateLoadingStatusAction(true))
        return fetchUtils.call(removeBookAssociationURI, auth)
            .then((result) => {
                dispatch(initDraftBookAction(result));
                dispatch(addMessage({text: intl.formatMessage(messages.bookUnlinkedFromDraft), type: 'success'}));
            }).catch((err) => {
                let title = intl.formatMessage(messages.bookUnlinkFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }).then(() => {
                dispatch(setRemoveAssociateLoadingStatusAction(false))
            })
    }
})

export const assignDraftToUserAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, assignDraftToUserURI, intl) => {
    if (assignDraftToUserURI) {
        dispatch(setAssignLoadingStatusAction(true));
        return fetchUtils.call(assignDraftToUserURI, auth)
            .then((result) => {
                dispatch(setAssignedDraftBookAction(result));
                dispatch(addMessage({text: intl.formatMessage(messages.draftAssignedToYou), type: 'success'}));
            }).catch((err) => {
                let title = intl.formatMessage(messages.draftAssignFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }).then(() => {
                dispatch(setAssignLoadingStatusAction(false));
            })
    }
})

export const removeAssigneeAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, removeAssigneeURI, intl) => {
    if (removeAssigneeURI) {
        dispatch(setAssignLoadingStatusAction(true));
        return fetchUtils.call(removeAssigneeURI, auth)
            .then((result) => {
                dispatch(setAssignedDraftBookAction(result));
                dispatch(addMessage({text: intl.formatMessage(messages.draftUnassignedFromYou), type: 'success'}));
            }).catch((err) => {
                let title = intl.formatMessage(messages.draftUnassignFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }).then(() => {
                dispatch(setAssignLoadingStatusAction(false));
            })
    }
})






