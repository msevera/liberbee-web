/**
 * Created by Mike on 10/10/2017.
 */

'use strict';

import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter, Link, NavLink} from 'react-router-dom';
import React from 'react';
import {showSigninAction, showSignupAction} from '../../masterActions';
import Avatar from '../../../shared/avatar/components/avatar';
import Navigation from '../../../shared/navigation/components/navigation';
import NavigationItem from '../../../shared/navigation/components/navigationItem';
import NavigationItemContent from '../../../shared/navigation/components/navigationItemContent';
import NavigationItemMenu from '../../../shared/navigation/components/navigationIteMenu';
import MessagesNotificationsContainer from '../../messagesNotificaitions/components/messagesNotificationsContainer';
import LocaleSwitcher from '../../localeSwitcher/components/localeSwitcherContainer';
import {defineMessages, FormattedMessage} from 'react-intl'
import {withTools} from '../../../hoc';
import {messages as navigationMessages} from '../navigationMessages';
import queryString from 'query-string';
import Hamburger from "../../../shared/hamburger/components/hamburger";

class NavigationContainer extends React.Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired
    }

    constructor(){
        super();
    }

    onSellBook = (e) => {
        let {gtm, history, routeResolver} = this.props;

        let addBookPath = routeResolver.buildRouteFor('addBook',{},{redirect: true}).pathname;
        let query = {};
        let searchQuery = history.location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        query.redirect = addBookPath


        history.push({
            search: queryString.stringify(query)
        })
        gtm.sendEvent('anonymousSellClick');
        gtm.sendVirtualPageView('anonymous/sellClick');
        this.onSignInShow(e);
    }

    onSignInShow = (e) => {
        let {showSigninAction, gtm} = this.props;
        gtm.sendEvent('logInClick');
        showSigninAction(true);
    }

    onSignUpShow = (e) => {
        let {showSignupAction, gtm} = this.props;
        gtm.sendEvent('signUpClick');
        showSignupAction(true);
    }

    onMessagesIconMobileClick = (e) => {
        e.preventDefault();
    }

    buildMessagesNavigationItem(showOn, className){
        let {messagesNotifications, routeResolver} = this.props;

        if (showOn == 'hover'){
            return <NavigationItem showOn={showOn} showArrow={false} className={className}>
                <NavigationItemContent>
                    <NavLink
                        className={'icon icon-message' + (messagesNotifications.length > 0 ? ' icon-message-has-messages' : '')}
                        activeClassName="icon-messageHighlight"
                        to={routeResolver.buildRouteFor('usersWithConversations', {}, {redirect: true})}>
                    </NavLink>
                </NavigationItemContent>
                <NavigationItemMenu>
                    <div className="popover popover-highlight">
                        <MessagesNotificationsContainer />
                    </div>
                </NavigationItemMenu>
            </NavigationItem>
        }else{
            return <NavigationItem className={className}>
                <NavigationItemContent>
                    <NavLink
                        className={'icon icon-message' + (messagesNotifications.length > 0 ? ' icon-message-has-messages' : '')}
                        activeClassName="icon-messageHighlight"
                        to={routeResolver.buildRouteFor('usersWithConversations', {}, {redirect: true})}>
                    </NavLink>
                </NavigationItemContent>
            </NavigationItem>
        }
    }

    buildMenuNavigationItem(showOn, className){
        let {auth} = this.context;
        let {user, routeResolver, gtm} = this.props;

        return <NavigationItem showOn={showOn} className={className}>
            <NavigationItemContent>
                {
                    showOn == 'hover' ?
                        <Link to={routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}, {
                            redirect: true,
                            reload: true
                        })}>
                            <Avatar className="avatar-small" name={user.name} src={user.photo}/>
                        </Link> :
                        <span>
                            <Avatar className="avatar-small" name={user.name} src={user.photo}/>
                        </span>
                }

            </NavigationItemContent>
            <NavigationItemMenu>
                <div className="popover popover-highlight">
                    <ul className="menu">
                        <li className="d-flex d-sm-none">
                            <Link
                                  to={routeResolver.buildRouteFor('addBook',{},{redirect: true})}><FormattedMessage {...navigationMessages.addBook} /></Link>
                        </li>
                        <li>
                            <Link to={routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}, {redirect: true})}>
                                <FormattedMessage {...navigationMessages.myBooks} />
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={routeResolver.buildRouteFor('favorites', {user: user.slug}, {redirect: true})}>
                                <FormattedMessage {...navigationMessages.favorites} />
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={routeResolver.buildRouteFor('userSettings', {user: user.slug}, {redirect: true})}>
                                <FormattedMessage {...navigationMessages.settings} />
                            </Link>
                        </li>
                        <li>
                            <a href="#" onClick={(e) => {
                                e.preventDefault();
                                gtm.sendEvent('loggedOut');
                                window.location = routeResolver.applyLocaleToPath(auth.signOutUrl);
                            }}>
                                <FormattedMessage {...navigationMessages.logOut} />
                            </a>
                        </li>
                    </ul>
                </div>
            </NavigationItemMenu>
        </NavigationItem>
    }

    render() {
        let {auth} = this.context;
        let {actions, user, locale, routeResolver} = this.props;

        let selectedLocale = locale.items.find(l => l.code == locale.selected);
        return <nav>
            <Navigation>
                <NavigationItem className="d-none d-xl-flex">
                    <NavigationItemContent>
                        <NavLink exact={true} activeClassName="nav--itemLink-is-active" to={routeResolver.buildRouteFor('index', {}, {redirect: true, reload: true})}><FormattedMessage {...navigationMessages.home} /></NavLink>
                    </NavigationItemContent>
                </NavigationItem>
                <NavigationItem className="d-none d-lg-flex">
                    <NavigationItemContent>
                        <NavLink activeClassName="nav--itemLink-is-active" to={routeResolver.buildRouteFor('help',{},{redirect: true})}><FormattedMessage {...navigationMessages.howItWorks} /></NavLink>
                    </NavigationItemContent>
                </NavigationItem>
                {
                    actions.createBook && user &&
                    <NavigationItem className="d-none d-sm-flex">
                        <NavigationItemContent>
                            <Link className="btn btn-secondary"
                                  to={routeResolver.buildRouteFor('addBook',{},{redirect: true})}><FormattedMessage {...navigationMessages.addBook} /></Link>
                        </NavigationItemContent>
                    </NavigationItem>
                }
                <NavigationItem showOn="click" className="d-none d-lg-flex">
                    <NavigationItemContent>
                        {
                            selectedLocale.short
                        }
                    </NavigationItemContent>
                    <NavigationItemMenu>
                        <div className="popover popover-highlight">
                            <LocaleSwitcher />
                        </div>
                    </NavigationItemMenu>
                </NavigationItem>
                {
                    !auth.isAuthenticated &&
                    <NavigationItem className="d-none d-sm-flex d-lg-none">
                        <NavigationItemContent>
                            <button className="btn btn-secondary" onClick={this.onSellBook}>
                                <FormattedMessage {...navigationMessages.addBook} />
                            </button>
                        </NavigationItemContent>
                    </NavigationItem>
                }
                {
                    !auth.isAuthenticated &&
                    <NavigationItem className="d-none d-lg-flex">
                        <NavigationItemContent>
                            <button className="btn btn-primary" onClick={this.onSellBook}>
                                <FormattedMessage {...navigationMessages.addBook} />
                            </button>
                        </NavigationItemContent>
                    </NavigationItem>
                }
                {
                    !auth.isAuthenticated && actions.createUser &&
                    <NavigationItem className="d-none d-lg-flex">
                        <NavigationItemContent>
                            <button className="btn btn-secondary btn-sm" onClick={this.onSignUpShow}>
                                <FormattedMessage {...navigationMessages.signUp} />
                            </button>
                        </NavigationItemContent>
                    </NavigationItem>
                }
                {
                    !auth.isAuthenticated &&
                    <NavigationItem className="d-none d-lg-flex">
                        <NavigationItemContent>
                            <div onClick={this.onSignInShow}>
                                <FormattedMessage {...navigationMessages.logIn} />
                            </div>
                        </NavigationItemContent>
                    </NavigationItem>
                }
                {
                    !auth.isAuthenticated &&
                    <NavigationItem className="d-flex d-lg-none" showOn="click" showArrow={true}>
                        <NavigationItemContent>
                            <FormattedMessage {...navigationMessages.menu} />
                        </NavigationItemContent>
                        <NavigationItemMenu>
                            <div className="popover popover-highlight">
                                <ul className="menu">
                                    <li className="d-flex d-sm-none">
                                        <span onClick={this.onSellBook}><FormattedMessage {...navigationMessages.addBook} /></span>
                                    </li>
                                    <li>
                                        <span onClick={this.onSignInShow}><FormattedMessage {...navigationMessages.logIn} /></span>
                                    </li>
                                    <li>
                                        <span onClick={this.onSignUpShow}><FormattedMessage {...navigationMessages.signUp} /></span>
                                    </li>
                                </ul>
                            </div>
                        </NavigationItemMenu>
                    </NavigationItem>
                }
                {
                    auth.isAuthenticated &&
                        this.buildMessagesNavigationItem('hover', 'd-none d-lg-flex')
                }
                {
                    auth.isAuthenticated &&
                        this.buildMessagesNavigationItem('click', 'd-flex d-lg-none')
                }
                {
                    auth.isAuthenticated && user && user.slug &&
                        this.buildMenuNavigationItem('hover', 'd-none d-xl-flex')
                }
                {
                    auth.isAuthenticated && user && user.slug &&
                    this.buildMenuNavigationItem('click', 'd-flex d-xl-none')
                }
            </Navigation>
        </nav>
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.master.user,
        actions: state.master.general.actions,
        messagesNotifications: state.master.messagesNotifications.items,
        locale: state.master.app.locale
    }
}

const mapDispatchToProps = {
    showSigninAction,
    showSignupAction,
}

export default withTools(connect(mapStateToProps, mapDispatchToProps)(NavigationContainer));