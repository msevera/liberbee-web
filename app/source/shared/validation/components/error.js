/**
 * Created by Mike on 9/7/2017.
 */

import React from 'react'
import {connect} from 'react-redux';

class Error extends React.Component {

    getPropErrors() {
        let {messages, modelMessage, formSubmitted, validationResult, pristine} = this.props;

        let errorsResults = [];
        if (modelMessage){
            errorsResults.push(modelMessage);
        }

        Object.keys(validationResult).forEach((key) => {

            let message = messages[key];

            //!props.fieldValue.valid && ((!props.fieldValue.pristine || props.fieldValue.submitFailed) && !props.fieldValue.focus);
            if (!!message && !validationResult[key] && (!pristine || formSubmitted)){
                errorsResults.push(message)
            }
        })

        return errorsResults;
    }

    getModelErrors() {
        let {formMessage} = this.props;
        let errorsResults = [];

        if (formMessage){
            errorsResults.push(formMessage);
        }

        return errorsResults;
    }

    render(){
        let {className, prop} = this.props;

        let errors = [];
        if (prop){
            errors = this.getPropErrors();
        }else{
            errors = this.getModelErrors();
        }


        return errors.length == 0 ? null: <div className={className}>
            {
                errors.map((error, idx) => {
                    return <span key={idx}>{error}</span>
                })
            }
        </div>
    }
}




let geoObjByString = (path, obj) => {
    return path.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj || self)
}

let mapStateToProps = (state, props) => {
    let propName = props.prop;
    let modelName = props.model;

    let model = geoObjByString(modelName, state);
    let fieldModel = propName ? geoObjByString(propName, model.$form): {};

    return {
        className: props.className,
        model: modelName,
        prop: propName,
        formSubmitted: model.$form.$submitted,
        formMessage: model.$form.$message,
        messages: props.messages,
        modelMessage: fieldModel.message,
        validationResult: fieldModel.validationResult,
        pristine: fieldModel.pristine
    }
}


export default connect(mapStateToProps)(Error);