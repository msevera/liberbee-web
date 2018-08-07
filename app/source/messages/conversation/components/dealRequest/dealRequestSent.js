/**
 * Created by Mike on 10/24/2017.
 */

import React from 'react';
import halson from 'halson';
import DealRequest from './dealRequest';
import {injectIntl, defineMessages} from 'react-intl';
import {messages as masterMessages} from '../../../../master/masterMessages';
import LoadButton from '../../../../shared/button/components/loadButton';

class DealRequestSent extends DealRequest {
    buildStatus(dealRequestLine) {
        /*let state = dealRequestLine.requestorState;

        if (state == 'received') {
            return 'Marked as received';
        }*/

        return '';
    }

    onMarkAsReceivedDealRequestLine = (dealRequestLine) => {
        let {markAsReceivedDealRequestLine, dealRequest} = this.props;
        let dealRequestLineHal = halson(dealRequestLine);
        let markAsReceivedURI = dealRequestLineHal.getLink('markAsReceivedDealRequestLine');
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');

        markAsReceivedDealRequestLine(markAsReceivedURI, bookCopySnapshot, dealRequest._id, bookCopySnapshot._id);
    }

    onUndoReceivedDealRequestLine = (dealRequestLine) => {
        let {undoReceivedURIDealRequestLine, dealRequest} = this.props;
        let dealRequestLineHal = halson(dealRequestLine);
        let undoReceivedURI = dealRequestLineHal.getLink('undoReceivedDealRequestLine');
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');

        undoReceivedURIDealRequestLine(undoReceivedURI, bookCopySnapshot, dealRequest._id, bookCopySnapshot._id);
    }

    bildActionsCssClasses(dealRequestLine) {
        let dealRequestLineHal = halson(dealRequestLine);
        let undoSentURI = dealRequestLineHal.getLink('undoReceivedDealRequestLine');

        if (undoSentURI) {
            return ' dealRequest--actions-is-link'
        }

        return '';
    }

    resolveDeal(dealRequestLine) {
        let dealRequestLineHal = halson(dealRequestLine);
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
        return bookCopySnapshot.deal;
    }

    resolveGeo(dealRequestLine) {
        let dealRequestLineHal = halson(dealRequestLine);
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
        return bookCopySnapshot.geo;
    }

    buildActions(dealRequestLine) {
        let {intl} = this.props;
        let dealRequestLineHal = halson(dealRequestLine);
        let markAsReceivedURI = dealRequestLineHal.getLink('markAsReceivedDealRequestLine');
        let undoReceivedURI = dealRequestLineHal.getLink('undoReceivedDealRequestLine');

        return <div>
            {
                markAsReceivedURI &&
                <LoadButton className="btn btn-primary btn-small d-none d-sm-inline-flex" key="buttonReceived"
                            text={intl.formatMessage(messages.markAsReceived)}
                            loading={dealRequestLine.loading}
                            onClick={this.onMarkAsReceivedDealRequestLine.bind(this, dealRequestLine)}/>
            }
            {
                markAsReceivedURI &&
                <LoadButton className="btn btn-primary btn-small d-inline-flex d-sm-none" key="buttonReceivedShort"
                            text={intl.formatMessage(messages.markAsReceivedShort)}
                            loading={dealRequestLine.loading}
                            onClick={this.onMarkAsReceivedDealRequestLine.bind(this, dealRequestLine)}/>
            }
            {
                undoReceivedURI &&
                [<span key="buttonReceivedLabel">{intl.formatMessage(messages.markedAsReceived)}</span>,
                    <LoadButton className="btn btn-link btn-link btn-small" key="buttonReceivedUndo"
                                text={intl.formatMessage(masterMessages.undo)}
                                loading={dealRequestLine.loading}
                                onClick={this.onUndoReceivedDealRequestLine.bind(this, dealRequestLine)}/>]
            }
        </div>
    }
}

const messages = defineMessages({
    markAsReceived: {
        id: 'dealRequestSent.markAsReceived',
        defaultMessage: 'Mark book as received'
    },
    markAsReceivedShort: {
        id: 'dealRequestSent.markAsReceivedShort',
        defaultMessage: 'Mark as received'
    },
    markedAsReceived: {
        id: 'dealRequestSent.markedAsReceived',
        defaultMessage: 'Book is marked as received'
    }
})

export default injectIntl(DealRequestSent);