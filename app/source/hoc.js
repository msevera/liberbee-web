/**
 * Created by Mike on 11/3/2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ComponentExtended from './componentExtended';
import {withRouter} from 'react-router-dom';
import {Helmet} from 'react-helmet';

let defaultOptions = {
    reloadOnPop: true
}

let _resolveOptions = (options) => {
    return Object.assign({}, defaultOptions, options);
}

export const withComponentExtended = (id, routes = [], loadData, seo, trackPageView = true, options) => {
    return (Component) => {
        let NewComponent = withTools(Component);
        let resolvedOptions = _resolveOptions(options);

        class WithComponentExtended extends ComponentExtended {
            static routes = routes;
            static id = id;
            static loadData = loadData;
            static renderedOnServer = false;
            static reloadOnPop = resolvedOptions.reloadOnPop;
            static initialized = resolvedOptions.initialized;
            static contextTypes = {
                routeResolver: PropTypes.object.isRequired,
                gtm: PropTypes.object.isRequired,
                router: PropTypes.object.isRequired,
                store: PropTypes.object.isRequired,
                intl: PropTypes.object.isRequired
            }

            constructor() {
                super();
                this.domain = ''
                this.trackPageView = trackPageView;
            }

            renderHeaderLinks() {
                let {routeResolver, intl, store} = this.context;
                let {location} = this.context.router.route;
                let seoData = routeResolver.buildSeo(location.pathname, seo)
                let webDomain = store.getState().master.app.webDomain;

                return <Helmet key="helmet">
                    {
                        seoData.canonical &&
                        <link rel="canonical" href={`${webDomain}${seoData.canonical}`}/>
                    }
                    {
                        seoData.noIndex &&
                        <meta name="robots" content="noindex, nofollow"/>
                    }
                    {
                        seoData.hreflangs && seoData.hreflangs.map((hreflang) => {
                            return <link key={hreflang.href} rel="alternate" href={`${webDomain}${hreflang.href}`}
                                         hreflang={hreflang.locale}/>
                        })
                    }
                </Helmet>
            }

            render() {

                let componentsToRender = [];
                if (id != 'master') {
                    componentsToRender.push(this.renderHeaderLinks())
                }

                componentsToRender.push(<NewComponent key="newComponent" {...this.props}/>);

                return componentsToRender
            }
        }

        return withRouter(WithComponentExtended);
    }
}

export const withTools = (Component) => {
    class WithTools extends React.Component {
        static contextTypes = {
            routeResolver: PropTypes.object.isRequired,
            gtm: PropTypes.object.isRequired
        }

        render() {
            let {routeResolver, gtm} = this.context;

            return <Component {...this.props} routeResolver={routeResolver} gtm={gtm}/>
        }
    }

    return withRouter(WithTools)
    //return WithTools;
}


export const withRouteTools = (Component) => {
    class WithRouteTools extends React.Component {
        static contextTypes = {
            routeResolver: PropTypes.object.isRequired,
            gtm: PropTypes.object.isRequired
        }

        static WrappedComponent = Component;

        render() {
            let {routeResolver, gtm} = this.context;

            return <Component {...this.props} routeResolver={routeResolver} gtm={gtm}/>
        }
    }

    return WithRouteTools
    //return WithTools;
}