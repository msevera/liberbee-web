'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {injectIntl, defineMessages, FormattedHTMLMessage} from 'react-intl';
import {withComponentExtended, withTools} from '../../../hoc';
import Helmet from 'react-helmet';
import {withRouter, Link, NavLink} from 'react-router-dom';
import {messages as helpMessages} from '../../helpMessages';
import {messages as masterMessages} from "../../../master/masterMessages";

class HelpSellBookContainer extends React.Component {
    render() {
        let {intl, routeResolver} = this.props;

        return <div className="docs">
            <Helmet>
                <title>
                    {intl.formatMessage(masterMessages.pageTitle, {title: intl.formatMessage(helpMessages.sellBook)})}
                </title>
            </Helmet>
            <h1>{intl.formatMessage(helpMessages.sellBook)}</h1>
            <div>
                <FormattedHTMLMessage {...messages.sellBookContent} />
            </div>
        </div>
    }
}

const messages = defineMessages({
    sellBookContent: {
        id: 'help.sellBookContent',
        defaultMessage: '<p>You can add books that you want to <b>sell</b> or <b>swap</b> to your shelf. This way, other users can request them from you.</p> <h3>To sell a book</h3> <div>1. Do one of the following: <ul> <li>At the top of the <b>Liberbee</b> page, click <b>Sell book</b>.</li> <li>On your profile page, click <b>My bookshelf</b> tab, and then click <b>Sell book</b>.</li> </ul> </div> <div>2. Find the needed book, and then click <b>Put up for sale</b>. <p className="docs--note"><span className="docs--noteLabel">Note</span> You can also add a book on book details page by clicking <b>Put up for sale</b>.</p> </div> <div>3. In the opened window, type the price that you want to sell the book for. If you consider swapping, select also <b>Consider swapping</b>. <p className="docs--note"><span className="docs--noteLabel">Note</span> You can choose different combinations: Indicate the price and consider swapping, choose only swapping, or even leave a zero price without selecting swapping option, this will mean that you want to give this book away for free.</p> </div> <p>4. Click <b>Put up for sale</b>.</p> <p>Now, this book is added to your shelf and other users can send you a request to buy or swap it, depending on what you have indicated.</p> <h3>Add a book manually</h3> <p>In case the book that you want to add and sell is not in our database or the edition that you own is different from the one available on <b>Liberbee</b>, you can add it manually.</p> <p>To add a book manually:</p> <div>1. Do one of the following: <ul> <li>At the top of the <b>Liberbee</b> page, click <b>Sell book</b>.</li> <li>On your profile page, click <b>My bookshelf</b> tab, and then click <b>Sell book</b>.</li> </ul> </div> <p>2. Under the search box, click <b>Add book manually</b>.</p> <p>3. In the opened window, provide the required information, and then click <b>Add book</b>.</p> <p>After you add the book, it is sent to the administrator for further review.</p>'
    }
})

const mapStateToProps = (state, props) => {
    return {}
}

const mapDispatchToProps = {}


export default withComponentExtended('helpSellBook', [], null, {
    canonical: (params) => {
        return params;
    }
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(HelpSellBookContainer)));