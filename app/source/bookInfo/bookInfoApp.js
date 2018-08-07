/**
 * Created by Mike on 5/21/2017.
 */

'use strict';

import bookInfoReducers from './bookInfoReducers';
import BookInfoContainer from './components/bookInfoContainer';

export default {
    reducers: bookInfoReducers,
    container: BookInfoContainer
}