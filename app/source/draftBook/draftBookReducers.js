/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

import {combineReducers} from 'redux';
import {validationReducer} from '../shared/validation/validation';
import halson from 'halson';
import {
    initDraftBookAction,
    setAssignedDraftBookAction,
    draftBookAssociateSearchSetResutsAction,
    clearDraftBookAssociateResultsAction,
    moreBooksLoadedAction,
    resetFormsAction,
    setDraftBookAssociateSearchLoadingStatusAction,
    setAssociateLoadingStatusAction,
    setRemoveAssociateLoadingStatusAction,
    setAssignLoadingStatusAction,
    setPublishLoadingStatusAction,
    setSaveLoadingStatusAction,
    setCloneLoadingStatusAction,
    setDraftBookInitializedAction
} from './draftBookActions';

import {
    setDraftAuthorsAutocompleteAction,
    editAuthorInRevisionAction,
    removeAuthorFromRevisionAction,
    addAuthorToRevisionAction,
    setDraftAuthorFoundAction,
    setAuthorLoadingStatusAction
} from './authorsSelector/authorsSelectorActions';

import {
    setDraftPublishersAutocompleteAction,
    editPublisherInRevisionAction,
    removePublisherFromRevisionAction,
    addPublisherToRevisionAction,
    setDraftPublisherFoundAction,
    setPublisherLoadingStatusAction
} from './publishersSelector/publishersSelectorActions'
import {setCategoryLoadingStatusAction} from "../shared/categorySelector/categorySelectorActions";

export default {
    draftBook: combineReducers({
        general: (state = {
            initialized: false,
            actions: {
                removeDraftBook: null,
                associateDraftWithBook: null,
                removeBookAssociation: null,
                assignDraftToUser: null,
                removeDraftAssignee: null,
                loadMore: null,
                self: null
            }
        }, action) => {
            switch (action.type) {
                case setDraftBookInitializedAction.type: {
                    return {
                        ...state,
                        initialized: action.data
                    }
                }

                case draftBookAssociateSearchSetResutsAction.type: {
                    let searchResultHal = halson(action.data);

                    return {
                        ...state,
                        actions: {
                            ...state.actions,
                            loadMore: searchResultHal.getLink('next')
                        }
                    }
                }

                case setAssignedDraftBookAction.type:
                case initDraftBookAction.type: {
                    let draftBookHal = halson(action.data);
                    return {
                        ...state,
                        initialized: true,
                        actions: {
                            ...state.actions,
                            removeDraftBook: draftBookHal.getLink('removeDraftBook'),
                            associateDraftWithBook: draftBookHal.getLink('associateDraftWithBook'),
                            removeBookAssociation: draftBookHal.getLink('removeBookAssociation'),
                            assignDraftToUser: draftBookHal.getLink('assignDraftToUser'),
                            removeDraftAssignee: draftBookHal.getLink('removeDraftAssignee'),
                            self: draftBookHal.getLink('self')
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

                default: {
                    return state;
                }
            }
        },
        associates: (state = {books: [], searchInitiated: false, loading: false}, action) => {
            switch (action.type) {
                case setDraftBookAssociateSearchLoadingStatusAction.type: {
                    return {
                        ...state,
                        loading: action.data
                    }
                }

                case draftBookAssociateSearchSetResutsAction.type: {
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

                case clearDraftBookAssociateResultsAction.type: {
                    return {
                        ...state,
                        books: [],
                        searchInitiated: false
                    }
                }

                default: {
                    return state;
                }
            }
        },
        draft: (state = {
            _id: '',
            associateLoading: false,
            removeAssociateLoading: false,
            assignLoading: false,
            saveLoading: false,
            publishLoading: false,
            cloneLoading: false,
            categoryLoading: false,
            createCopy: null,
            book: null,
            createdBy: null,
            assignee: null,
            publishedRevision: null,
            publishDate: null,
            revisions: [],
            authorsAutocomplete: {
                suggestions: [],
                query: ''
            },
            publishersAutocomplete: {
                suggestions: [],
                query: ''
            },

        }, action) => {
            switch (action.type) {
                case setCategoryLoadingStatusAction.type: {
                    return {
                        ...state,
                        categoryLoading: action.data
                    }
                }

                case setCloneLoadingStatusAction.type: {
                    return {
                        ...state,
                        cloneLoading: action.data
                    }
                }

                case setPublishLoadingStatusAction.type: {
                    return {
                        ...state,
                        publishLoading: action.data
                    }
                }

                case setSaveLoadingStatusAction.type: {
                    return {
                        ...state,
                        saveLoading: action.data
                    }
                }

                case setAssociateLoadingStatusAction.type: {
                    return {
                        ...state,
                        associateLoading: action.data
                    }
                }

                case setRemoveAssociateLoadingStatusAction.type: {
                    return {
                        ...state,
                        removeAssociateLoading: action.data
                    }
                }

                case setAssignLoadingStatusAction.type: {
                    return {
                        ...state,
                        assignLoading: action.data
                    }
                }

                case initDraftBookAction.type: {
                    let draftBookHal = halson(action.data);

                    return {
                        ...state,
                        _id: draftBookHal._id,
                        createCopy: draftBookHal.createCopy,
                        publishedRevision: draftBookHal.publishedRevision,
                        publishDate: draftBookHal.publishDate,
                        book: draftBookHal.book,
                        createdBy: draftBookHal.createdBy,
                        assignee: draftBookHal.assignee,
                        revisions: draftBookHal.getEmbeds('revisions')
                    }
                }

                case setAssignedDraftBookAction.type: {
                    let draftBookHal = halson(action.data);
                    let revisions = draftBookHal.getEmbeds('revisions')
                    return {
                        ...state,
                        _id: draftBookHal._id,
                        createCopy: draftBookHal.createCopy,
                        publishedRevision: draftBookHal.publishedRevision,
                        publishDate: draftBookHal.publishDate,
                        book: draftBookHal.book,
                        createdBy: draftBookHal.createdBy,
                        assignee: draftBookHal.assignee,
                        revisions: revisions.map((rev) => {
                            let currentRev = state.revisions.find(curRev => curRev._id == rev._id);
                            if (!currentRev)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    authors: [...currentRev.data.authors],
                                    publishers: [...currentRev.data.publishers]
                                }
                            }
                        })
                    }
                }

                case setDraftAuthorsAutocompleteAction.type: {
                    let autocompleteHal = halson(action.data)
                    return {
                        ...state,
                        authorsAutocomplete: {
                            ...state.authorsAutocomplete,
                            suggestions: autocompleteHal.getEmbeds('authors'),
                            query: autocompleteHal.query
                        }
                    }
                }

                case setDraftPublishersAutocompleteAction.type: {
                    let autocompleteHal = halson(action.data)
                    return {
                        ...state,
                        publishersAutocomplete: {
                            ...state.publishersAutocomplete,
                            suggestions: autocompleteHal.getEmbeds('publishers'),
                            query: autocompleteHal.query
                        }
                    }
                }

                case setDraftAuthorFoundAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    authors: rev.data.authors.map((author, index) => {
                                        if (index != action.data.index)
                                            return author;

                                        return {
                                            ...author,
                                            found: action.data.found
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case setAuthorLoadingStatusAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    authors: rev.data.authors.map((author, index) => {
                                        if (index != action.data.index)
                                            return author;

                                        return {
                                            ...author,
                                            loading: action.data.loading
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case editAuthorInRevisionAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    authors: rev.data.authors.map((author, index) => {
                                        if (index != action.data.index)
                                            return author;

                                        return {
                                            ...author,
                                            name: action.data.name
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case addAuthorToRevisionAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    authors: [...rev.data.authors, {found: null, name: action.data.name}]
                                }
                            }
                        })
                    }
                }

                case removeAuthorFromRevisionAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    authors: rev.data.authors.filter((author, index) => {
                                        return index != action.data.index;
                                    })
                                }
                            }
                        })
                    }
                }


                case setDraftPublisherFoundAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    publishers: rev.data.publishers.map((publisher, index) => {
                                        if (index != action.data.index)
                                            return publisher;

                                        return {
                                            ...publisher,
                                            found: action.data.found
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case setPublisherLoadingStatusAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    publishers: rev.data.publishers.map((publisher, index) => {
                                        if (index != action.data.index)
                                            return publisher;

                                        return {
                                            ...publisher,
                                            loading: action.data.loading
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case editPublisherInRevisionAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    publishers: rev.data.publishers.map((publisher, index) => {
                                        if (index != action.data.index)
                                            return publisher;

                                        return {
                                            ...publisher,
                                            name: action.data.name
                                        }
                                    })
                                }
                            }
                        })
                    }
                }

                case addPublisherToRevisionAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    publishers: [...rev.data.publishers, {found: null, name: action.data.name}]
                                }
                            }
                        })
                    }
                }

                case removePublisherFromRevisionAction.type: {
                    return {
                        ...state,
                        revisions: state.revisions.map((rev) => {
                            if (action.data.revisionId != rev._id)
                                return rev;

                            return {
                                ...rev,
                                data: {
                                    ...rev.data,
                                    publishers: rev.data.publishers.filter((author, index) => {
                                        return index != action.data.index;
                                    })
                                }
                            }
                        })
                    }
                }

                case resetFormsAction.type: {
                    return {
                        ...state,
                    }
                }

                default:
                    return state;
            }
        },
        bookModel: validationReducer(
            {
                title: '',
                authors: [],
                publishers: [],
                publishDate: '',
                isbn10: '',
                isbn13: '',
                categories: '',
                languages: '',
                description: '',
                pages: '',
                bindings: '',
                popularity: 'avg'
            }, 'draftBook.bookModel'),
    })
}