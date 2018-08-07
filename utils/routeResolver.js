/**
 * Created by Mike on 9/12/2017.
 */
let {matchPath} = require('react-router-dom');
let pathToRegexp = require('path-to-regexp');
let history = require('../utils/history');

class RouteResolver {
    constructor(routes, locale, localeResolver, webDomain) {
        this.webDomain = webDomain;
        this.locale = locale;
        this.localeResolver = localeResolver;
        this.routes = routes;
        this._defaultOptions = {
            reload: false,
            redirect: false,
            locale: false,
            query: undefined,
            absolute: false
        }

    }

    buildSeo(url, options) {
        let result = {};
        /*
                if (!options)
                    return result;*/

        if (!options) {
            result.noIndex = true;
            return result;
        }

        if (options.canonical) {
            let {route, keys} = this._getRouteParams(url);
            let canonicalParams = options.canonical(keys);
            let canonicalUrl = this.buildRouteFor(route.id, canonicalParams).pathname;
            result.canonical = canonicalUrl;

            if (url == canonicalUrl) {
                let locales = this.localeResolver.getSupportedLocales();

                result.hreflangs = locales.map((loc) => {
                    let href = this.changeRouteLocale(loc.code, canonicalUrl).pathname;

                    return {
                        locale: loc.code,
                        href
                    }
                })
            }
        }

        return result;
    }

    getLocalePath() {
        return this.localeResolver.getLocalePath();
    }

    _resolveOptions(options) {
        return Object.assign({}, this._defaultOptions, options);
    }

    _resolveLocale(locale) {
        let result = {}

        if (locale != this.localeResolver.getDefaultLocale()) {
            result.locale = locale;
        }

        return result;
    }

    applyLocaleToPath(path) {
        return this.localeResolver.applyLocaleToPath(this.locale, path);
    }

    getMatchedRoute(url) {
        let route = this.routes.find((route) => {
            let match = matchPath(url, Object.assign({}, route, {exact: true}));
            return match;
        });

        return route;
    }

    _getRouteParams(url) {
        let route = this.getMatchedRoute(url);
        let tokens = [];
        let re = pathToRegexp(route.path, tokens);
        let matches = re.exec(url);

        matches.shift();
        let keys = matches.reduce((result, value, index) => {
            let paramsName = tokens[index].name;
            result[paramsName] = value;

            return result;
        }, {})

        return {
            route,
            keys
        }
    }

    changeRouteLocale(locale, url) {
        let {keys, route} = this._getRouteParams(url);

        delete keys.locale;
        return this.buildRouteFor(route.id, keys, {locale});
    }

    getMatchedRouteState(url, options) {
        let route = this.getMatchedRoute(url);

        if (route) {
            return this.getReloadState(route.id, options);
        }
    }

    getReloadState(routeId, options) {
        let {reload, redirect} = this._resolveOptions(options);

        let route = this.routes.find((route) => {
            return route.id === routeId;
        })

        let reloadObj = route.stateReloadKeys.reduce((result, item) => {

            result[item] = {
                reload,
                redirect
            }

            return result;
        }, {});

        return Object.assign({}, reloadObj, {pathname: `${location.pathname}${location.search}`});
    }

    buildRouteFor(routeId, uriParams, options) {
        let {reload, redirect, pathname, override, locale, query, absolute} = this._resolveOptions(options);

        if (!uriParams) {
            uriParams = {};
        }

        let route = this.routes.find((route) => {
            return route.id === routeId;
        })

        let path = pathname ? pathname : route.path;
        let toPath = pathToRegexp.compile(path);
        let localeParam = locale ? this._resolveLocale(locale) : this._resolveLocale(this.locale);
        uriParams = Object.assign(uriParams, localeParam);

        let uri = toPath(uriParams, {encode: (x) => x});
        if (uri == '') {
            uri = '/';
        }

        let reloadObj = route.stateReloadKeys.reduce((result, item) => {
            result[item] = {
                reload,
                redirect
            }

            return result;
        }, {});

        reloadObj = Object.assign({}, reloadObj, override, {
            path: route.path
        });

        let resultObj = {
            pathname: uri,
            state: reloadObj
        }

        if (absolute){
            resultObj.absolutePathname = this.webDomain + uri;
        }

        let search;
        if (query) {
            search = '?';
            for (let p in query) {
                if (search != '?') {
                    search += '&';
                }
                let value = query[p];
                if (value != '') {
                    search += `${p}=${query[p]}`
                }
            }

            if (search != '?') {
                resultObj.search = search;
            }
        }

        return resultObj;
    }
}

module.exports = RouteResolver;
