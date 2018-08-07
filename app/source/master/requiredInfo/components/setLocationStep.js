/**
 * Created by Mike on 9/8/2017.
 */
'use strict';

import React from 'react';
import SetUserLocationContainer from '../../setUserLocation/components/setUserLocationContainer';
import {injectIntl, FormattedMessage, defineMessages} from 'react-intl';
import {messages as requiredInfoMessages} from '../requiredInfoMessages';

class SetLocationStep extends React.Component {
    constructor() {
        super();
    }

    render() {
        let {onSkip, onNext, specified, intl} = this.props;

        return <div className="actionBlock">
            <div className="actionBlock--title">
                <FormattedMessage {...messages.title} />
            </div>
            <div className="actionBlock--description">
            </div>
            <div className="actionBlock--content">
                <SetUserLocationContainer />
            </div>
            <div className="actionBlock--actions actionBlock--center">
                {
                    !specified ?
                        <a href="#" onClick={onSkip}>{intl.formatMessage(requiredInfoMessages.willDoThisLater)}</a> :
                        <button className="btn btn-primary"
                                onClick={onNext}>{intl.formatMessage(requiredInfoMessages.next)}</button>
                }

            </div>
        </div>
    }
}

const messages = defineMessages({
    title: {
        id: 'requiredInfoSetLocationStep.title',
        defaultMessage: 'To continue, specify your location'
    },
    description: {
        id: 'specifyLocationStep.description',
        defaultMessage: 'Choose your city'
    }
})

export default injectIntl(SetLocationStep);