/**
 * Created by Mike on 9/24/2017.
 */

'use strict';

import addBookReducers from './addBookReducers';
import AddBookContainer from './components/addBookContainer';

export default {
    reducers: addBookReducers,
    container: AddBookContainer
}