import fetchUtils from "../../../../utils/fetchUtils";
import {debounce} from 'throttle-debounce';
import halson from 'halson';

let callAuthorsAutocomplete = (fetchUtils, state, dispatch, auth, authorsAutocompleteURI, author, resolve, reject) => {
    fetchUtils
        .call(authorsAutocompleteURI, auth, {q: author}, {combineRequests: true})
        .then((result) => {
            console.log('authorsAutocomplete loaded', result);
            resolve(result)
        })
        .catch((err) => {
            reject(err)
        })
}

callAuthorsAutocomplete = debounce(300, callAuthorsAutocomplete);

export const authorsAutocomplete = (dispatch, getState, auth, author) => {
    return new Promise((resolve, reject) => {
        let state = getState();
        let actions = halson(state.master.general.actions);

        callAuthorsAutocomplete(fetchUtils, state, dispatch, auth, actions.authorsAutocomplete, author, resolve, reject);
    })
}


let callPublishersAutocomplete = (fetchUtils, state, dispatch, auth, publishersAutocompleteURI, publisher, resolve, reject) => {
    return fetchUtils.call(publishersAutocompleteURI, auth, {
        q: publisher
    }, {combineRequests: true})
        .then((result) => {
            console.log('publishersAutocomplete loaded', result);
            resolve(result);
        })
        .catch((err) => {
            reject(err);
        })
}

callPublishersAutocomplete = debounce(300, callPublishersAutocomplete);

export const publishersAutocomplete = (dispatch, getState, auth, publisher) => {
    return new Promise((resolve, reject) => {
        let state = getState();
        let actions = halson(state.master.general.actions);

        callPublishersAutocomplete(fetchUtils, state, dispatch, auth, actions.publishersAutocomplete, publisher, resolve, reject);
    })
}


let callPlacesAutocomplete = (fetchUtils, state, dispatch, auth, placesAutocompleteURI, place, types, resolve, reject) => {
    fetchUtils
        .call(placesAutocompleteURI, auth, {q: place, types}, {combineRequests: true})
        .then((result) => {
            console.log('placesAutocomplete loaded', result);
            resolve(result)
        })
        .catch((err) => {
            reject(err)
        })
}

callPlacesAutocomplete = debounce(300, callPlacesAutocomplete);

export const placesAutocomplete = (dispatch, getState, auth, place, types) => {
    return new Promise((resolve, reject) => {
        let state = getState();
        let actions = halson(state.master.general.actions);

        callPlacesAutocomplete(fetchUtils, state, dispatch, auth, actions.placesAutocomplete, place, types, resolve, reject);
    })
}