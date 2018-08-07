/**
 * Created by Mike on 5/27/2017.
 */

var assetsManifest = require('../manifest.json');

class AssetsLoader {
    constructor(){
        this.manifest = assetsManifest;
    }

    get(key){
        return this.manifest[key];
    }

    getAll(){
        return this.manifest;
    }
}

module.exports = new AssetsLoader();