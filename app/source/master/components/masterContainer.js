/**
 * Created by Mike on 5/16/2017.
 */

'use strict';

import {messages as navigationMessages} from "../navigation/navigationMessages";

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/master.scss');
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {
    signInAction,
    signUpAction,
    showSigninAction,
    showSignupAction,
    showForgotPasswordAction,
    userLocationGeoAutocompleteAction,
    userLocationGeoSetLocationAction,
    showSpecifyRequiredInfoAction,
    setRequiredInfoAction,
    forgotPasswordSendEmailAction,
    setPasswordRecoverySendStatusAction,
    confirmEmailAction,
    verifyPasswordRecoveryTokenAction,
    facebookSigninAction,
    googleSigninAction,
    initIntlDepenantComponentsAction
} from '../masterActions';
import SignIn from '../signin/components/signin';
import SignUp from '../signup/components/signup';
import SendEmail from '../passwordRecovery/components/sendEmail';
import Popup from '../../shared/popup/components/popup';
import {clearFormErrors} from '../../shared/validation/actions'
import TutorialContainer from '../tutorial/components/tutorialContainer';
import RequiredInfoContainer from '../requiredInfo/components/requiredInfoContainer';
import EmailConfirmationResultContainer from '../confirmEmail/components/emailConfirmationResultContainer';
import ResetPasswordContainer from '../passwordRecovery/components/resetPasswordContainer';
import queryString from 'query-string';
import NotifierContainer from '../notifier/components/notifierContainer';
import NavigationContainer from '../navigation/components/navigationContainer';
import SocialSigninContainer from '../signin/components/socialSignInContainer';
import SocialSigninAssociateContainer from '../signin/components/socialSignInAssociateContainer';
import {joinMessagesRoomAction, leaveMessagesRoomAction} from '../../shared/sockets/socketsActions';
import {loadMessagesNotificationsAction} from '../messagesNotificaitions/messagesNotificationsActions';
import {withComponentExtended} from '../../hoc';
import {Helmet} from 'react-helmet';
import {injectIntl, FormattedMessage} from 'react-intl';
import RedirectWithStatus from '../../redirectWithStatus';


class MasterContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
        auth: PropTypes.object.isRequired
    }

    static getResetPasswordToken(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.reset ? query.reset : '';
    }

    static getRedirect(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.redirect ? query.redirect : '';
    }

    static getConfirmEmailToken(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.verify ? query.verify : '';
    }


    constructor(props) {
        super();

        this.state = {
            requiredInfoStepIndex: 0
        }
    }

    componentDidMount() {
        let {joinMessagesRoomAction, initIntlDepenantComponentsAction, intl} = this.props;

        joinMessagesRoomAction();
        initIntlDepenantComponentsAction(intl)
    }

    componentWillUnmount() {
        let {leaveMessagesRoomAction} = this.props;

        leaveMessagesRoomAction();
    }

    onSignInShow = (e) => {
        let {showSigninAction} = this.props;

        showSigninAction(true);

        e.preventDefault();
    }

    onSignUpShow = (e) => {
        let {showSignupAction} = this.props;

        showSignupAction(true);

        e.preventDefault();
    }

    switchToSignUp = () => {
        let {showSigninAction, showSignupAction} = this.props;
        this.removeRedirect()
        showSigninAction(false);
        showSignupAction(true);
    }

    switchToSignIn = () => {
        let {showSigninAction, showSignupAction, showForgotPasswordAction, setPasswordRecoverySendStatusAction} = this.props;

        showSigninAction(true);
        showSignupAction(false);
        showForgotPasswordAction(false);

        setTimeout(() => {
            setPasswordRecoverySendStatusAction('');
        }, 500);
    }

    switchToForgotPassword = () => {
        let {showForgotPasswordAction, showSigninAction} = this.props;
        this.removeRedirect()
        showForgotPasswordAction(true);
        showSigninAction(false);
    }

    removeRedirect(){
        let {history} = this.props;

        let query = {};
        let searchQuery = history.location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
            if (query.redirect){
                delete query.redirect;
                history.push({
                    search: queryString.stringify(query)
                })
            }
        }
    }

    onSignInClose = () => {
        let {showSigninAction} = this.props;

        this.removeRedirect()

        showSigninAction(false);
        this.context.store.dispatch(clearFormErrors({model: 'master.signin'}));
    }

    onSignUpClose = () => {
        let {showSignupAction} = this.props;

        showSignupAction(false);
        this.context.store.dispatch(clearFormErrors({model: 'master.signup'}));
    }

    onForgotPasswordClose = () => {
        let {showForgotPasswordAction, setPasswordRecoverySendStatusAction} = this.props;
        showForgotPasswordAction(false);

        setTimeout(() => {
            setPasswordRecoverySendStatusAction('');
        }, 500);
    }

    onSpecifyRequiredInfoPopupClose = () => {
        let {showSpecifyRequiredInfoAction, setRequiredInfoAction} = this.props;


        showSpecifyRequiredInfoAction(false);

        setTimeout(() => {
            setRequiredInfoAction({
                emailConfirmed: true,
                userGeoCompleted: true
            })

            this.setState({
                requiredInfoStepIndex: 0
            })
        }, 500)
    }

    onRequiredInfoStepIndexChanged = (idx) => {
        this.setState({
            requiredInfoStepIndex: idx
        })
    }

    renderHeaderLinks() {
        let {location, routeResolver} = this.props;
        let seoData = routeResolver.buildSeo(location.pathname)

        return <Helmet>
            {
                seoData.canonical &&
                <link rel="canonical" href={seoData.canonical}/>
            }
        </Helmet>
    }

    render() {
        let {
            children, user, showSignin, showSignup, passwordRecoveryEmail, showForgotPassword,
            signInAction, signUpAction, facebookSigninAction, googleSigninAction, actions, showSpecifyRequiredInfo,
            passwordRecoverySendStatus,
            location, forgotPasswordSendEmailAction, resetPasswordAction, routeResolver, intl, signInLoading, signUpLoading, resetPasswordLoading
        } = this.props;

        let {auth} = this.context;
        let redirect = MasterContainer.getRedirect(location);
        let {requiredInfoStepIndex} = this.state;
        let home = routeResolver.buildRouteFor('index', {}, {redirect: true, reload: true});

        return auth.isAuthenticated && redirect ? <RedirectWithStatus to={{pathname: redirect}} status={302}/> : <div>
            <header className="l-header fixed-top d-flex">
                <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="logo">
                        <Link to={home}>
                            <img src="/img/logo.svg" alt="Liberbee"/>
                        </Link>
                    </div>
                    <NavigationContainer/>
                </div>
                <Popup id="signin" show={!!showSignin} onPopupClose={this.onSignInClose}>
                    <SignIn onSignIn={signInAction} onSignUp={this.switchToSignUp} loading={signInLoading}
                            onFacebookSignin={facebookSigninAction} onGoogleSignin={googleSigninAction}
                            onForgotPassword={this.switchToForgotPassword}/>
                </Popup>
                <Popup id="signup" show={!!showSignup} onPopupClose={this.onSignUpClose}>
                    <SignUp onSignUp={signUpAction} onFacebookSignup={facebookSigninAction} loading={signUpLoading}
                            onGoogleSignup={googleSigninAction} onSignIn={this.switchToSignIn}/>
                </Popup>
                <Popup id="forgotPassword" show={!!showForgotPassword} onPopupClose={this.onForgotPasswordClose}>
                    <SendEmail sendStatus={passwordRecoverySendStatus} email={passwordRecoveryEmail}
                               loading={resetPasswordLoading}
                               onSend={forgotPasswordSendEmailAction} onSignIn={this.switchToSignIn}
                               onClose={this.onForgotPasswordClose}/>
                </Popup>
                <Popup show={showSpecifyRequiredInfo} onPopupClose={this.onSpecifyRequiredInfoPopupClose}>
                    <RequiredInfoContainer stepIndex={requiredInfoStepIndex}
                                           onStepIndexChanged={this.onRequiredInfoStepIndexChanged}
                                           onLastStep={this.onSpecifyRequiredInfoPopupClose}/>
                </Popup>
                <TutorialContainer/>
                <EmailConfirmationResultContainer/>
                <ResetPasswordContainer/>
                <NotifierContainer/>
                <SocialSigninContainer/>
                <SocialSigninAssociateContainer/>
            </header>
            <div className="l-content l-content-minHeight">
                {children}
            </div>
            <footer className="l-footer">
                <div className="l-line"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="footer">
                                <div className="footer--copyright">© {new Date().getFullYear()} Liberbee</div>
                                <ul className="footer--links">
                                    <li>
                                        <Link
                                            to={routeResolver.buildRouteFor('help', {}, {redirect: true})}><FormattedMessage {...navigationMessages.howItWorks} /></Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={routeResolver.buildRouteFor('terms', {}, {redirect: true})}><FormattedMessage {...navigationMessages.terms} /></Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={routeResolver.buildRouteFor('privacyPolicy', {}, {redirect: true})}><FormattedMessage {...navigationMessages.privacy} /></Link>
                                    </li>
                                    {<li>
                                        <Link
                                            to={routeResolver.buildRouteFor('contacts', {}, {redirect: true})}><FormattedMessage {...navigationMessages.contacts} /></Link>
                                    </li>}
                                </ul>
                                <div className="footer--social">
                                    <ul className="footer--socialContent">
                                        <li className="footer--socialFacebook">
                                            <a href="https://www.facebook.com/theliberbee/" target="_blank"></a>
                                        </li>
                                        <li className="footer--socialInstagram">
                                            <a href="https://www.instagram.com/the.liberbee/" target="_blank"></a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.master.user,
        actions: state.master.general.actions,
        showSignin: state.master.general.showSignin,
        showSignup: state.master.general.showSignup,
        signInLoading: state.master.general.signInLoading,
        signUpLoading: state.master.general.signUpLoading,
        resetPasswordLoading: state.master.general.resetPasswordLoading,
        showForgotPassword: state.master.general.showForgotPassword,
        showSpecifyRequiredInfo: state.master.general.showSpecifyRequiredInfo,
        passwordRecoveryEmail: state.master.forgotPassword.email,
        passwordRecoverySendStatus: state.master.passwordRecovery.sendStatus
    }
}

const mapDispatchToProps = {
    signInAction,
    signUpAction,
    showSigninAction,
    showSignupAction,
    showForgotPasswordAction,
    userLocationGeoAutocompleteAction,
    userLocationGeoSetLocationAction,
    showSpecifyRequiredInfoAction,
    setRequiredInfoAction,
    forgotPasswordSendEmailAction,
    setPasswordRecoverySendStatusAction,
    facebookSigninAction,
    googleSigninAction,
    joinMessagesRoomAction,
    leaveMessagesRoomAction,
    initIntlDepenantComponentsAction
}

const loadData = (props, context) => {
    let actions = []

    let resetPasswordToken = MasterContainer.getResetPasswordToken(props.location);
    let confirmEmailToken = MasterContainer.getConfirmEmailToken(props.location);

    if (resetPasswordToken) {
        actions.push(context.store.dispatch(verifyPasswordRecoveryTokenAction({token: resetPasswordToken})));
    }

    if (confirmEmailToken) {
        actions.push(context.store.dispatch(confirmEmailAction({token: confirmEmailToken})));
    }

    actions.push(context.store.dispatch(loadMessagesNotificationsAction()))

    return Promise.all(actions);
}

export default withComponentExtended('master', [], loadData, null, false)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(MasterContainer)));
