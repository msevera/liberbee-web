/**
 * Created by Mike on 9/14/2017.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Popup from '../../../shared/popup/components/popup';
import queryString from 'query-string';
import {required, password, email} from '../../../../../utils/validation';
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import {submitForm, clearFormErrors, resetForm} from '../../../shared/validation/actions';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router-dom';
import history from '../../../../../utils/history';
import {
    resetPasswordAction,
    setPasswordRecoveryTokenVerificationStatusAction,
    showSigninAction
} from '../../masterActions';
import {injectIntl, FormattedMessage, defineMessages} from 'react-intl';
import {messages as formMessages} from '../../../shared/form/messages';
import {messages as validationMessages} from '../../../shared/validation/messages';
import {messages as masterMessages} from '../../masterMessages';
import {withTools} from '../../../hoc';
import LoadButton from '../../../shared/button/components/loadButton';

class ResetPasswordPopup extends React.Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
    }

    static getResetPasswordToken(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.reset ? query.reset : '';
    }

    constructor(props) {
        super();

        this.state = {
            show: props.show
        }

        this.validators = {
            password: {
                required,
                password
            },
            confirmPassword: {
                required,
                password
            }
        }
    }

    onClose = () => {
        let {setPasswordRecoveryTokenVerificationStatusAction, routeResolver} = this.props;
        this.setState({
            show: false
        })

        let path = routeResolver.buildRouteFor('index', {}).pathname
        history.push(path);

        setTimeout(() => {
            setPasswordRecoveryTokenVerificationStatusAction({status: '', show: false})
        }, 500)
    }

    onSignIn = () => {
        let {showSigninAction} = this.props;
        this.onClose();

        showSigninAction(true)

    }

    onChangePassword = () => {
        let {resetPasswordAction, location} = this.props;
        let {store} = this.context;
        store.dispatch(submitForm({model: 'master.resetPassword'}))
            .then((model) => {
                resetPasswordAction({
                    password: model.password,
                    token: ResetPasswordPopup.getResetPasswordToken(location)
                })
            });
    }

    buildContent() {
        let {resetPassword, verificationStatus, intl, resetPasswordLoading} = this.props;
        switch (verificationStatus) {
            case 'invalid_token': {
                return <div className="actionBlock">
                    <div className="actionBlock--title">
                        <FormattedMessage {...messages.title} />
                    </div>
                    <div className="actionBlock--description">
                        <FormattedMessage {...messages.resetTokenNotValid} />
                    </div>
                    <div className="actionBlock--actions actionBlock--center">
                        <button className="btn btn-primary" onClick={this.onClose}>{intl.formatMessage(masterMessages.close)}</button>
                    </div>
                </div>
            }

            case 'token_expired': {
                return <div className="actionBlock">
                    <div className="actionBlock--title">
                        <FormattedMessage {...messages.title} />
                    </div>
                    <div className="actionBlock--description">
                        <FormattedMessage {...messages.resetTokenExpired} />
                    </div>
                    <div className="actionBlock--actions actionBlock--center">
                        <button className="btn btn-primary" onClick={this.onClose}>{intl.formatMessage(masterMessages.close)}</button>
                    </div>
                </div>
            }

            case 'password_changed': {
                return <div className="actionBlock">
                    <div className="actionBlock--title">
                        <FormattedMessage {...messages.passwordChanged} />
                    </div>
                    <div className="actionBlock--description">
                        <FormattedMessage {...messages.loginWithNewPassword} />
                    </div>
                    <div className="actionBlock--actions actionBlock--center">
                        <button className="btn btn-primary" onClick={this.onSignIn}>{intl.formatMessage(messages.login)}</button>
                    </div>
                </div>
            }

            default: {
                return <div className="actionBlock">
                    <div className="actionBlock--title">
                        <FormattedMessage {...messages.title} />
                    </div>
                    <div className="actionBlock--description">
                        <FormattedMessage {...messages.enterNewPassword} />
                    </div>
                    <div className="actionBlock--content">
                        <form className="form">
                            <FormGroupInput id="resetPassword"
                                            required={true}
                                            label={intl.formatMessage(formMessages.password)}
                                            placeholder={intl.formatMessage(formMessages.newPasswordPlaceholder)}
                                            model="master.resetPassword"
                                            prop="password"
                                            type="password"
                                            validators={this.validators.password}
                                            messages={{
                                                required: intl.formatMessage(validationMessages.passwordRequired),
                                                password: intl.formatMessage(validationMessages.passwordComplexity),
                                            }}/>

                            <FormGroupInput id="resetPasswordConfirm"
                                            required={true}
                                            label={intl.formatMessage(formMessages.confirmPassword)}
                                            placeholder={intl.formatMessage(formMessages.repeatNewPasswordPlaceholder)}
                                            model="master.resetPassword"
                                            prop="confirmPassword"
                                            type="password"
                                            validators={{
                                                ...this.validators.confirmPassword, confirmPassword: (password) => {
                                                    return password == resetPassword;
                                                }
                                            }}
                                            messages={{
                                                required: intl.formatMessage(validationMessages.passwordRequired),
                                                password: intl.formatMessage(validationMessages.passwordComplexity),
                                                confirmPassword: intl.formatMessage(validationMessages.passwordDoesNotMatch)
                                            }}/>
                        </form>
                    </div>
                    <div className="actionBlock--actions actionBlock--center">
                        <LoadButton loading={resetPasswordLoading} className="btn btn-primary" onClick={this.onChangePassword}>{intl.formatMessage(messages.changePassword)}</LoadButton>
                    </div>
                </div>
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            show: nextProps.show
        })
    }

    render() {
        let {show} = this.state;

        return <Popup show={show} onPopupClose={this.onClose}>
            {this.buildContent()}
        </Popup>
    }
}

const messages = defineMessages({
    title: {
        id: 'passwordRecovery.title',
        defaultMessage: 'Password recovery'
    },
    resetTokenNotValid: {
        id: 'passwordRecovery.resetTokenNotValid',
        defaultMessage: 'Reset password token not valid'
    },
    resetTokenExpired: {
        id: 'passwordRecovery.resetTokenExpired',
        defaultMessage: 'Reset password token expired'
    },
    passwordChanged: {
        id: 'passwordRecovery.passwordChanged',
        defaultMessage: 'Your password changed'
    },
    loginWithNewPassword: {
        id: 'passwordRecovery.loginWithNewPassword',
        defaultMessage: 'Now you can log in with your new password'
    },
    login: {
        id: 'passwordRecovery.login',
        defaultMessage: 'Log in'
    },
    enterNewPassword: {
        id: 'passwordRecovery.enterNewPassword',
        defaultMessage: 'Please enter new password'
    },
    changePassword: {
        id: 'passwordRecovery.changePassword',
        defaultMessage: 'Change password'
    }
})

const mapStateToProps = (state) => {
    return {
        resetPasswordLoading: state.master.general.resetPasswordLoading,
        resetPassword: state.master.resetPassword.password,
        show: state.master.passwordRecovery.verification.show,
        verificationStatus: state.master.passwordRecovery.verification.status
    }
}

const mapDispatchToProps = {
    resetPasswordAction,
    setPasswordRecoveryTokenVerificationStatusAction,
    showSigninAction
}

export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ResetPasswordPopup)));