/**
 * Created by Mike on 5/7/2017.
 */

'use strict';

import React from 'react';
import ProviderExtended from '../providerExtended';
import {Router, Route, StaticRouter, Switch, matchPath} from 'react-router-dom';
import historyCustom from '../../../utils/history';
import App from '../app';
import BundleLoader from '../bundleLoader';
import RouteExtended from '../routeExtended';
import {initData, initRoot} from '../master/masterActions';
import {buildRoutes} from './mainRoutes';
import appUtils from '../../../utils/appUtils';
import NotFound from '../status/notFound';
import MasterContainer from '../master/components/masterContainer';
import MasterSockets from '../master/masterSockets';
import {matchRoutes} from 'react-router-config';
import RouteResolver from '../../../utils/routeResolver';
import LocaleResolver from '../../../utils/localization/localeResolver';
import URIUtils from '../../../utils/uriUtils';
import {IntlProvider} from 'react-intl';
import translationsLoader from '../../../utils/localization/translationsLoader';

class MainApp extends App {
    constructor(options) {
        super(options);

        this.localeResolver = new LocaleResolver(this.options.localization.supportedLocales);
        this.routes = buildRoutes(this.localeResolver);

        let componentRenderedOnServer = this.routes.find((route) => {
            let match = matchPath(options.location.path, route);
            return match;
        });

        return appUtils.isBrowser ?
            this._handleClientRender(componentRenderedOnServer) :
            this._handleServerRender(componentRenderedOnServer)

    }

    _handleClientRender(componentRenderedOnServer) {
        return new Promise((resolve, reject) => {
            super.setRouteResolver(this.options.routeResolver);
            if (!componentRenderedOnServer || !componentRenderedOnServer.componentLoader) {
                super.createStore();
                this.preloadOtherModules();
                return translationsLoader[this.options.localization.locale]((messages) => {
                    super.setLocalization({
                        locale: this.options.localization.locale,
                        messages: messages
                    })
                    return resolve({component: this.render()});
                })
            }




            componentRenderedOnServer.renderedOnServer = true;
            componentRenderedOnServer.componentLoader((app) => {
                app = app.default ? app.default : app;

                super.createStore(app.reducers);

                MasterSockets.init(this.options.socket, this.store);
                if (app.sockets) {
                    app.sockets.init(this.options.socket, this.store);
                }

                componentRenderedOnServer.componentLoader = app.container;
                MasterContainer.WrappedComponent.renderedOnServer = true;

                let routes = this._buildRouteTree(componentRenderedOnServer);
                matchRoutes(routes, this.options.location.path).forEach(({route, match}) => {
                    let component = route.componentLoader.container ? route.componentLoader.container : route.componentLoader;
                    component.WrappedComponent.renderedOnServer = true;
                });


                translationsLoader[this.options.localization.locale]((messages) => {
                    super.setLocalization({
                        locale: this.options.localization.locale,
                        messages: messages
                    })

                    resolve({
                        component: this.render(),
                        store: this.store
                    });
                })


            })

            this.preloadOtherModules();
        });
    }

    _handleServerRender(componentToRenderOnServer) {
        return new Promise((resolve, reject) => {
            let flatRoutes = this._buildFlatRoutes();
            let actions = [() => this.store.dispatch(initData({
                ...this.options.initData,
                appRoutes: flatRoutes
            })), () => MasterContainer.loadData({location: this.options.location}, {store: this.store})];
            let routeId;
            let storeReducers;

            super.setRouteResolver(new RouteResolver(flatRoutes, this.options.localization.locale, this.localeResolver, this.options.initData.webData.domain));

            if (!!componentToRenderOnServer && !!componentToRenderOnServer.componentLoader) {
                routeId = componentToRenderOnServer.id;
                storeReducers = componentToRenderOnServer.componentLoader.reducers;

                let routes = this._buildRouteTree(componentToRenderOnServer);
                const prefetchingRequests = matchRoutes(routes, this.options.location.path).map(({route, match}) => {
                    let component = route.componentLoader.container ? route.componentLoader.container : route.componentLoader;
                    return RouteExtended.WrappedComponent.secureCheck(this.options.auth, route.authLevel) && component.loadData ? () => {
                        return component.loadData({match, location: this.options.location}, {store: this.store})
                    } : () => {
                        return Promise.resolve(null)
                    };
                });

                actions = actions.concat(prefetchingRequests);
            }

            super.createStore(storeReducers);
            super.setLocalization({
                locale: this.options.localization.locale,
                messages: translationsLoader[this.options.localization.locale]
            })

            this.store.dispatch(initRoot()).then(() => {
                Promise.all(actions.map((func) => func()))
                    .then(() => {
                        resolve({
                            routeId: routeId,
                            component: this.render(this.options.isServer, `${this.options.location.path}${this.options.location.search}`, this.options.context),
                            store: this.store
                        });
                    })
                    .catch((err) => {
                        reject(err);
                    })
            });


        });
    }

    _buildFlatRoutes() {
        let flatRoutes = []
        this.routes.forEach((component) => {
            return this._buildRouteTree(component, null, flatRoutes);
        })

        return flatRoutes;
    }

    _buildRouteTree(route, routeParent, flatRoutesResult) {
        route = Object.assign({}, route);
        let tree = [route];

        let component = route.componentLoader ? route.componentLoader : route.component;
        component = component.container ? component.container : component;

        route.stateReloadKeys = [route.id];

        if (routeParent) {
            let path = !!route.path ? route.path : '';
            let absolutePath = route.absolutePath ? route.absolutePath : ''

            route.path = absolutePath ? `${this.localeResolver.getLocalePath()}${absolutePath}` : routeParent.path + path;

            if (route.params) {
                route.path = URIUtils.bindParams(route.path, route.params);
            }
            route.stateReloadKeys = route.stateReloadKeys.concat(routeParent.stateReloadKeys);
        }

        if (flatRoutesResult && !flatRoutesResult.find(fr => fr.id == route.id)) {
            flatRoutesResult.push({
                id: route.id,
                path: route.path,
                seo: route.seo,
                stateReloadKeys: route.stateReloadKeys
            })
        }

        if (!!component.routes) {
            route.routes = [];
            component.routes.forEach((r) => {
                let routes = this._buildRouteTree(r, route, flatRoutesResult);
                route.routes = route.routes.concat(routes);
            });
        }

        return tree;
    }

    preloadOtherModules() {
        setTimeout(() => {
            this.routes.forEach((route) => {
                if (!route.renderedOnServer && !!route.componentLoader) {
                    if (route.styleLoader) {
                        route.styleLoader.load();
                    }

                    route.componentLoader((mod) => {

                    })
                }
            })
        }, 1000);

    }

    getRoutes() {
        return <Switch>
            {this.routes.map((route) => {
                if (route.component)
                {
                    return <Route key={route.path} path={route.path} component={route.component}/>
                } else if (route.renderedOnServer) {
                    return <RouteExtended key={route.path} exact={route.exact} strict={route.strict} path={route.path}
                                          authLevel={route.authLevel} component={route.componentLoader}/>
                } else {
                    return <RouteExtended key={route.path} exact={route.exact} strict={route.strict} path={route.path}
                                          authLevel={route.authLevel} render={(props) => {

                        return <BundleLoader async={appUtils.isBrowser} load={route.componentLoader}>
                            {(app) => {
                                if (appUtils.isBrowser && route.styleLoader) {
                                    route.styleLoader.load();
                                }

                                let Container = app ? app.container : null;
                                if (app && appUtils.isBrowser && !app.isStoreReplaced) {
                                    app.isStoreReplaced = true;
                                    super.replaceStore(app.reducers);
                                }

                                if (app && appUtils.isBrowser && app.sockets && !app.isSocketInit) {
                                    app.isSocketInit = true;
                                    app.sockets.init(this.options.socket, this.store);
                                }


                                return Container
                                    ? <Container />
                                    : <div>Loading bundle</div>
                            }
                            }
                        </BundleLoader>
                    }}/>
                }
            })}

            <RouteExtended status={404} component={NotFound}/>
        </Switch>
    }

    render(isServer, url, context) {
        let RouterComponent = isServer ? StaticRouter : Router;
        let historyInstance = historyCustom.historyObject;

        return <IntlProvider locale={this.localization.locale}
                             messages={this.localization.messages}
                             initialNow={this.options.localization.initialNow}
                             formats={{
                                 date: {
                                     dateShort: {
                                         day: 'numeric',
                                         month: 'short',
                                         hour: '2-digit',
                                         minute: '2-digit'
                                     },
                                     dateFull: {
                                         weekday: 'long',
                                         month: 'short',
                                         day: 'numeric'
                                     },
                                     dateWithYear: {
                                         day: 'numeric',
                                         month: 'short',
                                         year: 'numeric'
                                     },
                                     year: {
                                         year: 'numeric'
                                     },
                                     timeShort: {
                                         hour: 'numeric',
                                         minute: 'numeric',
                                     }
                                 },
                                 number: {
                                     price: {
                                         style: 'currency',
                                         currencyDisplay: 'code'
                                     }
                                 }
                             }}>
            <ProviderExtended store={this.store} auth={this.options.auth} routeResolver={this.routeResolver} gtm={this.options.gtm}>
                <RouterComponent location={url} context={context} history={historyInstance}>
                    <MasterContainer>
                        {this.getRoutes()}
                    </MasterContainer>
                </RouterComponent>
            </ProviderExtended>
        </IntlProvider>
    }
}

module.exports = MainApp;