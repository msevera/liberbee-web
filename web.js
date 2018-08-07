/**
 * Created by Mike on 5/3/2017.
 */

'use strict';

let express = require('express'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    cookieParser = require('cookie-parser'),
    config = require('config'),
    Router = require('./routes/router'),
    path = require('path'),
    security = require('./security/security'),
    localization = require('./utils/localization/localization'),
    LocaleResolver = require('./utils/localization/localeResolver'),
    assetsLoader = require('./utils/assetsLoader');

class Web {
    constructor(app, port){
        this.app = app;
        this.port = port;
        this.localeResolver = new LocaleResolver(localization.getSupportedLocales())
        this.router = new Router(this.app, this.localeResolver);
        this.app.locals.assetsLoader = assetsLoader;
    }

    initSession(){
        let sessionConfig = Object.assign({}, config.get('web.session'), {
            store: new RedisStore(config.get('redis'))
        })

        this.app.use(session(sessionConfig));
    }

    registerMiddlwares(){
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());

        config.get('web.staticFolders').forEach((folder) => {
            this.app.use(express.static(path.join(__dirname, folder)));
        });

        this.app.use(cookieParser(config.get('web.session.secret')));

        this.app.use(this.localeResolver.getLocalePath(),(req, res, next) => {
            if (req.params.locale){
                req.locale = req.params.locale;
            }else{
                req.locale = this.localeResolver.getDefaultLocale();
            }
            next();
        })
    }

    initSecurity(){
        this.app.use(security.initialize());
        this.app.use(security.CSRF);
    }


    startServer(){
        this.app.disable('x-powered-by');
        this.app.listen(this.port);
        this.app.set('views', path.join(__dirname, '/resources/views'));
        console.log('Liberbee web server started on: '+ this.port);
    }

    start(){
        this.app.use(compression());
        this.app.set('view engine', 'ejs');
        this.registerMiddlwares();
        this.initSession();
        this.initSecurity();
        this.router.registerRoutes();
        localization.init();
        this.startServer();
    }
}

module.exports = Web;