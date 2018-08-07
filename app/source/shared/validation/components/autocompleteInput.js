/**
 * Created by Mike on 9/7/2017.
 */


import React from 'react'
import {connect} from 'react-redux';
import {changeAction, setValidationResultAction, setValidationPristineAction} from '../actions';
import DecimalFormatted from '../../formatted/components/decimalFormatted';
import Autocomplete from "../../autocomplete/components/autocomplete";

class AutocompleteInput extends React.Component {

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

    onChange = (value) => {
        let {onInputChange, changeAction, setValidationResultAction, setValidationPristineAction, model, prop} = this.props;

        let newValue = value;
        changeAction({model, prop, value: newValue, cleanMessage: value != newValue})

        let validationResult = this.validate(newValue);
        setValidationResultAction({model, prop, validationResult});


        if (value != newValue) {
            setValidationPristineAction({model, prop, pristine: false});
        }

        this.setState({
            value: value
        })

        if (onInputChange) {
            onInputChange(value);
        }
    }

    onBlur = (value) => {
        let {onInputBlur, changeAction, setValidationResultAction, setValidationPristineAction, model, prop} = this.props;
        let newValue = value;


        changeAction({model, prop, value: newValue, cleanMessage: value != newValue})

        let validationResult = this.validate(newValue);
        setValidationResultAction({model, prop, validationResult});


        if (value != newValue) {
            setValidationPristineAction({model, prop, pristine: false});
        }


        this.setState({
            newValue
        })

        if (onInputBlur) {
            onInputBlur(value);
        }
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

    buildSuggestionsSource(authorsSuggestionsRes, query) {
        return authorsSuggestionsRes.map((suggest) => {

            //let queryRegexp = new RegExp('(' + query + ')', 'i')
            //let primaryText = suggest.text.replace(queryRegexp, '<span class="autocomplete--highlight">$1</span>')
            let primaryText = suggest.highlight;

            return {
                data: suggest,
                title: suggest.text,
                text: (<span>
                    <span className="autocomplete--primary" dangerouslySetInnerHTML={{__html: primaryText}}></span>
                </span>)
            }
        })
    }

    onSelectedValueChangedHandler = (data, text, meta) => {
        let {onSelectedValueChanged} = this.props;

        this.setState({
            value: text
        })

        if (onSelectedValueChanged) {
            onSelectedValueChanged(data, text, meta);
        }
    }

    onHoveredValueChangedHandler = (data, text) => {
        let {onHoveredValueChanged} = this.props;

        if (onHoveredValueChanged) {
            onHoveredValueChanged(data, text);
        }
    }

    render() {
        let {className, placeholder, suggestions, suggestionsBuilder, disabled = false} = this.props;
        let {value} = this.state;
        let cssClasses = this.getCssClasses();

        let suggestionsRes
        if (suggestionsBuilder) {
            suggestionsRes = suggestionsBuilder(suggestions, value);
        } else {
            suggestionsRes = this.buildSuggestionsSource(suggestions, value);
        }

        return <Autocomplete
            disabled={disabled}
            inputClassName={className + cssClasses}
            value={!!value || typeof value == 'number' ? value : ''}
            onInputBlur={this.onBlur}
            onInputChange={this.onChange}
            suggestions={suggestionsRes}
            highlight={!!value || typeof value == 'number' ? value : ''}
            placeholder={placeholder}
            onHoveredValueChanged={this.onHoveredValueChangedHandler}
            onSelectedValueChanged={this.onSelectedValueChangedHandler}/>

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


export default connect(mapStateToProps, mapDispatchToProps)(AutocompleteInput);