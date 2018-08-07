/**
 * Created by Mike on 10/10/2017.
 */

'use strict';

import React from 'react';

class NavigationItemMenu extends React.Component {
    render(){
        let {children, show} = this.props;
        return <div className={'nav--menu' + (show ? ' nav--menu-is-visible': '')}>{children}</div>
    }
}

export default NavigationItemMenu;