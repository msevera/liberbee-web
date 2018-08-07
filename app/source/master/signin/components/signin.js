/**
 * Created by Mike on 5/16/2017.
 */

'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {required, email} from '../../../../../utils/validation';
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import {submitForm, clearFormErrors, resetForm} from '../../../shared/validation/actions';
import Error from '../../../shared/validation/components/error';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import {messages as formMessages} from '../../../shared/form/messages';
import {messages as validationMessages} from '../../../shared/validation/messages';
import {withRouteTools} from "../../../hoc";
import LoadButton from '../../../shared/button/components/loadButton';

class Signin extends Component {
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
            },
            password: {
                required
            }
        }
    }

    onSignIn = () => {
        let {store} = this.context;
        let {onSignIn, intl, gtm} = this.props;

        store.dispatch(submitForm({model: 'master.signin'}))
            .then((form) => {
                onSignIn(form, intl)
            });
    }

    onSignUp = (e) => {
        e.preventDefault();
        let {store} = this.context;
        let {onSignUp, gtm} = this.props;

        gtm.sendEvent('signUpClick');
        onSignUp();
        store.dispatch(clearFormErrors({model: 'master.signin'}))
    }

    onForgotPassword = () => {
        let {store} = this.context;
        let {onForgotPassword, gtm} = this.props;

        store.dispatch(clearFormErrors({model: 'master.signin'}));
        gtm.sendEvent('forgotPasswordClick');
        onForgotPassword(true)
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                e.target.blur();
                this.onSignIn();

                break;
            }
        }
    }

    onFacebookSignin = () => {
        let {onFacebookSignin, routeResolver} = this.props;
        onFacebookSignin(routeResolver, 'signin');
    }

    onGoogleSignin = () => {
        let {onGoogleSignin, routeResolver} = this.props;
        onGoogleSignin(routeResolver, 'signin');
    }

    render() {
        let {intl, loading} = this.props;

        return <div className="actionBlock">
            <div className="actionBlock--title">
                <FormattedMessage {...messages.title} />
            </div>
            <div className="actionBlock--content">
                <div className="security">
                    <div className="security--socials">
                        <span className="security--facebook" onClick={this.onFacebookSignin}></span>
                        <span className="security--google" onClick={this.onGoogleSignin}></span>
                    </div>
                    <form className="form" onKeyDown={this.onFormKeyDown}>
                        <FormGroupInput id="signupEmail"
                                        required={true}
                                        label={intl.formatMessage(formMessages.email)}
                                        placeholder={intl.formatMessage(formMessages.emailPlaceholder)}
                                        model="master.signin"
                                        prop="email"
                                        validators={this.validators.email}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.emailRequired),
                                            email: intl.formatMessage(validationMessages.emailNotValid)
                                        }}/>

                        <FormGroupInput id="signupPassword"
                                        required={true}
                                        label={intl.formatMessage(formMessages.password)}
                                        placeholder={intl.formatMessage(formMessages.passwordPlaceholder)}
                                        model="master.signin"
                                        prop="password"
                                        type="password"
                                        validators={this.validators.password}
                                        helpText={intl.formatMessage(formMessages.forgotPassword)}
                                        helpAction={this.onForgotPassword}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.passwordRequired)
                                        }}/>
                        <Error
                            model="master.signin"
                            className="form--errors"/>
                    </form>
                </div>
            </div>
            <div className="actionBlock--actions">
                <LoadButton className="btn btn-primary"
                            loading={loading}
                            onClick={this.onSignIn}>{intl.formatMessage(messages.logIn)}</LoadButton>
                <div>
                    <span>{intl.formatMessage(messages.dontHaveAccount)}</span> <a href="#"
                                                                                   onClick={this.onSignUp}>{intl.formatMessage(messages.signUp)}</a>
                </div>
            </div>
        </div>
    }
}

const messages = defineMessages({
    title: {
        id: 'signin.title',
        defaultMessage: 'Log in, to continue'
    },
    logIn: {
        id: 'signin.logIn',
        defaultMessage: 'Log in'
    },
    signUp: {
        id: 'signin.signUp',
        defaultMessage: 'Sign up'
    },
    dontHaveAccount: {
        id: 'signin.dontHaveAccount',
        defaultMessage: 'Don\'t have an account?'
    }
})

export default withRouteTools(injectIntl(Signin));