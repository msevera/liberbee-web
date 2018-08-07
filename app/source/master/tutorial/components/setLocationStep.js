/**
 * Created by Mike on 9/8/2017.
 */
'use strict';

import React from 'react';
import SetUserLocationContainer from '../../setUserLocation/components/setUserLocationContainer';
import {injectIntl, FormattedMessage, defineMessages} from 'react-intl';
import {messages as tutorialMessages} from '../tutorialMessages';

class SetLocationStep extends React.Component {
    constructor() {
        super();

        this.state = {
            place: ''
        }
    }

    render() {
        let {onSkip, onNext, specified, intl} = this.props;

        return <div className="actionBlock">
            <div className="actionBlock--title">
                <FormattedMessage {...messages.title}/>
            </div>
            <div className="actionBlock--description">
                <FormattedMessage {...messages.description}/>
            </div>
            <div className="actionBlock--content">
                <SetUserLocationContainer />
            </div>
            <div className="actionBlock--actions actionBlock--center">
                {
                    !specified ? <a href="#" onClick={onSkip}>{intl.formatMessage(tutorialMessages.willDoThisLater)}</a> :
                        <button className="btn btn-primary" onClick={onNext}>{intl.formatMessage(tutorialMessages.next)}</button>
                }

            </div>
        </div>
    }
}

const messages = defineMessages({
    title: {
        id: 'specifyLocationStep.title',
        defaultMessage: 'Please specify your location'
    },
    description: {
        id: 'specifyLocationStep.description',
        defaultMessage: 'Choose your city'
    }
})

export default injectIntl(SetLocationStep);