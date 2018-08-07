/**
 * Created by Mike on 7/7/2017.
 */

'use strict';

var createHistory = require('history').createBrowserHistory;
var appUtils = require('./appUtils');
var RouteResolver = require('./routeResolver');


class History {
    get historyObject(){
        return this.history;
    }

    init(routeResolver) {
        if (appUtils.isBrowser)
        {
            this.history = createHistory({});
            let url = `${location.pathname}${location.search}`;
            let reloadState = routeResolver.getMatchedRouteState(url, {reload: true});
            this.replace(url, reloadState);
        }
    }

    push(data, state){
        this.history && this.history.push(data, state);
    }

    replace(data, state){
        this.history && this.history.replace(data, state);
    }
}

module.exports = new History();
