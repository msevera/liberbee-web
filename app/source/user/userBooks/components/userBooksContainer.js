/**
 * Created by Mike on 6/5/2017.
 */


'use strict';

import React from 'react';
import {connect} from 'react-redux'
import {loadUserBooksAction, removeBookCopyAction, setBooksInitializedAction} from '../../userActions';
import {removeBookDraftAction} from '../../draftBooks/draftBooksActions';
import {addToFavoritesAction, removeFromFavoritesAction} from '../../../master/masterActions';
import UserPendingBooksContainer from './userPendingBooksContainer';
import UserActiveBooksContainer from './userActiveBooksContainer';
import {Switch, Link} from 'react-router-dom';
import RedirectWithStatus from '../../../redirectWithStatus';
import RouteExtended from '../../../routeExtended';
import {matchPath} from 'react-router';
import {withComponentExtended} from '../../../hoc';
import {injectIntl, defineMessages} from 'react-intl';
import Helmet from 'react-helmet';
import {messages as masterMessages} from '../../../master/masterMessages';
import PageLoader from "../../../shared/empty/components/pageLoader";
import {
    FacebookShareButton, TwitterShareButton
} from 'react-share';

class UserBooksContainer extends React.Component {
    static getUser(match) {
        let userSlug = match.params.user;

        return userSlug ? userSlug : '';
    }

    constructor() {
        super();
    }

    componentWillUnmount() {
        let {setBooksInitializedAction} = this.props;
        setBooksInitializedAction(false);
    }

    buildSelectorLink(route, text) {
        let {user, location, match, routeResolver} = this.props;

        let isRouteActive = matchPath(location.pathname, {
            path: `${match.path}${route.path}`
        })

        return <li className={'selector--item' + (isRouteActive ? ' selector--item-is-selected' : '')}>
            {
                route.path == '/active' &&
                <Link
                    to={routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}).pathname}>{text}</Link>
            }
            {
                route.path == '/pending' &&
                <Link
                    to={routeResolver.buildRouteFor('userPendingBooks', {user: user.slug}).pathname}>{text}</Link>
            }
        </li>
    }

    buildSeoURL() {
        let {routeResolver, user, webDomain} = this.props;

        if (!user.slug)
            return webDomain;

        let pathName = routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}, {
            redirect: true,
            reload: true
        }).pathname;

        return `${webDomain}${pathName}`;
    }

    onFacebookShareWindowClose = () => {
        let b = 0;
    }

    onFacebookShareClick = () => {
        let {gtm, loggedUser} = this.props;
        gtm.sendEvent('shareShelf', {
            userId: loggedUser._id,
            shareSocial: 'facebook'
        })
    }

    onTwitterShareClick = () => {
        let {gtm, loggedUser} = this.props;
        gtm.sendEvent('shareShelf', {
            userId: loggedUser._id,
            shareSocial: 'twitter'
        })
    }

    render() {
        let {actions, user, match, intl, routeResolver, isLoggedUser, initialized, social} = this.props;
        let title = intl.formatMessage(masterMessages.pageTitle, {
            title: intl.formatMessage(messages.pageTitleOtherUser, {
                user: user.name
            })
        })

        let metaDescription = intl.formatMessage(masterMessages.pageMetaDescription);
        let currentPageUrl = this.buildSeoURL()

        return <div className="container l-relative">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={metaDescription}/>
                <meta property="og:type" content="website"/>
                <meta property="og:url" content={currentPageUrl}/>
                <meta property="og:title" content={title}/>
                <meta property="og:description" content={metaDescription}/>
                <meta property="og:image" content={social.facebook.shareImg}/>
                <meta property="fb:app_id" content={social.facebook.appId}/>
            </Helmet>
            {
                !initialized &&
                <PageLoader className="pageLoader-secondary pageLoader-absolute"/>
            }
            <div className="row">
                <div className="col-12 l-userBookActions d-flex justify-content-between align-items-center">
                    {
                        actions.createBook &&
                        <Link className="btn btn-link d-none d-md-inline-flex"
                              to={routeResolver.buildRouteFor('addBook').pathname}>{intl.formatMessage(messages.addBook)}</Link>
                    }
                    {
                        isLoggedUser &&
                        <div className="ml-5 l-userBooksSocialShare d-none d-md-block">
                            <div className="socialShare">
                                <div className="socialShare--text">{intl.formatMessage(messages.share)}</div>
                                <div className="socialShare--content">
                                    <FacebookShareButton url={currentPageUrl} beforeOnClick={this.onFacebookShareClick} onShareWindowClose={this.onFacebookShareWindowClose}
                                                         className="socialShare--item socialShare--facebook">
                                    </FacebookShareButton>
                                    <TwitterShareButton title={title} via="Liberbee" url={currentPageUrl} beforeOnClick={this.onTwitterShareClick}
                                                        className="socialShare--item socialShare--twitter">
                                    </TwitterShareButton>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        actions.createBook &&
                        <div className="ml-auto">
                            <ul className="selector">
                                {
                                    this.buildSelectorLink(routes[0], intl.formatMessage(messages.active))
                                }
                                {
                                    this.buildSelectorLink(routes[1], intl.formatMessage(messages.pending))
                                }
                            </ul>
                        </div>
                    }
                </div>
            </div>
            <Switch>
                {routes.map((route) => {
                    return <RouteExtended key={route.path} exact={route.exact} authLevel={route.authLevel}
                                          path={`${match.path}${route.path}`}
                                          component={route.componentLoader}/>
                })}
                {
                    user.slug &&
                    <RedirectWithStatus from={routeResolver.buildRouteFor('userBooks', {user: user.slug}).pathname}
                                        exact to={{
                        pathname: routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}).pathname,
                    }}/>
                }
            </Switch>
        </div>
    }
}

const messages = defineMessages({
    share: {
        id: 'userBooks.share',
        defaultMessage: 'Share with friends'
    },
    pageTitleOtherUser: {
        id: 'userBooks.pageTitleOtherUser',
        defaultMessage: 'Books for selling and swapping from {user}'
    },
    pageTitle: {
        id: 'userBooks.pageTitle',
        defaultMessage: 'My bookshelf'
    },
    addBook: {
        id: 'userBooks.addBook',
        defaultMessage: 'Sell book'
    },
    active: {
        id: 'userBooks.active',
        defaultMessage: 'Active'
    },
    pending: {
        id: 'userBooks.pending',
        defaultMessage: 'Pending'
    }
})

const mapStateToProps = (state, props) => {
    return {
        isLoggedUser: state.master.user.slug == state.userData.user.slug,
        bookCopies: state.userData.books.bookCopies,
        initialized: state.userData.books.initialized,
        draftBooks: state.userData.books.draftBooks,
        actions: state.userData.general.actions,
        user: state.userData.user,
        loggedUser: state.master.user,
        match: props.match,
        webDomain: state.master.app.webDomain,
        social: state.master.app.social
    }
}

const mapDispatchToProps = {
    loadUserBooksAction,
    removeBookCopyAction,
    addToFavoritesAction,
    removeFromFavoritesAction,
    removeBookDraftAction,
    setBooksInitializedAction
}

const routes = [{
    id: UserActiveBooksContainer.id,
    path: '/active',
    componentLoader: UserActiveBooksContainer
}, {
    id: UserPendingBooksContainer.id,
    path: '/pending',
    componentLoader: UserPendingBooksContainer
}]

const loadData = (props, context) => {
    let userSlug = UserBooksContainer.getUser(props.match);
    return context.store.dispatch(loadUserBooksAction({userSlug}));
}

export default withComponentExtended('userBooks', routes, loadData, null, false)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(UserBooksContainer)));