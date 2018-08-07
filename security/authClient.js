/**
 * Created by Mike on 5/15/2017.
 */

import fetchUtils from '../utils/fetchUtils';
import cookies from 'js-cookie';
import AuthBase from './authBase';

class AuthClient extends AuthBase {
    constructor(options) {
        super();
        this.userId = options.user._id;
        this._isAuthenticated = !!options.user.isAuthenticated;
        this._apiBaseUrl = options.apiBaseUrl;
        this._locale = options.locale;
    }

    getAcceptLanguage() {
        return this._locale;
    }

    _getTokenFromCookies() {
        return cookies.get('_a');
    }

    getAuthToken() {
        let token = this._getTokenFromCookies();
        return Promise.resolve(token);
    }

    signIn({email, password}){
        return fetchUtils.post('signin', this.signInUrl, {email, password}).then((data) => {
            this._isAuthenticated = !!data;
            return data;
        })
    }

    associateWithPassword({token, password, provider}){
        return fetchUtils.post('associateWithPassword', '/auth/social/associatewithpassword', {token, password, provider}).then((data) => {
            this._isAuthenticated = !!data;
            return data;
        })
    }

    gotoSignIn(){

    }

    signOut(){
        this._isAuthenticated = false;
        window.location = this.signOutUrl;
    }

    updateExpiredAuthToken(generateNewToken) {
        return fetchUtils.post('authenticateAPI', '/updateToken', {generateNewToken})
            .then(() => {
                let token = cookies.get('_a');
                return token;
            });
    }
}

module.exports = AuthClient;