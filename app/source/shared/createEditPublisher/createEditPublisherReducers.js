'use strict';

import {combineReducers} from 'redux';
import {validationReducer} from '../validation/validation';
import {
    setCreatePublisherDataAction,
    setEditPublisherDataAction,
    resetCreateEditPublisherAction,
    setShowCreateEditPublisherPopupAction,
    setCreateEditPublisherLoadingStatusAction
} from './createEditPublisherActions';

export default combineReducers({
    general: (state = {
        show: false,
        mode: 'create',
        loading: false,
        createEditPublisherURI: null,
        removePublisherURI: null
    }, action) => {
        switch (action.type) {
            case setCreateEditPublisherLoadingStatusAction.type: {
                return {
                    ...state,
                    loading: action.data
                }
            }

            case setCreatePublisherDataAction.type: {
                return {
                    ...state,
                    show: true,
                    mode: 'create',
                    createEditPublisherURI: action.data.createEditPublisherURI
                }
            }

            case setEditPublisherDataAction.type: {
                return {
                    ...state,
                    show: true,
                    mode: 'edit',
                    createEditPublisherURI: action.data.createEditPublisherURI,
                    removePublisherURI: action.data.removePublisherURI
                }
            }

            case setShowCreateEditPublisherPopupAction.type: {
                return {
                    ...state,
                    show: action.data
                }
            }

            case resetCreateEditPublisherAction.type: {
                return {
                    ...state,
                    mode: 'create',
                    createEditPublisherURI: null,
                    removePublisherURI: null
                }
            }

            default:
                return state;
        }
    },
    createEditPublisherModel: validationReducer(
        {
            uk: '',
            en: '',
            ru: '',
        }, 'master.createEditPublisher.createEditPublisherModel'),
})