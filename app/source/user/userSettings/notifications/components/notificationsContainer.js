'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../../../hoc';
import Helmet from 'react-helmet';
import {withRouter, Link, NavLink} from 'react-router-dom';
import {messages as masterMessages} from "../../../../master/masterMessages";
import FormGroupChecked from '../../../../shared/form/components/formGroupChecked';
import ButtonLoad from '../../../../shared/button/components/loadButton';
import {resetForm, submitForm} from "../../../../shared/validation/actions";
import {setNotificationEmailSettingsAction} from '../../userSettingsActions'

class NotificationsContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    onSaveSettings = (e) => {
        let {setNotificationEmailSettingsAction, intl, actions} = this.props;
        !!e && e.preventDefault();
        let {store} = this.context;

        store.dispatch(submitForm({
            model: 'userData.userSettings.notificationsModel',
            validators: {}
        }))
            .then((emailNotificationsSettings) => {
                setNotificationEmailSettingsAction({
                    intl,
                    emailNotificationsSettings,
                    setSettingsURI: actions.setSettings
                })
            });
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                e.target.blur();
                this.onSaveSettings();

                break;
            }
        }
    }

    render() {
        let {intl, loading} = this.props;

        return <div className="docs">
            <Helmet>
                <title>
                    {
                        intl.formatMessage(masterMessages.pageTitle, {
                            title: intl.formatMessage(messages.pageTitle)
                        })
                    }
                </title>
            </Helmet>
            <div>
                <h3>{intl.formatMessage(messages.emailNotificationsTitle)}:</h3>
                <form className="form" onKeyDown={this.onFormKeyDown}>
                    <FormGroupChecked id="missedMessages"
                                      label={intl.formatMessage(messages.missedMessages)}
                                      type="checkbox"
                                      name="missedMessages"
                                      model="userData.userSettings.notificationsModel"
                                      prop="missedMessages"
                                      className="form--noMargin"
                    />
                    <FormGroupChecked id="newBookCopies"
                                      label={intl.formatMessage(messages.newBookCopies)}
                                      type="checkbox"
                                      name="newBookCopies"
                                      model="userData.userSettings.notificationsModel"
                                      prop="newBookCopies"
                                      className="form--noMargin"
                    />
                    <ButtonLoad className="btn btn-small btn-primary btn-xs-block mt-2"
                                text={intl.formatMessage(masterMessages.save)}
                                loading={loading}
                                onClick={this.onSaveSettings}/>
                </form>
            </div>
        </div>
    }
}

const messages = defineMessages({
    pageTitle: {
        id: 'notificationsSettings.pageTitle',
        defaultMessage: 'Notifications settings'
    },
    emailNotificationsTitle: {
        id: 'notificationsSettings.emailNotificationsTitle',
        defaultMessage: 'Send email notifications about'
    },
    missedMessages: {
        id: 'notificationsSettings.missedMessages',
        defaultMessage: 'Missed messages'
    },
    newBookCopies: {
        id: 'notificationsSettings.newBookCopies',
        defaultMessage: 'New books, put up for sale and swapping'
    }
});

const mapStateToProps = (state, props) => {
    return {
        actions: state.userData.general.actions,
        loading: state.userData.userSettings.general.emailSettingsNotificationsLoadingStatus
    }
}

const mapDispatchToProps = {
    setNotificationEmailSettingsAction
}


export default withComponentExtended('notificationsSettings', [], null, null)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(NotificationsContainer)));