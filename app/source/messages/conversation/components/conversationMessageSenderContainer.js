/**
 * Created by Mike on 10/19/2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import {submitForm, clearFormErrors, resetForm} from '../../../shared/validation/actions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {onConversationMessageSendAction} from '../../messagesActions';
import Error from '../../../shared/validation/components/error';
import {conversationMessageFormValidators} from '../../formValidators';
import {injectIntl, defineMessages} from 'react-intl';
import LoadButton from '../../../shared/button/components/loadButton';

class ConversationMessageSenderContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor() {
        super();

        this.validators = conversationMessageFormValidators;
    }

    onMessageSend = () => {
        let {onConversationMessageSendAction} = this.props;
        let {store} = this.context;
        store.dispatch(submitForm({model: 'messages.conversationMessage'}))
            .then((data) => {
                data.message = data.message.trim();
                if (data.message == '')
                    return;

                onConversationMessageSendAction(data)
            });
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13 : { //Enter
                if (!e.shiftKey) {
                    e.target.blur();
                    this.onMessageSend();
                    e.target.focus();
                    e.preventDefault();
                }

                break;
            }
        }
    }

    render() {
        let {intl, loading} = this.props;

        return <div className="conversationMessageSender">
            <div className="conversationMessageSender--container">
                <div className="conversationMessageSender--content">
                    <form className="form" onKeyDown={this.onFormKeyDown}>
                        <FormGroupInput id="conversationMessageSenderInput"
                                        placeholder={intl.formatMessage(messages.typeMessage)}
                                        model="messages.conversationMessage"
                                        prop="message"
                                        type="richtext"
                                        className="form--noMargin"
                                        inputClassName="txt-white"
                                        validators={this.validators.message}
                                        messages={{}}
                        />
                    </form>

                </div>
                <div className="conversationMessageSender--actions">
                    <LoadButton className="btn btn-primary btn-round ld-simple"
                                loaderClassName="ld-white ld-thin"
                                loading={loading}
                                onClick={this.onMessageSend}>
                        {
                            !loading &&
                            <span className="icon icon-send"></span>
                        }
                    </LoadButton>
                </div>
            </div>
            <Error
                model="messages.conversationMessage"
                prop="message"
                className="form--errors"
                messages={{
                    htmlLimitCharsTo: intl.formatMessage(messages.messageLimit)
                }}/>
        </div>
    }
}

const messages = defineMessages({
    typeMessage: {
        id: 'conversationMessageSender.typeMessage',
        defaultMessage: 'Type a message...'
    },
    messageLimit: {
        id: 'conversationMessageSender.messageLimit',
        defaultMessage: 'Message can be 300 characters long'
    }
})

const mapStateToProps = (state, props) => {
    return {
        match: props.match,
        messages: state.messages.conversation.messages,
        recipient: state.messages.conversation.recipient,
        loading: state.messages.conversation.loading,
        loggedUser: state.master.user,
    }
}

const mapDispatchToProps = {
    onConversationMessageSendAction
}


export default withRouter(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ConversationMessageSenderContainer)));