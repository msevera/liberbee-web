'use strict';

import {combineReducers} from 'redux';
import {validationReducer} from '../validation/validation';
import {setCreateEditBookCopyDataAction, resetCreateEditBookCopyPopupAction, setShowCreateEditBookCopyPopupAction, setCreateEditBookCopyLoadingStatusAction} from './createEditBookCopyActions';

export default combineReducers({
    general: (state = {
        show: false,
        bookId: null,
        bookSlug: null,
        showComment: false,
        createEditBookCopyURI: null,
        loading: false,
        cover: null
    }, action) => {
        switch (action.type) {
            case setCreateEditBookCopyLoadingStatusAction.type: {
                return {
                    ...state,
                    loading: action.data
                }
            }

            case setCreateEditBookCopyDataAction.type: {
                return {
                    ...state,
                    show: true,
                    bookId: action.data.bookId,
                    bookSlug: action.data.bookSlug,
                    createEditBookCopyURI: action.data.createEditBookCopyURI,
                    cover: action.data.cover,
                    showComment: action.data.showComment
                }
            }

            case setShowCreateEditBookCopyPopupAction.type: {
                return {
                    ...state,
                    show: action.data
                }
            }

            case resetCreateEditBookCopyPopupAction.type: {
                return {
                    ...state,
                    bookId: null,
                    bookSlug: null,
                    createEditBookCopyURI: null,
                    cover: null
                }
            }

            default:
                return state;
        }
    },
    createEditBookCopyModel: validationReducer(
        {
            amount: '0',
            swap: true,
            comment: '',
            condition: 20
        }, 'master.createEditBookCopy.createEditBookCopyModel'),
})