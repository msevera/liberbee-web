'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedHTMLMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../../hoc';
import Helmet from 'react-helmet';
import {withRouter, Link, NavLink} from 'react-router-dom';
import {messages as helpMessages} from '../../helpMessages';
import {messages as masterMessages} from "../../../master/masterMessages";

class HelpMarkAsSentReceivedContainer extends React.Component {
    render() {
        let {intl, routeResolver} = this.props;

        return <div className="docs">
            <Helmet>
                <title>
                    {intl.formatMessage(masterMessages.pageTitle, {title: intl.formatMessage(helpMessages.markAsSentReceived)})}
                </title>
            </Helmet>
            <h1>{intl.formatMessage(helpMessages.markAsSentReceived)}</h1>
            <div>
                <FormattedHTMLMessage {...messages.markAsSentReceivedContent} />
            </div>
        </div>
    }
}

const messages = defineMessages({
    markAsSentReceivedContent: {
        id: 'help.markAsSentReceivedContent',
        defaultMessage: '<p>If you care about your rating, make sure you always mark the book that you sent to someone as <b>Sent</b> and the one that you get - as <b>Received</b>. This way, your book statistic will be indicated on your profile and thus users will know that they can reach out to you.</p><h3>To do this:</h3><p>1. Open the chat that you have started with another user.</p><div>2.\tOn the right side of the chat page, under your profile:<ul><li>For the sent book, on the <b>Incoming</b> tab, click <b>Mark as sent</b>.</li><li>For a book that you got from someone, on the <b>Outgoing</b> tab, click <b>Mark as received</b>.</li></ul></div><div className="docs--note"><span className="docs--noteLabel">Important</span> We would like to remind you that you can only mark books as <b>Sent/Received</b> when the action is complete both sides.</div>'
    }
})


const mapStateToProps = (state, props) => {
    return {}
}

const mapDispatchToProps = {}


export default withComponentExtended('helpMarkAsSentReceived', [], null, {
    canonical: (params) => {
        return params;
    }
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(HelpMarkAsSentReceivedContainer)));