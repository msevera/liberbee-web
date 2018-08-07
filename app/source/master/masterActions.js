/**
 * Created by Mike on 5/16/2017.
 */

'use strict';

import reduxUtils from '../../../utils/reduxUtils';
import fetchUtils from '../../../utils/fetchUtils';
import halson from 'halson';
import {setValidatorValueAndMessage, setFormMessage} from '../shared/validation/actions';
import {debounce} from 'throttle-debounce';
import popupTools from 'popup-tools';
import {messages as validationMessages} from '../shared/validation/messages';
import {setCreateDealRequestLoadingStatusAction} from "./getBook/getBookActions";
import {addMessage} from "./notifier/notifierActions";
import {defineMessages} from 'react-intl';

export const setUserAction = reduxUtils.createAction('SET_USER');
export const setUserAuthentication = reduxUtils.createAction('SET_USER_AUTHENTICATION');
export const setLocale = reduxUtils.createAction('SET_LOCALE');
export const setApiDataAction = reduxUtils.createAction('SET_API_DATA');
export const setWebDataAction = reduxUtils.createAction('SET_WEB_DATA');
export const setAppRoutes = reduxUtils.createAction('SET_APP_ROUTES');
export const setRootAction = reduxUtils.createAction('SET_ROOT');
export const showSigninAction = reduxUtils.createAction('SHOW_SIGNIN');
export const showSignupAction = reduxUtils.createAction('SHOW_SIGNUP');
export const showForgotPasswordAction = reduxUtils.createAction('SHOW_FORGOT_PASSWORD');
export const setUserLocationGeoAutocompleteAction = reduxUtils.createAction('SET_USER_LOCATION');
export const setUserLocationSpecifiedAction = reduxUtils.createAction('SET_USER_LOCATION_SPECIFIED');
export const setTutorialCompletedAction = reduxUtils.createAction('SET_TUTORIAL_COMPLETED');
export const showSpecifyRequiredInfoAction = reduxUtils.createAction('SHOW_SPECIFY_REQUIRED_INFO');
export const setRequiredInfoAction = reduxUtils.createAction('SET_REQUIRED_INFO');
export const bookAddedToFavorites = reduxUtils.createAction('BOOK_ADDED_TO_FAVORITES');
export const bookRemovedFromFavorites = reduxUtils.createAction('BOOK_REMOVED_FROM_FAVORITES');
export const setResendEmailVerificationStatusAction = reduxUtils.createAction('SET_RESEND_EMAIL_VERIFICATION_STATUS');
export const setPasswordRecoverySendStatusAction = reduxUtils.createAction('SET_PASSWORD_RECOVERY_SEND_STATUS');
export const showEmailConfirmationResultAction = reduxUtils.createAction('SHOW_EMAIL_CONFIRMATION_RESULT');
export const setPasswordRecoveryTokenVerificationStatusAction = reduxUtils.createAction('SET_PASSWORD_RECOVERY_TOKEN_VERIFICATION_STATUS');
export const setEmailConfirmedAction = reduxUtils.createAction('SET_EMAIL_CONFIRMED_ACTION');
export const showSocialSigninAction = reduxUtils.createAction('SHOW_SOCIAL_SIGNIN');
export const setSocialSigninAction = reduxUtils.createAction('SET_SOCIAL_SIGNIN');
export const showSocialSigninAssociateAction = reduxUtils.createAction('SHOW_SOCIAL_SIGNIN_ASSOCIATE');
export const setSocialSigninAssociateAction = reduxUtils.createAction('SET_SOCIAL_SIGNIN_ASSOCIATE');
export const resetSocialSigninAssociateAction = reduxUtils.createAction('RESET_SOCIAL_SIGNIN_ASSOCIATE');
export const setAddRemoveToFavoritesLoadingStatusAction = reduxUtils.createAction('SET_ADD_REMOVE_TO_FAVORITES_LOADING_STATUS_ACTION');
export const setSignInLoadingStatusAction = reduxUtils.createAction('SET_SIGN_IN_LOADING_STATUS');
export const setSignUpLoadingStatusAction = reduxUtils.createAction('SET_SIGN_UP_LOADING_STATUS');
export const setResetPasswordLoadingStatusAction = reduxUtils.createAction('SET_RESET_PASSWORD_LOADING_STATUS');

const messages = defineMessages({
    addToFavoritesFailed: {
        id: 'master.addToFavoritesFailed',
        defaultMessage: 'Add to favorites failed'
    },
    removeFromFavoritesFailed: {
        id: 'master.removeFromFavoritesFailed',
        defaultMessage: 'Remove from favorites failed'
    }
})

export const onSocialSignInAssociateAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {password}, intl) => {
    let state = getState();
    let token = state.master.socialSignInAssociate.token;
    let provider = state.master.socialSignInAssociate.provider;

    return auth.associateWithPassword({token, password, provider})
        .then(() => {
            dispatch(resetSocialSigninAssociateAction());
            location.reload();
        })
        .catch((err) => {
            if (err.body.name == 'InvalidPassword') {
                dispatch(setValidatorValueAndMessage({
                    model: 'master.socialSigninAssociateForm',
                    prop: 'password',
                    message: intl.formatMessage(validationMessages.passwordNotValid)
                }));
            }
        });
});

export const facebookSigninAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, routeResolver, type) => {
    let wnd = popupTools.popup(routeResolver.applyLocaleToPath('/auth/facebook'), 'Facebook', {
        width: 400,
        height: 300
    }, function (err, data) {
        // this executes when closed
        if (err) {
            // Closed by user
        } else {
            // Data returned by the server
            if (data.success) {
                if (type == 'signup') {
                    gtm.sendVirtualPageView('user/registered');
                }
                gtm.sendEvent(type == 'signin' ? 'loggedIn' : 'signedUp', {authProvider: 'facebook'});
                location.reload();
            } else {
                console.log(data.err)
                wnd.close();

                if (data.err && data.err.body.name == 'EmailNotConfirmed') {
                    dispatch(showSigninAction(false))
                    dispatch(showSignupAction(false))
                    dispatch(showSocialSigninAssociateAction(true))
                    dispatch(setSocialSigninAssociateAction(data.err.body.errors))
                }
            }
        }
    });
});

export const googleSigninAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, routeResolver, type) => {
    let wnd = popupTools.popup(routeResolver.applyLocaleToPath('/auth/google'), 'Google', {
        width: 400,
        height: 400
    }, function (err, data) {
        // this executes when closed
        if (err) {
            // Closed by user
        } else {
            // Data returned by the server
            if (data.success) {
                if (type == 'signup') {
                    gtm.sendVirtualPageView('user/registered');
                }
                gtm.sendEvent(type == 'signin' ? 'loggedIn' : 'signedUp', {authProvider: 'google'});
                location.reload();
            } else {
                console.log(data.err)
                wnd.close();

                if (data.err && data.err.body.name == 'EmailNotConfirmed') {
                    dispatch(showSigninAction(false))
                    dispatch(showSignupAction(false))
                    dispatch(showSocialSigninAssociateAction(true))
                    dispatch(setSocialSigninAssociateAction(data.err.body.errors))
                }
            }
        }
    });
});

export const signInAction = reduxUtils.createAsyncAction(({dispatch, auth, gtm}, {email, password}, intl, track = true) => {
    dispatch(setSignInLoadingStatusAction(true));
    return auth.signIn({email, password})
        .then(() => {
            track && gtm.sendEvent('loggedIn', {authProvider: 'liberbee'})
            dispatch(showSigninAction(false));
            location.reload();

        }).catch((err) => {
            if (err.body.error_description.type == 'SocialUserExists') {
                dispatch(showSigninAction(false));
                dispatch(setSocialSigninAction(err.body.error_description));
                dispatch(showSocialSigninAction(true));
            } else {
                dispatch(setFormMessage({
                    model: 'master.signin',
                    message: intl.formatMessage(validationMessages.credentialsNotValid)
                }));
            }
        }).then(() => {
            dispatch(setSignInLoadingStatusAction(false));
        });
});

export const signUpAction = reduxUtils.createAsyncAction(({dispatch, auth, getState, gtm}, {name, email, password}, intl) => {
    let state = getState();
    let actions = state.master.general.actions;

    if (actions.createUser) {
        dispatch(setSignUpLoadingStatusAction(true));
        return fetchUtils.call(actions.createUser, auth, {name, email, password}).then((result) => {
            gtm.sendVirtualPageView('user/registered');
            gtm.sendEvent('signedUp', {authProvider: 'liberbee'})
            console.log('User registered success');
            dispatch(showSignupAction(false));
            return dispatch(signInAction({email, password}, intl, false));
        }).catch((err) => {
            if (err.body.name == 'SocialUserExists') {
                dispatch(showSignupAction(false));
                dispatch(setSocialSigninAction(err.body.errors));
                dispatch(showSocialSigninAction(true));
            }


            if (err.body.name == 'ValidationError') {
                let allowedErrorKeys = ['name', 'password', 'email'];
                Object.keys(err.body.errors).forEach((key) => {
                    let error = err.body.errors[key];
                    let prop = error.path == 'hashedPassword' ? 'password' : error.path;

                    allowedErrorKeys.includes(prop) && dispatch(setValidatorValueAndMessage({
                        model: 'master.signup',
                        prop,
                        message: intl.formatMessage(validationMessages[error.message])
                    }));
                })
            }
            console.log('User registered failed');
        }).then(() => {
            dispatch(setSignUpLoadingStatusAction(false));
        })
    }
});

export const initData = reduxUtils.createAsyncAction(({dispatch, auth}, data) => {
    return Promise.all([
        dispatch(setApiDataAction(data.apiData)),
        dispatch(setWebDataAction(data.webData)),
        dispatch(setUserAuthentication(data.user)),
        dispatch(setLocale(data.locale)),
        dispatch(setAppRoutes(data.appRoutes))]);
});

export const initRoot = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    return fetchUtils.get('loadRoot', '/', {auth}).then((data) => {
        dispatch(setRootAction(data));
        return Promise.resolve(dispatch(getMe()));
    }).catch((err) => {
        console.log('Root actions failed', err);
    })
});

export const getMe = reduxUtils.createAsyncAction(({dispatch, auth, getState}) => {
    let actions = getState().master.general.actions;
    if (actions.getMe) {
        return fetchUtils.call(actions.getMe, auth).then((result) => {
            dispatch(setUserAction(result));
        })
    }
});

let callAutocomplete = (fetchUtils, state, dispatch, auth, placesAutocompleteURI, place) => {
    return fetchUtils.call(placesAutocompleteURI, auth, {
        q: place,
        types: 'city'
    }, {combineRequests: true}).then((result) => {
        console.log('placesAutocomplete loaded', result);
        dispatch(setUserLocationGeoAutocompleteAction(result));
    }).catch(() => {
        console.log('placesAutocomplete failed');
    })
}

callAutocomplete = debounce(300, callAutocomplete);

export const userLocationGeoAutocompleteAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, place) => {
    let state = getState();
    let actions = halson(state.master.general.actions);

    callAutocomplete(fetchUtils, state, dispatch, auth, actions.placesAutocomplete, place);
})

export const userLocationGeoSetLocationAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, data) => {
    let state = getState();
    let actions = state.master.general.actions;

    dispatch(setUserLocationSpecifiedAction());
    if (actions.setLocation) {
        fetchUtils.call(actions.setLocation, auth, {cityId: data._id}).then((result) => {
            dispatch(setUserLocationSpecifiedAction());
            dispatch(setUserAction(result));
            console.log('set location success');
        }).catch(() => {
            console.log('set location failed');
        })
    }
})

export const completeTutorialAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, wizardStatus) => {
    let state = getState();
    let actions = state.master.general.actions;

    dispatch(setTutorialCompletedAction());
    if (actions.completeTutorial) {
        fetchUtils.call(actions.completeTutorial, auth).then((result) => {
            gtm.sendVirtualPageView('wizard/complete')
            gtm.sendEvent('wizardCompleted', {wizardStatus: wizardStatus.length > 0 ? wizardStatus.sort((a, b) => a.length - b.length).join('/') : undefined});
            dispatch(setTutorialCompletedAction());
            console.log('set location success');
        }).catch(() => {
            console.log('set location failed');
        })
    }
});

export const handleRequiredInfoError = reduxUtils.createAsyncAction(({dispatch, getState, auth}, error) => {
    let requiredDataObj = {};
    let showSpecifyRequiredInfo = false;

    if (error.errors.EmailIsNotConfirmed) {
        requiredDataObj.emailConfirmed = false;
        showSpecifyRequiredInfo = true;
    }

    if (error.errors.UserLocationRequired) {
        requiredDataObj.userGeoCompleted = false;
        showSpecifyRequiredInfo = true;
    }

    if (showSpecifyRequiredInfo) {
        dispatch(setRequiredInfoAction(requiredDataObj));
        dispatch(showSpecifyRequiredInfoAction(true));
    }
});

export const addToFavoritesAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, addToFavaroritesURI, bookId, bookURI, bookSlug) => {
    dispatch(setAddRemoveToFavoritesLoadingStatusAction({
        bookId,
        bookSlug,
        loading: true
    }))
    return fetchUtils.post('addToFavorite', '/users/me/favorites', {bookId}, {auth})
        .then(() => {
            gtm.sendEvent('addedToFavorites', {bookSlug, userId: auth.userId});
            return fetchUtils.call(bookURI, auth).then((book) => {
                dispatch(bookAddedToFavorites(book));
            })
        })
        .catch((err) => {
            if (err && err.statusCode != 403) {
                let title = intl.formatMessage(messages.addToFavoritesFailed);
                let text = '';
                if (err.body && err.body.message) {
                    text = err.body.message;
                }
                dispatch(addMessage({text, title, type: 'error'}));
            }
            dispatch(setCreateDealRequestLoadingStatusAction(false))
        }).then(() => {
            dispatch(setAddRemoveToFavoritesLoadingStatusAction({
                bookId,
                bookSlug,
                loading: false
            }))
        });
});

export const removeFromFavoritesAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, intl, removeFromFavaroritesURI, bookId, bookURI, bookSlug) => {
    dispatch(setAddRemoveToFavoritesLoadingStatusAction({
        bookId,
        bookSlug,
        loading: true
    }))
    return fetchUtils.call(removeFromFavaroritesURI, auth)
        .then(() => {
            gtm.sendEvent('removedFromFavorites', {bookSlug, userId: auth.userId});
            return fetchUtils.call(bookURI, auth).then((book) => {
                dispatch(bookRemovedFromFavorites(book));
            })
        }).catch((err) => {
            let title = intl.formatMessage(messages.removeFromFavoritesFailed);
            let text = '';
            if (err.body && err.body.message) {
                text = err.body.message;
            }
            dispatch(addMessage({text, title, type: 'error'}));
            dispatch(setCreateDealRequestLoadingStatusAction(false))
        }).then(() => {
            dispatch(setAddRemoveToFavoritesLoadingStatusAction({
                bookId,
                bookSlug,
                loading: false
            }))
        });
});

export const confirmEmailAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {token}) => {
    let actions = getState().master.general.actions;

    return fetchUtils.call(actions.confirmEmail, auth, {token})
        .then(() => {
            dispatch(setEmailConfirmedAction());
            dispatch(showEmailConfirmationResultAction({show: true, status: 'success'}));
        }).catch((err) => {
            if (err.body && err.body.name == 'EmailAlreadyConfirmed') {
                return dispatch(showEmailConfirmationResultAction({show: true, status: 'already_confirmed'}))
            }

            if (err.body && err.body.name == 'IncorrectVerificationToken') {
                return dispatch(showEmailConfirmationResultAction({show: true, status: 'invalid_token'}))
            }
        });
});

export const generateEmailVerificationTokenAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}) => {
    let actions = getState().master.general.actions;

    return fetchUtils.call(actions.generateEmailVerificationToken, auth)
        .then(() => {
            dispatch(setResendEmailVerificationStatusAction({status: 'success'}))
        }).catch((err) => {
            if (err.body && err.body.name == 'EmailAlreadyConfirmed') {
                dispatch(setResendEmailVerificationStatusAction({status: 'already_confirmed'}))
            } else {
                dispatch(setResendEmailVerificationStatusAction({status: 'error'}))
            }

        });
});

export const forgotPasswordSendEmailAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, gtm}, {email}, intl) => {
    dispatch(setResetPasswordLoadingStatusAction(true));
    let actions = getState().master.general.actions;

    return fetchUtils.call(actions.generatePasswordRecoveryToken, auth, {email})
        .then(() => {
            gtm.sendEvent('forgotPasswordSent');
            dispatch(setPasswordRecoverySendStatusAction('success'))
        }).catch((err) => {
            if (err.statusCode == 400 && err.body && err.body.name == 'UserNotExists') {
                dispatch(setValidatorValueAndMessage({
                    model: 'master.forgotPassword',
                    prop: 'email',
                    message: intl.formatMessage(validationMessages.emailIsNotRegistered)
                }));
            }
        }).then(() => {
            dispatch(setResetPasswordLoadingStatusAction(false));
        });
});

export const verifyPasswordRecoveryTokenAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {token}) => {
    let actions = getState().master.general.actions;

    return fetchUtils.call(actions.verifyPasswordRecoveryToken, auth, {token})
        .then(() => {
            dispatch(setPasswordRecoveryTokenVerificationStatusAction({status: 'success', show: true}))
        }).catch((err) => {
            if (err.statusCode == 400 && err.body && err.body.name == 'IncorrectResetPasswordToken') {
                dispatch(setPasswordRecoveryTokenVerificationStatusAction({status: 'invalid_token', show: true}))
            }

            if (err.statusCode == 400 && err.body && err.body.name == 'ResetPasswordTokenExpired') {
                dispatch(setPasswordRecoveryTokenVerificationStatusAction({status: 'token_expired', show: true}))
            }
        });
});

export const resetPasswordAction = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {password, token}) => {
    dispatch(setResetPasswordLoadingStatusAction(true));
    let actions = getState().master.general.actions;

    return fetchUtils.call(actions.resetPassword, auth, {password, token})
        .then(() => {
            dispatch(setPasswordRecoveryTokenVerificationStatusAction({status: 'password_changed', show: true}))
        }).catch((err) => {
            if (err.statusCode == 400 && err.body && err.body.name == 'IncorrectResetPasswordToken') {
                dispatch(setPasswordRecoveryTokenVerificationStatusAction({status: 'invalid_token', show: true}))
            }

            if (err.statusCode == 400 && err.body && err.body.name == 'ResetPasswordTokenExpired') {
                dispatch(setPasswordRecoveryTokenVerificationStatusAction({status: 'token_expired', show: true}))
            }
        }).then(() => {
            dispatch(setResetPasswordLoadingStatusAction(false));
        });
});

export const initIntlDepenantComponentsAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, errorHandler}, intl) => {
    errorHandler.setIntl(intl)
});

export const checkRequiredInfoAction = reduxUtils.createAsyncAction(({dispatch, getState, auth, routeResolver, gtm}) => {
    return fetchUtils.get('checkFilledRequiredInfo', '/users/me/checkrequiredinfo', {auth});
});