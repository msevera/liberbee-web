'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import {addMessage} from '../../master/notifier/notifierActions';
import {defineMessages} from 'react-intl';
import {resetModelToInitial, resetForm, clearFormErrors} from '../validation/actions';
import halson from 'halson';

export const setSelectCategoryDataAction = reduxUtils.createAction('SET_SELECT_CATEGORY_DATA');
export const resetSelectCategoryAction = reduxUtils.createAction('RESET_SELECT_CATEGORY');
export const setShowSelectCategoryPopupAction = reduxUtils.createAction('SET_SHOW_SELECT_CATEGORY_POPUP');
export const setCategoryLoadingStatusAction = reduxUtils.createAction('SET_CATEGORY_LOADING_STATUS');


export const showSelectCategoryPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    dispatch(setCategoryLoadingStatusAction(true));
    dispatch(setShowSelectCategoryPopupAction(true))
    let getCategoriesAction = getState().master.general.actions.getCategories;
    fetchUtils.call(getCategoriesAction, auth)
        .then((result) => {
            dispatch(setSelectCategoryDataAction(result));
            dispatch(setCategoryLoadingStatusAction(false));
        })
        .catch(() => {
            dispatch(setCategoryLoadingStatusAction(false));
        })

});

export const hideSelectCategoryPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    dispatch(setShowSelectCategoryPopupAction(false));
    setTimeout(() => {
        dispatch(resetSelectCategoryAction());
    }, 500)
});




