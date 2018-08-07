/**
 * Created by Mike on 9/28/2017.
 */

import {htmlLimitCharsTo, htmlLimitWordsFrom, htmlRequired} from '../../../../utils/validation';

export const messageSymbolsCount = 300;
export const messageWordsCount = 5;

export const requestModelFormValidators = {
    message: {
        htmlRequired,
        htmlLimitCharsTo: htmlLimitCharsTo(messageSymbolsCount),
        //htmlLimitWordsFrom: htmlLimitWordsFrom(messageWordsCount)
    }
}