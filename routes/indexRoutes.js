/**
 * Created by Mike on 3/29/2017.
 */

'use strict';
let IndexController = require('../controllers/indexController'),
    security = require('../security/security'),
    Routes = require('./routes');


class IndexRoutes extends Routes {
    constructor(app){
        super(IndexController)

        app.route('*')
            .get(super.bindRouteTo('indexAction'))
            .post(super.bindRouteTo('indexAction'));

    }
}

module.exports = IndexRoutes;