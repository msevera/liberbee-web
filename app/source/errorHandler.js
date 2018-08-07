/**
 * Created by Mike on 10/13/2017.
 */

import {handleRequiredInfoError} from './master/masterActions';
import {handleBookNotActiveError} from './master/errorHandlerActions';

class ErrorHandler {
    setStore(store){
        this.store = store;
    }

    setIntl(intl){
        this.intl = intl;
    }

    handle(err) {
        if (err && err.body){
            switch (err.body.name){
                case 'UserRequiredInfo': {
                    this.store.dispatch(handleRequiredInfoError(err.body))
                    break;
                }

                case 'BookNotActive': {
                    this.store.dispatch(handleBookNotActiveError(err.body, this.intl))
                    break;
                }
            }
        }
    }
}

export default ErrorHandler;