/**
 * Created by Mike on 9/19/2017.
 */


'use strict';

import reduxUtils from '../../../../utils/reduxUtils';
import fetchUtils from '../../../../utils/fetchUtils';
import history from '../../../../utils/history';
import halson from 'halson';
import {removeDraftBook} from '../../shared/createEditBookManually/createEditBookManuallyActions';

export const setDraftBooksAction = reduxUtils.createAction('SET_DRAFT_BOOKS');
export const draftBookRemovedAction = reduxUtils.createAction('DRAFT_BOOK_REMOVED_ACTION');
export const setDraftBooksFacetValueAction = reduxUtils.createAction('SET_DRAFT_BOOKS_FACET_VALUE');
export const setDraftBooksInitializedAction = reduxUtils.createAction('SET_USER_DRAFT_BOOKS_INITIALIZED');

let populateHistory = (result, user, routeResolver) => {
    let queryStringArray = [];
    result.resolved && result.resolved.length > 0 && queryStringArray.push(`resolved=${result.resolved.join(',')}`);
    result.page && result.page > 1 && queryStringArray.push(`page=${result.page}`);

    let queryString = queryStringArray.length > 0 ? `?${queryStringArray.join('&')}` : '';

    let urlToPush = routeResolver.buildRouteFor('pending', {user: user.slug}).pathname;
    if (queryString) {
        urlToPush = `${urlToPush}${queryString}`;
    }

    history.push(urlToPush, routeResolver.getReloadState('pending', {reload: true}));
}

export const loadDraftBooksAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, routeResolver, gtm}, {facetsParams, page, history}) => {
    let state = getState();
    let actions = state.master.general.actions;
    let user = state.master.user;
    let queryParams = {};

    if (page > 1) {
        queryParams.page = page;
    }

    if (!facetsParams) {
        state.userData.draftBooks.facets.reduce((result, facet) => {
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
    } else {
        queryParams = {...queryParams, ...facetsParams};
    }

    return actions.getDraftBooks ?
        fetchUtils.call(actions.getDraftBooks, auth, queryParams).then((result) => {
            dispatch(setDraftBooksAction(result));

            let draftBooks = halson(result).getEmbeds('draftBooks');
            if (draftBooks.length == 0 && queryParams.page && queryParams.page > 1) {
                return dispatch(loadDraftBooksAction({facetsParams, history}))
            } else {
                history && populateHistory(result, user, routeResolver);
            }
        }).catch((err) => {
            dispatch(setDraftBooksInitializedAction(true));
            console.log('Load draft books failed', err);
        }) :
        Promise.resolve();
});

export const removeBookDraftAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, intl, bookDraftAction) => {
    let state = getState();
    let page = state.userData.draftBooks.page;

    return bookDraftAction && removeDraftBook(dispatch, auth, intl, gtm, bookDraftAction, false)
        .then((draftBook) => {
            dispatch(draftBookRemovedAction(draftBook));
            dispatch(loadDraftBooksAction({page, history: true}))
        })
        .catch((err) => {
            console.log('Load books failed', err);
        })
});
