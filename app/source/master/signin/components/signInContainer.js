/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import RedirectWithStatus from '../../../redirectWithStatus';
import {connect} from 'react-redux';
import {withComponentExtended} from '../../../hoc';
import SignIn from './signin';
import {signInAction,
    facebookSigninAction,
    googleSigninAction, showForgotPasswordAction} from '../../masterActions';

import Helmet from 'react-helmet';
import {defineMessages, injectIntl} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';
import queryString from 'query-string';

class SignInContainer extends React.Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired
    }

    static getRedirect(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.redirect ? query.redirect : '';
    }

    switchToSignUp = () => {
        let {history, routeResolver} = this.props;
        history.push(routeResolver.buildRouteFor('signup').pathname)
    }

    switchToForgotPassword = () => {
        let {showForgotPasswordAction} = this.props;
        showForgotPasswordAction(true);
    }

    render() {
        let {signInAction, location, facebookSigninAction, googleSigninAction, intl, signInLoading, routeResolver} = this.props;
        let {auth} = this.context;
        let redirect = SignInContainer.getRedirect(location);

        let componentToRender = <SignIn loading={signInLoading}
                                        onSignIn={signInAction}
                                        onSignUp={this.switchToSignUp}
                                        onForgotPassword={this.switchToForgotPassword}
                                        onFacebookSignin={facebookSigninAction}
                                        onGoogleSignin={googleSigninAction}/>;

       /* if (auth.isAuthenticated) {
            if (!redirect)
            {
                componentToRender = <RedirectWithStatus to={routeResolver.buildRouteFor('index')}  status={302} />;
            }else{
                componentToRender = <RedirectWithStatus to={{pathname: redirect}}  status={302} />;
            }
        }*/


        return <div className="container">
            <Helmet>
                <title>
                    {intl.formatMessage(masterMessages.pageTitle, {title: intl.formatMessage(messages.pageTitle)})}
                </title>
            </Helmet>
            <div className="row h-100 align-items-center">
                <div className="col-12 d-flex flex-column align-items-center">
                    {
                        componentToRender
                    }
                </div>
            </div>
        </div>;
    }
}

const messages = defineMessages({
    pageTitle: {
        id: 'signin.pageTitle',
        defaultMessage: 'Log in'
    }
})

const mapStateToProps = (state) => {
    return {
        signInLoading: state.master.general.signInLoading
    }
}

const mapDispatchToProps = {
    signInAction,
    facebookSigninAction,
    googleSigninAction,
    showForgotPasswordAction
}


export default withComponentExtended('login')(injectIntl(connect(mapStateToProps, mapDispatchToProps)(SignInContainer)));
