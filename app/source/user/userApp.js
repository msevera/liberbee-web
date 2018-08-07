/**
 * Created by Mike on 6/5/2017.
 */

'use strict';

import userReducers from './userReducers';
import UserContainer from './components/userContainer';

export default {
    reducers: userReducers,
    container: UserContainer
}