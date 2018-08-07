/**
 * Created by Mike on 10/11/2017.
 */

'use strict';

import React from 'react';
import RouteExtended from './routeExtended';
import NotFound from "./status/notFound";

export default () => (
    <RouteExtended status={404} component={NotFound}/>
)