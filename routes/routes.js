/**
 * Created by Mike on 4/5/2017.
 */

'use strict';

let security = require('../security/security');

class Routes {
    get controllerInstance() {
        return new this.ControllerClass();
    }

    constructor(controllerClass) {
        this.ControllerClass = controllerClass;
    }

    bindRouteTo(method, isSecure = true) {
        let result = [(req, res, next) => {
            console.log(this.ControllerClass.name, method);
            this.controllerInstance[method](req, res, next);
        }];

        if (isSecure) {
            result.unshift(security.csrfMiddleware);
        }

        return result;
    }
}

module.exports = Routes;