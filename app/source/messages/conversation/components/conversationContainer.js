/**
 * Created by Mike on 10/16/2017.
 */
'use strict';

import React from 'react';
import {connect} from 'react-redux';
import Avatar from '../../../shared/avatar/components/avatar';
import ReceivedFromUserRequestContainer from './receivedFromUserRequestsContainer';
import SentToUserRequestContainer from './sentToUserRequestsContainer';
import {
    loadConversationByUserAction,
    loadConversationByIncRequestAction,
    loadConversationByOutRequestAction,
    loadMoreMessagesAction,
    onConversationMessageSendRepeatAction,
    showConversationsListAction,
    showUserInfoAction
} from '../../messagesActions';
import ConversationMessageSenderContainer from './conversationMessageSenderContainer';
import {Scrollbars} from 'react-custom-scrollbars';
import {injectIntl, defineMessages} from 'react-intl';
import {withComponentExtended} from '../../../hoc';
import isSameDay from 'date-fns/is_same_day';
import isSameMinute from 'date-fns/is_same_minute';
import differenceInDays from 'date-fns/difference_in_days';

class ConversationContainer extends React.Component {
    static getType(match) {
        let type = match.params.type;

        return type ? type : '';
    }

    static getData(match) {
        let data = match.params.data;

        return data ? data : '';
    }


    constructor(props) {
        super();

        this.conversationContentHeight = 0;
    }

    componentDidUpdate() {
        let {updateScrollPosition, scrollToBottom, scrollAction} = this.props;
        let {scrollbars} = this.refs;

        if (scrollAction == 'updateScrollPosition') {
            let heightOffset = this.refs.conversationContent.clientHeight - this.conversationContentHeight;
            scrollbars.scrollTop(heightOffset);
        }

        if (scrollAction == 'scrollToBottom') {
            scrollbars.scrollToBottom();
        }
    }

    buildSeparator(separator) {
        let {intl} = this.props;

        let daysDiff = differenceInDays(new Date(), new Date(separator.date));

        let formRelative = (daysDiff == 0 || daysDiff == 1)

        return <div className="conversationSeparator">
            <div className="conversationSeparator--content">
                {
                    formRelative ?
                        intl.formatRelative(separator.date, {units: 'day'}) :
                        intl.formatDate(separator.date, {format: 'dateFull'})
                }
            </div>
        </div>
    }

    buildMessageMeta(user, date) {
        let {intl} = this.props;

        return <div className="conversationMessage--meta">
            {
                user &&
                <div className="conversationMessage--user">
                    <Avatar className="avatar-middle" name={user.name} src={user.photo}/>
                </div>
            }
            {
                date &&
                <div className="conversationMessage--time">
                    {
                        intl.formatDate(date, {format: 'timeShort'})
                    }
                </div>
            }
        </div>
    }

    sendMessageAgain(message) {
        let {onConversationMessageSendRepeatAction} = this.props;
        onConversationMessageSendRepeatAction(message)
    }

    buildMessage(messageGroup) {
        let {recipient, loggedUser, intl} = this.props;

        if (!recipient)
            return;

        let isRecepientOwner = recipient._id == messageGroup.from;

        return <div
            className={'conversationMessage' + (isRecepientOwner ? ' conversationMessage-recipient' : ' conversationMessage-owner')}>
            {
                messageGroup.messages.map((message, idx) => {
                    let differentMoreThanMinute = true;
                    if (idx > 0) {
                        let sameMin = isSameMinute(new Date(message.created), new Date(messageGroup.messages[idx - 1].created))
                        if (sameMin) {
                            differentMoreThanMinute = false;
                        }

                    }

                    return <div className="conversationMessage--item" key={message._id}>
                        <div className="conversationMessage--content">
                            {
                                isRecepientOwner && this.buildMessageMeta(idx == 0 ? recipient : null, differentMoreThanMinute ? message.created : null)
                            }
                            <div
                                className={'conversationMessage--text' + (idx == 0 ? ' conversationMessage--textArrow' : '')}
                                dangerouslySetInnerHTML={{__html: message.text}}></div>
                            {
                                message.status == 'unsent' && !isRecepientOwner &&
                                <div
                                    className="conversationMessage--status conversationMessage--unsent">{intl.formatMessage(messages.statusNotSent)}
                                    <button className="btn btn-link btn-small"
                                            onClick={() => this.sendMessageAgain(message)}>{intl.formatMessage(messages.sendAgain)}</button>
                                </div>
                            }
                            {
                                (idx == messageGroup.messages.length - 1) && message.status == 'sent' && !isRecepientOwner &&
                                <div
                                    className="conversationMessage--status conversationMessage--sent">{intl.formatMessage(messages.statusSent)}</div>
                            }
                            {
                                (idx == messageGroup.messages.length - 1) && message.status == 'delivered' && !isRecepientOwner &&
                                <div
                                    className="conversationMessage--status conversationMessage--delivered">{intl.formatMessage(messages.statusDelivered)}</div>
                            }
                            {
                                (idx == messageGroup.messages.length - 1) && message.status == 'seen' && !isRecepientOwner &&
                                <div
                                    className="conversationMessage--status conversationMessage--seen">{intl.formatMessage(messages.statusSeen)}</div>
                            }
                        </div>
                        {
                            !isRecepientOwner && this.buildMessageMeta(idx == 0 ? loggedUser : null, differentMoreThanMinute ? message.created : null)
                        }

                    </div>
                })

            }
        </div>
    }

    prepareMessages() {
        let {messages} = this.props;

        return messages.reduce((result, message, idx) => {

            message = {...message};
            let lastItem = result[result.length - 1];
            let isFirst = idx == 0;
            let isNewMessageGroup = isFirst || (lastItem && (lastItem.from != message.from || (message.meta && message.meta.dealRequest)));
            let isDifferentDays = lastItem && !isSameDay(new Date(lastItem.messages[lastItem.messages.length - 1].created), new Date(message.created));
            let messageId = message._id ? message._id : message.tempId
            let unSent = !message._id && message.unSent == true;
            let delivered = !!message._id && !message.seen;

            if (unSent) {
                message.status = 'unsent';
            }

            if (!unSent) {
                message.status = 'sent';
            }

            if (delivered && !unSent) {
                message.status = 'delivered';
            }

            if (message.seen && !unSent) {
                message.status = 'seen';
            }

            message.unSent = unSent;
            message.delivered = delivered;

            if (isFirst) {
                result.push({
                    id: `daySeparator_${messageId}`,
                    type: 'daySeparator',
                    date: message.created
                })
            }

            if (isNewMessageGroup || isDifferentDays) {
                if (isDifferentDays) {
                    result.push({
                        id: `daySeparator_${messageId}`,
                        type: 'daySeparator',
                        date: message.created
                    })
                }

                result.push({
                    id: `message_${messageId}`,
                    type: 'message',
                    from: message.from,
                    messages: [message]
                });
            } else {
                lastItem.messages.push(message)
            }

            return result;
        }, []);
    }

    renderThumb = ({style, ...props}) => {
        return (
            <div
                className="scrollbar--bar"
                style={{...style}}
                {...props}/>
        );
    }

    handleScrollbarUpdate = (values) => {
        const {conversationActions, loadMoreMessagesAction, moreMessagesAreLoading} = this.props;
        const {scrollTop, scrollHeight, clientHeight} = values;
        let {conversationContent} = this.refs;


        if (scrollTop <= 100 && conversationActions.loadMoreMessages && !moreMessagesAreLoading) {
            this.conversationContentHeight = conversationContent.clientHeight;
            loadMoreMessagesAction(conversationActions.loadMoreMessages);
        }
    }

    showConversationsList = () => {
        let {showConversationsListAction} = this.props;
        showConversationsListAction();
    }

    showUserInfo = () => {
        let {showUserInfoAction} = this.props;
        showUserInfoAction();
    }

    render() {
        let {showMessagesList} = this.props;

        return <div className="h-100 w-100">
            {
                showMessagesList &&
                <div className="messengerMobileActions">
                    <div className="messengerMobileActions--item messengerMobileActions--conversationsList"
                         onClick={this.showConversationsList}>
                    </div>
                    <div className="messengerMobileActions--item messengerMobileActions--userInfo"
                         onClick={this.showUserInfo}></div>
                </div>
            }
            <div className="conversation">
                <div className="conversation--content">
                    <Scrollbars autoHide autoHideDuration={500} className="scrollbar" style={{height: '100%'}}
                                universal={true} ref="scrollbars" renderThumbVertical={this.renderThumb}
                                onUpdate={this.handleScrollbarUpdate}>
                        <div ref="conversationContent">
                            {
                                this.prepareMessages().map((item) => {
                                    switch (item.type) {
                                        case 'message': {
                                            return <div key={item.id}
                                                        className="conversation--item conversation--itemPadded">{this.buildMessage(item)}</div>;
                                        }

                                        case 'daySeparator': {
                                            return <div key={item.id}
                                                        className="conversation--item">{this.buildSeparator(item)}</div>;
                                        }
                                    }

                                })
                            }
                        </div>
                    </Scrollbars>
                </div>
                <div className="conversation--actions">
                    <ConversationMessageSenderContainer/>
                </div>
            </div>
        </div>
    }
}

const messages = defineMessages({
    statusSent: {
        id: 'messages.statusSent',
        defaultMessage: 'Sending...'
    },
    statusNotSent: {
        id: 'messages.statusUnSent',
        defaultMessage: 'Not sent'
    },
    statusDelivered: {
        id: 'messages.statusDelivered',
        defaultMessage: 'Sent'
    },
    statusSeen: {
        id: 'messages.statusSeen',
        defaultMessage: 'Seen'
    },
    sendAgain: {
        id: 'messages.sendAgain',
        defaultMessage: 'Send again'
    }
})

const mapStateToProps = (state, props) => {
    return {
        moreMessagesAreLoading: state.messages.conversation.moreMessagesAreLoading,
        match: props.match,
        messages: state.messages.conversation.messages,
        recipient: state.messages.conversation.recipient,
        loggedUser: state.master.user,
        conversationActions: state.messages.conversation.actions,
        updateScrollPosition: state.messages.general.updateScrollPosition,
        scrollToBottom: state.messages.general.scrollToBottom,
        scrollAction: state.messages.general.scrollAction,
        showMessagesList: state.messages.general.showMessagesList
    }
}

const mapDispatchToProps = {
    loadConversationByUserAction,
    loadConversationByIncRequestAction,
    loadConversationByOutRequestAction,
    loadMoreMessagesAction,
    onConversationMessageSendRepeatAction,
    showConversationsListAction,
    showUserInfoAction
}

const routes = [
    {
        id: ReceivedFromUserRequestContainer.id,
        absolutePath: `/messages/:type/:data/received`,
        componentLoader: ReceivedFromUserRequestContainer
    }, {
        id: SentToUserRequestContainer.id,
        absolutePath: `/messages/:type/:data/sent`,
        componentLoader: SentToUserRequestContainer
    }
]

const loadData = (props, context) => {
    let type = ConversationContainer.getType(props.match);
    let data = ConversationContainer.getData(props.match);

    switch (type) {
        case 'u': {
            return context.store.dispatch(loadConversationByUserAction({user: data}));
        }

        case 'i': {
            return context.store.dispatch(loadConversationByIncRequestAction({request: data}));
        }

        case 'o': {
            return context.store.dispatch(loadConversationByOutRequestAction({request: data}));
        }
    }

}


export default withComponentExtended('conversation', routes, loadData, null, false)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ConversationContainer)));