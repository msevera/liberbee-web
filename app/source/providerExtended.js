/**
 * Created by Mike on 6/10/2017.
 */
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';

export default class ProviderExtended extends Provider {
    static childContextTypes = Object.assign({}, Provider.childContextTypes, {
        auth: PropTypes.shape({
            isAuthenticated: PropTypes.bool
        }),
        routeResolver: PropTypes.object,
        gtm: PropTypes.object
    })

    getChildContext() {
        var context = super.getChildContext();
        context.auth = this.props.auth;
        context.gtm = this.props.gtm;
        context.routeResolver = this.props.routeResolver;
        return context;
    }
}