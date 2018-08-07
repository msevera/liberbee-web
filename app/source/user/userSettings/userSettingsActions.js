'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import {addMessage} from '../../master/notifier/notifierActions';
import {defineMessages} from 'react-intl';

export const setEmailSettingsNotificationsLoadingStatusAction = reduxUtils.createAction('SET_EMAIL_SETTINGS_NOTIFICATIONS_LOADING_STATUS');

const messages = defineMessages({
    updateSettingsFailed: {
        id: 'userSettings.updateSettingsFailed',
        defaultMessage: 'Saving settings failed'
    },
    settingsUpdated: {
        id: 'userSettings.settingsUpdated',
        defaultMessage: 'Your settings are saved'
    }
})

export const setNotificationEmailSettingsAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {intl, setSettingsURI, emailNotificationsSettings}) => {
    if (!setSettingsURI)
        return;

    dispatch(setEmailSettingsNotificationsLoadingStatusAction(true))
    let settings = {
        notifications: {
            email: emailNotificationsSettings
        }
    }
    return fetchUtils.call(setSettingsURI, auth, {settings}).then((result) => {
        dispatch(addMessage({text: intl.formatMessage(messages.settingsUpdated), type: 'success'}));
    }).catch((err) => {
        let title = intl.formatMessage(messages.updateSettingsFailed);
        let text = '';
        if (err.body && err.body.message) {
            text = err.body.message;
        }
        dispatch(addMessage({text, title, type: 'error'}));
    }).then(() => {
        dispatch(setEmailSettingsNotificationsLoadingStatusAction(false));
    })
});
