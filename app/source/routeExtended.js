/**
 * Created by Mike on 5/10/2017.
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Route, Redirect} from 'react-router-dom';
import RedirectWithStatus from './redirectWithStatus';
import {withRouteTools} from './hoc';

class RouteExtended extends Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired
    }

    getComponentToRender(props) {
        let {render, component: Component, location} = this.props;

        return !!Component ? <Component {...props} /> : render(props)
    }

    static secureCheck(auth, authLevel){
        let needAuthentication = authLevel && authLevel > 0;

        return (!needAuthentication) || (needAuthentication && auth.isAuthenticated);
    }

    processSecure(props) {
        let {auth} = this.context;
        let {authLevel, routeResolver} = this.props;

        if (!auth.isAuthenticated){
            console.log('Redirecting from route extended to sign in');
        }

        let renderComponent = this.constructor.secureCheck(auth, authLevel);
        if (renderComponent){
            return this.getComponentToRender(props);
        }

        let query = {};
        if (props.location.pathname){
            query = {
                redirect: props.location.pathname
            }
        }
        let loginTo = routeResolver.buildRouteFor('login', {}, {
            query
        })
        return <RedirectWithStatus status={302} to={loginTo}/>
    }

    render() {
        let {auth, authLevel, render, component, status, ...rest} = this.props;

        return <Route {...rest} render={props => {
            let {staticContext} = props;
            if (staticContext && status){
                staticContext.status = status;
            }

            if (authLevel && authLevel > 0) {
                return this.processSecure(props);
            } else {
                return this.getComponentToRender(props);
            }
        }}/>
    }
}

export default withRouteTools(RouteExtended);