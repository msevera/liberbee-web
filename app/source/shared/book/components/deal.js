/**
 * Created by Mike on 11/4/2017.
 */

import React from 'react';
import {defineMessages, FormattedMessage, FormattedNumber} from 'react-intl';

class Deal extends React.Component {
    render() {
        let {amount, swap, currencyCode, className, align} = this.props;

        let renderSwap = !!swap;
        let renderAmount = amount > 0;
        let renderBoth = renderSwap && renderAmount;
        let renderGiveaway = !renderAmount && !renderSwap;

        let alignCssClass = '';
        if (align == 'center') {
            alignCssClass = 'deal-center';
        }
        else if (align == 'left') {
            alignCssClass = 'deal-left';
        }

        return <div className={'deal' + (alignCssClass ? ` ${alignCssClass}` : '') + (className ? ` ${className}` : '')}>
            {
                renderAmount &&
                <div className="deal--left">

                    <div className="deal--price">
                        <FormattedNumber format="price" currency={currencyCode} value={amount}/>
                    </div>
                    {
                        (renderBoth || (align != 'center')) &&
                        <div className={'deal--or' + (!swap || amount == 0 ? ' deal--or-is-hidden' : '')}>
                            <FormattedMessage {...messages.or}/>
                        </div>
                    }
                </div>
            }
            {
                renderSwap &&
                <div className="deal--swap">
                    <FormattedMessage {...messages.swap}/>
                </div>
            }
            {
                renderGiveaway &&
                <div className="deal--giveaway">
                    <FormattedMessage {...messages.giveaway}/>
                </div>
            }
        </div>
    }
}


const messages = defineMessages({
    swap: {
        id: 'deal.swap',
        defaultMessage: 'Swap',
    },
    giveaway: {
        id: 'deal.giveaway',
        defaultMessage: 'Giveaway',
    },
    or: {
        id: 'deal.or',
        defaultMessage: 'or'
    }
})

export default Deal;