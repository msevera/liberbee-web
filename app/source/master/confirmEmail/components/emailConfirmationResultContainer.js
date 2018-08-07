/**
 * Created by Mike on 9/14/2017.
 */

'use strict';

import React from 'react';
import Popup from '../../../shared/popup/components/popup';
import history from '../../../../../utils/history';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {showEmailConfirmationResultAction} from '../../masterActions';
import {injectIntl, defineMessages} from 'react-intl';
import {messages as masterMessages} from '../../masterMessages';
import {withTools} from '../../../hoc';

class EmailConfirmationResultContainer extends React.Component {
    constructor(props){
        super();
        this.state = {
            show: props.show
        }
    }

    onContinue = () => {
        let {showEmailConfirmationResultAction, routeResolver} = this.props;
        this.setState({
            show: false
        })

        let path = routeResolver.buildRouteFor('index', {}).pathname
        history.replace(path)

        setTimeout(() => {
            showEmailConfirmationResultAction({show: false, status: ''})
        }, 500)
    }

    buildMessage(messageKey) {
        let {intl} = this.props;

        switch (messageKey){
            case 'success':{
                return intl.formatMessage(messages.emailConfirmed);
            }

            case 'invalid_token':{
                return intl.formatMessage(messages.invalidToken);
            }

            case 'already_confirmed': {
                return intl.formatMessage(messages.alreadyConfirmed);
            }
        }
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            show: nextProps.show
        })
    }

    render() {
        let {confirmationStatus, intl} = this.props;
        let {show} = this.state;

        let message = this.buildMessage(confirmationStatus)


        return <Popup show={show} onPopupClose={this.onContinue}>
            <div className="actionBlock actionBlock-above">
                <div className="actionBlock--title">
                    {message}
                </div>

                <div className="actionBlock--actions actionBlock--center">
                    <button className="btn btn-primary" onClick={this.onContinue}>{intl.formatMessage(masterMessages.continue)}</button>
                </div>
            </div>
        </Popup>
    }
}

const messages = defineMessages({
    emailConfirmed: {
        id: 'emailConfirmationResult.emailConfirmed',
        defaultMessage: 'Your email confirmed'
    },
    invalidToken: {
        id: 'emailConfirmationResult.invalidToken',
        defaultMessage: 'Invalid confirmation token'
    },
    alreadyConfirmed: {
        id: 'emailConfirmationResult.alreadyConfirmed',
        defaultMessage: 'Your email already confirmed'
    }
})

const mapStateToProps = (state) => {
    return {
        confirmationStatus: state.master.emailVerification.confirmationStatus,
        show: state.master.emailVerification.show,
    }
}

const mapDispatchToProps = {
    showEmailConfirmationResultAction
}

export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(EmailConfirmationResultContainer)));
