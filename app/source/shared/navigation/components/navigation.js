/**
 * Created by Mike on 10/10/2017.
 */

'use strict';

import React from 'react';

class Navigation extends React.Component {
    render(){
        let {children} = this.props;

        return <ul className="nav">{children}</ul>
    }
}

export default Navigation;