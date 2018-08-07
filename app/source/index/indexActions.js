/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

import fetchUtils from '../../../utils/fetchUtils';
import reduxUtils from '../../../utils/reduxUtils';
import halson from 'halson';
import history from '../../../utils/history';
import {debounce} from 'throttle-debounce';

export const initIndexAction = reduxUtils.createAction('INIT_INDEX');
export const filterIndexAction = reduxUtils.createAction('FILTER_INDEX');
export const setPlacesAutocompleteAction = reduxUtils.createAction('SET_PLACES_AUTOCOMPLETE');
export const setPlaceTextAction = reduxUtils.createAction('SET_PLACE_TEXT');
export const setPlaceSlugAction = reduxUtils.createAction('SET_PLACE_SLUG');
export const setQueryTextAction = reduxUtils.createAction('SET_SEARCH_QUERY_TEXT');
export const setSearchFacetValueAction = reduxUtils.createAction('SET_SEARCH_FACET_VALUE');
export const setSearchSortCriteriaActiveAction = reduxUtils.createAction('SET_SEARCH_SORT_CRITERIA_ACTIVE');
export const setSearchCategoryActiveAction = reduxUtils.createAction('SET_SEARCH_CATEGORY_ACTIVE');
export const moreBooksLoadedAction = reduxUtils.createAction('MORE_BOOKS_LOADED');
export const setSelectedCategoryAction = reduxUtils.createAction('SET_SELECTED_CATEGORY');
export const setSearchLoadingStatusAction = reduxUtils.createAction('SET_SEARCH_LOADING_STATUS');
export const setSearchContentLoadingStatusAction = reduxUtils.createAction('SET_SEARCH_CONTENT_LOADING_STATUS');
export const setInitializedAction = reduxUtils.createAction('SET_INDEX_INITIALIZED');
export const setNotFoundAction = reduxUtils.createAction('SET_INDEX_NOT_FOUND');

let populateHistory = (result, routeResolver) => {
    let queryStringArray = [];
    result.query && queryStringArray.push(`q=${result.query}`);
    result.lang && queryStringArray.push(`lang=${result.lang}`);
    result.sort && queryStringArray.push(`sort=${result.sort}`);
    result.geo && queryStringArray.push(`place=${result.geo.slug}`);

    let urlToPush = routeResolver.buildRouteFor('index', {}).pathname;
    let queryString = queryStringArray.length > 0 ? `?${queryStringArray.join('&')}` : '';

    if (!result.category && queryString) {
        urlToPush = `${routeResolver.buildRouteFor('index', {0: 'books'}).pathname}${queryString}`;
    }

    if (result.category) {
        urlToPush = `${routeResolver.buildRouteFor('index', {
            category: `books/${result.category}`,
        }).pathname}${queryString}`;
    }

    history.push(urlToPush, routeResolver.getReloadState('index', {reload: true}));
}

export const filterBooksAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {history}) => {
    let state = getState();
    let actions = state.master.general.actions;
    if (actions.getBooks) {
        dispatch(setSearchContentLoadingStatusAction(true))
        let {query, place} = state.index.search.response;

        let queryParams = {q: query, facets: true};

        if (place.slug) {
            queryParams.geo = place.slug;
        }

        state.index.search.facets.reduce((result, facet) => {
            let facetValues = facet.values
                .filter((facetItem) => {
                    return facetItem.selected;
                })
                .map((facetItem) => {
                    return facetItem.key
                })
                .join(',');

            if (facetValues) {
                result[facet.key] = facetValues;
            }

            return result;
        }, queryParams);

        state.index.search.sortCriterias.reduce((result, criteria) => {
            if (criteria.selected) {
                result['sort'] = criteria.key;
            }

            return result;
        }, queryParams);

        let selectedCategory = getSelectedCategory(state);
        if (selectedCategory) {
            queryParams.category = selectedCategory
        }


        return fetchUtils.call(actions.getBooks, auth, queryParams, {combineRequests: true}).then((result) => {
            console.log('Index filtered');

            if (gtm) {
                let books = halson(result).getEmbeds('books');
                gtm.ee.impressions(books, result.category, result.page, result.size);
            }

            dispatch(filterIndexAction(result));

            history && populateHistory(result, routeResolver);

        }).catch((err) => {
            console.log('Index filter failed', err);
            dispatch(setSearchContentLoadingStatusAction(false))
        })
    }
})

let getSelectedCategory = (state) => {
    let selectedCategory = state.index.search.categories.items.find(c => c.selected);
    let selectedAncestor = state.index.search.categories.ancestors.find(c => c.selected);
    if (selectedCategory) {
        return selectedCategory.slug;
    } else if (selectedAncestor) {
        return selectedAncestor.slug;
    }
}

export const searchBooksAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}, {searchQuery, placeSlug, placeText, facetsParams, sortQuery, history, page, category}, {track = false, searchLoading = true}) => {
    let state = getState();
    let actions = halson(state.master.general.actions);

    if (actions.getBooks) {
        searchLoading && dispatch(setSearchLoadingStatusAction(true))
        dispatch(setSearchContentLoadingStatusAction(true))

        let queryParams = {q: searchQuery, facets: true};

        if (placeSlug) {
            queryParams.geo = placeSlug;
        }

        if (facetsParams) {
            queryParams = {...queryParams, ...facetsParams};
        }

        if (sortQuery) {
            queryParams.sort = sortQuery;
        }

        if (page) {
            queryParams.page = page;
        }

        if (category) {
            queryParams.category = category;
        }

        if (track) {
            gtm && gtm.sendSearch(searchQuery, placeSlug);
            gtm && (searchQuery || placeSlug) && gtm.sendEvent('onSearch', {placeSlug: placeSlug || undefined, searchTerm: searchQuery || undefined});
        }


        return fetchUtils.call(actions.getBooks, auth, queryParams, {combineRequests: true}).then((result) => {
            console.log('Index loaded');

            if (gtm) {
                let books = halson(result).getEmbeds('books');
                gtm.ee.impressions(books, result.category, result.page, result.size);
            }

            if (placeText) {
                result.geo.text = placeText;

                if (placeText != state.index.search.place.text) {
                    dispatch(placeAutocompleteAction(placeText));
                }
            }

            dispatch(initIndexAction(result));


            history && populateHistory(result, routeResolver);
        }).catch((err) => {
            if (err.statusCode == 404)
            {
                dispatch(setNotFoundAction(true))
            }
            console.log('Index load failed', err);
            dispatch(setSearchLoadingStatusAction(false))
            dispatch(setSearchContentLoadingStatusAction(false))
        })
    }
})

let callAutocomplete = (fetchUtils, state, dispatch, auth, placesAutocompleteURI, place) => {
    return fetchUtils.call(placesAutocompleteURI, auth, {q: place}, {combineRequests: true}).then((result) => {
        console.log('placesAutocomplete loaded', result);
        dispatch(setPlacesAutocompleteAction(result));
    }).catch(() => {
        console.log('placesAutocomplete failed');
    })
}

callAutocomplete = debounce(300, callAutocomplete);

export const placeAutocompleteAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, place) => {
    let state = getState();
    let actions = halson(state.master.general.actions);

    dispatch(setPlaceTextAction(place));

    callAutocomplete(fetchUtils, state, dispatch, auth, actions.placesAutocomplete, place);
})

export const loadMoreAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, loadMoreURI) => {
    if (loadMoreURI) {
        return fetchUtils.call(loadMoreURI, auth).then((result) => {
            dispatch(moreBooksLoadedAction(result));

            if (gtm) {
                let books = getState().index.search.books;
                gtm.ee.impressions(books, result.category, 1, result.size);
            }
        }).catch((err) => {
            console.log(err);
        })
    }
})


