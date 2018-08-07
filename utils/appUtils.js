/**
 * Created by Mike on 5/9/2017.
 */

class AppUtils {
    get isBrowser(){
        return process.env.APP_ENV === 'browser';
    }

    get isProduction(){
        return process.env.NODE_ENV === 'production';
    }

    get appFolder(){
        return this.isProduction ? 'build': 'source';
    }
}

module.exports = new AppUtils();