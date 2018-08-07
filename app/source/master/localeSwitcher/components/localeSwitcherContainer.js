/**
 * Created by Mike on 11/2/2017.
 */
/**
 * Created by Mike on 10/31/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {withRouter, Link, NavLink} from 'react-router-dom';
import PropTypes from 'prop-types';
import cookies from 'js-cookie';
import {withTools} from '../../../hoc';

class LocaleSwitcher extends React.Component {
    /* static contextTypes = {
     router: PropTypes.object.isRequired
     }*/
    onSwitchLocale = (locale) => {
        let {location, routeResolver} = this.props;

        let routeData = routeResolver.changeRouteLocale(locale.code, location.pathname);

        let newUrl = `${routeData.pathname}${location.search}`;
        window.location = newUrl;
        var b = 0;
        //cookies.set('language', locale.code);
        //window.location.reload()
    }

    render() {
        let {locale} = this.props;
        return <ul className="menu">
            {
                locale.items.map((l) => {
                    return <li key={l.code} onClick={() => this.onSwitchLocale(l)}>
                        <span>{l.text}</span>
                    </li>
                })
            }
        </ul>
    }
}

const mapStateToProps = (state) => {
    return {
        locale: state.master.app.locale
    }
}

const mapDispatchToProps = {}

export default withTools(connect(mapStateToProps, mapDispatchToProps)(LocaleSwitcher));
