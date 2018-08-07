/**
 * Created by Mike on 9/24/2017.
 */

'use strict';

import halson from 'halson';
import {combineReducers} from 'redux';
import {validationReducer} from '../validation/validation';
import {
    setCreateEditBookManuallyStatusAction,
    setCreateEditBookManuallyAction,
    setShowCreateEditBookManuallyPopupAction,
    setCreateEditBookManuallyAuthorsAutocompleteAction,
    setCreateEditBookManuallyPublishersAutocompleteAction,
    resetCreateEditBookManuallyPopupAction,
    setCreateEditBookManuallyLoadingStatusAction
} from './createEditBookManuallyActions';

export default combineReducers({
    general: (state = {
        mode: 'create',
        status: '',
        loading: false,
        cover: null,
        show: false,
        authorsAutocomplete: {
            suggestions: [],
            query: ''
        },
        createEditDraftBookURI: null,
        publishersAutocomplete: {
            suggestions: [],
            query: ''
        }
    }, action) => {
        switch (action.type) {
            case setCreateEditBookManuallyLoadingStatusAction.type: {
                return {
                    ...state,
                    loading: action.data
                }
            }

            case setCreateEditBookManuallyAction.type: {
                return {
                    ...state,
                    show: true,
                    mode: action.data.mode,
                    cover: action.data.cover,
                    createEditDraftBookURI: action.data.createEditDraftBookURI
                }
            }

            case resetCreateEditBookManuallyPopupAction.type: {
                return {
                    ...state,
                    show: false,
                    cover: null,
                    mode: 'create',
                    createEditDraftBookURI: null,
                    status: '',
                }
            }

            case setShowCreateEditBookManuallyPopupAction.type: {
                return {
                    ...state,
                    show: false
                }
            }

            case setCreateEditBookManuallyStatusAction.type: {
                return {
                    ...state,
                    status: action.data.status
                }
            }
            case setCreateEditBookManuallyAuthorsAutocompleteAction.type: {
                let autocompleteHal = halson(action.data)
                return {
                    ...state,
                    authorsAutocomplete: {
                        ...state.authorsAutocomplete,
                        suggestions: autocompleteHal.getEmbeds('authors'),
                        query: autocompleteHal.query
                    }
                }
            }

            case setCreateEditBookManuallyPublishersAutocompleteAction.type: {
                let autocompleteHal = halson(action.data)
                return {
                    ...state,
                    publishersAutocomplete: {
                        ...state.publishersAutocomplete,
                        suggestions: autocompleteHal.getEmbeds('publishers'),
                        query: autocompleteHal.query
                    }
                }
            }

            default:
                return state;
        }
    },
    createEditBookManuallyModel: validationReducer(
        {
            title: '',
            authors: '',
            publishers: '',
            publishDate: '',
            isbn: '',
            amount: '',
            swap: true,
            condition: 20
        }, 'master.createEditBookManually.createEditBookManuallyModel')
})