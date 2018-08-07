/**
 * Created by Mike on 9/8/2017.
 */
'use strict';

import React from 'react';
import ConfirmEmailContainer from '../../confirmEmail/components/confirmEmailContainer';
import {injectIntl, FormattedMessage, defineMessages} from 'react-intl';
import {messages as requiredInfoMessages} from '../requiredInfoMessages';
import {messages as tutorialMessages} from "../../tutorial/tutorialMessages";

class ConfirmEmailStep extends React.Component{
    buildActionBlock(){
        let {status, onSkip, intl} = this.props;

        switch (status){
            case 'already_confirmed': {
                return <div className="actionBlock">
                    <div className="actionBlock--title">
                        <FormattedMessage {...messages.emailConfirmedTitle} />
                    </div>
                    <div className="actionBlock--description">
                        <FormattedMessage {...messages.emailConfirmedDescription} />
                    </div>
                    <div className="actionBlock--actions actionBlock--center">
                        <button className="btn btn-primary" onClick={onSkip}>{intl.formatMessage(requiredInfoMessages.next)}</button>
                    </div>
                </div>
            }

            default: {
                return <div className="actionBlock">
                    <div className="actionBlock--title">
                        <FormattedMessage {...messages.confirmEmailTitle} />
                    </div>
                    <div className="actionBlock--description">
                        <FormattedMessage {...messages.confirmEmailDescription} />
                    </div>
                    <div className="actionBlock--content">
                        <ConfirmEmailContainer />
                    </div>
                    <div className="actionBlock--actions actionBlock--center">
                        <a href="#" onClick={onSkip}>{intl.formatMessage(tutorialMessages.next)}</a>
                    </div>
                </div>
            }
        }
    }

    render(){
        return this.buildActionBlock();
    }
}

const messages = defineMessages({
    emailConfirmedTitle: {
        id: 'confirmEmailStep.emailConfirmedTitle',
        defaultMessage: 'Your email confirmed'
    },
    emailConfirmedDescription: {
        id: 'confirmEmailStep.emailConfirmedDescription',
        defaultMessage: 'Thank you for email confirmation'
    },
    confirmEmailTitle: {
        id: 'requiredInfoConfirmEmailStep.confirmEmailTitle',
        defaultMessage: 'To continue, confirm your email address'
    },
    confirmEmailDescription: {
        id: 'confirmEmailStep.confirmEmailDescription',
        defaultMessage: 'Please follow the link we have sent to your email address'
    }
})

export default injectIntl(ConfirmEmailStep);