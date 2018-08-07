/**
 * Created by Mike on 11/4/2017.
 */

import React from 'react';
import {defineMessages, FormattedMessage, FormattedNumber} from 'react-intl';

class Empty extends React.Component {

    renderImage() {
        let {type = 'books'} = this.props;

        switch (type) {
            case 'books': {
                return <img src="/img/icons/empty-books.svg" alt="books"/>
            }

            case 'messages': {
                return <img src="/img/icons/empty-messages.svg" alt="books"/>
            }
        }
    }

    render() {
        let {message, secondaryMessage, renderImg=true, className} = this.props;

        return <div className={`empty ${className ? className : ''}`}>
            {
                renderImg &&
                this.renderImage()
            }
            <div className="empty--primaryMessage">{message}</div>
            <div className="empty--secondaryMessage">{secondaryMessage}</div>
        </div>
    }
}

export default Empty;