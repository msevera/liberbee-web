/**
 * Created by Mike on 9/19/2017.
 */

'use strict';

import {setDraftBooksAction, draftBookRemovedAction, setDraftBooksFacetValueAction, setDraftBooksInitializedAction} from './draftBooksActions';
import halson from 'halson';

export default (state = {
    initialized: false,
    books: [],
    facets: [],
    from: 0,
    size: 0,
    total: 0,
    page: 0
}, action) => {
    switch (action.type) {
        case setDraftBooksInitializedAction.type: {
            return {
                ...state,
                initialized: action.data
            }
        }

        case setDraftBooksAction.type: {
            let dataHal = halson(action.data)

            return {
                ...state,
                initialized: true,
                books: dataHal.getEmbeds('draftBooks'),
                facets: dataHal.getEmbeds('facets'),
                user: dataHal.user,
                from: dataHal.from,
                size: dataHal.size,
                total: dataHal.total,
                page: dataHal.page
            }
        }

        case draftBookRemovedAction.type: {
            return {
                ...state,
                books: state.books.filter((draftBook) => {
                    if (draftBook._id != action.data._id) {
                        return action.data;
                    }
                })
            }
        }

        case setDraftBooksFacetValueAction.type: {
            return {
                ...state,
                facets: state.facets.map((facet) => {
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

        default:
            return state;
    }
}