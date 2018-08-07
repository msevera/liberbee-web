/**
 * Created by Mike on 7/12/2017.
 */
'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {required, email} from '../../../../../utils/validation';
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import {submitForm, clearFormErrors} from '../../../shared/validation/actions';
import {defineMessages, injectIntl, FormattedMessage} from 'react-intl';
import {messages as formMessages} from '../../../shared/form/messages';
import {messages as validationMessages} from '../../../shared/validation/messages';
import {messages as masterMessages} from '../../masterMessages';
import LoadButton from '../../../shared/button/components/loadButton';

class SendEmail extends Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
    }

    constructor() {
        super();

        this.validators = {
            email: {
                required,
                email,
            }
        }
    }

    onSignIn = (e) => {
        e.preventDefault();
        let {store} = this.context;
        let {onSignIn} = this.props;

        onSignIn();
        store.dispatch(clearFormErrors({model: 'master.forgotPassword'}))
    }

    onClose = () => {
        let {onClose} = this.props;
        onClose();
    }

    onSend = () => {
        let {onSend, intl} = this.props;
        let {store} = this.context;
        store.dispatch(submitForm({model: 'master.forgotPassword'}))
            .then((form) => {
                onSend(form, intl)
            });
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                e.target.blur();
                this.onSend();
                break;
            }
        }
    }

    buildContent() {
        let {sendStatus, email, intl, loading} = this.props;

        if (sendStatus != 'success') {
            return <div className="actionBlock">
                <div className="actionBlock--title">
                    <FormattedMessage {...messages.title} />
                </div>
                <div className="actionBlock--description">
                    <FormattedMessage {...messages.description} />
                </div>
                <div className="actionBlock--content">
                    <form className="form" onKeyDown={this.onFormKeyDown}>
                        <FormGroupInput id="passwordRecoveryEmail"
                                        required={true}
                                        label={intl.formatMessage(formMessages.email)}
                                        placeholder={intl.formatMessage(formMessages.emailPlaceholder)}
                                        model="master.forgotPassword"
                                        prop="email"
                                        validators={this.validators.email}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.emailRequired),
                                            email: intl.formatMessage(validationMessages.emailNotValid)
                                        }}/>
                    </form>
                </div>
                <div className="actionBlock--actions">
                    <LoadButton loading={loading} className="btn btn-primary" onClick={this.onSend}>{intl.formatMessage(messages.send)}</LoadButton>
                    <div>
                        <a href="#" onClick={this.onSignIn}>{intl.formatMessage(messages.backToLogin)}</a>
                    </div>
                </div>
            </div>
        } else {
            return <div className="actionBlock">
                <div className="actionBlock--title">
                    <FormattedMessage {...messages.title} />
                </div>
                <div className="actionBlock--description">
                    <FormattedMessage {...messages.followTheInstructions} values={{email: <b>{email}</b>}} />
                </div>
                <div className="actionBlock--actions">
                    <button className="btn btn-primary" onClick={this.onClose}>{intl.formatMessage(masterMessages.close)}</button>
                    <div>
                        <a href="#" onClick={this.onSignIn}>{intl.formatMessage(messages.backToLogin)}</a>
                    </div>
                </div>
            </div>
        }
    }

    render() {
        return this.buildContent();
    }
}

const messages = defineMessages({
    title: {
        id: 'passwordRecovery.title',
        defaultMessage: 'Password recovery'
    },
    description: {
        id: 'passwordRecovery.description',
        defaultMessage: 'It happens to everyone. Just let us now your email address and we send you email with instructions'
    },
    send: {
        id: 'passwordRecovery.send',
        defaultMessage: 'Send'
    },
    backToLogin: {
        id: 'passwordRecovery.backToLogin',
        defaultMessage: 'Back to Log in'
    },
    followTheInstructions: {
        id: 'passwordRecovery.followTheInstructions',
        defaultMessage: 'Please follow the instructions we sent you to your email {email}'
    }
})


export default injectIntl(SendEmail);