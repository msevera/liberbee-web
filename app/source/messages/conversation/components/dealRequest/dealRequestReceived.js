/**
 * Created by Mike on 10/24/2017.
 */

import React from 'react';
import halson from 'halson';
import DealRequest from './dealRequest';
import {injectIntl, defineMessages} from 'react-intl';
import {messages as masterMessages} from "../../../../master/masterMessages";
import LoadButton from '../../../../shared/button/components/loadButton';

class DealRequestReceived extends DealRequest {
    buildStatus(dealRequestLine) {
        let state = dealRequestLine.requestedFromState;

        /* if (state == 'requested') {
             return 'To read more about statuses';
         }*/

        return '';
    }

    onMarkAsSentDealRequestLine = (dealRequestLine) => {
        let {markAsSentDealRequestLine, dealRequest} = this.props;
        let dealRequestLineHal = halson(dealRequestLine);
        let markAsSentURI = dealRequestLineHal.getLink('markAsSentDealRequestLine');
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
        let bookCopySnapshotHal = halson(bookCopySnapshot);
        let book = bookCopySnapshotHal.getEmbed('book');

        markAsSentDealRequestLine(markAsSentURI, book.slug, bookCopySnapshot.deal.amount, dealRequest._id, bookCopySnapshot._id)
    }

    onUndoSentDealRequestLine = (dealRequestLine) => {
        let {undoSentDealRequestLine, dealRequest} = this.props;
        let dealRequestLineHal = halson(dealRequestLine);
        let undoSentURI = dealRequestLineHal.getLink('undoSentDealRequestLine');
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
        let bookCopySnapshotHal = halson(bookCopySnapshot);
        let book = bookCopySnapshotHal.getEmbed('book');

        undoSentDealRequestLine(undoSentURI, book.slug, bookCopySnapshot.deal.amount, dealRequest._id, bookCopySnapshot._id);
    }

    bildActionsCssClasses(dealRequestLine) {
        let dealRequestLineHal = halson(dealRequestLine);
        let undoSentURI = dealRequestLineHal.getLink('undoSentDealRequestLine');

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
        let markAsSentURI = dealRequestLineHal.getLink('markAsSentDealRequestLine');
        let undoSentURI = dealRequestLineHal.getLink('undoSentDealRequestLine');

        return <div>
            {
                markAsSentURI &&
                <LoadButton className="btn btn-primary btn-small d-none d-sm-inline-flex" key="buttonSend"
                            text={intl.formatMessage(messages.markAsSent)}
                            loading={dealRequestLine.loading}
                            onClick={this.onMarkAsSentDealRequestLine.bind(this, dealRequestLine)}/>
            }
            {
                markAsSentURI &&
                <LoadButton className="btn btn-primary btn-small d-inline-flex d-sm-none" key="buttonSendShort"
                            text={intl.formatMessage(messages.markAsSentShort)}
                            loading={dealRequestLine.loading}
                            onClick={this.onMarkAsSentDealRequestLine.bind(this, dealRequestLine)}/>
            }
            {
                undoSentURI &&
                [<span key="buttonSendLabel">{intl.formatMessage(messages.markedAsSent)}</span>,
                    <LoadButton className="btn btn-link btn-link btn-small" key="buttonSendUndo"
                                text={intl.formatMessage(masterMessages.undo)}
                                loading={dealRequestLine.loading}
                                onClick={this.onUndoSentDealRequestLine.bind(this, dealRequestLine)}/>]
            }
        </div>
    }
}

const messages = defineMessages({
    markAsSent: {
        id: 'dealRequestReceived.markAsSent',
        defaultMessage: 'Mark book as sent'
    },
    markAsSentShort: {
        id: 'dealRequestReceived.markAsSentShort',
        defaultMessage: 'Mark as sent'
    },
    markedAsSent: {
        id: 'dealRequestReceived.markedAsSent',
        defaultMessage: 'Book is marked as sent'
    }
})

export default injectIntl(DealRequestReceived);