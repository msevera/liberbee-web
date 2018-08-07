/**
 * Created by Mike on 10/31/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {withRouter, Link, NavLink} from 'react-router-dom';
import Avatar from '../../../shared/avatar/components/avatar';
import halson from 'halson';
import {FormattedRelative} from 'react-intl';
import {defineMessages, injectIntl, FormattedMessage} from 'react-intl';
import {withTools} from '../../../hoc';

class MessagesNotificationsContainer extends React.Component {
    constructor() {
        super();
        this.maxNotifications = 2;
    }

    onSelectUserConversation = (recipient) => {
        let {history, routeResolver} = this.props;
        history.push(routeResolver.buildRouteFor('receivedFromUserRequests', {
            type: 'u',
            data: recipient.slug
        }, {redirect: true, override: {usersWithConversations: {redirect: true, reload: false}}}))
    }

    buildNotification(data) {
        let {intl} = this.props;
        let dataHal = halson(data);
        let recipient = dataHal.recipient;
        let message = dataHal.getEmbed('messages');

        let renderUnseenMessages = dataHal.unseenMessages > 0 && !dataHal.unseenRequests;
        let renderUnseenRequest = dataHal.unseenRequests > 0;

        let conversationUnseen = renderUnseenRequest || renderUnseenMessages;

        return <div className="conversationItem conversationItem-noRightBorder"
                    onClick={() => this.onSelectUserConversation(recipient)}>
            <div className="conversationItem--highlight"></div>
            <div className="conversationItem--avatar">
                <Avatar className="avatar avatar-middle" src={recipient.photo} name={recipient.name}/>
            </div>
            <div className="conversationItem--content">
                <div className="conversationItem--title">
                    {recipient.name}
                </div>
                <div className="conversationItem--message">
                    <span dangerouslySetInnerHTML={{__html: message.text}}></span>
                </div>
            </div>
            <div className="conversationItem--meta">
                {
                    conversationUnseen ?
                        <div className="conversationItem--attention">
                            {
                                renderUnseenRequest &&
                                <span>{intl.formatMessage(messages.request)}</span>
                            }
                            {
                                renderUnseenMessages &&
                                <span>{dataHal.unseenMessages}</span>
                            }
                        </div> : <div></div>
                }
                <div className="conversationItem--date">
                    <FormattedRelative value={message.created}/>
                </div>
            </div>
        </div>
    }

    render() {
        let {items, routeResolver} = this.props;
        let length = items.length > this.maxNotifications ? this.maxNotifications : items.length;

        let notifications = [];
        for (var i = 0; i < length; i++) {
            notifications.push(this.buildNotification(items[i]));
        }

        return <div className={'messagesNotifications' + (items.length == 0 ? ' messagesNotifications-is-empty' : '')}>
            {
                items.length > 0 ?
                    <div className="messagesNotifications--content">
                        <div className="messagesNotifications--messages">
                            {
                                notifications
                            }
                        </div>
                    </div> :
                    <div className="messagesNotifications--empty"><FormattedMessage {...messages.noMessages} /></div>
            }
            <div className="messagesNotifications--showAll">
                <Link className="btn btn-link btn-sm"
                      to={routeResolver.buildRouteFor('usersWithConversations', {}, {redirect: true})}>
                    <span><FormattedMessage {...messages.viewAll} /></span>
                </Link>
            </div>
        </div>
    }
}

const messages = defineMessages({
    noMessages: {
        id: 'messagesNotification.noMessages',
        defaultMessage: 'There is no new messages',
    },
    viewAll: {
        id: 'messagesNotification.viewAll',
        defaultMessage: 'View all',
    },
    request: {
        id: 'messagesNotification.request',
        defaultMessage: 'Request'
    }
});

const mapStateToProps = (state) => {
    return {
        items: state.master.messagesNotifications.items,
        total: state.master.messagesNotifications.total,
        actions: state.master.messagesNotifications.actions,
        moreMessagesNotificationsAreLoading: state.master.messagesNotifications.moreMessagesNotificationsAreLoading
    }
}

const mapDispatchToProps = {}

export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(MessagesNotificationsContainer)));
