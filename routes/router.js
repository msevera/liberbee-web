/**
 * Created by Mike on 4/5/2017.
 */

'use strict';

let IndexRoutes = require('./indexRoutes'),
    SecurityRoutes = require('./securityRoutes');

class Router{
    constructor(app, localeResolver){
        this.app = app;
        this.localeResolver = localeResolver;
    }

    registerRoutes(){
        new SecurityRoutes(this.app, this.localeResolver);
        new IndexRoutes(this.app, this.localeResolver);

        this.app.use(function(req, res) {
            res.status(404).send({url: req.originalUrl + ' not found'})
        })
    }
}

module.exports = Router;