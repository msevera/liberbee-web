/**
 * Created by Mike on 10/11/2017.
 */

'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    showSocialSigninAssociateAction,
    resetSocialSigninAssociateAction,
    showSigninAction,
    showForgotPasswordAction,
    onSocialSignInAssociateAction
} from '../../masterActions';
import Popup from '../../../shared/popup/components/popup';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import Avatar from '../../../shared/avatar/components/avatar';
import {required, password, email} from '../../../../../utils/validation';
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import {submitForm, resetForm} from '../../../shared/validation/actions';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {messages as formMessages} from '../../../shared/form/messages';
import {messages as validationMessages} from '../../../shared/validation/messages';

class SocialSigninAssociateContainer extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }

    constructor() {
        super();

        this.validators = {
            password: {
                required
            }
        }
    }

    onPopupClose = () => {
        let {store} = this.context;

        let {showSocialSigninAssociateAction, resetSocialSigninAssociateAction} = this.props;
        showSocialSigninAssociateAction(false);
        setTimeout(() => {
            resetSocialSigninAssociateAction();
            store.dispatch(resetForm({model: 'master.socialSigninAssociateForm', validators: this.validators}))
        }, 500)
    }

    onSignIn = () => {

        let {store} = this.context;
        let {onSocialSignInAssociateAction, intl} = this.props;

        store.dispatch(submitForm({model: 'master.socialSigninAssociateForm'}))
            .then((form) => {
                onSocialSignInAssociateAction(form, intl)
            });
    }

    onSwitchToSignIn = () => {
        let {showSigninAction, showSocialSigninAction} = this.props;

        showSocialSigninAction(false);
        showSigninAction(true);
    }

    onSwitchToPasswordReset = () => {
        let {showSocialSigninAction, showForgotPasswordAction} = this.props;

        showSocialSigninAction(false);
        showForgotPasswordAction(true);
    }

    render() {
        let {show, name, photo, email, intl} = this.props;

        return <Popup id="socialSignin" show={show} onPopupClose={this.onPopupClose}>
            <div className="actionBlock">
                <div className="actionBlock--title">
                    <FormattedMessage {...messages.title} />
                </div>
                <div className="actionBlock--description">
                    <FormattedMessage {...messages.description} />
                </div>
                <div className="actionBlock--content">
                    <div className="">
                        <div className="socialSignin">
                            <Avatar className="avatar-big" src={photo} name={name}/>
                            <div className="socialSignin--name">{name}</div>
                            <div className="socialSignin--email">{email}</div>
                            <div className="socialSignin--loginWith">
                                <div className="form">
                                    <div className="form-h">
                                        <FormGroupInput id="associatePassord"
                                                        required={true}
                                                        placeholder={intl.formatMessage(formMessages.passwordPlaceholder)}
                                                        model="master.socialSigninAssociateForm"
                                                        prop="password"
                                                        type="password"
                                                        validators={this.validators.password}
                                                        messages={{
                                                            required: intl.formatMessage(validationMessages.passwordRequired)
                                                        }}/>
                                        <div className="form--group form--center">
                                            <button className="btn btn-primary" onClick={this.onSignIn}>{intl.formatMessage(messages.login)}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="actionBlock--actions actionBlock--center actionBlock--noMargin actionBlock--column">
                    <a href="#" onClick={this.onSwitchToSignIn}>{intl.formatMessage(messages.loginWithDifferentAccount)}</a>
                    <a href="#" onClick={this.onSwitchToPasswordReset}>{intl.formatMessage(messages.resetPassword)}</a>
                </div>
            </div>
        </Popup>
    }
}

const messages = defineMessages({
    title: {
        id: 'socialSigninAssociate.title',
        defaultMessage: 'Looks like you already have an account'
    },
    description: {
        id: 'socialSigninAssociate.description',
        defaultMessage: 'Please login instead.'
    },
    login: {
        id: 'socialSigninAssociate.login',
        defaultMessage: 'Log in'
    },
    loginWithDifferentAccount: {
        id: 'socialSigninAssociate.loginWithDifferentAccount',
        defaultMessage: 'Login with a different account'
    },
    resetPassword: {
        id: 'socialSigninAssociate.resetPassword',
        defaultMessage: 'Reset password'
    }
})

const mapStateToProps = (state) => {
    return {
        show: state.master.socialSignInAssociate.show,
        facebook: state.master.socialSignInAssociate.facebook,
        google: state.master.socialSignInAssociate.google,
        name: state.master.socialSignInAssociate.name,
        email: state.master.socialSignInAssociate.email,
        photo: state.master.socialSignInAssociate.photo
    }
}

const mapDispatchToProps = {
    showSocialSigninAssociateAction,
    resetSocialSigninAssociateAction,
    showSigninAction,
    showForgotPasswordAction,
    onSocialSignInAssociateAction
}


export default withRouter(injectIntl(connect(mapStateToProps, mapDispatchToProps)(SocialSigninAssociateContainer)));