/**
 * Created by Mike on 10/16/2017.
 */
'use strict';

import React from 'react';
import {connect} from 'react-redux';
import DealRequestReceived from './dealRequest/dealRequestReceived';
import {markAsSentDealRequestLineAction,
    undoSentDealRequestLineAction,
    showDeactivateBookCopyPopupAction,
    setDeactivateBookCopyAction,
    removeBookCopyAction} from '../../messagesActions';
import {withComponentExtended} from '../../../hoc';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import Popup from '../../../shared/popup/components/popup';
import BookCover from '../../../shared/book/components/bookCover';
import halson from 'halson';
import {messages as masterMessages} from '../../../master/masterMessages';

class ReceivedFromUsersRequestsContainer extends React.Component {
    constructor() {
        super();

        this.state = {
            showDeactivateBookCopyPopup: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            showDeactivateBookCopyPopup: nextProps.showDeactivateBookCopyPopup
        })
    }

    getName(recipient) {
        let nameArr = recipient.name.split(' ');
        return nameArr.length > 0 ? nameArr[0] : '';
    }

    onDeactivateBookCopyPopupClose = () => {
        let {showDeactivateBookCopyPopupAction, setDeactivateBookCopyAction} = this.props;
        showDeactivateBookCopyPopupAction(false);

        setTimeout(() => {
            setDeactivateBookCopyAction({})
        }, 500)
    }

    onDeactivateBookCopyPopupConfirm = () => {
        let {removeBookCopyAction, removeBookCopy, intl, deactivateBookCopySlug} = this.props;
        removeBookCopyAction(intl, removeBookCopy, deactivateBookCopySlug);
    }

    getDeactivateBookCopy() {
        let {deactivateDealRequestId, deactivateBookCopyId, dealRequests} = this.props;
        let result = null;

        dealRequests.some((dealRequest) => {
            let dealRequestHal = halson(dealRequest);
            let dealRequestLines = dealRequestHal.getEmbeds('dealRequestLines');

            return dealRequestHal._id == deactivateDealRequestId && dealRequestLines.some((dealRequestLine) => {
                let dealRequestLineHal = halson(dealRequestLine);
                let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');

                if (bookCopySnapshot._id == deactivateBookCopyId) {
                    result = bookCopySnapshot;
                    return true;
                }

                return false;
            })
        })

        return result;
    }

    render() {
        let {user, dealRequests, markAsSentDealRequestLineAction, undoSentDealRequestLineAction, removeBookCopy, intl, removeBookCopyLoading} = this.props;
        let {showDeactivateBookCopyPopup} = this.state;

        let name = user ? this.getName(user) : '';
        let lastItem = dealRequests.length > 0 && dealRequests[0];
        let previousItems = dealRequests.filter((item, idx) => idx > 0);
        let deactivateBookCopy = removeBookCopy && this.getDeactivateBookCopy();
        let deactivateBook = halson(deactivateBookCopy).getEmbed('book');

        return <div className="dealRequestsList">
            {
                lastItem &&
                <div>
                    <div
                        className="dealRequestsList--title">{intl.formatMessage(messages.lastRequestReceived, {user: name})}</div>
                    <div className="dealRequestsList--content">
                        <DealRequestReceived markAsSentDealRequestLine={markAsSentDealRequestLineAction}
                                             undoSentDealRequestLine={undoSentDealRequestLineAction}
                                             dealRequest={lastItem} opened={true}/>
                    </div>
                </div>
            }
            {
                previousItems.length > 0 &&
                <div>
                    <div className="dealRequestsList--title">{intl.formatMessage(messages.previousRequests)}</div>
                    <div className="dealRequestsList--content">
                        {previousItems.map((dealRequest, idx) => {
                            return <DealRequestReceived key={dealRequest._id} markAsSentDealRequestLine={markAsSentDealRequestLineAction}
                                                        undoSentDealRequestLine={undoSentDealRequestLineAction}
                                                        dealRequest={dealRequest} opened={false}/>
                        })}
                    </div>
                </div>
            }
            {
                !lastItem &&
                <div className="dealRequestsList--empty">{intl.formatMessage(messages.noRequests, {user: name})}</div>
            }
            <Popup id="deactivateBookCopy"
                   show={!!showDeactivateBookCopyPopup}
                   title={intl.formatMessage(messages.removeBookPopupTitle)}
                   confirmAction={this.onDeactivateBookCopyPopupConfirm}
                   confirmActionLoading={removeBookCopyLoading}
                   confirmActionText={intl.formatMessage(messages.removeBookPopupConfirmAction)}
                   cancelAction={this.onDeactivateBookCopyPopupClose}
                   cancelActionText={intl.formatMessage(messages.removeBookPopupCancelAction)}
                   onPopupClose={this.onDeactivateBookCopyPopupClose}>
                {
                    deactivateBookCopy &&
                    <div className="bookPlate">
                        <div className="bookPlate--content">
                        <div
                            className={'bookPlate--cover' + (!deactivateBook.cover ? ' bookPlate--cover-is-empty' : '')}>
                            {
                                deactivateBook.cover ?
                                    <BookCover cover={deactivateBook.cover}/> :
                                    <span>Book cover</span>
                            }
                        </div>
                        <div className="bookPlate--data">
                            <div className="deactivateBookCopy">
                                <div className="deactivateBookCopy--messages">
                                    <div>
                                        <FormattedMessage {...messages.removeBookPopupMessage1} values={{
                                            title: <span title={deactivateBook.title} class="deactivateBookCopy--title">{
                                                deactivateBook.title.length > 30 ? `${deactivateBook.title.substr(0, 30)}...` : deactivateBook.title
                                            }</span>
                                        }} />
                                    </div>
                                    <div>
                                        <FormattedMessage {...messages.removeBookPopupMessage2} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                }
            </Popup>
        </div>
    }
}

const messages = defineMessages({
    removeBookPopupTitle: {
        id: 'receivedRequests.removeBookPopupTitle',
        defaultMessage: 'Remove book from bookshelf'
    },
    removeBookPopupConfirmAction: {
        id: 'receivedRequests.removeBookPopupConfirmAction',
        defaultMessage: 'Remove from bookshelf'
    },
    removeBookPopupCancelAction: {
        id: 'receivedRequests.removeBookPopupCancelAction',
        defaultMessage: 'Leave'
    },
    removeBookPopupMessage1: {
        id: 'receivedRequests.removeBookPopupMessage1',
        defaultMessage: 'You have just marked following book \"{title}\" as Sent.'
    },
    removeBookPopupMessage2: {
        id: 'receivedRequests.removeBookPopupMessage2',
        defaultMessage: 'If you sent the last copy of this book we can remove it from your book shelf.'
    },
    lastRequestReceived: {
        id: 'receivedRequests.lastRequestReceived',
        defaultMessage: 'Last request received from {user}'
    },
    noRequests: {
        id: 'receivedRequests.noRequests',
        defaultMessage: 'You haven\'t received requests from {user} yet'
    },
    previousRequests: {
        id: 'receivedRequests.previousRequests',
        defaultMessage: 'Previous requests'
    }
})

const mapStateToProps = (state, props) => {
    return {
        dealRequests: state.messages.dealRequests.received,
        removeBookCopyLoading: state.messages.dealRequests.deactivateBookCopy.removeBookCopyLoading,
        user: state.messages.dealRequests.user,
        showDeactivateBookCopyPopup: state.messages.dealRequests.deactivateBookCopy.showDeactivateBookCopyPopup,
        deactivateDealRequestId: state.messages.dealRequests.deactivateBookCopy.dealRequestId,
        deactivateBookCopyId: state.messages.dealRequests.deactivateBookCopy.bookCopyId,
        deactivateBookCopySlug: state.messages.dealRequests.deactivateBookCopy.bookCopySlug,
        removeBookCopy: state.messages.dealRequests.deactivateBookCopy.removeBookCopy,
    }
}

const mapDispatchToProps = {
    markAsSentDealRequestLineAction,
    undoSentDealRequestLineAction,
    showDeactivateBookCopyPopupAction,
    setDeactivateBookCopyAction,
    removeBookCopyAction
}


export default withComponentExtended('receivedFromUserRequests', [], null, null, false)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ReceivedFromUsersRequestsContainer)))