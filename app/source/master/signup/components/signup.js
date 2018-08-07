/**
 * Created by Mike on 7/12/2017.
 */
'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {required, password, email} from '../../../../../utils/validation';
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import {submitForm, clearFormErrors} from '../../../shared/validation/actions';
import {injectIntl, FormattedMessage, FormattedHTMLMessage, defineMessages} from 'react-intl';
import {messages as formMessages} from '../../../shared/form/messages';
import {messages as validationMessages} from '../../../shared/validation/messages';
import {withRouteTools} from '../../../hoc';
import LoadButton from '../../../shared/button/components/loadButton';

class Signup extends Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
    }

    constructor() {
        super();

        this.validators = {
            name: {
                required
            },
            email: {
                required,
                email,
            },
            password: {
                required,
                password
            }
        }
    }

    onSignIn = (e) => {
        e.preventDefault();
        let {store} = this.context;
        let {onSignIn, gtm} = this.props;

        gtm.sendEvent('logInClick');
        onSignIn();
        store.dispatch(clearFormErrors({model: 'master.signup'}))
        //store.dispatch(resetForm({model: 'master.signup', validators: this.validators}))
    }

    onSignUp = () => {
        let {onSignUp, intl} = this.props;
        let {store} = this.context;
        store.dispatch(submitForm({model: 'master.signup'}))
            .then((form) => {
                onSignUp(form, intl);
            });
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                e.target.blur();
                this.onSignUp();
                break;
            }
        }
    }

    onFacebookSignup = () => {
        let {onFacebookSignup, routeResolver} = this.props;
        onFacebookSignup(routeResolver, 'signup');
    }

    onGoogleSignup = () => {
        let {onGoogleSignup, routeResolver} = this.props;
        onGoogleSignup(routeResolver, 'signup');
    }

    render() {
        let {intl, routeResolver, loading} = this.props;

        return <div className="actionBlock">
            <div className="actionBlock--title">
                <FormattedMessage {...messages.title} />
            </div>
            <div className="actionBlock--content">
                <div className="security">
                    <div className="security--socials">
                        <span className="security--facebook" onClick={this.onFacebookSignup}></span>
                        <span className="security--google" onClick={this.onGoogleSignup}></span>
                    </div>
                    <form className="form" onKeyDown={this.onFormKeyDown}>
                        <FormGroupInput id="signupFullName"
                                        required={true}
                                        label={intl.formatMessage(formMessages.fullName)}
                                        placeholder={intl.formatMessage(formMessages.fullNamePlaceholder)}
                                        model="master.signup"
                                        prop="name"
                                        validators={this.validators.name}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.nameRequired)
                                        }}/>

                        <FormGroupInput id="signupEmail"
                                        required={true}
                                        label={intl.formatMessage(formMessages.email)}
                                        placeholder={intl.formatMessage(formMessages.emailPlaceholder)}
                                        model="master.signup"
                                        prop="email"
                                        validators={this.validators.email}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.emailRequired),
                                            email: intl.formatMessage(validationMessages.emailNotValid),
                                        }}/>

                        <FormGroupInput id="signupPassword"
                                        required={true}
                                        label={intl.formatMessage(formMessages.password)}
                                        placeholder={intl.formatMessage(formMessages.passwordPlaceholder)}
                                        model="master.signup"
                                        prop="password"
                                        type="password"
                                        validators={this.validators.password}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.passwordRequired),
                                            password: intl.formatMessage(validationMessages.passwordComplexity),
                                        }}/>
                    </form>
                    <div className="security--policyAgreement">
                        <FormattedHTMLMessage {...messages.agreement} values={{
                            termsOfServiceLink: routeResolver.buildRouteFor('terms').pathname,
                            privacyPolicyLink: routeResolver.buildRouteFor('privacyPolicy').pathname
                        }}/>
                    </div>
                </div>
            </div>
            <div className="actionBlock--actions">
                <LoadButton className="btn btn-primary"
                            loading={loading}
                            onClick={this.onSignUp}>{intl.formatMessage(messages.signUp)}</LoadButton>
                <div>
                    <span>{intl.formatMessage(messages.alreadyHavAccount)}</span> <a href="#"
                                                                                     onClick={this.onSignIn}>{intl.formatMessage(messages.signIn)}</a>
                </div>
            </div>
        </div>
    }
}

const messages = defineMessages({
    agreement: {
        id: 'signup.agreement',
        defaultMessage: 'By signing up, I agree to Liberbee\'s <a target="_blank" href="{termsOfServiceLink}">Terms of Service</a> and <a target="_blank" href="{privacyPolicyLink}">Privacy Policy</a>'
    },
    title: {
        id: 'signup.title',
        defaultMessage: 'Sign up to Liberbee'
    },
    signUp: {
        id: 'signup.signUp',
        defaultMessage: 'Sign up'
    },
    signIn: {
        id: 'signup.signIn',
        defaultMessage: 'Log in'
    },
    alreadyHavAccount: {
        id: 'signup.alreadyHavAccount',
        defaultMessage: 'Already have an account?'
    }
})


export default withRouteTools(injectIntl(Signup));