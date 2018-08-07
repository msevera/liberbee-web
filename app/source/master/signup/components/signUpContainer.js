/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import RedirectWithStatus from '../../../redirectWithStatus';
import {connect} from 'react-redux';
import {withComponentExtended} from '../../../hoc';
import SignUp from './signup';
import {
    signUpAction,
    facebookSigninAction,
    googleSigninAction
} from '../../masterActions';

import Helmet from 'react-helmet';
import {defineMessages, injectIntl} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';

class SignUpContainer extends React.Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired
    }

    switchToSignIn = () => {
        let {history, routeResolver} = this.props;

        history.push(routeResolver.buildRouteFor('login').pathname);
    }

    render() {
        let {signUpAction, location, facebookSigninAction, googleSigninAction, intl, signUpLoading, routeResolver} = this.props;
        let {auth} = this.context;

        let componentToRender = <SignUp loading={signUpLoading}
                                        onSignUp={signUpAction}
                                        onSignIn={this.switchToSignIn}
                                        onFacebookSignup={facebookSigninAction}
                                        onGoogleSignup={googleSigninAction}/>;

        if (auth.isAuthenticated) {
            let redirectTo = routeResolver.buildRouteFor('index').pathname;
            if (location.state && location.state.from && (location.state.from.pathname != auth.signInUrl)) {
                redirectTo = location.state.from.pathname;
            }

            componentToRender = <RedirectWithStatus to={{pathname: redirectTo}} status={302}/>;
        }


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
        id: 'signup.pageTitle',
        defaultMessage: 'Sign up'
    }
})

const mapStateToProps = (state) => {
    return {
        signUpLoading: state.master.general.signUpLoading
    }
}

const mapDispatchToProps = {
    signUpAction,
    facebookSigninAction,
    googleSigninAction
}


export default withComponentExtended('signup')(injectIntl(connect(mapStateToProps, mapDispatchToProps)(SignUpContainer)));
