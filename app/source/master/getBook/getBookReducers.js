/**
 * Created by Mike on 10/3/2017.
 */

'use strict';

import {combineReducers} from 'redux';
import {validationReducer} from '../../shared/validation/validation';
import {
    setUserBookCopiesAction, showGetBookPopupAction, setValidatedDealRequestAction,
    setCreateDealRequestLoadingStatusAction, setGetBookCopyLoadingStatusAction
} from './getBookActions';
import {bookAddedToFavorites, bookRemovedFromFavorites} from '../../master/masterActions';
import halson from 'halson';

export default combineReducers({
    general: (state = {
        show: false,
        user: null,
        loading: false,
        bookCopies: [],
        inRequest: []
    }, action) => {
        switch (action.type) {
            case setCreateDealRequestLoadingStatusAction.type: {
                return {
                    ...state,
                    loading: action.data
                }
            }

            case setGetBookCopyLoadingStatusAction.type: {
                return {
                    ...state,
                    bookCopies: state.bookCopies.map((bookCopy) => {
                        if (bookCopy._id != action.data.bookCopyId)
                            return bookCopy;


                        return {
                            ...bookCopy,
                            loading: action.data.loading
                        }
                    })
                }
            }

            case setUserBookCopiesAction.type: {
                let dataHal = halson(action.data)
                let bookCopies = dataHal.getEmbeds('bookCopies')

                return {
                    ...state,
                    user: dataHal.getEmbed('user'),
                    bookCopies: bookCopies.map((bookCopy) => {
                        if (!state.inRequest.includes(bookCopy._id)) {
                            return {
                                ...bookCopy,
                                isAddedToRequest: false
                            };
                        }

                        return {
                            ...bookCopy,
                            isAddedToRequest: true
                        }
                    })
                }
            }

            case setValidatedDealRequestAction.type: {
                let dataHal = halson(action.data)
                let dealRequestLines = dataHal.getEmbeds('dealRequestLines').map(dealRequetLine => {
                    let bookCopySnapshot = halson(dealRequetLine).getEmbed('bookCopySnapshot')
                    return bookCopySnapshot._id;
                });

                return {
                    ...state,
                    inRequest: dealRequestLines,
                    bookCopies: state.bookCopies.map((bookCopy) => {
                        if (!dealRequestLines.includes(bookCopy._id)) {
                            return {
                                ...bookCopy,
                                isAddedToRequest: false
                            };
                        }

                        return {
                            ...bookCopy,
                            isAddedToRequest: true
                        }
                    })
                }
            }

            case showGetBookPopupAction.type: {
                return action.data ? {
                    ...state,
                    show: action.data
                } : {
                    ...state,
                    show: action.data,
                    user: null,
                    bookCopies: [],
                    inRequest: []
                }
            }

            case bookAddedToFavorites.type: {
                let bookHal = halson(action.data);
                return {
                    ...state,
                    bookCopies: state.bookCopies.map((bookCopy) => {
                        let book = halson(bookCopy).getEmbed('book');
                        if (book._id != bookHal._id) {
                            return bookCopy;
                        }

                        return {
                            ...bookCopy,
                            _embedded: {
                                ...bookCopy._embedded,
                                book: {
                                    ...bookCopy._embedded.book,
                                    favorite: true,
                                    _links: bookHal._links
                                }
                            }
                        }
                    })
                }
            }

            case bookRemovedFromFavorites.type: {
                let bookHal = halson(action.data);
                return {
                    ...state,
                    bookCopies: state.bookCopies.map((bookCopy) => {
                        let book = halson(bookCopy).getEmbed('book');
                        if (book._id != bookHal._id) {
                            return bookCopy;
                        }

                        return {
                            ...bookCopy,
                            _embedded: {
                                ...bookCopy._embedded,
                                book: {
                                    ...bookCopy._embedded.book,
                                    favorite: false,
                                    _links: bookHal._links
                                }
                            }
                        }
                    })
                }
            }

            default:
                return state;
        }
    },
    requestModel: validationReducer(
        {
            message: ''
        }, 'master.getBook.requestModel'),
})