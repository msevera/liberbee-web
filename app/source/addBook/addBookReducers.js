/**
 * Created by Mike on 9/24/2017.
 */

'use strict';

import halson from 'halson';
import {combineReducers} from 'redux';
import {
    addBookSearchSetResultsAction,
    bookCreatedAction,
    bookCopyCreatedAction,
    clearAddBookResultsAction,
    moreBooksLoadedAction,
    setAddBookSearchLoadingStatus
} from './addBookActions';
import {setShowCreateEditBookCopyLoadingStatusAction} from '../shared/createEditBookCopy/createEditBookCopyActions';
import {bookAddedToFavorites, bookRemovedFromFavorites} from '../master/masterActions';

export default {
    addBook: combineReducers({
        general: (state = {
            actions: {
                loadMore: null
            }
        }, action) => {
            switch (action.type) {
                case addBookSearchSetResultsAction.type: {
                    let searchResultHal = halson(action.data);

                    return {
                        ...state,
                        actions: {
                            ...state.actions,
                            loadMore: searchResultHal.getLink('next')
                        }
                    }
                }

                case moreBooksLoadedAction.type: {
                    let dataHal = halson(action.data);
                    return {
                        ...state,
                        actions: {
                            ...state.actions,
                            loadMore: dataHal.getLink('next')
                        }
                    }
                }

                default:
                    return state;
            }
        },
        search: (state = {books: [], searchInitiated: false, searchLoadingStatus: false}, action) => {
            switch (action.type) {
                case setAddBookSearchLoadingStatus.type : {
                    return {
                        ...state,
                        searchLoadingStatus: action.data
                    }
                }

                case addBookSearchSetResultsAction.type: {
                    let searchResultHal = halson(action.data);

                    return {
                        ...state,
                        books: searchResultHal.getEmbeds('books'),
                        searchInitiated: true
                    }
                }

                case moreBooksLoadedAction.type: {
                    let dataHal = halson(action.data);
                    return {
                        ...state,
                        books: state.books.concat(dataHal.getEmbeds('books'))
                    }
                }

                case bookCreatedAction.type:
                case bookCopyCreatedAction.type: {
                    return {
                        ...state,
                        books: state.books.map((book) => {
                            if (book._id == action.data._id) {
                                return action.data;
                            }

                            return book;
                        })
                    }
                }

                case clearAddBookResultsAction.type: {
                    return {
                        ...state,
                        books: [],
                        searchInitiated: false
                    }
                }

                case bookAddedToFavorites.type: {
                    let bookHal = halson(action.data);
                    return {
                        ...state,
                        books: state.books.map((book) => {
                            if (book._id != bookHal._id) {
                                return book;
                            }

                            return {
                                ...book,
                                favorite: true,
                                _links: bookHal._links
                            }
                        })
                    }
                }

                case bookRemovedFromFavorites.type: {
                    let bookHal = halson(action.data);
                    return {
                        ...state,
                        books: state.books.map((book) => {
                            if (book._id != bookHal._id) {
                                return book;
                            }

                            return {
                                ...book,
                                favorite: false,
                                _links: bookHal._links
                            }
                        })
                    }
                }

                case setShowCreateEditBookCopyLoadingStatusAction.type: {
                    return {
                        ...state,
                        books: state.books.map((book) => {
                            if (book._id != action.data.bookId) {
                                return book;
                            }

                            return {
                                ...book,
                                loading: action.data.loading,
                            }
                        })
                    }
                }

                default:
                    return state;
            }
        }
    })
}