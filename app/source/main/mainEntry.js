/**
 * Created by Mike on 5/3/2017.
 */

import 'core-js/fn/array/find';
import 'core-js/fn/array/find-index';
import 'core-js/fn/object/assign';
import 'core-js/fn/array/includes';
import 'core-js/fn/promise';
import React from 'react';
import {hydrate} from 'react-dom';
import MainApp from './mainApp';
import AuthClient from '../../../security/authClient';
import {showSigninAction} from '../master/masterActions';
import RouteResolver from '../../../utils/routeResolver';
import Histoty from '../../../utils/history';
import fetchUtils from '../../../utils/fetchUtils';
import ErrorHandler from '../errorHandler';
import Socket from '../../../utils/socket';
import LocaleResolver from '../../../utils/localization/localeResolver';
import GTM from '../../../utils/analytics/gtm';
import smoothscroll from 'smoothscroll-polyfill';

// kick off the polyfill!
smoothscroll.polyfill();

let {addLocaleData} = require('react-intl');
let preloadedState = window.__PRELOADED_STATE__;
let localization = window.__LOCALIZATION__;

function runMyApp() {
    let apiDomain = preloadedState.master.app.apiDomain
    let auth = new AuthClient({
        user: preloadedState.master.user,
        apiBaseUrl: `${apiDomain}${preloadedState.master.app.apiBaseUrl}`,
        locale: localization.locale
    });

    let routeResolver = new RouteResolver(preloadedState.master.app.appRoutes, localization.locale, new LocaleResolver(localization.supportedLocales), preloadedState.master.app.webDomain)
    let gtm = new GTM(routeResolver);
    if (preloadedState.master.user._id)
    {
        gtm.setUser(preloadedState.master.user._id);
    }

    gtm.ee.setInitial(preloadedState)



    addLocaleData(window.ReactIntlLocaleData[localization.locale]);
    let errorHandler = new ErrorHandler();
    let options = {
        location: {
            path: location.pathname
        },
        gtm,
        auth,
        localization,
        errorHandler,
        socket: new Socket(auth, apiDomain),
        routeResolver,
        preloadedState,
        storeCreated: (store) => {
            errorHandler.setStore(store);
            fetchUtils.setErrorHandler(errorHandler);
            options.auth.gotoSignIn = function () {
                store.dispatch(showSigninAction(true))
            }
        }
    }

    console.log('apiData', preloadedState.master.general);
    console.log('appRoutes', preloadedState.master.app);

    Histoty.init(routeResolver);
    delete window.__PRELOADED_STATE__;

    new MainApp(options).then(({component, store}) => {
        hydrate(component, document.getElementById('app'))
    });


}
if (!global.Intl) {
    require.ensure([
        'intl',
        'intl/locale-data/jsonp/en.js',
        'intl/locale-data/jsonp/uk.js',
    ], function (require) {
        require('intl');
        require(`intl/locale-data/jsonp/en.js`);
        require(`intl/locale-data/jsonp/uk.js`);
        runMyApp()
    });

} else {
    runMyApp()
}
