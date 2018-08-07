'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../../hoc';
import NotificationsContainer from "../notifications/components/notificationsContainer";
import {Switch, NavLink, withRouter} from 'react-router-dom';
import RouteExtended from '../../../routeExtended';
import {messages as userSettingsMessages} from '../userSettingsMessages';
import RedirectWithStatus from '../../../redirectWithStatus';

class UserSettingsContainer extends React.Component {
    render() {
        let {match, routeResolver, user, isLoggedUser} = this.props;

        return <div className="container">
            <div className="row l-userBookActions">
                <div className="col-3 mt-2 d-none d-md-block">
                    <ul className="menu menu-light">
                        <li>
                            <NavLink activeClassName="menu--item-is-selected" exact
                                     to={routeResolver.buildRouteFor('notificationsSettings', {user: user.slug}, {redirect: true})}><FormattedMessage {...userSettingsMessages.notifications} /></NavLink>
                        </li>
                    </ul>
                </div>
                <div className="col-12 col-md-9">
                    <Switch>
                        {routes.map((route) => {
                            return <RouteExtended key={route.path} exact={route.exact} authLevel={route.authLevel}
                                                  path={`${match.path}${route.path}`}
                                                  component={route.componentLoader}/>
                        })}
                        <RedirectWithStatus status={302}
                                            from={routeResolver.buildRouteFor('userSettings', {user: user.slug}).pathname} exact
                                            to={{
                                                pathname: routeResolver.buildRouteFor('notificationsSettings', {user: user.slug}).pathname
                                            }}/>

                    </Switch>
                </div>
            </div>
        </div>
    }
}

const mapStateToProps = (state, props) => {
    return {
        isLoggedUser: state.master.user.slug == state.userData.user.slug,
        user: state.master.user
    }
}

const mapDispatchToProps = {}

const routes = [
    {
        id: NotificationsContainer.id,
        path: '/notifications',
        componentLoader: NotificationsContainer
    }
]

export default withComponentExtended('userSettings', routes, null, null)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(UserSettingsContainer)))

