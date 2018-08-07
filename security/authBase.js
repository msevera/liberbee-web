/**
 * Created by Mike on 5/14/2017.
 */


class AuthBase{
    get isAuthenticated(){
        return this._isAuthenticated;
    }

    get apiBaseUrl() {
        return this._apiBaseUrl;
    }

    get signOutUrl(){
        return '/signout';
    }

    get signInUrl(){
        return '/login';
    }

    resolveToken(options) {
        let generateNewToken = options && options.generateNewToken;

        if (generateNewToken){
            return this.updateExpiredAuthToken(generateNewToken).then((tokenDataString) => {
                return this._formatAuthTokenHeader(tokenDataString);
            });
        }

        return Promise.resolve(this.getAuthToken()).then((tokenDataString) => {
            if (this._checkAuthToken(tokenDataString)) {
                return this._formatAuthTokenHeader(tokenDataString);
            } else {
                return this.updateExpiredAuthToken().then((tokenDataString) => {
                    return this._formatAuthTokenHeader(tokenDataString);
                });
            }
        });
    }

    _checkAuthToken(tokenData) {
        if (!tokenData) {
            return false
        };

        let tokenDataArray = tokenData.split(';'),
            expiresIn = tokenDataArray[2];

        return Date.now() < (new Date(expiresIn)).getTime();
    }

    _formatAuthTokenHeader(tokenData) {
        let tokenDataArray = tokenData.split(';');
        return tokenDataArray[1] + ' ' + tokenDataArray[0];
    }
}

module.exports = AuthBase;