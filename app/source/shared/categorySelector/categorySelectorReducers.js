'use strict';

import {combineReducers} from 'redux';
import halson from 'halson';
import {
    setSelectCategoryDataAction,
    setShowSelectCategoryPopupAction,
    resetSelectCategoryAction,
    setCategoryLoadingStatusAction
} from './categorySelectorActions';

export default combineReducers({
    general: (state = {
        show: false,
        loading: false,
        categories: []
    }, action) => {
        switch (action.type) {
            case setCategoryLoadingStatusAction.type: {
                return {
                    ...state,
                    loading: action.data.loading
                }
            }

            case setSelectCategoryDataAction.type: {
                let categorieHal = halson(action.data)
                return {
                    ...state,
                    show: true,
                    categories: categorieHal.getEmbeds('categories')
                }
            }

            case setShowSelectCategoryPopupAction.type: {
                return {
                    ...state,
                    show: action.data
                }
            }

            case resetSelectCategoryAction.type: {
                return {
                    ...state
                }
            }

            default:
                return state;
        }
    }
})