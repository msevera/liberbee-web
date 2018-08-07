'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedHTMLMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../../hoc';
import Helmet from 'react-helmet';
import {withRouter, Link, NavLink} from 'react-router-dom';
import {messages as helpMessages} from '../../helpMessages';
import {messages as masterMessages} from "../../../master/masterMessages";


class HelpFindBookContainer extends React.Component {
    render() {
        let {intl, routeResolver} = this.props;

        return <div className="docs">
            <Helmet>
                <title>
                    {intl.formatMessage(masterMessages.pageTitle, {title: intl.formatMessage(helpMessages.findBook)})}
                </title>
            </Helmet>
            <h1>{intl.formatMessage(helpMessages.findBook)}</h1>
            <div>
                <FormattedHTMLMessage {...messages.findBookContent} />
            </div>
        </div>
    }
}

const messages = defineMessages({
    findBookContent: {
        id: 'help.findBookContent',
        defaultMessage: '<p>Find books that you are interested in.</p><h3>To find a book:</h3><p>1. Go to <b>Liberbee</b> home page.</p><p>2. In the search box, type book title, author, genre or ISBN and specify the city or country that you want to find the book in.</p><p>3. Click <b>Search button</b>.</p><p>The available books will appear at the top of the list. For each book, you can view its cover, name, author, rating, and the language that this book is written in.</p><p>If you do not have a concrete book in mind, you can browse through book categories on the left.</p>'
    }
})

const mapStateToProps = (state, props) => {
    return {}
}

const mapDispatchToProps = {}


export default withComponentExtended('helpFindBook', [], null, {
    canonical: (params) => {
        return params;
    }
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(HelpFindBookContainer)));