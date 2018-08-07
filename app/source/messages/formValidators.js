/**
 * Created by Mike on 9/28/2017.
 */

import {htmlLimitCharsTo, htmlRequired} from '../../../utils/validation';

export const conversationMessageFormValidators = {
    message: {
        htmlLimitCharsTo: htmlLimitCharsTo(300),
        htmlRequired
    }
}