/**
 * Created by Mike on 5/15/2017.
 */

let fetchUtils = require('../utils/fetchUtils');
let AuthBase = require('./authBase');
let config = require('config');
let configHelper = require('../config/configHelper');
let LocaleResolver = require('../utils/localization/localeResolver');
let localization = require('../utils/localization/localization');

class AuthServer extends AuthBase {
    constructor(req, res) {
        super();
        this._authCookieName = config.get('api.auth.cookieName');
        this.req = req;
        this.res = res;
        this.session = req.session;
        this.authType = {
            liberbee: config.get('api.auth.liberbee'),
            social: config.get('api.auth.social')
        }
        this.clientCredentials = {
            client_id: config.get('api.auth.credentials.clientId'),
            client_secret: config.get('api.auth.credentials.clientSecret')
        }

        this.localeResolver = new LocaleResolver(localization.getSupportedLocales());
    }

    getAcceptLanguage() {
        return this.req.locale;
    }

    get apiBaseUrl() {
        return `${configHelper.getApiServer()}${config.get('api.baseUrl')}`
    }

    get isAuthenticated() {
        let sess = this.session;
        return !!sess.signedInUser
    }

    signOut(redirectToSignIn) {
        let sess = this.session;
        this.res.clearCookie(this._authCookieName);
        sess.destroy();
        let path = this.localeResolver.applyLocaleToPath(this.req.locale, '/');
        redirectToSignIn ? this.gotoSignIn() : this.res.redirect(302, path);
    }

    gotoSignIn(queryString) {
        let url = queryString ? `${this.signInUrl}?${queryString}` : `${this.signInUrl}`;
        this.res.redirect(302, url);
    }

    signIn(email, password) {
        let data = Object.assign({}, this.clientCredentials, {
            grant_type: 'password',
            username: email,
            password
        });

        return this._authenticate(data, this.authType.liberbee.path).then(() => {
            let signedInUser = {isAuthenticated: true};
            this.session.signedInUser = signedInUser;
            return signedInUser;
        });
    }

    signInSocial(token, provider) {
        return this._authenticate({access_token: token, provider}, this.authType.social.path).then(() => {
            let signedInUser = {isAuthenticated: true};
            this.session.signedInUser = signedInUser;
            return signedInUser;
        });
    }

    associateWithPassword(token, password, provider){
        return this._authenticate({access_token: token, password, provider}, this.authType.social.associateWithPasswordPath).then(() => {
            let signedInUser = {isAuthenticated: true};
            this.session.signedInUser = signedInUser;
            return signedInUser;
        });
    }

    getAuthToken() {
        let authToken = this.session.authToken;
        if (!authToken) {
            return this._authenticateWebServer();
        }

        let token = this._formatTokenDataString(authToken);
        this._setCookie(token);

        return Promise.resolve(token);
    }

    updateExpiredAuthToken() {
        let token = this.session.authToken;

        if (!!token.refresh_token) {
            return this._refreshUserToken(token.refresh_token);
        }

        return this._authenticateWebServer();
    }

    _refreshUserToken(refreshToken) {
        let data = Object.assign({}, this.clientCredentials, {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        });

        return this._authenticate(data, this.authType.liberbee.path);
    }

    _authenticateWebServer() {
        let data = Object.assign({}, this.clientCredentials, {
            grant_type: 'client_credentials',
        });

        return this._authenticate(data, this.authType.liberbee.path);
    }

    _authenticate(data, authPath, locale) {
        return fetchUtils.post('authenticateAPI', authPath, data, {baseUrl: this.apiBaseUrl, locale: this.req.locale})
            .then((response) => {
                this.session.authToken = Object.assign({}, response, {
                    expireDate: new Date(Date.now() + (response.expires_in * 1000)).toISOString()
                })

                const token = this._formatTokenDataString(this.session.authToken);
                this._setCookie(token);
                return token;
            });
    }

    _setCookie(token) {
        this.res.cookie(this._authCookieName, token);
    }

    _formatTokenDataString(tokenData) {
        return tokenData.access_token + ';' + tokenData.token_type + ';' + tokenData.expireDate;
    }
}

module.exports = AuthServer;