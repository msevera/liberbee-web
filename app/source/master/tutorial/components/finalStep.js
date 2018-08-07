/**
 * Created by Mike on 9/8/2017.
 */
'use strict';

import React from 'react';
import {Link} from 'react-router-dom';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {withRouteTools} from '../../../hoc';

class FinalStep extends React.Component {
    render() {
        let {createBookAction, onComplete, intl, routeResolver} = this.props;

        return <div className="actionBlock">
            <div className="actionBlock--title">
                <FormattedMessage {...messages.subTitle} />
            </div>
            <div className="actionBlock--content">
                <div className="tutorial">
                    <div className="tutorial--final">
                       {/* <div className="tutorial--finalSubTitle">
                            <FormattedMessage {...messages.subTitle} />
                        </div>*/}
                        <div className="tutorial--description">
                            <FormattedMessage {...messages.description} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="actionBlock--actions actionBlock--center">
                {createBookAction &&
                <Link onClick={onComplete} to={routeResolver.buildRouteFor('addBook', {}, {redirect: true})}
                      className="btn btn-primary">{intl.formatMessage(messages.addBooksToShelf)}</Link>}
            </div>
        </div>
    }
}

const messages = defineMessages({
    title: {
        id: 'finalStep.title',
        defaultMessage: 'Final step'
    },
    subTitle: {
        id: 'finalStep.subTitle',
        defaultMessage: 'Your account is ready'
    },
    description: {
        id: 'finalStep.description',
        defaultMessage: 'To swap and sell books, please put them up for sale'
    },
    addBooksToShelf: {
        id: 'finalStep.addBooksToShelf',
        defaultMessage: 'Put books up for sale'
    }
})

export default withRouteTools(injectIntl(FinalStep));