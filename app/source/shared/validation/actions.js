/**
 * Created by Mike on 9/7/2017.
 */

import reduxUtils from '../../../../utils/reduxUtils';

export const changeAction = reduxUtils.createAction('VALIDATION_FORM_CHANGE_ACTION');
export const setValidationResultAction = reduxUtils.createAction('VALIDATION_SET_RESULT_ACTION');
export const setValidationResultsAction = reduxUtils.createAction('VALIDATION_SET_RESULTS_ACTION');
export const setValidationPristineAction = reduxUtils.createAction('VALIDATION_SET_PRISTINE_ACTION');
export const setValidatorValueAndMessage = reduxUtils.createAction('VALIDATION_SET_VALIDTOR_VALUE_AND_MESSAGE');
export const setFormSubmitted = reduxUtils.createAction('VALIDATION_SET_FORM_SUBMITTED');
export const clearFormErrors = reduxUtils.createAction('VALIDATION_CLEAR_ERRORS')
export const resetModelToInitial = reduxUtils.createAction('VALIDATION_RESET_MODEL');
export const setFormMessage = reduxUtils.createAction('VALIDATION_SET_FORM_MESSAGE');

let getObjByString = (path, obj) => {
    return path.split('.').reduce(function (prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj || self)
}

let getFormData = (modelData) => {
    let result = Object.keys(modelData.$form.$initialState).reduce((result, key) => {
        result[key] = modelData[key];

        return result;
    }, {});

    return result;
}

let validateForm = (model, validators) => {
    let validationResults = Object.keys(validators).reduce((result, validatorPropKey) => {
        let propValidators = validators[validatorPropKey];
        result[validatorPropKey] = Object.keys(propValidators).reduce((result, key) => {
            if (!result.validationResult) {
                result.validationResult = {};
            }

            let funcToValidate = propValidators[key];

            result.validationResult[key] = typeof funcToValidate == 'boolean' ? funcToValidate : !!funcToValidate(model.$form[validatorPropKey].value);

            return result;
        }, {});

        return result;
    }, {})

    return validationResults;
}

let validateProp = (model, propName, validators) => {
    let validationResult = {};

    if (validators) {
        validationResult = Object.keys(validators).reduce((result, key) => {
            let funcToValidate = validators[key];

            result[key] = typeof funcToValidate == 'boolean' ? funcToValidate : !!funcToValidate(model.$form[propName].value);

            return result;
        }, {});
    }

    return validationResult;
}

export const setFormItem = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {model: modelName, prop: propName, value: newValue, validators: propValidators}) => {
    dispatch(changeAction({model: modelName, prop: propName, value: newValue, cleanMessage: true}));

    let state = getState();
    let model = getObjByString(modelName, state);
    let validationResult = validateProp(model, propName, propValidators);
    dispatch(setValidationResultAction({model: modelName, prop: propName, validationResult}))

    let value = model.$form[propName].value;
    if (value != newValue) {
        setValidationPristineAction({model: modelName, prop: propName, pristine: false});
    }

})

export const resetForm = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {model: modelName, validators}) => {
    dispatch(resetModelToInitial({model: modelName}));

    if (validators) {
        let state = getState();
        let model = getObjByString(modelName, state);
        let validationResults = validateForm(model, validators);

        dispatch(setValidationResultsAction({model: modelName, validationResults}));
    }
})

export const submitForm = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {model: modelName, validators}) => {
    return new Promise((resolve, reject) => {
        let state = getState();

        let model = getObjByString(modelName, state);
        dispatch(setFormSubmitted({model: modelName, submitted: true}))

        if (validators) {
            let validationResults = validateForm(model, validators);

            dispatch(setValidationResultsAction({model: modelName, validationResults}));
        }

        state = getState();
        model = getObjByString(modelName, state);
        if (model.$form.$valid) {
            resolve(getFormData(model))
        } else {
            //reject()
        }
    })
})

export const getForm = reduxUtils.createAsyncAction(({dispatch, getState, auth}, {model: modelName}) => {
    return new Promise((resolve, reject) => {
        let state = getState();
        let model = getObjByString(modelName, state);
        resolve(getFormData(model))
    })
})

