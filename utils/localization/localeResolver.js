/**
 * Created by Mike on 11/10/2017.
 */
class LocaleResolver {
    constructor(supportedLocales) {
        this.supportedLocales = supportedLocales;
        this.defaultLocale = supportedLocales.find(loc => loc.default).code;
        this.localePath = this._buildLocalePath(supportedLocales);
    }

    _buildLocalePath(supportedLocales) {
        let otherThanDefaultLocales = supportedLocales.filter(loc => !loc.default).map(loc => loc.code);
        return `/:locale(${otherThanDefaultLocales.join('|')})?`
    }

    getDefaultLocale() {
        return this.defaultLocale;
    }

    getLocalePath() {
        return this.localePath;
    }

    getSupportedLocales(){
        return this.supportedLocales;
    }

    applyLocaleToPath(locale, path) {
        if (locale != this.getDefaultLocale()) {
            return path == '/' ? `/${locale}` : `/${locale}${path}`;
        }

        return path;
    }
}

module.exports = LocaleResolver;