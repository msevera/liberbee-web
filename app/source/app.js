/**
 * Created by Mike on 5/4/2017.
 */

'use strict';

import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import masterReducers from './master/masterReducers';
import logger from 'redux-logger'

class App {
    constructor(options) {
        this.options = options;
        this.reducers = {...masterReducers};
        this.localization = null;
        this.flatRoutes = [];
    }

    registerReducers(reducers) {
        this.reducers = {
            ...this.reducers,
            ...reducers
        }
    }

    createStore(reducers) {
        console.log('create store');
        if (!!reducers) {
            this.registerReducers(reducers)
        }

        this.store = createStore(combineReducers(this.reducers), this.options.preloadedState, applyMiddleware(thunkMiddleware.withExtraArgument({
            auth: this.options.auth,
            socket: this.options.socket,
            routeResolver: this.routeResolver,
            gtm: this.options.gtm,
            errorHandler: this.options.errorHandler
        })/*, logger*/));

        if (this.options.storeCreated) {
            this.options.storeCreated(this.store);
        }
    }

    setLocalization(localization){
        this.localization = localization;
    }

    setRouteResolver(routeResolver){
        this.routeResolver = routeResolver;
    }

    replaceStore(reducers) {
        console.log('replace store');
        this.registerReducers(reducers);

        this.store.replaceReducer(combineReducers(this.reducers));
    }

    getState() {
        return this.store.getState();
    }
}

module.exports = App;