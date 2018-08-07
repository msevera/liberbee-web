/**
 * Created by Mike on 11/1/2017.
 */

let fs = require('fs');
let path = require('path');
let areIntlLocalesSupported = require('intl-locales-supported');

class Localization {
    constructor() {
        this.locales = [{
            code: 'uk',
            text: 'Українська',
            short: 'Укр',
            default: true
        }, {
            code: 'en',
            text: 'English',
            short: 'Eng'

        }, {
            code: 'ru',
            text: 'Русский',
            short: 'Рус '
        }];

        this._polifyll();
    }

    _polifyll() {
        if (global.Intl) {
            // Determine if the built-in `Intl` has the locale data we need.
            if (!areIntlLocalesSupported(this.locales.map(l => l.code))) {
                // `Intl` exists, but it doesn't have the data we need, so load the
                // polyfill and replace the constructors we need with the polyfill's.
                require('intl');
                Intl.NumberFormat = IntlPolyfill.NumberFormat;
                Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
            }
        } else {
            // No `Intl`, so use and load the polyfill.
            global.Intl = require('intl');
        }
    }

    init() {

        this.localesData = this.locales.reduce((result, locale) => {
            result[locale.code] = {
                locale: locale.code,
                //messages: require(`../../resources/localization/${locale.code}.json`),
                localeData: fs.readFileSync(path.join(__dirname, `../../node_modules/react-intl/locale-data/${locale.code}.js`)).toString()
            }

            return result;
        }, {})
    }

    getLocales() {
        return this.locales;
    }

    getSupportedLocales() {
        return this.locales.map((loc) => {
            return {
                code: loc.code,
                default: loc.default
            };
        })
    }

    getLocalizationFor(locale) {
        let data = this.localesData[locale];

        return {
            locale: data.locale,
            messages: data.messages
        }
    }

    getLocaleDatFor(locale) {
        let data = this.localesData[locale];

        return data.localeData;
    }
}

module.exports = new Localization();