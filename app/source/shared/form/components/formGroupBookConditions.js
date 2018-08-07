import React from 'react';
import Checked from '../../validation/components/checked';
import {messages as validationMessages} from "../../validation/messages";
import FormGroupInput from './formGroupInput'
import {messages as bookMessages} from "../../book/bookMessages";
import {messages as formMessages} from "../../form/messages";
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import DropDownItem from '../../dropdown/components/dropdownItem';

class FormGroupBookCondition extends React.Component {
    constructor(props){
        super();

        let {intl} = props;
        this.conditions = [
            {
                text: intl.formatMessage(bookMessages.conditionNew),
                value: 10
            },
            {
                text: intl.formatMessage(bookMessages.conditionExcellent),
                value: 20
            },
            {
                text: intl.formatMessage(bookMessages.conditionGood),
                value: 30
            },
            {
                text: intl.formatMessage(bookMessages.conditionNotBad),
                value: 40
            }
        ]
    }
    render() {
        let {id, intl, validators, messages, model, prop, showLabel} = this.props;

        let params = {}
        if (showLabel){
            params.label = intl.formatMessage(formMessages.bookCondition);
        }else {
            params.togglePrefixText = `${intl.formatMessage(formMessages.bookCondition)}:`;
        }

        return  <FormGroupInput id={id}
                                {...params}
                                type="dropdown"
                                togglePrefixClassNames="dropdown--prefLight"
                                model={model}
                                prop={prop}
                                title={intl.formatMessage(formMessages.conditionNotSpecified)}
                                validators={validators}
                                messages={messages}
        >
            {
                this.conditions.map((cond) => {
                    return <DropDownItem key={cond.value} text={cond.text}
                                         value={cond.value}/>
                })
            }
        </FormGroupInput>
    }
}


export default injectIntl(FormGroupBookCondition);