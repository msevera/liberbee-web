/**
 * Created by Mike on 9/29/2017.
 */

'use strict';

import React from 'react';
import {defineMessages, injectIntl} from 'react-intl';

class PaginationSummary extends React.Component {
    render(){
        let {total, from, size, intl} = this.props;
        let totalPages = Math.ceil(total/size);
        let currentPage = Math.ceil(from/size);

        let beforeCurrentPageTotal = (currentPage - 1) * size;
        if (currentPage == totalPages) {
            beforeCurrentPageTotal += total - beforeCurrentPageTotal;
        }else {
            beforeCurrentPageTotal += size;
        }

        return <div className="paginationSummary">
            <span className="paginationSummary--from">{from}</span> - <span className="paginationSummary--to">{beforeCurrentPageTotal}</span> {intl.formatMessage(messages.from)} <span className="paginationSummary--total">{total}</span>
        </div>
    }
}

let messages = defineMessages({
    from: {
        id: 'paginationSummary.from',
        defaultMessage: 'from'
    }
})

export default injectIntl(PaginationSummary);