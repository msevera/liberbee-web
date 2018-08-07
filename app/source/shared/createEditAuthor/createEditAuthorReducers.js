'use strict';

import {combineReducers} from 'redux';
import {validationReducer} from '../validation/validation';
import {
    setCreateAuthorDataAction,
    setEditAuthorDataAction,
    resetCreateEditAuthorAction,
    setShowCreateEditAuthorPopupAction,
    setCreateEditAuthorLoadingStatusAction
} from './createEditAuthorActions';

export default combineReducers({
    general: (state = {
        show: false,
        mode: 'create',
        loading: false,
        createEditAuthorURI: null,
        removeAuthorURI: null
    }, action) => {
        switch (action.type) {
            case setCreateEditAuthorLoadingStatusAction.type: {
                return {
                    ...state,
                    loading: action.data
                }
            }

            case setCreateAuthorDataAction.type: {
                return {
                    ...state,
                    show: true,
                    mode: 'create',
                    createEditAuthorURI: action.data.createEditAuthorURI
                }
            }

            case setEditAuthorDataAction.type: {
                return {
                    ...state,
                    show: true,
                    mode: 'edit',
                    createEditAuthorURI: action.data.createEditAuthorURI,
                    removeAuthorURI: action.data.removeAuthorURI
                }
            }

            case setShowCreateEditAuthorPopupAction.type: {
                return {
                    ...state,
                    show: action.data
                }
            }

            case resetCreateEditAuthorAction.type: {
                return {
                    ...state,
                    mode: 'create',
                    createEditAuthorURI: null,
                    removeAuthorURI: null
                }
            }

            default:
                return state;
        }
    },
    createEditAuthorModel: validationReducer(
        {
            uk: '',
            en: '',
            ru: '',
        }, 'master.createEditAuthor.createEditAuthorModel'),
})