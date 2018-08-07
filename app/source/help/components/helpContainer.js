'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../hoc';
import HelpSellBookContainer from "../sellBook/components/helpSellBookContainer";
import HelpBuyBookContainer from "../buyBook/components/helpBuyBookContainer";
import HelpAboutLiberbeeContainer from "../aboutLiberbee/components/helpAboutLiberbeeContainer";
import HelpFindBookContainer from "../findBook/components/helpFindBookContainer";
import HelpMarkAsSentReceivedContainer from "../markAsSentReceived/components/helpMarkAsSentReceivedContainer";
import {Switch, NavLink, withRouter} from 'react-router-dom';
import RouteExtended from '../../routeExtended';
import {messages as helpMessages} from '../helpMessages';

class HelpContainer extends React.Component {
    render() {
        let {match, routeResolver} = this.props;

        return <div className="container">
            <div className="row l-infoPage">
                <div className="col-3 mt-2">
                    <ul className="menu menu-light">
                        <li>
                            <NavLink activeClassName="menu--item-is-selected" exact
                                     to={routeResolver.buildRouteFor('help', {}, {redirect: true})}><FormattedMessage {...helpMessages.howItWorks} /></NavLink>
                        </li>
                        <li>
                            <NavLink activeClassName="menu--item-is-selected"
                                     to={routeResolver.buildRouteFor('helpFindBook', {}, {redirect: true})}><FormattedMessage {...helpMessages.findBook} /></NavLink>
                        </li>
                        <li>
                            <NavLink activeClassName="menu--item-is-selected"
                                     to={routeResolver.buildRouteFor('helpSellBook', {}, {redirect: true})}><FormattedMessage {...helpMessages.sellBook} /></NavLink>
                        </li>
                        <li>
                            <NavLink activeClassName="menu--item-is-selected"
                                     to={routeResolver.buildRouteFor('helpBuyBook', {}, {redirect: true})}><FormattedMessage {...helpMessages.buyBook} /></NavLink>
                        </li>
                        <li>
                            <NavLink activeClassName="menu--item-is-selected"
                                     to={routeResolver.buildRouteFor('helpMarkAsSentReceived', {}, {redirect: true})}><FormattedMessage {...helpMessages.markAsSentReceived} /></NavLink>
                        </li>
                    </ul>
                </div>
                <div className="col-9">
                    <Switch>
                        {routes.map((route) => {
                            return <RouteExtended key={route.path} exact={route.exact} authLevel={route.authLevel}
                                                  path={`${match.path}${route.path}`}
                                                  component={route.componentLoader}/>
                        })}
                        {
                            <HelpAboutLiberbeeContainer/>
                        }
                    </Switch>
                </div>
            </div>
        </div>
    }
}

const mapStateToProps = (state, props) => {
    return {}
}

const mapDispatchToProps = {}

const routes = [
    {
        id: HelpSellBookContainer.id,
        path: '/put-a-book-up-for-sale',
        componentLoader: HelpSellBookContainer
    },
    {
        id: HelpBuyBookContainer.id,
        path: '/buy-a-book',
        componentLoader: HelpBuyBookContainer
    },
    {
        id: HelpFindBookContainer.id,
        path: '/find-books',
        componentLoader: HelpFindBookContainer
    },
    {
        id: HelpMarkAsSentReceivedContainer.id,
        path: '/mark-as-sent-or-received',
        componentLoader: HelpMarkAsSentReceivedContainer
    }
]

export default withComponentExtended('help', routes, null, null)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(HelpContainer)))

