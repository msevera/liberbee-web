/**
 * Created by Mike on 9/19/2017.
 */

'use strict';

import React from 'react';
import Checked from '../../validation/components/checked';

class FormGroupChecked extends React.Component {
    render() {
        let {id, model, prop, type='radio', name, value, label, validators, className, disabled} = this.props;

        return <div className={'form--group' + (className ? ` ${className}` : '')}>
            <Checked model={model}
                     prop={prop}
                     name={name}
                     id={id}
                     type={type}
                     label={label}
                     checkedValue={value}
                     disabled={disabled}
                     validators={validators}/>
        </div>
    }
}


export default FormGroupChecked;