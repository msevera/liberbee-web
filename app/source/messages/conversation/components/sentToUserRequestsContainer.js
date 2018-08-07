/**
 * Created by Mike on 10/16/2017.
 */
'use strict';

import React from 'react';
import {connect} from 'react-redux';
import DealRequestSent from './dealRequest/dealRequestSent';
import {markAsReceivedDealRequestLineAction, undoReceivedDealRequestLineAction} from '../../messagesActions'
import {withComponentExtended} from '../../../hoc';
import {injectIntl, defineMessages} from 'react-intl';

class SentToUserRequestsContainer extends React.Component {
    getName(recipient) {
        let nameArr = recipient.name.split(' ');
        return nameArr.length > 0 ? nameArr[0] : '';
    }

    render() {
        let {user, dealRequests, markAsReceivedDealRequestLineAction, undoReceivedDealRequestLineAction, intl} = this.props;

        let name = user ? this.getName(user) : '';
        let lastItem = dealRequests.length > 0 && dealRequests[0];
        let previousItems = dealRequests.filter((item, idx) => idx > 0);

        return <div className="dealRequestsList">
            {
                lastItem &&
                <div>
                    <div className="dealRequestsList--title">{intl.formatMessage(messages.lastRequestSent, {user: name})}</div>
                    <div className="dealRequestsList--content">
                        <DealRequestSent markAsReceivedDealRequestLine={markAsReceivedDealRequestLineAction} undoReceivedURIDealRequestLine={undoReceivedDealRequestLineAction} dealRequest={lastItem} opened={true} />
                    </div>
                </div>
            }
            {
                previousItems.length > 0 &&
                <div>
                    <div className="dealRequestsList--title">{intl.formatMessage(messages.previousRequests)}</div>
                    <div className="dealRequestsList--content">
                        {previousItems.map((dealRequest, idx) => {
                            return <DealRequestSent markAsReceivedDealRequestLine={markAsReceivedDealRequestLineAction} undoReceivedURIDealRequestLine={undoReceivedDealRequestLineAction} dealRequest={dealRequest} opened={false} />
                        })}
                    </div>
                </div>
            }
            {
                !lastItem &&
                <div className="dealRequestsList--empty">{intl.formatMessage(messages.noRequests, {user: name})}</div>
            }
        </div>
    }
}

const messages = defineMessages({
    lastRequestSent: {
        id: 'sentRequests.lastRequestRecevied',
        defaultMessage: 'Last request sent to {user}'
    },
    noRequests: {
        id: 'sentRequests.noRequests',
        defaultMessage: 'You haven\'t sent requests to {user} yet'
    },
    previousRequests: {
        id: 'sentRequests.previousRequests',
        defaultMessage: 'Previous requests'
    }
})

const mapStateToProps = (state, props) => {
    return {
        dealRequests: state.messages.dealRequests.sent,
        user: state.messages.dealRequests.user
    }
}

const mapDispatchToProps = {markAsReceivedDealRequestLineAction, undoReceivedDealRequestLineAction}


export default withComponentExtended('sentToUserRequests', [], null, null, false)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(SentToUserRequestsContainer)));