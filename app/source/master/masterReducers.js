/**
 * Created by Mike on 5/16/2017.
 */


'use strict';

import {combineReducers} from 'redux';
import {validationReducer} from '../shared/validation/validation';
import notifierReducers from './notifier/notifierReducers';
import messagesNotificationsReducers from './messagesNotificaitions/messagesNotificationsReducers';
import getBookReducers from './getBook/getBookReducers';
import createEditBookCopyReducers from '../shared/createEditBookCopy/createEditBookCopyReducers';
import createEditBookManuallyReducers from '../shared/createEditBookManually/createEditBookManuallyReducers';
import createEditBookAuthorReducers from '../shared/createEditAuthor/createEditAuthorReducers';
import createEditBookPublisherReducers from '../shared/createEditPublisher/createEditPublisherReducers';
import categorySelectorReducers from '../shared/categorySelector/categorySelectorReducers';
import {
    setLocale,
    setUserAction,
    setSocialSigninAction,
    showSigninAction,
    showSignupAction,
    showSocialSigninAction,
    showForgotPasswordAction,
    setApiDataAction,
    setWebDataAction,
    setAppRoutes,
    setRootAction,
    setUserLocationGeoAutocompleteAction,
    setUserLocationSpecifiedAction,
    setTutorialCompletedAction,
    showSpecifyRequiredInfoAction,
    setRequiredInfoAction,
    setUserAuthentication,
    setResendEmailVerificationStatusAction,
    setPasswordRecoverySendStatusAction,
    showEmailConfirmationResultAction,
    setPasswordRecoveryTokenVerificationStatusAction,
    setEmailConfirmedAction,
    showSocialSigninAssociateAction,
    setSocialSigninAssociateAction,
    resetSocialSigninAssociateAction,
    setSignInLoadingStatusAction,
    setSignUpLoadingStatusAction,
    setResetPasswordLoadingStatusAction
} from './masterActions';
import halson from 'halson';

export default {
    master: combineReducers({
        categorySelector: categorySelectorReducers,
        createEditAuthor: createEditBookAuthorReducers,
        createEditPublisher: createEditBookPublisherReducers,
        createEditBookManually: createEditBookManuallyReducers,
        createEditBookCopy: createEditBookCopyReducers,
        getBook: getBookReducers,
        messagesNotifications: messagesNotificationsReducers,
        notifier: notifierReducers,
        app: (state = {
            apiDomain: '',
            apiBaseUrl: '',
            webDomain: '',
            social: {
                facebook: {
                    shareImg: '',
                    appId: ''
                }
            },
            appRoutes: [],
            locale: {
                items: [],
                selected: null
            }
        }, action) => {
            switch (action.type) {
                case setApiDataAction.type: {
                    return {
                        ...state,
                        apiBaseUrl: action.data.baseUrl,
                        apiDomain: action.data.domain
                    }
                }

                case setWebDataAction.type: {
                    return {
                        ...state,
                        webDomain: action.data.domain,
                        social: action.data.social
                    }
                }

                case setAppRoutes.type: {
                    return {
                        ...state,
                        appRoutes: action.data
                    }
                }

                case setLocale.type: {
                    return {
                        ...state,
                        locale: action.data
                    }
                }

                default:
                    return state;
            }
        },
        general: (state = {
            showSignin: false,
            signInLoading: false,
            signUpLoading: false,
            resetPasswordLoading: false,
            showSignup: false,
            showForgotPassword: false,
            showSpecifyRequiredInfo: false,
            userGeoCompleted: false,
            tutorialCompleted: false,
            emailConfirmed: false,
            actions: {
                searchBook: null,
                getBooks: null,
                getBook: null,
                createBook: null,
                current: null,
                createUser: null,
                getMe: null,
                getUser: null,
                getUserBookCopies: null,
                getMyBookCopies: null,
                setLocation: null,
                placesAutocomplete: null,
                authorsAutocomplete: null,
                publishersAutocomplete: null,
                completeTutorial: null,
                getFavoriteBooks: null,
                confirmEmail: null,
                generateEmailVerificationToken: null,
                generatePasswordRecoveryToken: null,
                verifyPasswordRecoveryToken: null,
                resetPassword: null,
                createDraftBook: null,
                getDraftBooks: null,
                getDraftBook: null,
                removeDraftBook: null,
                createDealRequest: null,
                validateDealRequest: null,
                getUsersWithLastMessage: null,
                getMessagesWithUser: null,
                createMessage: null,
                getDealRequests: null,
                searchAuthor: null,
                createAuthor: null,
                searchPublisher: null,
                createPublisher: null,
                checkRequiredInfo: null,
                getCategories: null,
                getBookReviews: null
            },
            userLocation: {
                specified: false,
                autocomplete: {
                    suggestions: [],
                    query: ''
                }
            }
        }, action) => {
            switch (action.type) {
                case setResetPasswordLoadingStatusAction.type: {
                    return {
                        ...state,
                        resetPasswordLoading: action.data
                    }
                }

                case setSignInLoadingStatusAction.type: {
                    return {
                        ...state,
                        signInLoading: action.data
                    }
                }

                case setSignUpLoadingStatusAction.type: {
                    return {
                        ...state,
                        signUpLoading: action.data
                    }
                }

                case setEmailConfirmedAction.type: {
                    return {
                        ...state,
                        emailConfirmed: true
                    }
                }

                case setRequiredInfoAction.type: {
                    return {
                        ...state,
                        ...action.data
                    }
                }

                case setRootAction.type: {
                    let rootHal = halson(action.data);
                    return {
                        ...state,
                        userGeoCompleted: rootHal.userGeoCompleted,
                        tutorialCompleted: rootHal.tutorialCompleted,
                        emailConfirmed: rootHal.emailConfirmed,
                        actions: {
                            searchBook: rootHal.getLink('searchBook'),
                            getBooks: rootHal.getLink('getBooks'),
                            getBook: rootHal.getLink('getBook'),
                            createBook: rootHal.getLink('createBook'),
                            current: rootHal.getLink('current'),
                            createUser: rootHal.getLink('createUser'),
                            getMe: rootHal.getLink('getMe'),
                            getUser: rootHal.getLink('getUser'),
                            getUserBookCopies: rootHal.getLink('getUserBookCopies'),
                            getMyBookCopies: rootHal.getLink('getMyBookCopies'),
                            setLocation: rootHal.getLink('setLocation'),
                            placesAutocomplete: rootHal.getLink('placesAutocomplete'),
                            authorsAutocomplete: rootHal.getLink('authorsAutocomplete'),
                            publishersAutocomplete: rootHal.getLink('publishersAutocomplete'),
                            completeTutorial: rootHal.getLink('completeTutorial'),
                            getFavoriteBooks: rootHal.getLink('getFavoriteBooks'),
                            confirmEmail: rootHal.getLink('confirmEmail'),
                            generateEmailVerificationToken: rootHal.getLink('generateEmailVerificationToken'),
                            generatePasswordRecoveryToken: rootHal.getLink('generatePasswordRecoveryToken'),
                            verifyPasswordRecoveryToken: rootHal.getLink('verifyPasswordRecoveryToken'),
                            resetPassword: rootHal.getLink('resetPassword'),
                            createDraftBook: rootHal.getLink('createDraftBook'),
                            getDraftBooks: rootHal.getLink('getDraftBooks'),
                            getDraftBook: rootHal.getLink('getDraftBook'),
                            removeDraftBook: rootHal.getLink('removeDraftBook'),
                            createDealRequest: rootHal.getLink('createDealRequest'),
                            validateDealRequest: rootHal.getLink('validateDealRequest'),
                            getUsersWithLastMessage: rootHal.getLink('getUsersWithLastMessage'),
                            getMessagesWithUser: rootHal.getLink('getMessagesWithUser'),
                            createMessage: rootHal.getLink('createMessage'),
                            getDealRequests: rootHal.getLink('getDealRequests'),
                            searchAuthor: rootHal.getLink('searchAuthor'),
                            createAuthor: rootHal.getLink('createAuthor'),
                            searchPublisher: rootHal.getLink('searchPublisher'),
                            createPublisher: rootHal.getLink('createPublisher'),
                            checkRequiredInfo: rootHal.getLink('checkRequiredInfoURI'),
                            getCategories: rootHal.getLink('getCategories'),
                            getBookReviews: rootHal.getLink('getBookReviews')
                        }
                    }
                }

                case showSpecifyRequiredInfoAction.type: {
                    return {
                        ...state,
                        showSpecifyRequiredInfo: action.data
                    }
                }

                case showSigninAction.type: {
                    return {
                        ...state,
                        showSignin: action.data
                    }
                }

                case showSignupAction.type: {
                    return {
                        ...state,
                        showSignup: action.data
                    }
                }

                case showForgotPasswordAction.type: {
                    return {
                        ...state,
                        showForgotPassword: action.data
                    }
                }

                case setUserLocationGeoAutocompleteAction.type: {
                    let autocompleteHal = halson(action.data);

                    return {
                        ...state,
                        userLocation: {
                            ...state.userLocation,
                            autocomplete: {
                                ...state.userLocation.autocomplete,
                                suggestions: autocompleteHal.getEmbeds('places'),
                                query: autocompleteHal.query
                            }
                        }
                    }
                }

                case setUserLocationSpecifiedAction.type: {
                    return {
                        ...state,
                        userLocation: {
                            ...state.userLocation,
                            specified: true
                        }
                    }
                }

                case setTutorialCompletedAction.type:
                    return {
                        ...state,
                        tutorialCompleted: true,
                        userGeoCompleted: true,
                        emailConfirmed: true,
                    }

                default:
                    return state;
            }
        },
        socialSignIn: (state = {
            show: false,
            providers: [],
            name: '',
            photo: '',
            email: ''
        }, action) => {
            switch (action.type) {

                case setSocialSigninAction.type: {
                    return {
                        ...state,
                        providers: action.data.providers,
                        name: action.data.name,
                        photo: action.data.photo,
                        email: action.data.email
                    }
                }

                case showSocialSigninAction.type: {
                    return {
                        ...state,
                        show: action.data
                    }
                }

                default:
                    return state;
            }
        },
        socialSignInAssociate: (state = {
            show: false,
            provider: '',
            name: '',
            photo: '',
            email: '',
            token: ''
        }, action) => {
            switch (action.type) {

                case setSocialSigninAssociateAction.type: {
                    return {
                        ...state,
                        provider: action.data.provider,
                        name: action.data.name,
                        photo: action.data.photo,
                        email: action.data.email,
                        token: action.data.token
                    }
                }

                case showSocialSigninAssociateAction.type: {
                    return {
                        ...state,
                        show: action.data
                    }
                }

                case resetSocialSigninAssociateAction.type: {
                    return {
                        show: false,
                        facebook: false,
                        google: false,
                        name: '',
                        photo: '',
                        email: '',
                        token: '',
                        geo: null
                    }
                }

                default:
                    return state;
            }
        },
        user: (state = {
            _id: '',
            email: '',
            name: '',
            photo: '',
            slug: '',
            geo: {
                currencyCode: undefined
            },
            isAuthenticated: false
        }, action) => {
            switch (action.type) {
                case setUserAction.type: {
                    return {
                        ...state,
                        _id: action.data._id,
                        email: action.data.email,
                        name: action.data.name,
                        photo: action.data.photo,
                        slug: action.data.slug,
                        geo: {
                            ...state.geo,
                            currencyCode: action.data.geo &&  action.data.geo.currencyCode ? action.data.geo.currencyCode : undefined
                        }
                    }
                }

                case setUserAuthentication.type: {
                    return {
                        ...state,
                        isAuthenticated: action.data && action.data.isAuthenticated
                    }
                }

                default:
                    return state;
            }
        },
        emailVerification: (state = {
            generateVerificationTokenStatus: '',
            confirmationStatus: '',
            show: false
        }, action) => {
            switch (action.type) {
                case setResendEmailVerificationStatusAction.type: {
                    return {
                        ...state,
                        generateVerificationTokenStatus: action.data.status
                    }
                }

                case showEmailConfirmationResultAction.type: {
                    return {
                        ...state,
                        show: action.data.show,
                        confirmationStatus: action.data.status
                    }
                }

                default:
                    return state;
            }
        },
        passwordRecovery: (state = {
            sendStatus: '',
            verification: {
                status: '',
                show: false
            }
        }, action) => {
            switch (action.type) {
                case setPasswordRecoverySendStatusAction.type: {
                    return {
                        ...state,
                        sendStatus: action.data
                    }
                }

                case setPasswordRecoveryTokenVerificationStatusAction.type: {
                    return {
                        ...state,
                        verification: {
                            ...state.verification,
                            show: action.data.show,
                            status: action.data.status
                        }
                    }
                }

                default:
                    return state;
            }
        },
        socialSigninAssociateForm: validationReducer(
            {
                password: ''
            }, 'master.socialSigninAssociateForm'),
        signup: validationReducer(
            {
                name: '',
                email: '',
                password: ''
            }, 'master.signup'),
        signin: validationReducer(
            {
                email: '',
                password: ''
            }, 'master.signin'),
        forgotPassword: validationReducer(
            {
                email: ''
            }, 'master.forgotPassword'),
        resetPassword: validationReducer(
            {
                password: '',
                confirmPassword: ''
            }, 'master.resetPassword')

    })
}