/**
 * Created by Mike on 5/10/2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ComponentExtended extends Component{
    static contextTypes = {
        store: PropTypes.object.isRequired,
        router: PropTypes.object.isRequired,
        gtm: PropTypes.object.isRequired,
    }

    static loadData(dispatch){
    }

    componentDidMount(){
        let {location} = this.context.router.route;
        let {history} = this.context.router;
        let {gtm} = this.context;


        if (location.state && location.state[this.constructor.id]) {
            location.state[this.constructor.id] = false;
        }

        if (!this.constructor.renderedOnServer && this.constructor.loadData &&
            (this.constructor.reloadOnPop || (!this.constructor.reloadOnPop && history.action != 'POP') )){
            this.constructor.loadData(this.props, this.context).then(() => {
                this.trackPageView && gtm.sendPageView();
            });
        }else{
            this.constructor.initialized && this.constructor.initialized(this.context);
            this.trackPageView && gtm.sendPageView();
        }

        this.constructor.renderedOnServer = false;

        if (typeof window != 'undefined'){
            window.scrollTo(0, 0);
        }
    }

    componentDidUpdate() {
        let {location} = this.context.router.route;
        let {history} = this.context.router;
        let {gtm} = this.context;

        let isPopAndReload = (location.state && location.state[this.constructor.id] && location.state[this.constructor.id].reload && history.action == 'POP');
        let isRedirect = location.state && location.state[this.constructor.id] && location.state[this.constructor.id].redirect;

        if (isPopAndReload || isRedirect) {
            if (this.constructor.loadData)
            {
                this.constructor.loadData(this.props, this.context).then(() => {
                    this.trackPageView && !this.trackPageView.onlyOnLoad && gtm.sendPageView();
                });
            }else{
                this.trackPageView && !this.trackPageView.onlyOnLoad && gtm.sendPageView();
            }

            if(location.state[this.constructor.id].reload){
                location.state[this.constructor.id].reload = false;
            }

            if(location.state[this.constructor.id].redirect){
                location.state[this.constructor.id].redirect = false;
            }
        }
    }
}