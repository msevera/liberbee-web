/**
 * Created by Mike on 9/28/2017.
 */

import {required, year, isbnMultiple, limitCharsTo, decimal} from '../../../../utils/validation';

export const addBookManuallyFormVaidators = {
    title: {
        required
    },
    authors: {

    },
    publishers: {
        required
    },
    publishDate: {
        required,
        year
    },
    isbn: {
        isbnMultiple: isbnMultiple(',')
    },
    amount: {
        required,
        decimal
    },
    condition: {
        required
    }
};