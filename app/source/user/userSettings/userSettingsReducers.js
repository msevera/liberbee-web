'use strict';

import {combineReducers} from 'redux';
import {validationReducer} from '../../shared/validation/validation';
import {setEmailSettingsNotificationsLoadingStatusAction} from './userSettingsActions';

export default combineReducers({
    general: (state = {
        emailSettingsNotificationsLoadingStatus: false
    }, action) => {
        switch (action.type) {
            case setEmailSettingsNotificationsLoadingStatusAction.type: {
                return {
                    ...state,
                    emailSettingsNotificationsLoadingStatus: action.data
                }
            }

            default:
                return state;
        }
    },
    notificationsModel: validationReducer(
        {
            missedMessages: true,
            newBookCopies: true,
        }, 'userData.userSettings.notificationsModel'),
})