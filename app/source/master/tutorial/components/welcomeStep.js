/**
 * Created by Mike on 9/8/2017.
 */

'use strict';

import React from 'react';
import {injectIntl, FormattedMessage, defineMessages} from 'react-intl';
import {messages as tutorialMessages} from '../tutorialMessages';

class WelcomeStep extends React.Component {
    render() {
        let {steps, onNext, intl} = this.props;

        return <div className="actionBlock">
            <div className="actionBlock--title">
                <FormattedMessage {...messages.welcome} />
            </div>
            <div className="actionBlock--content">
                <div className="tutorial">
                    <div className="tutorial--welcome">
                        <FormattedMessage {...messages.getStarted} />
                    </div>
                </div>
            </div>
            <div className="actionBlock--actions actionBlock--center">
                <button className="btn btn-primary" onClick={onNext}>{intl.formatMessage(tutorialMessages.next)}</button>
            </div>
        </div>
    }
}

const messages = defineMessages({
    welcome: {
        id: 'welcomeStep.welcome',
        defaultMessage: 'Welcome to Liberbee'
    },
    getStarted: {
        id: 'welcomeStep.getStarted',
        defaultMessage: 'To swap and sell books you\'ll have to confirm a few, quick details'
    }
})

export default injectIntl(WelcomeStep);