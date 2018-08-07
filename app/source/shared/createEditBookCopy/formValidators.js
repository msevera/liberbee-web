/**
 * Created by Mike on 9/28/2017.
 */

import {required, decimal, htmlLimitCharsTo} from '../../../../utils/validation';

export const commentSymbolsCount = 100;
export const createEditBookCopyModelValidators = {
    amount: {
        required,
        decimal
    },
    condition: {
        required
    },
    comment: {
        htmlLimitCharsTo: htmlLimitCharsTo(commentSymbolsCount)
    }
}