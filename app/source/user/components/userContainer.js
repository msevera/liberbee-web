/**
 * Created by Mike on 6/5/2017.
 */

'use strict';

import PageLoader from "../../shared/empty/components/pageLoader";

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/user.scss');
import React from 'react';
import {Switch, NavLink, withRouter} from 'react-router-dom';
import RouteExtended from '../../routeExtended'
import {connect} from 'react-redux';
import {loadUserDataAction, setUserInitializedAction, setNotFoundAction} from '../userActions';
import {showUpdateInfoPopupAction} from '../updateInfo/updateInfoActions';
import UserBooksContainer from '../userBooks/components/userBooksContainer';
import FavoriteBooksContainer from '../favoriteBooks/components/favoriteBooksContainer';
import DraftBooksContainer from '../draftBooks/components/draftBooksContainer';
import UserSettingsContainer from '../userSettings/components/userSettingsContainer';
import RedirectWithStatus from '../../redirectWithStatus';
import Avatar from '../../shared/avatar/components/avatar';
import {withComponentExtended} from '../../hoc';
import {injectIntl, defineMessages} from 'react-intl';
import UpdateInfoContainer from '../updateInfo/components/updateInfoContainer';
import NotFound from '../../notFound';

class UserContainer extends React.Component {
    static getUser(match) {
        let userSlug = match.params.user;

        return userSlug ? userSlug : '';
    }

    componentWillUnmount(){
        let {setUserInitializedAction, setNotFoundAction} = this.props;
        setUserInitializedAction(false);
        setNotFoundAction(false);
    }

    updateInfoClickHandler = () => {
        let {showUpdateInfoPopupAction} = this.props;
        showUpdateInfoPopupAction()
    }

    render() {
        const {match, user, actions, isLoggedUser, bookCopiesCount, intl, routeResolver, initialized, notFound} = this.props;
        let booksText = isLoggedUser ? intl.formatMessage(messages.myBooks, {count: bookCopiesCount}) : intl.formatMessage(messages.books, {count: bookCopiesCount});

        return notFound ? <NotFound /> : <div>
            {
                !initialized &&
                <PageLoader/>
            }
            <div className="container l-userProfile">
                <div className="row h-100 align-items-center">
                    <div className="col-12 d-flex flex-column">
                        <div className="userInfo userInfo-h">
                            <div className="userInfo--avatar">
                                <Avatar className="avatar-big" name={user.name} src={user.photo}/>
                            </div>
                            <div className="userInfo--content">
                                <div className="userInfo--row">
                                    <div className="userInfo--name">{user.name}</div>
                                    {
                                        user.geo && user.geo.city &&
                                        <div className="userInfo--location">{user.geo.city}, {user.geo.country}</div>
                                    }
                                    {
                                        actions.updateInfo &&
                                        <div className="userInfo--action">
                                            <UpdateInfoContainer/>
                                            <button className="btn btn-secondary btn-small"
                                                    onClick={this.updateInfoClickHandler}>{intl.formatMessage(messages.updateInfo)}</button>
                                        </div>
                                    }
                                </div>
                                <div className="userInfo--row">
                                    {
                                        user.stats &&
                                        <div className="stats">
                                            <div className="stats--item">
                                                <span className="stats--value">{user.stats.sent}</span><span
                                                className="stats--name">{intl.formatMessage(messages.booksSent)}</span>
                                            </div>
                                            <div className="stats--separator">|</div>
                                            <div className="stats--item">
                                                <span className="stats--value">{user.stats.received}</span><span
                                                className="stats--name">{intl.formatMessage(messages.booksReceived)}</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="tab">
                            {
                                actions.getUserBookCopies &&
                                <NavLink className="tab--item" activeClassName="tab--item-is-selected"
                                         to={routeResolver.buildRouteFor('userBooks', {user: user.slug}).pathname}>{booksText}</NavLink>
                            }
                            {
                                actions.getFavoriteBooks &&
                                <NavLink className="tab--item" activeClassName="tab--item-is-selected"
                                         to={routeResolver.buildRouteFor('favorites', {user: user.slug}).pathname}>{intl.formatMessage(messages.favorites)}</NavLink>
                            }
                            {
                                actions.setSettings &&
                                <NavLink className="tab--item d-none d-sm-block" activeClassName="tab--item-is-selected"
                                         to={routeResolver.buildRouteFor('userSettings', {user: user.slug}).pathname}>{intl.formatMessage(messages.settings)}</NavLink>
                            }
                            {
                                actions.getDraftBooks &&
                                <NavLink className="tab--item d-none d-md-block" activeClassName="tab--item-is-selected"
                                         to={routeResolver.buildRouteFor('pending', {user: user.slug}).pathname}>{intl.formatMessage(messages.draftsForReview)}</NavLink>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="l-line"></div>
            <Switch>
                {routes.map((route) => {
                    return <RouteExtended key={route.path} exact={route.exact} authLevel={route.authLevel}
                                          path={`${match.path}${route.path}`}
                                          component={route.componentLoader}/>
                })}
                {
                    user.slug &&
                    <RedirectWithStatus status={302}
                                        from={routeResolver.buildRouteFor('user', {user: user.slug}).pathname} exact
                                        to={{
                                            pathname: routeResolver.buildRouteFor('userBooks', {user: user.slug}).pathname
                                        }}/>
                }
            </Switch>
        </div>
    }
}

const messages = defineMessages({
    books: {
        id: 'user.books',
        defaultMessage: 'Books ({count, number})'
    },
    myBooks: {
        id: 'user.myBooks',
        defaultMessage: 'My bookshelf ({count, number})'
    },
    favorites: {
        id: 'user.favorites',
        defaultMessage: 'Favorites'
    },
    settings: {
        id: 'user.settings',
        defaultMessage: 'Settings'
    },
    draftsForReview: {
        id: 'user.draftsForReview',
        defaultMessage: 'Drafts for review'
    },
    booksReceived: {
        id: 'user.booksReceived',
        defaultMessage: 'Received'
    },
    booksSent: {
        id: 'user.booksSent',
        defaultMessage: 'Sent'
    },
    updateInfo: {
        id: 'user.updateInfo',
        defaultMessage: 'Update info'
    }
})

const mapStateToProps = (state, props) => {
    return {
        isLoggedUser: state.master.user.slug == state.userData.user.slug,
        initialized: state.userData.general.initialized,
        notFound: state.userData.general.notFound,
        user: state.userData.user,
        match: props.match,
        actions: state.userData.general.actions,
        bookCopies: state.userData.books.bookCopies,
        bookCopiesCount: state.userData.books.count
    }
}
const mapDispatchToProps = {
    showUpdateInfoPopupAction,
    setUserInitializedAction,
    setNotFoundAction
}

const routes = [{
    id: UserBooksContainer.id,
    path: '/books',
    componentLoader: UserBooksContainer
}, {
    id: FavoriteBooksContainer.id,
    path: '/favorites',
    componentLoader: FavoriteBooksContainer
}, {
    id: UserSettingsContainer.id,
    path: '/settings',
    authLevel: 1,
    componentLoader: UserSettingsContainer
},{
    id: DraftBooksContainer.id,
    path: '/pending',
    componentLoader: DraftBooksContainer
}]

const loadData = (props, context) => {
    let userSlug = UserContainer.getUser(props.match);
    return context.store.dispatch(loadUserDataAction({userSlug}));
}

export default withComponentExtended('user', routes, loadData, null, false)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(UserContainer)));
