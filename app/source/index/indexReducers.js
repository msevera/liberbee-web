/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

import halson from 'halson';

import {
    initIndexAction,
    filterIndexAction,
    setPlacesAutocompleteAction,
    setPlaceTextAction,
    setPlaceSlugAction,
    setQueryTextAction,
    setSearchFacetValueAction,
    setSearchSortCriteriaActiveAction,
    moreBooksLoadedAction,
    setSearchCategoryActiveAction,
    setSelectedCategoryAction,
    setSearchLoadingStatusAction,
    setSearchContentLoadingStatusAction,
    setInitializedAction,
    setNotFoundAction
} from './indexActions';
import {bookAddedToFavorites, bookRemovedFromFavorites} from '../master/masterActions';

export default {
    index: (state = {
        initialized: false,
        nonFound: false,
        search: {
            loading: false,
            contentLoading: false,
            response: {
                query: '',
                page: 1,
                size: 30,
                category: '',
                lang: [],
                sort: null,
                place: {
                    text: '',
                    slug: ''
                },
            },
            books: [],
            facets: [],
            sortCriterias: [],
            categories: {
                items: [],
                ancestors: []
            },
            query: '',
            place: {
                text: '',
                slug: ''
            },
            actions: {
                loadMore: null,
                loadPrev: null,
            },
            total: 0
        },
        placesAutocomplete: {
            suggestions: [],
            query: ''
        }
    }, action) => {
        switch (action.type) {
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

            case setSearchLoadingStatusAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        loading: action.data
                    }
                }
            }

            case setSearchContentLoadingStatusAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        contentLoading: action.data
                    }
                }
            }

            case setSelectedCategoryAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        categories: {
                            ...state.search.categories,
                            ancestors: state.search.categories.ancestors.map((cat) => {
                                return {
                                    ...cat,
                                    loading: cat.slug == action.data,
                                    selected: cat.slug == action.data
                                }
                            }),
                            items: state.search.categories.items.map((cat) => {
                                return {
                                    ...cat,
                                    loading: cat.slug == action.data,
                                    selected: cat.slug == action.data
                                }
                            })
                        }
                    }
                }
            }

            case initIndexAction.type: {
                let dataHal = halson(action.data);

                return {
                    ...state,
                    initialized: true,
                    notFound: false,
                    search: {
                        ...state.search,
                        loading: false,
                        contentLoading: false,
                        books: dataHal.getEmbeds('books'),
                        facets: dataHal.getEmbeds('facets'),
                        sortCriterias: dataHal.getEmbeds('sortCriterias'),
                        categories: dataHal.getEmbed('categories'),
                        query: dataHal.query,
                        total: dataHal.total,
                        place: dataHal.geo ? dataHal.geo : {
                            text: '',
                            slug: ''
                        },
                        actions: {
                            ...state.search.actions,
                            loadMore: dataHal.getLink('next'),
                            loadPrev: dataHal.getLink('prev')
                        },
                        response: {
                            ...state.search.response,
                            category: dataHal.category,
                            query: dataHal.query,
                            page: dataHal.page,
                            lang: dataHal.lang,
                            sort: dataHal.sort,
                            size: dataHal.size,
                            place: dataHal.geo ? dataHal.geo : {
                                text: '',
                                slug: ''
                            }
                        }
                    }
                }
            }

            case moreBooksLoadedAction.type: {
                let dataHal = halson(action.data);
                return {
                    ...state,
                    search: {
                        ...state.search,
                        books: state.search.books.concat(dataHal.getEmbeds('books')),
                        facets: dataHal.getEmbeds('facets'),
                        sortCriterias: dataHal.getEmbeds('sortCriterias'),
                        categories: dataHal.getEmbed('categories'),
                        query: dataHal.query,
                       /* place: dataHal.geo ? dataHal.geo : {
                            text: '',
                            slug: ''
                        },*/
                        actions: {
                            ...state.search.actions,
                            loadMore: dataHal.getLink('next'),
                            loadPrev: dataHal.getLink('prev')
                        },
                        response: {
                            ...state.search.response,
                            query: dataHal.query,
                            place: dataHal.geo ? dataHal.geo : {
                                text: '',
                                slug: ''
                            },
                            category: dataHal.category,
                            sort: dataHal.sort,
                            lang: dataHal.lang,
                            page: dataHal.page
                        }
                    }
                }
            }

            case filterIndexAction.type: {
                let dataHal = halson(action.data);

                return {
                    ...state,
                    search: {
                        ...state.search,
                        contentLoading: false,
                        books: dataHal.getEmbeds('books'),
                        facets: dataHal.getEmbeds('facets'),
                        categories: dataHal.getEmbed('categories'),
                        actions: {
                            ...state.search.actions,
                            loadMore: dataHal.getLink('next'),
                            loadPrev: dataHal.getLink('prev')
                        },
                        total: dataHal.total,
                        response: {
                            ...state.search.response,
                            query: dataHal.query,
                            place: dataHal.geo ? dataHal.geo : {
                                text: '',
                                slug: ''
                            },
                            category: dataHal.category,
                            sort: dataHal.sort,
                            page: dataHal.page,
                            lang: dataHal.lang
                        }
                    }
                }
            }

            case setSearchSortCriteriaActiveAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        sortCriterias: state.search.sortCriterias.map((criteria) => {
                            return {
                                ...criteria,
                                selected: criteria.key == action.data.key
                            }
                        })
                    }
                }
            }

            case setSearchCategoryActiveAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        categories: {
                            ...state.search.categories,
                            items: state.search.categories.items.map((category) => {
                                return {
                                    ...category,
                                    selected: action.data ? category.slug == action.data.slug : false
                                }
                            }),
                            ancestors: state.search.categories.ancestors.map((category) => {
                                return {
                                    ...category,
                                    selected: action.data ? category.slug == action.data.slug : false
                                }
                            }),
                        }
                    }
                }
            }

            case setSearchFacetValueAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        facets: state.search.facets.map((facet) => {
                            if (facet.key != action.data.facet.key)
                                return facet;

                            return {
                                ...facet,
                                values: facet.values.map((facetItem) => {
                                    if (facetItem.key != action.data.facetItem.key)
                                        return facetItem;

                                    return {
                                        ...facetItem,
                                        selected: !facetItem.selected
                                    }
                                })
                            }


                        })
                    }
                }
            }

            case setQueryTextAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        query: action.data
                    }
                }
            }

            case setPlacesAutocompleteAction.type: {
                return {
                    ...state,
                    placesAutocomplete: {
                        ...state.placesAutocomplete,
                        suggestions: action.data,
                        query: action.data.query
                    }
                }
            }

            case setPlaceTextAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        place: {
                            ...state.search.place,
                            text: action.data
                        }
                    }
                }
            }

            case setPlaceSlugAction.type: {
                return {
                    ...state,
                    search: {
                        ...state.search,
                        place: {
                            ...state.search.place,
                            slug: action.data
                        }
                    }
                }
            }

            case bookAddedToFavorites.type: {
                let bookHal = halson(action.data);
                return {
                    ...state,
                    search: {
                        ...state.search,
                        books: state.search.books.map((book) => {
                            if (book._id != bookHal._id){
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
            }

            case bookRemovedFromFavorites.type: {
                let bookHal = halson(action.data);
                return {
                    ...state,
                    search: {
                        ...state.search,
                        books: state.search.books.map((book) => {
                            if (book._id != bookHal._id){
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
            }

            default:
                return state;
        }
    }

}
