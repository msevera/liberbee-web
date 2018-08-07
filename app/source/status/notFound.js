/**
 * Created by Mike on 5/10/2017.
 */

'use strict';

import React from 'react';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {withTools} from '../hoc';
import {Link} from 'react-router-dom';

const NotFound = ({routeResolver, intl}) => (
    <div className="notFound">
        <div className="notFound--content">
            <div className="notFound--icon">

            </div>
            <div className="notFound--primaryMessage">
                <FormattedMessage {...messages.primaryMessage} />
            </div>
            <div className="notFound--secondaryMessage">
                <FormattedMessage {...messages.secondaryMessage} />
            </div>
            <div className="notFound--actions">
                <Link className="btn btn-primary" to={routeResolver.buildRouteFor('index', {}, {redirect: true, reload: true})}>
                    {
                        intl.formatMessage(messages.action)
                    }
                </Link>
            </div>
        </div>
    </div>
)

const messages = defineMessages({
    primaryMessage: {
        id: 'notFound.primaryMessage',
        defaultMessage: 'This page isn\'t available',
    },
    secondaryMessage: {
        id: 'notFound.secondaryMessage',
        defaultMessage: 'The link you followed may be broken, or the page may have been removed',
    },
    action: {
        id: 'notFound.action',
        defaultMessage: 'Back Home',
    },
});

export default withTools(injectIntl(NotFound));