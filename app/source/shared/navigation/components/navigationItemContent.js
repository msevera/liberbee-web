/**
 * Created by Mike on 10/10/2017.
 */

'use strict';

import React from 'react';

class NavigationItemContent extends React.Component {
    render(){
        let {children} = this.props;
        return <div className="nav--itemContent">{children}</div>
    }
}

export default NavigationItemContent;