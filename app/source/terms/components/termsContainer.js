'use strict';

import React from 'react';
import {Switch, NavLink, withRouter} from 'react-router-dom';
import RouteExtended from '../../routeExtended';
import RedirectWithStatus from '../../redirectWithStatus';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../hoc';
import PrivacyPolicyContainer from '../privacyPolicy/components/privacyPolicyContainer';
import TermsOfUseContainer from '../termsOfUse/components/termsOfUseContainer';
import {messages as navigationMessages} from "../../master/navigation/navigationMessages";

class TermsContainer extends React.Component {


    render() {
        let {match, routeResolver} = this.props;

        return <div className="container">
            <div className="row l-infoPage">
                <div className="col-3 mt-2">
                    <ul className="menu menu-light">
                        <li>
                            <NavLink activeClassName="menu--item-is-selected" exact
                                     to={routeResolver.buildRouteFor('terms',{},{redirect: true})}><FormattedMessage {...navigationMessages.terms} /></NavLink>
                        </li>
                        <li>
                            <NavLink activeClassName="menu--item-is-selected"
                                     to={routeResolver.buildRouteFor('privacyPolicy',{},{redirect: true})}><FormattedMessage {...navigationMessages.privacy} /></NavLink>
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
                            <TermsOfUseContainer />
                        }
                    </Switch>
                </div>
            </div>
        </div>
    }
}

const messages = defineMessages({

})

const mapStateToProps = (state, props) => {
    return {

    }
}

const mapDispatchToProps = {

}

const routes = [{
    id: PrivacyPolicyContainer.id,
    path: '/privacy',
    componentLoader: PrivacyPolicyContainer
}]

export default withComponentExtended('help', routes, null, null)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(TermsContainer)))