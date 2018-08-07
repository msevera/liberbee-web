/**
 * Created by Mike on 6/5/2017.
 */

'use strict';

import {combineReducers} from 'redux';
import {
    bookCopyRemovedAction,
    setMyBooksAction,
    setFavoriteBooksAction,
    initUserDataAction,
    updateEditedBookCopyAction,
    updateEditedDraftBookAction,
    setUserInitializedAction,
    setBooksInitializedAction,
    setFavoritesInitializedAction,
    setNotFoundAction
} from './userActions';
import {bookAddedToFavorites, bookRemovedFromFavorites} from '../master/masterActions';
import {setGetBookCopyLoadingStatusAction} from '../master/getBook/getBookActions';
import {draftBookRemovedAction} from './draftBooks/draftBooksActions';
import {setShowCreateEditBookCopyLoadingStatusAction} from '../shared/createEditBookCopy/createEditBookCopyActions';
import halson from 'halson';
import draftBooksReducers from './draftBooks/draftBooksReducers';
import updateInfoReducers from './updateInfo/updateInfoReducers';
import userSettingsReducers from './userSettings/userSettingsReducers';

export default {
    userData: combineReducers({
        general: (state = {
            notFound: false,
            initialized: false,
            actions: {
                createBook: null,
                getUserBookCopies: null,
                getFavoriteBooks: null,
                updateInfo: null,
                setSettings: null
            }
        }, action) => {
            switch (action.type) {
                case setNotFoundAction.type: {
                    return {
                        ...state,
                        notFound: action.data
                    }
                }

                case setUserInitializedAction.type: {
                    return {
                        ...state,
                        initialized: action.data
                    }
                }

                case initUserDataAction.type: {
                    let userHal = halson(action.data);
                    return {
                        ...state,
                        notFound: false,
                        initialized: true,
                        actions: {
                            ...state.actions,
                            createBook: userHal.getLink('createBook'),
                            getUserBookCopies: userHal.getLink('getUserBookCopies'),
                            getFavoriteBooks: userHal.getLink('getFavoriteBooks'),
                            getDraftBooks: userHal.getLink('getDraftBooks'),
                            updateInfo: userHal.getLink('updateInfo'),
                            setSettings: userHal.getLink('setSettings')
                        }
                    }
                }

                default: {
                    return state;
                }
            }
        },
        user: (state = {
            name: '',
            email: '',
            slug: '',
            photo: '',
            geo: null,
            settings: null,
            stats: {
                received: 0,
                sent: 0
            }
        }, action) => {
            switch (action.type) {
                case initUserDataAction.type: {
                    let userHal = halson(action.data);
                    return {
                        ...state,
                        email: userHal.email,
                        name: userHal.name,
                        slug: userHal.slug,
                        photo: userHal.photo,
                        settings: userHal.settings,
                        geo: userHal.geo,
                        stats: userHal.stats,
                    }
                }

                default: {
                    return state;
                }
            }
        },
        favorite: (state = {books: [], initialized: false}, action) => {
            switch (action.type) {
                case setFavoritesInitializedAction.type: {
                    return {
                        ...state,
                        initialized: action.data
                    }
                }

                case setFavoriteBooksAction.type: {
                    let dataHal = halson(action.data)

                    return {
                        ...state,
                        initialized: true,
                        books: dataHal.getEmbeds('favoriteBooks')
                    }
                }

                case bookRemovedFromFavorites.type: {
                    let bookHal = halson(action.data);
                    return {
                        ...state,
                        books: state.books.filter((book) => {
                            return book._id != bookHal._id;
                        })
                    }
                }

                default:
                    return state;
            }
        },
        draftBooks: draftBooksReducers,
        updateInfo: updateInfoReducers,
        userSettings: userSettingsReducers,
        books: (state = {bookCopies: [], draftBooks: [], count: 0, initialized: false}, action) => {
            switch (action.type) {
                case setBooksInitializedAction.type: {
                    return {
                        ...state,
                        initialized: action.data
                    }
                }

                case setMyBooksAction.type: {
                    let bookCopiesHal = halson(action.data);
                    let bookCopies = bookCopiesHal.getEmbeds('bookCopies');
                    let draftBooks = bookCopiesHal.getEmbeds('draftBooks');

                    return {
                        ...state,
                        initialized: true,
                        bookCopies,
                        draftBooks,
                        count: bookCopies.length
                    }
                }

                case initUserDataAction.type: {
                    let userHal = halson(action.data);
                    return {
                        ...state,
                        count: userHal.bookCopies
                    }
                }


                case updateEditedBookCopyAction.type: {
                    return {
                        ...state,
                        bookCopies: state.bookCopies.map((bc) => {
                            if (bc._id != action.data._id)
                                return bc;

                            return {
                                ...bc,
                                comment: action.data.comment,
                                condition: action.data.condition,
                                deal: action.data.deal
                            }
                        })
                    }
                }

                case updateEditedDraftBookAction.type: {
                    return {
                        ...state,
                        draftBooks: state.draftBooks.map((db) => {
                            if (db._id != action.data._id)
                                return db;

                            return {
                                ...action.data
                            }
                        })
                    }
                }

                case draftBookRemovedAction.type: {
                    let draftBooks = state.draftBooks.filter((draftBook) => {
                        if (draftBook._id != action.data._id) {
                            return action.data;
                        }
                    })

                    return {
                        ...state,
                        draftBooks
                    }
                }

                case bookCopyRemovedAction.type: {
                    let bookCopies = state.bookCopies.filter((book) => {
                        if (book._id != action.data._id) {
                            return action.data;
                        }
                    })

                    return {
                        ...state,
                        bookCopies,
                        count: bookCopies.length
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

                case setShowCreateEditBookCopyLoadingStatusAction.type: {
                    return {
                        ...state,
                        bookCopies: state.bookCopies.map((bookCopy) => {
                            let bookCopyHal = halson(bookCopy);
                            let book = bookCopyHal.getEmbed('book');

                            if (book._id != action.data.bookId)
                                return bookCopy;

                            return {
                                ...bookCopy,
                                loading: action.data.loading
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