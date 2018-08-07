/**
 * Created by Mike on 5/14/2017.
 */


'use strict';
let Controller = require('./controller'),
    AuthServer = require('../security/authServer'),
    security = require('../security/security'),
    popupTools = require('popup-tools');

class SecurityController extends Controller {
    constructor() {
        super();
    }

    updateToken(req, res) {
        let authServer = new AuthServer(req, res);
        let generateNewToken = req.body.generateNewToken;
        authServer.resolveToken({generateNewToken})
            .then(() => {
                res.send();
            }).catch((err) => {
            res.status(err.statusCode).send(err.body);
        });
    }

    signin(req, res, next) {
        let authServer = new AuthServer(req, res);
        authServer.signIn(req.body.email, req.body.password)
            .then((signedInUser) => {
                res.send(signedInUser);
            })
            .catch((err) => {
                res.status(err.statusCode).send(err.body);
            });
    }

    signinFacebook(req, res, next) {
        req.locale = req.session.signinLocale;
        req.session.signinLocale = null;
        security.facebookToken(req, res, next)
            .then((token) => {
                let authServer = new AuthServer(req, res);
                return authServer.signInSocial(token, 'facebook');
            })
            .then(() => {
                res.send(popupTools.popupResponse({success: true}));
            })
            .catch((err) => {
                if (err && err.body && err.body.name == 'EmailNotConfirmed') {
                    res.send(popupTools.popupResponse({success: false, err}));
                } else {
                    res.send(popupTools.popupResponse({success: false}));
                }
            });
    }

    signinGoogle(req, res, next) {
        req.locale = req.session.signinLocale;
        req.session.signinLocale = null;
        security.googleToken(req, res, next)
            .then((token) => {
                let authServer = new AuthServer(req, res);
                return authServer.signInSocial(token, 'google');
            })
            .then(() => {
                res.send(popupTools.popupResponse({success: true}));
            })
            .catch((err) => {
                if (err && err.body && err.body.name == 'EmailNotConfirmed') {
                    res.send(popupTools.popupResponse({success: false, err}));
                } else {
                    res.send(popupTools.popupResponse({success: false}));
                }
            });
    }

    signout(req, res) {
        let authServer = new AuthServer(req, res);
        authServer.signOut();
    }

    associateWithPassword(req, res) {
        let token = req.body.token;
        let password = req.body.password;
        let provider = req.body.provider;

        let authServer = new AuthServer(req, res);
        authServer.associateWithPassword(token, password, provider)
            .then((signedInUser) => {
                res.send(signedInUser);
            })
            .catch((err) => {
                res.status(err.statusCode).send(err.body);
            });
    }
}

module.exports = SecurityController;



