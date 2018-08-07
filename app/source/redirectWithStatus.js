/**
 * Created by Mike on 10/11/2017.
 */

'use strict';

import React from 'react';
import {Redirect, Route} from 'react-router-dom';

export default ({ from, to, exact, status=301 }) => (
    <Route render={({ staticContext }) => {
        // there is no `staticContext` on the client, so
        // we need to guard against that here
        if (staticContext)
            staticContext.status = status
        return <Redirect from={from} to={to} exact/>
    }}/>
)