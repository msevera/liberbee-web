    /**
 * Created by Mike on 5/14/2017.
 */

'use strict';
let SecurityController = require('../controllers/securityController'),
    security = require('../security/security'),
    passport = require('passport'),
    Routes = require('./routes');


class SecurityRoutes extends Routes {
    constructor(app, localeResolver) {
        super(SecurityController)

        app.route('/updateToken')
            .post(super.bindRouteTo('updateToken'));

        app.route('/login')
            .post(super.bindRouteTo('signin'));

        app.route(`${localeResolver.getLocalePath()}/signout`)
            .get(super.bindRouteTo('signout'));

        app.route('/auth/social/associatewithpassword').post(super.bindRouteTo('associateWithPassword'))

        app.route(`${localeResolver.getLocalePath()}/auth/facebook`)
            .get(security.facebookToken);

        app.route('/auth/facebook/callback').get(super.bindRouteTo('signinFacebook'));

        app.route(`${localeResolver.getLocalePath()}/auth/google`)
            .get(security.googleToken);

        app.route('/auth/google/callback').get(super.bindRouteTo('signinGoogle'));
    }
}

module.exports = SecurityRoutes;