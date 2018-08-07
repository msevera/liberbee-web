/**
 * Created by Mike on 11/10/2017.
 */

let EnhancedEcommerce = require('./enhancedEcommerce');

class GTM {
    constructor(routeResolver) {
        this.routeResolver = routeResolver;
        this.enabled = !!window.dataLayer;
        this.ee = new EnhancedEcommerce(this.enabled);

    }

    sendPageView(){
        if (!this.enabled)
            return;

        window.dataLayer.push({
            event: 'pageView'
        })
    }

    sendCustomPageView(pagePath){
        if (!this.enabled)
            return;

        window.dataLayer.push({
            event: 'virtualPageView',
            virtualPagePath: this.routeResolver.applyLocaleToPath(`/${pagePath}`)
        })
    }

    sendVirtualPageView(virtualPage) {
        if (!this.enabled)
            return;

        window.dataLayer.push({
            event: 'virtualPageView',
            virtualPagePath: this.routeResolver.applyLocaleToPath(`/virtual/${virtualPage}`)
        })
    }

    sendSearch(query, category) {
        if (!this.enabled)
            return;

        let searchParams = [];
        if (query) {
            searchParams.push(`query=${query}`);
        }

        if (category) {
            searchParams.push(`category=${category}`)
        }

        searchParams.length > 0 && window.dataLayer.push({
            event: 'virtualPageView',
            virtualPagePath: this.routeResolver.applyLocaleToPath(`/virtual/search?${searchParams.join('&')}`)
        })
    }

    sendEvent(eventName, data){ if (!this.enabled)
        return;

        let event = {event: eventName, ...data}
        window.dataLayer.push(event);
    }


    setUser(gaUserId) {
        if (!this.enabled)
            return;

        window.dataLayer.push({
            gaUserId
        })
    }
}

module.exports = GTM;