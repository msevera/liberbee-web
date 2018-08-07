/**
 * Created by Mike on 4/13/2017.
 */

global.__SERVER__ = true;

let express = require('express'),
    config = require('config'),
    Web = require('./web');

let web = new Web(express(), config.get('web.localServerPort'));
web.start();

