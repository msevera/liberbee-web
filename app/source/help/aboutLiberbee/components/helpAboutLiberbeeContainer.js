'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../../hoc';
import Helmet from 'react-helmet';
import {withRouter, Link, NavLink} from 'react-router-dom';
import {messages as helpMessages} from '../../helpMessages';

class HelpAboutLiberbeeContainer extends React.Component {
    render() {
        let {intl, routeResolver} = this.props;

        return <div className="docs">
            <Helmet>
                <title>
                    {intl.formatMessage(helpMessages.howItWorks)}
                </title>
            </Helmet>
            <h1>{intl.formatMessage(helpMessages.howItWorks)}</h1>
            <div>
                <FormattedHTMLMessage {...messages.howItWorksContent} />
            </div>
        </div>
    }
}

const messages = defineMessages({
    howItWorksContent: {
        id: 'help.howItWorksContent',
        defaultMessage: '<p><b>Liberbee</b> is a portal for those who are into books, well, to be exact, into paper books. All of us have those that will always live on our shelves, re-read, treasured. But there are also books that were a one-time-thing and forgotten, simply gathering dust. So why not find them another owner?</p><p>With <b>Liberbee</b>, you can sell or swap such books, whatever is best for you. You can meet future book owner if you are from the same city, have a chat, or simply arrange things via postal service. Easy, isn’t it? Do shelves revision and give it a try.</p>'
    }
});

const mapStateToProps = (state, props) => {
    return {}
}

const mapDispatchToProps = {}


export default withComponentExtended('aboutLiberbee', [], null, {
    canonical: (params) => {
        return params;
    }
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(HelpAboutLiberbeeContainer)));