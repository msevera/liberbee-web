'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import {addMessage} from '../../master/notifier/notifierActions';
import {defineMessages} from 'react-intl';
import {clearFormErrors, resetModelToInitial} from "../../shared/validation/actions";
import {placesAutocomplete} from "../../shared/autocomplete/autocompleteActions";
import {initUserDataAction, loadUserBooksAction} from "../userActions";
import {setUserAction} from '../../master/masterActions';

export const setUpdateInfoDataAction = reduxUtils.createAction('SET_UPDATE_INFO_DATA_POPUP');
export const setUpdateInfoDataLoadingStatusAction = reduxUtils.createAction('SET_UPDATE_INFO_DATA_LOADING_STATUS');
export const resetUpdateInfoPopupAction = reduxUtils.createAction('RESET_UPDATE_INFO_POPUP');
export const setShowUpdateInfoPopupAction = reduxUtils.createAction('SET_SHOW_UPDATE_INFO_POPUP');
export const setUpdateInfoAutocompleteAction = reduxUtils.createAction('SET_UPDATE_INFO_AUTOCOMPLETE_POPUP');

const messages = defineMessages({
    updateInfoFailed: {
        id: 'updateInfo.updateInfoFailed',
        defaultMessage: 'Update info failed'
    },
    infoUpdated: {
        id: 'updateInfo.infoUpdated',
        defaultMessage: 'Your info is updated'
    }
})

export const showUpdateInfoPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}) => {
    let state = getState();
    let fullName = state.userData.user.name;
    let location = state.userData.user.geo.city;
    let locationId = state.userData.user.geo.cityId;

    gtm.sendEvent('updateInfoClick')

    dispatch(resetModelToInitial({
        model: 'userData.updateInfo.updateInfoModel',
        initialData: {
            fullName,
            location,
            locationId
        }
    }));

    dispatch(setShowUpdateInfoPopupAction(true))

});

export const hideUpdateInfoPopupAction = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    dispatch(setShowUpdateInfoPopupAction(false));
    setTimeout(() => {
        dispatch(clearFormErrors({model: 'userData.updateInfo.updateInfoModel'}))
        dispatch(resetUpdateInfoPopupAction());
    }, 500)
});


export const updateInfoAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {intl, updateInfoURI, fullName, avatar, locationId}) => {
    dispatch(setUpdateInfoDataLoadingStatusAction(true));
    return fetchUtils.call(updateInfoURI, auth, {name: fullName, location: locationId, profilePicture: avatar})
        .then((result) => {
            gtm.sendEvent('infoUpdated')
            dispatch(addMessage({text: intl.formatMessage(messages.infoUpdated), type: 'success'}));
            dispatch(hideUpdateInfoPopupAction());
            dispatch(initUserDataAction(result));
            dispatch(setUserAction(result));
            dispatch(loadUserBooksAction({userSlug: result.slug}));
        })
        .catch((err) => {
            let title = intl.formatMessage(messages.updateInfoFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
        })
        .then(() => {
            dispatch(setUpdateInfoDataLoadingStatusAction(false));
        })
});

export const updateInfoPlacesAutocompleteAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {place}) => {
    placesAutocomplete(dispatch, getState, auth, place, 'city')
        .then((result) => {
            console.log('placesAutocomplete loaded', result);
            dispatch(setUpdateInfoAutocompleteAction(result));
        })
        .catch(() => {
            console.log('placesAutocomplete failed');
        })
})





