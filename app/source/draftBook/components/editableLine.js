'use strict';

import React from 'react';
import FormGroupInput from '../../shared/form/components/formGroupInput';

class EditableLine extends React.Component {
    render() {
        let {id, model, prop, status, showActionButton, label, placeholder, suggestions, autocompleteInputChangeHandler,
            autocompleteInputBlurHandler, autocompleteSelectedValueChanged, disabled, messages, onEditAction, onCreateAction, editText, createText} = this.props;

        return <div className="form--h">
            <FormGroupInput id={id}
                            className="form--grow"
                            type="autocomplete"
                            label={label}
                            placeholder={placeholder}
                            model={model}
                            prop={prop}
                            suggestions={suggestions}
                            onInputChange={autocompleteInputChangeHandler}
                            onInputBlur={autocompleteInputBlurHandler}
                            onSelectedValueChanged={autocompleteSelectedValueChanged}
                            disabled={disabled}
                            status={status}
                            messages={messages}/>
            {
                status == 'success' && showActionButton && !disabled &&
                <div className="form--group form--action">
                    <button className="btn btn-small btn-secondary"
                            onClick={onEditAction}>{editText}</button>
                </div>
            }
            {
                status == 'error' && showActionButton && !disabled &&
                <div className="form--group form--action">
                    <button className="btn btn-small btn-secondary"
                            onClick={onCreateAction}>{createText}</button>
                </div>
            }

        </div>
    }
}

export default EditableLine;