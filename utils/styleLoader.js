/**
 * Created by Mike on 5/25/2017.
 */
class StyleLoader{
    constructor(file){
        this.isLoaded = false;
        this.file = file;
        this.assets = typeof window != 'undefined' && window.__ASSETS__;
    }

    load(){
        if (!!this.isLoaded || !this.assets){
            return;
        }

        this.isLoaded = true;

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '/' + this.assets['css/' + this.file + '.scss'];
        document.head.appendChild(link);
    }
}

module.exports = StyleLoader;