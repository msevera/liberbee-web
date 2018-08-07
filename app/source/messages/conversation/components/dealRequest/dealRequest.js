/**
 * Created by Mike on 10/24/2017.
 */

import React from 'react';
import Collapsible from 'react-collapsible';
import halson from 'halson';
import BookCover from './../../../../shared/book/components/bookCover';
import Deal from '../../../../shared/book/components/deal';
import BookCondition from '../../../../shared/book/components/bookCondition';

class DealRequest extends React.Component {
    buildBookCopy(dealRequestLine) {
        let dealRequestLineHal = halson(dealRequestLine);
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
        let bookCopySnapshotHal = halson(bookCopySnapshot);
        let book = bookCopySnapshotHal.getEmbed('book');
        let deal = this.resolveDeal(dealRequestLine);
        let geo = this.resolveGeo(dealRequestLine);

        return <div className="dealRequest--item" key={bookCopySnapshot._id}>
            <div className="dealRequest--cover">
                <BookCover cover={book.cover} title={book.title} />
            </div>
            <div className="dealRequest--data">
                <div className="dealRequest--title">{book.title}</div>
                {
                    bookCopySnapshot.condition &&
                    <div className="dealRequest--condition">
                        <BookCondition className="bookCondition-normal" condition={bookCopySnapshot.condition} comment={bookCopySnapshot.comment} />
                    </div>
                }
                <div className="dealRequest--deal">
                    <Deal align="left" amount={deal.amount} swap={deal.swap} currencyCode={geo.currencyCode} />
                </div>
                <div>
                    <div className="dealRequest--status">
                        {this.buildStatus(dealRequestLine)}
                    </div>
                    <div className={'dealRequest--actions' + this.bildActionsCssClasses(dealRequestLine)}>
                        {this.buildActions(dealRequestLine)}
                    </div>
                </div>
            </div>
        </div>
    }

    resolveDeal(dealRequestLine){
        let dealRequestLineHal = halson(dealRequestLine);
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
        return bookCopySnapshot.deal;
    }

    resolveGeo(dealRequestLine) {
        let dealRequestLineHal = halson(dealRequestLine);
        let bookCopySnapshot = dealRequestLineHal.getEmbed('bookCopySnapshot');
        return bookCopySnapshot.geo;
    }

    bildActionsCssClasses(){
        return '';
    }

    getTrigger() {
        let {dealRequest, intl} = this.props;

        return <div className="dealRequest--heading">
            <span className="dealRequest--date">
                {intl.formatDate(dealRequest.created, {format: 'dateShort'})}
            </span>
        </div>
    }

    render() {
        let {dealRequest, opened} = this.props;
        let dealRequestHal = halson(dealRequest);
        let dealRequestLines = dealRequestHal.getEmbeds('dealRequestLines');
        return <div className="dealRequest"><Collapsible classParentString="collapsible" transitionTime={300}
                                                         trigger={this.getTrigger()} open={opened}>
            {
                dealRequestLines.map((dealRequestLine) => {
                    return this.buildBookCopy(dealRequestLine)
                })
            }

        </Collapsible></div>
    }
}

export default DealRequest;