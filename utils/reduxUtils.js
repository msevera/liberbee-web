class ReduxUtils{
    createAction(type){
        let action = (data) => {
            return {type, data}
        };

        action.type = type;
        return action;
    }

    createAsyncAction(actionFunc){
        return (...args) => {
            return (dispatch, getState, {auth, socket, routeResolver, gtm, errorHandler}) => {
                return actionFunc({dispatch, getState, auth, socket, routeResolver, gtm, errorHandler}, ...args);
            }
        }
    }
}

module.exports = new ReduxUtils();