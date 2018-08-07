'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedHTMLMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../../hoc';
import Helmet from 'react-helmet';
import {withRouter, Link, NavLink} from 'react-router-dom';
import {messages as helpMessages} from '../../helpMessages';
import {messages as masterMessages} from "../../../master/masterMessages";

class HelpBuyBookContainer extends React.Component {
    render() {
        let {intl, routeResolver} = this.props;

        return <div className="docs">
            <Helmet>
                <title>
                    {intl.formatMessage(masterMessages.pageTitle, {title: intl.formatMessage(helpMessages.buyBook)})}
                </title>
            </Helmet>
            <h1>{intl.formatMessage(helpMessages.buyBook)}</h1>
            <div>
                <FormattedHTMLMessage {...messages.buyBookContent} />
            </div>
        </div>
    }
}

const messages = defineMessages({
    buyBookContent: {
        id: 'help.buyBookContent',
        defaultMessage: '<p>To buy a certain book that you are interested in:</p><p>1. Find the needed book that you are looking for and then click <b>Get book</b>.</p><p>2. On the book details page, view the list of the people who you can get it from.</p><p>3. Choose the person depending on location, price, or swapping option, and then click <b>Request a book</b>.</p><p>4. In the opened window, type a message to the owner, and then click <b>Send request</b>.</p><p>After that, both of you can chat and make further arrangements.</p>'
    }
})

const mapStateToProps = (state, props) => {
    return {}
}

const mapDispatchToProps = {}


export default withComponentExtended('helpBuyBook', [], null, {
    canonical: (params) => {
        return params;
    }
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(HelpBuyBookContainer)));