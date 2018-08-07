/**
 * Created by Mike on 5/3/2017.
 */

'use strict'

let csrf = require('csurf'),
    config = require('config'),
    configHelper = require('../config/configHelper'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth20').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

class Security {
    get CSRF() {
        return this.csrf;
    }

    facebookToken(req, res, next) {
        return new Promise((resolve, reject) => {

            req.session.signinLocale = req.locale;
            passport.authenticate('facebook', {
                session: false,
                authType: 'rerequest',
                display: 'popup',
                scope: ['email'],
            }, this._socialAuth(resolve, reject))(req, res, next);
        });
    }

    googleToken(req, res, next) {
        return new Promise((resolve, reject) => {

            req.session.signinLocale = req.locale;
            passport.authenticate('google', {
                session: false,
                scope: ['email']
            }, this._socialAuth(resolve, reject))(req, res, next);
        });
    }


    constructor() {
        this.csrf = csrf({cookie: true});
        this._setStrategies();
        this._socialAuth = this._socialAuth.bind(this);
        this.facebookToken = this.facebookToken.bind(this);
        this.googleToken = this.googleToken.bind(this);
    }

    initialize() {
        return passport.initialize();
    }

    csrfMiddleware(req, res, next) {
        res.cookie('_x', req.csrfToken());
        next();
    }

    _setStrategies() {
        passport.use(new FacebookStrategy({
                clientID: config.get('web.security.facebook.clientId'),
                clientSecret: config.get('web.security.facebook.clientSecret'),
                callbackURL: `${configHelper.getWebServer()}${config.get('web.security.facebook.callbackUrl')}`,
                scope: ['email'],
                profileFields: ['email', 'displayName', 'photos']
            },
            function (accessToken, refreshToken, profile, cb) {
                return cb(null, profile, accessToken);
            }
        ));

        passport.use(new GoogleStrategy({
                clientID: config.get('web.security.google.clientId'),
                clientSecret: config.get('web.security.google.clientSecret'),
                callbackURL: `${configHelper.getWebServer()}${config.get('web.security.google.callbackUrl')}`
            },
            function (accessToken, refreshToken, profile, cb) {
                cb(null, profile, accessToken);
            }
        ));
    }

    _socialAuth(resolve, reject) {
        return (err, profile, token) => {
            if (err || !profile) {
                reject(err);
            } else {
                if (!profile.emails) {
                    reject({emailNotProvided: true})
                } else {
                    resolve(token);
                }
            }
        }

    }
}

module.exports = new Security();