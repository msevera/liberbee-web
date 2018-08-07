'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../hoc';
import {messages as masterMessages} from "../../master/masterMessages";
import Helmet from 'react-helmet';

class ContactsContainer extends React.Component {


    render() {
        let {intl} = this.props;

        return <div className="docs">
            <Helmet>
                <title>
                    {intl.formatMessage(masterMessages.pageTitle, {title: intl.formatMessage(messages.pageTitle)})}
                </title>
            </Helmet>
            <div className="container">
                <div className="row l-infoPage">
                    <div className="col-12">
                        <h1>{intl.formatMessage(messages.pageTitle)}</h1>
                        <div>
                            <FormattedMessage {...messages.pageContent} values={{
                                link: <a href="mailto:support@liberbee.com">support@liberbee.com</a>
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

const messages = defineMessages({
    pageTitle: {
        id: 'contacts.pageTitle',
        defaultMessage: 'Contacts'
    },
    pageContent: {
        id: 'contacts.pageContent',
        defaultMessage: 'If you have any questions please mail us to {link}'
    }
})

const mapStateToProps = (state, props) => {
    return {}
}

const mapDispatchToProps = {}


export default withComponentExtended('contacts', [], null, {
    canonical: (params) => {
        return params;
    }
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContactsContainer)))