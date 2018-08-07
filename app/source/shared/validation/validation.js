/**
 * Created by Mike on 9/7/2017.
 */

import {
    changeAction,
    setValidationResultAction,
    setValidationResultsAction,
    setValidationPristineAction,
    setValidatorValueAndMessage,
    setFormSubmitted,
    setFormMessage,
    clearFormErrors,
    resetModelToInitial
} from './actions'

export const validationReducer = (initialState, formPath) => {

    let getInitialStateCopy = (newState) => {
        let initialStateCopy = Object.assign({}, initialState, newState);

        Object.keys(initialStateCopy).forEach((key) => {
            if (!initialStateCopy.$form) {
                initialStateCopy.$form = {};
            }
            initialStateCopy.$form[key] = {
                value: initialStateCopy[key],
                valid: true,
                pristine: true,
                validationResult: {},
                message: ''
            }
        })

        initialStateCopy.$form.$model = formPath;
        initialStateCopy.$form.$message = '';
        initialStateCopy.$form.$valid = true;
        initialStateCopy.$form.$submitted = false;
        initialStateCopy.$form.$initialState = initialState;

        return initialStateCopy;
    }


    return (state = getInitialStateCopy(), action) => {
        if (action.data && action.data.model != formPath) {
            return state;
        }


        switch (action.type) {
            case changeAction.type: {
                return {
                    ...state,
                    [action.data.prop]: action.data.value,
                    $form: {
                        ...state.$form,
                        [action.data.prop]: {
                            ...state.$form[action.data.prop],
                            value: action.data.value,
                            message: action.data.cleanMessage ? '' : state.$form[action.data.prop].message
                        },
                        $message: action.data.cleanMessage ? '' : state.$form.$message
                    }
                }
            }

            case setValidationResultAction.type: {
                let isValid = Object.keys(action.data.validationResult).every((key) => {
                    return action.data.validationResult[key];
                });

                let areOtherPropsValid = Object.keys(initialState).every((key) => {
                    let prop = state.$form[key];
                    if (typeof prop != 'undefined' && key != action.data.prop) {
                        return prop.valid;
                    } else {
                        return true;
                    }
                })

                return {
                    ...state,
                    $form: {
                        ...state.$form,
                        $valid: isValid && areOtherPropsValid,
                        [action.data.prop]: {
                            ...state.$form[action.data.prop],
                            validationResult: action.data.validationResult,
                            valid: isValid
                        }
                    }
                }
            }

            case setValidationResultsAction.type: {
                let isFormValid = true;
                let newState = {
                    ...state,
                    $form: {
                        ...state.$form,
                        ...Object.keys(action.data.validationResults).reduce((result, validatorPropKey) => {
                            let propValidators = action.data.validationResults[validatorPropKey];
                            let validationResult = propValidators.validationResult ? propValidators.validationResult : {};

                            let isValid = Object.keys(validationResult).every((key) => {
                                return validationResult[key];
                            })


                            result[validatorPropKey] = {
                                ...state.$form[validatorPropKey],
                                validationResult,
                                valid: isValid
                            }

                            if (!isValid) {
                                isFormValid = false;
                            }

                            return result;
                        }, {}),
                        $valid: isFormValid,
                    }
                }

                return newState;
            }

            case setValidationPristineAction.type: {
                return {
                    ...state,
                    $form: {
                        ...state.$form,
                        [action.data.prop]: {
                            ...state.$form[action.data.prop],
                            pristine: action.data.pristine
                        }
                    }
                }
            }

            case setValidatorValueAndMessage.type: {
                return {
                    ...state,
                    $form: {
                        ...state.$form,
                        [action.data.prop]: {
                            ...state.$form[action.data.prop],
                            message: action.data.message
                        }
                    }
                }
            }

            case setFormMessage.type: {
                return {
                    ...state,
                    $form: {
                        ...state.$form,
                        $message: action.data.message
                    }
                }
            }

            case setFormSubmitted.type: {
                return {
                    ...state,
                    $form: {
                        ...state.$form,
                        $submitted: action.data.submitted
                    }
                }
            }

            case clearFormErrors.type: {

                let initialStateKeys = Object.keys(initialState);

                let newState = {
                    ...state,
                    $form: {
                        ...Object.keys(state.$form).reduce((result, key) => {
                            if (initialStateKeys.includes(key)) {
                                result[key] = {...state.$form[key], pristine: true, message: ''}
                            } else {
                                result[key] = state.$form[key];
                            }

                            return result;
                        }, {}),
                        $submitted: false,
                        $message: ''
                    }
                }

                return newState;
            }

            case resetModelToInitial.type: {
                let data = getInitialStateCopy(action.data ? action.data.initialData: {});

                return data;
            }

            default: {
                return state;
            }
        }
    }
}