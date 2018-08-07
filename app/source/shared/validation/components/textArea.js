/**
 * Created by Mike on 9/7/2017.
 */


import React from 'react'
import {connect} from 'react-redux';
import {changeAction, setValidationResultAction, setValidationPristineAction} from '../actions';

class TextArea extends React.Component {

    constructor(props) {
        super();

        this.state = {
            value: props.value
        }
    }

    validate(value) {
        let {validators} = this.props;

        let validationResult = {};

        if (validators) {
            validationResult = Object.keys(validators).reduce((result, key) => {
                let funcToValidate = validators[key];

                result[key] = typeof funcToValidate == 'boolean' ? funcToValidate : !!funcToValidate(value);

                return result;
            }, {})
        }

        return validationResult;
    }

    componentWillMount() {
        let {setValidationResultAction, model, prop, value} = this.props;

        let validationResult = this.validate(value);
        setValidationResultAction({model, prop, validationResult});
    }

    onChange = (e) => {
        let value = e.target.value;

        this.setState({
            value
        })
    }

    onBlur = (e) => {
        let {changeAction, setValidationResultAction, setValidationPristineAction, model, prop, value} = this.props;
        let newValue = e.target.value;


        changeAction({model, prop, value: newValue, cleanMessage: value != newValue})

        let validationResult = this.validate(newValue);
        setValidationResultAction({model, prop, validationResult});


        if (value != newValue) {
            setValidationPristineAction({model, prop, pristine: false});
        }


        this.setState({
            newValue
        })
    }

    isValid() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        })
    }

    propHasError() {
        let {formSubmitted, validationResult, pristine} = this.props;

        let hasError = Object.keys(validationResult).some((key) => {
            return !validationResult[key] && (!pristine || formSubmitted);
        })

        return hasError;
    }

    getCssClasses() {
        let {formMessage, modelMessage} = this.props;

        let hasError = this.propHasError();

        return formMessage || modelMessage || hasError ? ' txt-error' : '';

    }

    render() {
        let {className, placeholder, type='text', disabled} = this.props;
        let {value} = this.state;

        let cssClasses = this.getCssClasses();

        return <textarea disabled={disabled} className={className + cssClasses} type={type} value={value} onBlur={this.onBlur} onChange={this.onChange}
                      placeholder={placeholder}/>
    }
}

let geoObjByString = (path, obj) => {
    return path.split('.').reduce(function (prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj || self)
}

let mapStateToProps = (state, props) => {
    let propName = props.prop;
    let modelName = props.model;

    let model = geoObjByString(modelName, state);
    let fieldModel = geoObjByString(propName, model.$form);

    return {
        className: props.className,
        model: modelName,
        prop: propName,
        validators: props.validators,
        value: fieldModel.value,
        validationResult: fieldModel.validationResult,
        placeholder: props.placeholder,
        disabled: props.disabled,
        formMessage: model.$form.$message,
        modelMessage: fieldModel.message,
        formSubmitted: model.$form.$submitted,
        pristine: fieldModel.pristine
    }
}

let mapDispatchToProps = {
    changeAction,
    setValidationResultAction,
    setValidationPristineAction
}


export default connect(mapStateToProps, mapDispatchToProps)(TextArea);