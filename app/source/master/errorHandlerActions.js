import {setRequiredInfoAction, showSpecifyRequiredInfoAction} from "./masterActions";
import reduxUtils from "../../../utils/reduxUtils";
import {defineMessages} from 'react-intl';
import {addMessage} from "./notifier/notifierActions";

const messages = defineMessages({
    bookNotActiveError: {
        id: 'error.bookNotActiveError',
        defaultMessage: 'Book "<b>{title}</b>" is not active anymore'
    }
})

export const handleBookNotActiveError = reduxUtils.createAsyncAction(({dispatch, getState, auth}, error, intl) => {
    let text = intl.formatMessage(messages.bookNotActiveError, {
        title: error.errors.title
    });

    dispatch(addMessage({text, type: 'error', messageType: 'html'}));
});