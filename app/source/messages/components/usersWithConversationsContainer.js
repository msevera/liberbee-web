/**
 * Created by Mike on 10/17/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import halson from 'halson';
import Avatar from '../../shared/avatar/components/avatar';
import ConversationContainer from '../conversation/components/conversationContainer';
import {
    loadUsersWithLastMessageAction,
    selectUserConversationAction,
    loadConversationByUserAction,
    loadMoreUsersConversationsAction,
    showMessagesListAction
} from '../messagesActions';
import {Scrollbars} from 'react-custom-scrollbars';
import {FormattedRelative} from 'react-intl';
import {withComponentExtended} from '../../hoc';
import {injectIntl, defineMessages} from 'react-intl';

class UsersWithConversationsContainer extends React.Component {
    static getUser(match) {
        let data = match.params.user;

        return data ? data : null;
    }

    componentDidUpdate() {
        let {match, conversations, location, loggedUser, selectUserConversationAction, routeResolver} = this.props;

        if (location.pathname == routeResolver.buildRouteFor('usersWithConversations', {type: 'u'}).pathname && conversations.length > 0) {
            let conv = conversations[0];
            selectUserConversationAction({recipient: conv.recipient});
        }
    }

    onSelectUserConversation = (recipient) => {
        let {selectUserConversationAction, showMessagesListAction} = this.props;
        selectUserConversationAction({recipient});
        showMessagesListAction()
    }

    buildConversation(conversation) {
        let {selectedRecipient, intl} = this.props;

        let conversationHal = halson(conversation);
        let recipient = conversationHal.recipient;
        let message = conversationHal.getEmbed('messages');

        let renderUnseenMessages = conversationHal.unseenMessages > 0 && conversationHal.unseenRequests == 0;
        let renderUnseenRequest = conversationHal.unseenRequests > 0;

        let conversationUnseen = renderUnseenRequest || renderUnseenMessages;

        return <div
            className={'conversationItem' + (selectedRecipient == recipient.slug ? ' conversationItem-is-selected' : '') + (conversationUnseen ? ' conversation-is-unseen' : '')}
            onClick={() => this.onSelectUserConversation(recipient)} key={conversationHal.recipient._id}>
            <div className="conversationItem--highlight"></div>
            <div className="conversationItem--avatar">
                <Avatar className="avatar-middle" name={recipient.name} src={recipient.photo}/>
            </div>
            <div className="conversationItem--content">

                <div className="conversationItem--title">{recipient.name}</div>
                <div className="conversationItem--message">
                    {
                        (recipient._id != message.from) &&
                        <span>{intl.formatMessage(messages.you)}: </span>
                    }
                    <span dangerouslySetInnerHTML={{__html: message.text}}></span>
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
                                    <span>{conversationHal.unseenMessages}</span>
                                }
                            </div> : <div></div>
                    }
                    <div className="conversationItem--date">
                        <div>
                            <FormattedRelative value={new Date(message.created)} />
                        </div>
                    </div>
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
                                <span>{conversationHal.unseenMessages}</span>
                            }
                        </div> : <div></div>
                }
                <div className="conversationItem--date">
                    <div>
                        <FormattedRelative value={new Date(message.created)} />
                    </div>
                </div>
            </div>
        </div>
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
        let {loadMoreUsersConversationsAction, moreUsersConversationsAreLoading, actions} = this.props;
        const {scrollTop, scrollHeight, clientHeight} = values;
        const pad = 100; // 100px of the bottom
        // t will be greater than 1 if we are about to reach the bottom
        const t = ((scrollTop + pad) / (scrollHeight - clientHeight));
        if (t > 1 && actions.loadMoreUsersConversations && !moreUsersConversationsAreLoading) {
            loadMoreUsersConversationsAction(actions.loadMoreUsersConversations)
        }
    }

    render() {
        let {conversations} = this.props;
        return <Scrollbars autoHide autoHideDuration={500} className="scrollbar" style={{height: '100%'}}
                           universal={true}
                           ref="scrollbars" renderThumbVertical={this.renderThumb}
                           onUpdate={this.handleScrollbarUpdate}>
            <div className="conversationsList">
                <div className="conversationsList--content">
                    {
                        conversations.map((item) => {
                            return this.buildConversation(item)
                        })
                    }
                </div>
                <div className="conversationsList--stub">
                </div>
            </div>
        </Scrollbars>
    }
}

const messages = defineMessages({
    you: {
        id: 'usersWithConversation.you',
        defaultMessage: 'You'
    },
    request: {
        id: 'usersWithConversation.request',
        defaultMessage: 'Request'
    }
})

const mapStateToProps = (state, props) => {
    return {
        loggedUser: state.master.user,
        conversations: state.messages.usersConversations.items,
        selectedRecipient: state.messages.usersConversations.selectedRecipient,
        moreUsersConversationsAreLoading: state.messages.usersConversations.moreUsersConversationsAreLoading,
        actions: state.messages.usersConversations.actions
    }
}

const mapDispatchToProps = {
    selectUserConversationAction,
    loadUsersWithLastMessageAction,
    loadConversationByUserAction,
    loadMoreUsersConversationsAction,
    showMessagesListAction
}

const routes = [
    {
        id: ConversationContainer.id,
        absolutePath: `/messages/:type/:data`,
        componentLoader: ConversationContainer
    }
]

const loadData = (props, context) => {
    return context.store.dispatch(loadUsersWithLastMessageAction());
}


export default withComponentExtended('usersWithConversations', routes, loadData, null, false)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(UsersWithConversationsContainer)));