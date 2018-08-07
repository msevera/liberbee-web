/**
 * Created by Mike on 10/16/2017.
 */
'use strict';

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/messages.scss');
import React from 'react';
import {connect} from 'react-redux';
import {Switch, NavLink, Link} from 'react-router-dom';
import RouteExtended from '../../routeExtended'
import Avatar from '../../shared/avatar/components/avatar';
import UsersWithConversationsContainer from './usersWithConversationsContainer';
import ReceivedRequestsContainer from './receivedRequestsContainer';
import SentRequestsContainer from './sentRequestsContainer';
import ConversationContainer from '../conversation/components/conversationContainer';
import ReceivedFromUserRequestContainer from '../conversation/components/receivedFromUserRequestsContainer';
import SentToUserRequestContainer from '../conversation/components/sentToUserRequestsContainer';
import DOMUtils from '../../../../utils/DOMUtils';
import {Scrollbars} from 'react-custom-scrollbars';
import {markAsReadAction, setInitializedAction, setNotFoundAction, showMessagesListAction, showConversationsListAction} from '../messagesActions';
import {joinDealRequestsSocketRoomAction, leaveDealRequestsSocketRoomAction} from '../../shared/sockets/socketsActions';
import {withComponentExtended} from '../../hoc';
import {injectIntl, defineMessages} from 'react-intl';
import {messages as masterMessages} from '../../master/masterMessages';
import Helmet from 'react-helmet';
import Empty from '../../shared/empty/components/empty';
import PageLoader from '../../shared/empty/components/pageLoader';
import NotFound from '../../notFound';
import RedirectWithStatus from '../../redirectWithStatus';

class MessagesContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {height: '0'};
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.windowClick = this.windowClick.bind(this);
        this.windowBlur = this.windowBlur.bind(this);
        this.markMessagesAsRead = this.markMessagesAsRead.bind(this);

        if (props.gtm) {
            props.gtm.sendCustomPageView('messages')
        }
    }

    componentDidMount() {
        let {joinDealRequestsSocketRoomAction} = this.props;

        let footer = document.getElementsByClassName('l-footer')[0];
        let content = document.getElementsByClassName('l-content')[0];
        DOMUtils.addClass(footer, 'd-none');
        DOMUtils.removeClass(content, 'l-content-minHeight');
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        window.addEventListener('click', this.markMessagesAsRead);
        window.addEventListener('blur', this.markMessagesAsRead);
        window.addEventListener('keydown', this.markMessagesAsRead);

        joinDealRequestsSocketRoomAction();
    }

    componentWillUnmount() {
        let {leaveDealRequestsSocketRoomAction, setInitializedAction, setNotFoundAction, showConversationsListAction} = this.props;

        let footer = document.getElementsByClassName('l-footer')[0];
        let content = document.getElementsByClassName('l-content')[0];
        DOMUtils.removeClass(footer, 'd-none');
        DOMUtils.addClass(content, 'l-content-minHeight');
        window.removeEventListener('resize', this.updateWindowDimensions);
        window.removeEventListener('click', this.markMessagesAsRead);
        window.removeEventListener('blur', this.markMessagesAsRead);
        window.removeEventListener('keydown', this.markMessagesAsRead);
        setInitializedAction(false);
        setNotFoundAction(false);
        leaveDealRequestsSocketRoomAction();
        showConversationsListAction()
    }

    windowClick() {
        this.markMessagesAsRead();
    }

    windowBlur() {
        this.markMessagesAsRead();
    }

    markMessagesAsRead() {
        let {markAsReadAction, markAsReadLoading} = this.props;

        !markAsReadLoading && markAsReadAction();
        //markAsReadAction();
    }

    updateWindowDimensions() {
        let header = document.getElementsByClassName('l-header')[0];
        //let footer = document.getElementsByClassName('l-footer')[0];
        this.setState({height: window.innerHeight - header.offsetHeight/* - footer.offsetHeight*/});
    }

    renderThumb = ({style, ...props}) => {
        return (
            <div
                className="scrollbar--bar"
                style={{...style}}
                {...props}/>
        );
    }

    onShowMessagesList = () => {
        let {showMessagesListAction} = this.props;
        showMessagesListAction();
    }

    render() {
        let {height} = this.state
        let {match, receivedDealRequests, sentDealRequests, user, intl, routeResolver, userConversations, initialized, notFound, showConversationsList, showMessagesList, showUserInfo} = this.props;

        return notFound ? <RedirectWithStatus status={302} to={routeResolver.buildRouteFor('messages', {type: 'u'})}/> :
            <div className="container-fluid l-messages">
                <Helmet>
                    <title>
                        {
                            intl.formatMessage(masterMessages.pageTitle, {
                                title: intl.formatMessage(messages.pageTitle)
                            })
                        }
                    </title>
                </Helmet>
                {

                    <div className="row no-gutters">
                        {
                            !initialized && !notFound &&
                            <PageLoader/>
                        }
                        {
                            userConversations.length == 0 && initialized &&
                            <div className="l-empty-messages">
                                <Empty type="messages" className="empty-small"
                                       message={intl.formatMessage(messages.emptyPrimary)}/>
                            </div>
                        }
                        <div
                            className={`col-12 col-md-3 l-conversationsList ${showConversationsList ? 'l-conversationsList-is-visible' : ''}`}
                            style={{height}}>
                            <div className="l-conversationsListContent">
                                <Switch>
                                    <RouteExtended key={UsersWithConversationsContainer.id} authLevel={1}
                                                   path={routeResolver.buildRouteFor('usersWithConversations').pathname}
                                                   component={UsersWithConversationsContainer}/>
                                    <RouteExtended key={ReceivedRequestsContainer.id} authLevel={1}
                                                   path={routeResolver.buildRouteFor('incomingRequests').pathname}
                                                   component={ReceivedRequestsContainer}/>
                                    <RouteExtended key={SentRequestsContainer.id} authLevel={1}
                                                   path={routeResolver.buildRouteFor('sentRequests').pathname}
                                                   component={SentRequestsContainer}/>
                                </Switch>
                            </div>
                            <div className="l-conversationsListClose"
                                 onClick={this.onShowMessagesList}></div>
                            <div className="l-conversationsListBg" onClick={this.onShowMessagesList}></div>
                        </div>
                        <div
                            className={`col-12 col-md-5 l-messagesList ${showMessagesList ? 'l-messagesList-is-visible' : ''}`}
                            style={{height}}>
                            <RouteExtended key={ConversationContainer.id} authLevel={1}
                                           path={`${routeResolver.getLocalePath()}/messages/:type/:data`}
                                           component={ConversationContainer}/>
                        </div>
                        <div
                            className={`col-12 col-md-4 l-messagesUserInfo ${showUserInfo ? 'l-messagesUserInfo-is-visible' : ''}`}
                            style={{height}}>
                            <div className="l-messagesUserInfoContent">
                                <Scrollbars autoHide autoHideDuration={500} className="scrollbar" style={{height: '100%'}}
                                            universal={true}
                                            ref="scrollbars" renderThumbVertical={this.renderThumb}>
                                    {
                                        user &&
                                        <div className="mt-4 mb-4">
                                            <div className="userInfo userInfo-small">
                                                <Link
                                                    to={routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}, {
                                                        redirect: true,
                                                        reload: true
                                                    })}
                                                    className="userInfo--avatar">
                                                    <Avatar className="avatar-sm-60" src={user.photo} name={user.name}/>
                                                </Link>
                                                <Link
                                                    to={routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}, {
                                                        redirect: true,
                                                        reload: true
                                                    })}
                                                    className="userInfo--name">
                                                    {user.name}
                                                </Link>
                                                <div className="userInfo--location">
                                                    {user.geo.city}, {user.geo.country}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="d-flex justify-content-center mt-4">
                                        <div className="tab">
                                            {
                                                match.params.data &&
                                                <NavLink className="tab--item" activeClassName="tab--item-is-selected"
                                                         to={routeResolver.buildRouteFor('receivedFromUserRequests', {
                                                             type: match.params.type,
                                                             data: match.params.data
                                                         }).pathname}>{intl.formatMessage(messages.received)}
                                                    ({receivedDealRequests.length})</NavLink>
                                            }
                                            {
                                                match.params.data &&
                                                <NavLink className="tab--item" activeClassName="tab--item-is-selected"
                                                         to={routeResolver.buildRouteFor('sentToUserRequests', {
                                                             type: match.params.type,
                                                             data: match.params.data
                                                         }).pathname}>{intl.formatMessage(messages.sent)}
                                                    ({sentDealRequests.length})</NavLink>
                                            }
                                        </div>
                                    </div>
                                    <Switch>
                                        <RouteExtended key={ReceivedFromUserRequestContainer.id} authLevel={1}
                                                       path={`${routeResolver.getLocalePath()}/messages/:type/:data/received`}
                                                       component={ReceivedFromUserRequestContainer}/>
                                        <RouteExtended key={SentToUserRequestContainer.id} authLevel={1}
                                                       path={`${routeResolver.getLocalePath()}/messages/:type/:data/sent`}
                                                       component={SentToUserRequestContainer}/>

                                    </Switch>
                                </Scrollbars>
                            </div>
                            <div className="l-messagesUserInfoClose"
                                 onClick={this.onShowMessagesList}></div>
                            <div className="l-messagesUserInfoBg" onClick={this.onShowMessagesList}></div>
                        </div>
                    </div>
                }
            </div>
    }
}

const messages = defineMessages({
    emptyPrimary: {
        id: 'messages.emptyPrimary',
        defaultMessage: 'You do not have incoming and sent book requests yet'
    },
    pageTitle: {
        id: 'messages.pageTitle',
        defaultMessage: 'Messages'
    },
    received: {
        id: 'messages.received',
        defaultMessage: 'Incoming'
    },
    sent: {
        id: 'messages.sent',
        defaultMessage: 'Sent'
    }
})

const mapStateToProps = (state, props) => {
    return {
        match: props.match,
        notFound: state.messages.general.notFound,
        receivedDealRequests: state.messages.dealRequests.received,
        sentDealRequests: state.messages.dealRequests.sent,
        user: state.messages.dealRequests.user,
        userConversations: state.messages.usersConversations.items,
        markAsReadLoading: state.messages.usersConversations.markAsReadLoading,
        initialized: state.messages.general.initialized,
        showConversationsList: state.messages.general.showConversationsList,
        showMessagesList: state.messages.general.showMessagesList,
        showUserInfo: state.messages.general.showUserInfo
    }
}

const mapDispatchToProps = {
    markAsReadAction,
    joinDealRequestsSocketRoomAction,
    leaveDealRequestsSocketRoomAction,
    setInitializedAction,
    setNotFoundAction,
    showMessagesListAction,
    showConversationsListAction
}

const routes = [
    {
        id: UsersWithConversationsContainer.id,
        absolutePath: `/messages/u`,
        componentLoader: UsersWithConversationsContainer
    },
    {
        id: ReceivedRequestsContainer.id,
        absolutePath: `/messages/i`,
        componentLoader: ReceivedRequestsContainer
    },
    {
        id: SentRequestsContainer.id,
        absolutePath: `/messages/o`,
        componentLoader: SentRequestsContainer
    }

]


export default withComponentExtended('messages', routes, null, null, false)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(MessagesContainer)));