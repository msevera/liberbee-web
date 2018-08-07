/**
 * Created by Mike on 9/6/2017.
 */

'use strict';

import React from 'react';
import Input from '../../../shared/validation/components/input';
import TextArea from '../../../shared/validation/components/textArea';
import RichText from '../../../shared/validation/components/richText';
import AutocompleteInput from '../../validation/components/autocompleteInput';
import DropDownInput from '../../validation/components/dropDownInput';
import Error from '../../../shared/validation/components/error';

class FormGroupInput extends React.Component {
    constructor() {
        super();

        this.state = {
            showHint: false
        }
    }

    onHintClick = () => {
        let {showHint} = this.state;

        this.setState({
            showHint: !showHint
        })
    }

    componentDidMount() {
        window.addEventListener('click', this.onWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onWindowClick);
    }

    onWindowClick = (e) => {
        // not found: genuine outside event. Handle it.
        if (this.state.showHint === true) {
            var source = e.target;
            var found = false;

            // if source=dropdown elemnt then this event came from "somewhere" inside and should be ignored.
            while (source.parentNode) {
                found = (source === this.refs.hint);

                if (found) return;

                source = source.parentNode;
            }

            // not found: genuine outside event. Handle it.
            this.setState({
                showHint: false
            })
        }
    }

    getFormStatus(status) {
        switch (status) {
            case 'success': {
                return 'form--contentSuccess';
            }

            case 'error': {
                return 'form--contentError';
            }

            default: {
                return '';
            }
        }
    }

    render() {
        let {
            id,
            model,
            prop,
            label,
            type = 'text',
            hintIcon,
            hintHTML,
            validators,
            messages,
            placeholder,
            required,
            helpText,
            helpAction,
            className,
            disabled,
            inputClassName,
            suffix,
            suggestions,
            suggestionsBuilder,
            onSelectedValueChanged,
            onHoveredValueChanged,
            onInputChange,
            onInputBlur,
            status,
            dropDownClassName,
            togglePrefixText,
            children,
            title
        } = this.props;
        let {showHint} = this.state;


        return <div
            className={'form--group' + (required ? ' form--group-is-required' : '') + (className ? ` ${className}` : '')}>
            <div className="form--label">
                {
                    label &&
                    <label htmlFor={id}>{label}
                        {
                            hintIcon &&
                            <span ref="hint"
                                  className={`form--hintIcon form--hintIcon${hintIcon.charAt(0).toUpperCase()}${hintIcon.slice(1)}` + (showHint ? ' form--hint-is-visible' : '')}
                                  onClick={this.onHintClick} dangerouslySetInnerHTML={{__html: hintHTML}}>
                        </span>
                        }
                    </label>
                }
                {
                    helpText &&
                    <span className="form--help" onClick={(e) => helpAction && helpAction(e)}>{helpText}</span>
                }
            </div>
            <div className={`form--content ${status && !disabled ? this.getFormStatus(status) : ''}`}>
                {
                    type === 'textarea' &&
                    <TextArea model={model}
                              prop={prop}
                              type={type}
                              disabled={disabled}
                              className={'txt' + (inputClassName ? ' ' + inputClassName : '')} id={id}
                              placeholder={placeholder}
                              validators={validators}/>
                }
                {
                    (type === 'text' || type === 'password' || type === 'decimal') &&
                    <Input model={model}
                           prop={prop}
                           disabled={disabled}
                           type={type}
                           className={'txt' + (inputClassName ? ' ' + inputClassName : '')} id={id}
                           placeholder={placeholder}
                           validators={validators}/>
                }
                {
                    type === 'richtext' &&
                    <RichText model={model}
                              prop={prop}
                              disabled={disabled}
                              type={type}
                              className={'txt' + (inputClassName ? ' ' + inputClassName : '')} id={id}
                              placeholder={placeholder}
                              validators={validators}/>
                }
                {
                    type == 'autocomplete' &&
                    <AutocompleteInput model={model}
                                       prop={prop}
                                       type={type}
                                       disabled={disabled}
                                       suggestions={suggestions}
                                       suggestionsBuilder={suggestionsBuilder}
                                       onSelectedValueChanged={onSelectedValueChanged}
                                       onHoveredValueChanged={onHoveredValueChanged}
                                       onInputChange={onInputChange}
                                       onInputBlur={onInputBlur}
                                       className={'txt' + (inputClassName ? ' ' + inputClassName : '')} id={id}
                                       placeholder={placeholder}
                                       validators={validators}/>

                }
                {
                    type == 'dropdown' &&
                    <DropDownInput model={model}
                                   prop={prop}
                                   id={id}
                                   title={title}
                                   disabled={disabled}
                                   validators={validators}
                                   className={dropDownClassName}
                                   togglePrefixText={togglePrefixText}
                    >
                        {children}
                    </DropDownInput>
                }
                {
                    suffix &&
                    <span className="form--suffix">
                    {
                        suffix
                    }
                    </span>
                }
            </div>
            <Error
                model={model}
                prop={prop}
                className="form--errors"
                messages={messages}/>
        </div>
    }
}


export default FormGroupInput;