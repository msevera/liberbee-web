/**
 * Created by Michael on 11.03.2016.
 */
let superagent = require('superagent');
let cookies = require('js-cookie');
let URIUtils = require('../utils/uriUtils');
let appUtils = require('../utils/appUtils');

class RequestsQueue {
    constructor() {
        this.requestsQueue = {};
    }

    push(requestId, request) {
        if (!appUtils.isBrowser)
            return;

        this.requestsQueue[requestId] = request;
    }

    remove(requestId) {
        if (!appUtils.isBrowser || !this.requestsQueue[requestId])
            return;

        delete this.requestsQueue[requestId];
    }

    check(requestId) {
        if (!appUtils.isBrowser || !this.requestsQueue[requestId])
            return;

        this.requestsQueue[requestId].abort();
    }
}

class Request {
    constructor() {
        this.requestsQueue = new RequestsQueue();
    }

    get(requestId, url, params, options, successCallback, errorCallback) {
        let request = superagent.get(url);
        this._call(request, {}, requestId, url, params, options, successCallback, errorCallback)
    }


    post(requestId, url, params, data, options, successCallback, errorCallback) {
        let additionalHeaders = {};
        let csrf = cookies.get('_x');
        if (!!csrf) {
            additionalHeaders['X-CSRF-TOKEN'] = csrf;
        }

        let request = superagent.post(url)
            .send(data)
            .type(options.requestDataType);

        this._call(request, additionalHeaders, requestId, url, params, options, successCallback, errorCallback)
    }

    patch(requestId, url, params, data, options, successCallback, errorCallback) {
        let additionalHeaders = {};
        let csrf = cookies.get('_x');
        if (!!csrf) {
            additionalHeaders['X-CSRF-TOKEN'] = csrf;
        }

        let request = superagent.patch(url)
            .send(data)
            .type(options.requestDataType);

        this._call(request, additionalHeaders, requestId, url, params, options, successCallback, errorCallback)
    }



    put(requestId, url, params, data, options, successCallback, errorCallback) {
        let additionalHeaders = {};
        let csrf = cookies.get('_x');
        if (!!csrf) {
            additionalHeaders['X-CSRF-TOKEN'] = csrf;
        }

        let request = superagent.put(url)
            .send(data)
            .type(options.requestDataType);

        this._call(request, additionalHeaders, requestId, url, params, options, successCallback, errorCallback)
    }



    delete(requestId, url, params, options, successCallback, errorCallback) {
        let request = superagent.del(url);
        this._call(request, {}, requestId, url, params, options, successCallback, errorCallback)
    }

    _call(request, additionalHeaders, requestId, url, params, options, successCallback, errorCallback) {
        if (options.combineRequests) {
            this.requestsQueue.check(requestId);
        }

        if (!!options.authToken) {
            additionalHeaders.Authorization = options.authToken;
        }

        if (options.acceptLanguage) {
            additionalHeaders['Accept-Language'] = options.acceptLanguage;
        }


        request
            .query(params)
            .set(additionalHeaders)
            .accept(options.responseDataType)
            .end((err, res) => {
                this.requestsQueue.remove(requestId);

                if (err || !res.ok) {
                    errorCallback(err);
                } else {
                    successCallback(res.body);
                }
            });

        if (options.combineRequests) {
            this.requestsQueue.push(requestId, request);
        }
    }

    abort(requestId) {
        this.requestsQueue.check(requestId);
        this.requestsQueue.remove(requestId);
    }
}

class FetchUtils {
    constructor() {
        this.request = new Request();
    }

    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    _resolveOptions(options) {
        return {
            queryParams: options && options.queryParams,
            locale: options && options.locale,
            uriParams: options && options.uriParams,
            accept: options && options.accept != undefined ? options.accept : 'application/hal+json',
            baseUrl: options && options.auth ? options.auth.apiBaseUrl : options && options.baseUrl ? options.baseUrl : '',
            auth: options && options.auth,
            authTries: options && options.authTries != undefined ? {
                limit: options.authTries,
                attempt: 0
            } : {
                limit: 1,
                attempt: 0
            },
            contentType: options && options.contentType != undefined ? options.contentType : 'application/json',
            combineRequests: options && options.combineRequests != undefined ? options.combineRequests : false,
        }
    }

    _handleError(err, auth, reject, request, authTries) {
        if (err.code === 'ECONNRESET' || typeof err.status == 'undefined') {
            reject();
            return;
        }

        let statusCode = err.response.statusCode;

        if (statusCode === 401 && !!auth && authTries.attempt < authTries.limit) {
            authTries.attempt++;
            auth.resolveToken({generateNewToken: true}).then(request).catch((err) => {
                auth.signOut();
            });
        } else if (statusCode === 403) {

            if (err.response.body.error_description.type === 'access_denied') {
                console.log('access denied. Goto SignIn')
                auth.gotoSignIn();
            }

            reject({statusCode: err.response.statusCode, body: err.response.body});

        } else {
            this.errorHandler && this.errorHandler.handle(err.response);
            reject({statusCode: err.response.statusCode, body: err.response.body});
        }
    }

    _resolveUrl(url, baseUrl, uriParams) {

        if (!!uriParams) {
            url = URIUtils.bindParams(url, uriParams)
        }

        url = baseUrl ? `${baseUrl}${url}` : url;

        return url;
    }

    call(resourceURI, auth, params, options) {
        switch (resourceURI.method) {
            case 'delete':
            case 'get': {
                let mergedOptions = Object.assign({}, options, {
                    auth,
                    queryParams: params
                })

                return this[resourceURI.method](resourceURI.id, resourceURI.uri, mergedOptions);
            }

            case 'patch':
            case 'put':
            case 'post': {
                let mergedOptions = Object.assign({}, options, {
                    auth,
                })

                return this[resourceURI.method](resourceURI.id, resourceURI.uri, params, mergedOptions);
            }
        }

        return this[resourceURI.method](resourceURI.id, resourceURI.uri, ...data);
    }

    get(requestId, url, options) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject();
                return;
            }

            let {queryParams, uriParams, accept, combineRequests, auth, authTries, baseUrl} = this._resolveOptions(options);

            let request = (authToken) => {
                this.request.get(requestId, this._resolveUrl(url, baseUrl, uriParams), queryParams, {
                        responseDataType: accept,
                        combineRequests,
                        authToken,
                        acceptLanguage: auth && auth.getAcceptLanguage()
                    },
                    (response) => {
                        resolve(response);
                    },
                    (err) => {
                        this._handleError(err, auth, reject, request, authTries);
                    });
            }

            auth ? auth.resolveToken().then(request).catch((err) => {
                if (err && err.statusCode == 403 && err.body && err.body && err.body.error_description.type == 'invalid_refresh_token') {
                    auth.resolveToken({generateNewToken: true}).then(request).catch((err) => {
                        auth.signOut();
                    });
                } else {
                    auth.signOut();
                }
                //auth.signOut();
                //reject(err);
            }) : request();
        })
    }

    post(requestId, url, data, options) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject();
                return;
            }

            let dataJson = JSON.stringify(data);
            let {queryParams, uriParams, accept, contentType, combineRequests, auth, authTries, baseUrl, locale} = this._resolveOptions(options);

            let request = (authToken) => {
                this.request.post(requestId, this._resolveUrl(url, baseUrl, uriParams), queryParams, dataJson, {
                        responseDataType: accept,
                        requestDataType: contentType,
                        combineRequests,
                        authToken,
                        acceptLanguage: locale ? locale : auth && auth.getAcceptLanguage()
                    },
                    (response) => {
                        resolve(response);
                    },
                    (err) => {
                        this._handleError(err, auth, reject, request, authTries);
                    });
            }

            auth ? auth.resolveToken().then(request).catch((err) => {
                reject(err);
            }) : request();
        })
    }

    patch(requestId, url, data, options) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject();
                return;
            }

            let dataJson = JSON.stringify(data);
            let {queryParams, uriParams, accept, contentType, combineRequests, auth, authTries, baseUrl} = this._resolveOptions(options);

            let request = (authToken) => {
                this.request.patch(requestId, this._resolveUrl(url, baseUrl, uriParams), queryParams, dataJson, {
                        responseDataType: accept,
                        requestDataType: contentType,
                        combineRequests,
                        authToken,
                        acceptLanguage: auth && auth.getAcceptLanguage()
                    },
                    (response) => {
                        resolve(response);
                    },
                    (err) => {
                        this._handleError(err, auth, reject, request, authTries);
                    });
            }

            auth ? auth.resolveToken().then(request).catch((err) => {
                reject(err);
            }) : request();
        })
    }

    put(requestId, url, data, options) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject();
                return;
            }

            let dataJson = JSON.stringify(data);
            let {queryParams, uriParams, accept, contentType, combineRequests, auth, authTries, baseUrl} = this._resolveOptions(options);

            let request = (authToken) => {
                this.request.put(requestId, this._resolveUrl(url, baseUrl, uriParams), queryParams, dataJson, {
                        responseDataType: accept,
                        requestDataType: contentType,
                        combineRequests,
                        authToken,
                        acceptLanguage: auth && auth.getAcceptLanguage()
                    },
                    (response) => {
                        resolve(response);
                    },
                    (err) => {
                        this._handleError(err, auth, reject, request, authTries);
                    });
            }

            auth ? auth.resolveToken().then(request).catch((err) => {
                reject(err);
            }) : request();
        })
    }

    delete(requestId, url, options) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject();
                return;
            }

            let {queryParams, uriParams, accept, combineRequests, auth, authTries, baseUrl} = this._resolveOptions(options);

            let request = (authToken) => {
                this.request.delete(requestId, this._resolveUrl(url, baseUrl, uriParams), queryParams, {
                        responseDataType: accept,
                        combineRequests,
                        authToken,
                        acceptLanguage: auth && auth.getAcceptLanguage()
                    },
                    (response) => {
                        resolve(response);
                    },
                    (err) => {
                        this._handleError(err, auth, reject, request, authTries);
                    });
            }

            auth ? auth.resolveToken().then(request).catch((err) => {
                //auth.signOut();
                reject(err);
            }) : request();
        })
    }


    abort(requestId) {
        this.request.abort(requestId);
    }

}

module.exports = new FetchUtils();