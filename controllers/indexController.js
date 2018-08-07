/**
 * Created by Mike on 3/29/2017.
 */

'use strict';
let Controller = require('./controller'),
    {renderToString} = require('react-dom/server'),
    AuthServer = require('../security/authServer'),
    configHelper = require('../config/configHelper'),
    config = require('config'),
    queryString = require('query-string'),
    localization = require('../utils/localization/localization'),
    {Helmet} = require("react-helmet"),
    MainApp = require('../app/mainApp');

class IndexController extends Controller {
    constructor() {
        super();
    }

    indexAction(req, res, next) {
        let sess = req.session;
        let auth = new AuthServer(req, res);
        let localizationData = Object.assign({} ,localization.getLocalizationFor(req.locale), {initialNow: Date.now(), supportedLocales: localization.getSupportedLocales()});
        let localeData = localization.getLocaleDatFor(req.locale);
        let context = {};

        let appOptions = {
            isServer: true,
            context: context,
            location: {
                path: req.params[0],
                search: `?${queryString.stringify(req.query)}`
            },
            localization: localizationData,
            auth,
            initData: {
                user: sess.signedInUser ? sess.signedInUser : null,
                locale: {
                    items: localization.getLocales(),
                    selected: req.locale
                },
                apiData: {
                    domain: configHelper.getApiServer(),
                    baseUrl: config.get('api.baseUrl')
                },
                webData: {
                    domain: configHelper.getWebServer(),
                    social: config.get('web.social')
                }
            }
        };

        new MainApp(appOptions)
            .then(({component, store, routeId}) => {
                const html = renderToString(component);
                const preloadedState = store.getState();

               if (context.url) {
                    res.writeHead(context.status, {
                        Location: context.url
                    })
                    res.end()
                } else {

                   let status = context.status ? context.status: 200;
                    res.status(status).render('index', {
                        gtmEnable: config.get('gtm.enable'),
                        gtm: config.get('gtm.id'),
                        helmet: Helmet.renderStatic(),
                        bundle: routeId,
                        title: 'Liberbee',
                        htmlMarkup: html,
                        localization: localizationData,
                        localeData,
                        preloadedState
                    })
                }
            })
            .catch((error) => {
                next(error);
            });
    }
}

module.exports = IndexController;



