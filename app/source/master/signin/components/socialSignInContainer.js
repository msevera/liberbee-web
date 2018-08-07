/**
 * Created by Mike on 10/11/2017.
 */

'use strict';

import React, {Component} from 'react';
import {
    showSocialSigninAction,
    showSigninAction,
    showForgotPasswordAction,
    facebookSigninAction,
    googleSigninAction
} from '../../masterActions';
import Popup from '../../../shared/popup/components/popup';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import Avatar from '../../../shared/avatar/components/avatar';
import {injectIntl, defineMessages} from 'react-intl';
import {withRouteTools} from "../../../hoc";

class SocialSigninContainer extends Component {

    onPopupClose = () => {
        let {showSocialSigninAction} = this.props;
        showSocialSigninAction(false)
    }

    buildMessage() {
        let {providers, intl} = this.props;

        let capitalizedProviders = providers
            .map((prov) => {
                return prov.replace(/\b\w/g, l => l.toUpperCase());
            });

        let message = intl.formatMessage(messages.title, {count: capitalizedProviders.length, ...capitalizedProviders});

        return message;
    }

    buildDescription() {
        let {providers, intl} = this.props;

        let capitalizedProviders = providers.map((prov) => {
            return prov.replace(/\b\w/g, l => l.toUpperCase());
        });

        let message = intl.formatMessage(messages.description, {count: capitalizedProviders.length, ...capitalizedProviders});

        return message;
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

    onFacebookSignin = () => {
        let {facebookSigninAction, routeResolver} = this.props;
        facebookSigninAction(routeResolver, 'signin');
    }

    onGoogleSignin = () => {
        let {googleSigninAction, routeResolver} = this.props;
        googleSigninAction(routeResolver, 'signin');
    }

    render() {
        let {show, name, photo, email, providers, intl} = this.props;

        return <Popup id="socialSignin" show={show} onPopupClose={this.onPopupClose}>
            <div className="actionBlock">
                <div className="actionBlock--title">
                    {this.buildMessage()}
                </div>
                <div className="actionBlock--description">
                    {this.buildDescription()}
                </div>
                <div className="actionBlock--content">
                    <div className="">
                        <div className="socialSignin">
                            <Avatar className="avatar-big" src={photo} name={name}/>
                            <div className="socialSignin--name">{name}</div>
                            <div className="socialSignin--email">{email}</div>
                            <div className="socialSignin--loginWith">
                                <div className="security">
                                    <div className="security--socials">
                                        {
                                            providers.some(prov => prov == 'facebook') &&
                                            <span className="security--facebook" onClick={this.onFacebookSignin}></span>
                                        }
                                        {
                                            providers.some(prov => prov == 'google') &&
                                            <span className="security--google" onClick={this.onGoogleSignin}></span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="actionBlock--actions actionBlock--center actionBlock--noMargin actionBlock--column">
                    <a href="#"
                       onClick={this.onSwitchToSignIn}>{intl.formatMessage(messages.loginWithDifferentAccount)}</a>
                    <a href="#" onClick={this.onSwitchToPasswordReset}>{intl.formatMessage(messages.resetPassword)}</a>
                </div>
            </div>
        </Popup>
    }
}

const messages = defineMessages({
    title: {
        id: 'socialSignin.title',
        defaultMessage: 'You already created an account using {count, plural,' +
        '=0 {}' +
        '=1 {{0}}' +
        '=2 {{0} and {1}}}'
    },
    description: {
        id: 'socialSignin.description',
        defaultMessage: 'Please login with {count, plural,' +
        '=0 {}' +
        '=1 {{0} instead}' +
        '=2 {using one of them instead.}}'
    },
    loginWithDifferentAccount: {
        id: 'socialSignin.loginWithDifferentAccount',
        defaultMessage: 'Login with a different account'
    },
    resetPassword: {
        id: 'socialSignin.resetPassword',
        defaultMessage: 'Reset password'
    }
})

const mapStateToProps = (state) => {
    return {
        show: state.master.socialSignIn.show,
        providers: state.master.socialSignIn.providers,
        name: state.master.socialSignIn.name,
        email: state.master.socialSignIn.email,
        photo: state.master.socialSignIn.photo
    }
}

const mapDispatchToProps = {
    showSocialSigninAction,
    facebookSigninAction,
    googleSigninAction,
    showSigninAction,
    showForgotPasswordAction
}


export default withRouteTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(SocialSigninContainer)));