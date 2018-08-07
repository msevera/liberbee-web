'use strict';

import {combineReducers} from 'redux';
import {validationReducer} from '../../shared/validation/validation';
import {
    setUpdateInfoDataAction, setShowUpdateInfoPopupAction, resetUpdateInfoPopupAction,
    setUpdateInfoAutocompleteAction, setUpdateInfoDataLoadingStatusAction
} from './updateInfoActions';
import halson from 'halson';

export default combineReducers({
    general: (state = {
        show: false,
        loading: false,
        placesAutocomplete: {
            suggestions: [],
            query: ''
        },
    }, action) => {
        switch (action.type) {
            case setUpdateInfoDataLoadingStatusAction.type: {
                return {
                    ...state,
                    loading: action.data
                }
            }

            case setUpdateInfoDataAction.type: {
                return {
                    ...state,
                    show: true
                }
            }

            case setShowUpdateInfoPopupAction.type: {
                return {
                    ...state,
                    show: action.data
                }
            }

            case resetUpdateInfoPopupAction.type: {
                return {
                    ...state,
                    placesAutocomplete: {
                        suggestions: [],
                        query: ''
                    }
                }
            }

            case setUpdateInfoAutocompleteAction.type: {
                let autocompleteHal = halson(action.data)
                return {
                    ...state,
                    placesAutocomplete: {
                        ...state.placesAutocomplete,
                        suggestions: autocompleteHal.getEmbeds('places'),
                        query: autocompleteHal.query
                    }
                }
            }

            default:
                return state;
        }
    },
    updateInfoModel: validationReducer(
        {
            fullName: '',
            location: '',
            locationId: ''
        }, 'userData.updateInfo.updateInfoModel'),
})