/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

import {combineReducers} from 'redux';
import halson from 'halson';
import {
    initBookInfoAction,
    setInitializedAction,
    setNotFoundAction,
    setEditBookLoadingStatusAction,
    setBookRatingAction
} from './bookInfoActions';
import {
    bookAddedToFavorites,
    bookRemovedFromFavorites,
    setAddRemoveToFavoritesLoadingStatusAction
} from '../master/masterActions';
import {setGetBookCopyLoadingStatusAction} from '../master/getBook/getBookActions';
import {
    setShowCreateEditBookCopyLoadingStatusAction,
    setRemoveBookCopyLoadingStatusAction
} from '../shared/createEditBookCopy/createEditBookCopyActions';
import bookReviewsReducers from './bookReviews/bookReviewsReducers';

export default {
    bookInfo: combineReducers({
        bookReviews: bookReviewsReducers,
        general: (state = {
            notFound: false,
            initialized: false,
            rawBook: null,
            title: '',
            cover: {
                resource: '',
                ol: false
            },
            slug: '',
            rating: null,
            myRating: null,
            languages: '',
            authors: [],
            publishers: [],
            publishDate: null,
            bookCopies: null,
            facets: [],
            description: '',
            showCreateEditBookCopyLoading: false,
            addRemoveFromFavoritesLoading: false,
            editBookLoading: false,
            removeBookCopyLoading: false,
            actions: {
                createBookCopy: null,
                removeBookCopy: null,
                addToFavorites: null,
                removeFromFavorites: null,
                publishBook: null,
                unpublishBook: null,
                rateBook: null,
                createDraftFromBook: null
            }
        }, action) => {
            switch (action.type) {
                case setBookRatingAction.type: {
                    return {
                        ...state,
                        rating: action.data.rating,
                        myRating: action.data.myRating
                    }
                }

                case setNotFoundAction.type: {
                    return {
                        ...state,
                        notFound: action.data
                    }
                }

                case setInitializedAction.type: {
                    return {
                        ...state,
                        initialized: action.data
                    }
                }

                case setEditBookLoadingStatusAction.type: {
                    return {
                        ...state,
                        editBookLoading: action.data
                    }
                }

                case setAddRemoveToFavoritesLoadingStatusAction.type: {
                    return {
                        ...state,
                        addRemoveFromFavoritesLoading: action.data.loading
                    }
                }

                case setShowCreateEditBookCopyLoadingStatusAction.type: {
                    return {
                        ...state,
                        showCreateEditBookCopyLoading: action.data.loading
                    }
                }

                case setRemoveBookCopyLoadingStatusAction.type: {
                    return {
                        ...state,
                        removeBookCopyLoading: action.data.loading
                    }
                }

                case initBookInfoAction.type: {
                    let dataHal = halson(action.data);

                    return {
                        ...state,
                        initialized: true,
                        notFound: false,
                        rawBook: action.data,
                        _id: dataHal._id,
                        slug: dataHal.slug,
                        title: dataHal.title,
                        cover: dataHal.cover,
                        rating: dataHal.rating,
                        myRating: dataHal.myRating,
                        sourceUrl: dataHal.sourceUrl,
                        languages: dataHal.languages,
                        publishers: dataHal.getEmbeds('publishers'),
                        publishDate: dataHal.publishDate,
                        authors: dataHal.getEmbeds('authors'),
                        bookCopies: dataHal.getEmbeds('bookCopies'),
                        facets: dataHal.getEmbeds('facets'),
                        geo: dataHal.geo,
                        favorite: dataHal.favorite,
                        description: dataHal.description,
                        published: dataHal.published,
                        actions: {
                            ...state.actions,
                            createBookCopy: dataHal.getLink('createBookCopy'),
                            removeBookCopy: dataHal.getLink('removeBookCopy'),
                            removeFromFavorites: dataHal.getLink('removeFromFavorites'),
                            addToFavorites: dataHal.getLink('addToFavorites'),
                            publishBook: dataHal.getLink('publishBook'),
                            unpublishBook: dataHal.getLink('unpublishBook'),
                            rateBook: dataHal.getLink('rateBook'),
                            createDraftFromBook: dataHal.getLink('createDraftFromBook'),
                            self: dataHal.getLink('self')
                        },
                    }
                }

                case bookAddedToFavorites.type: {
                    let dataHal = halson(action.data);

                    return {
                        ...state,
                        favorite: true,
                        actions: {
                            ...state.actions,
                            createBookCopy: dataHal.getLink('createBookCopy'),
                            removeBookCopy: dataHal.getLink('removeBookCopy'),
                            removeFromFavorites: dataHal.getLink('removeFromFavorites'),
                            addToFavorites: dataHal.getLink('addToFavorites'),
                            self: dataHal.getLink('self')
                        }
                    }
                }

                case bookRemovedFromFavorites.type: {
                    let dataHal = halson(action.data);

                    return {
                        ...state,
                        favorite: false,
                        actions: {
                            ...state.actions,
                            createBookCopy: dataHal.getLink('createBookCopy'),
                            removeBookCopy: dataHal.getLink('removeBookCopy'),
                            removeFromFavorites: dataHal.getLink('removeFromFavorites'),
                            addToFavorites: dataHal.getLink('addToFavorites'),
                            self: dataHal.getLink('self')
                        }
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

                default:
                    return state;
            }
        }
    })
}