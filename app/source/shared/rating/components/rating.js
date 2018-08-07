/**
 * Created by Mike on 11/4/2017.
 */

import React from 'react';
import {defineMessages, FormattedMessage, FormattedNumber, injectIntl} from 'react-intl';

class RatingSelector extends React.Component {
    render() {
        let {value, intl} = this.props;

        return <div className={`rating ${!value ? 'rating-is-empty' : ''}`} title={value ?
            intl.formatMessage(messages.rating, {
                value
            }) :
            intl.formatMessage(messages.noRating)}>
            {
                value &&
                <span>
                    {
                        intl.formatNumber(value, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })
                    }
                </span>
            }

        </div>
    }
}


const messages = defineMessages({
    rating: {
        id: 'rating.title',
        defaultMessage: 'Book rating average is {value}',
    },
    noRating: {
        id: 'rating.noRating',
        defaultMessage: 'No book rating',
    }
})

export default injectIntl(RatingSelector);