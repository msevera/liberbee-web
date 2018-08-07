/**
 * Created by Mike on 9/10/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {generateEmailVerificationTokenAction} from '../../masterActions';
import {injectIntl, FormattedMessage, defineMessages} from 'react-intl';

class ConfirmEmailContainer extends React.Component {
    constructor(props) {
        super();

        this.state = {
            emailDisabled: true,
            email: props.user.email
        }
    }

    resendEmail = (e) => {
        let {generateEmailVerificationTokenAction} = this.props;

        e.preventDefault();

        generateEmailVerificationTokenAction();
    }

    render() {
        let {email, emailDisabled} = this.state;
        let {resendEmailStatus, intl} = this.props;

        return <div className="resendEmail l-resendEmail">
            <div className="resendEmail--content">
                <span className="resendEmail--emailAddress">{email}</span>
                {
                    resendEmailStatus == 'success' &&
                    <div className="resendEmail--statusResent">
                        <FormattedMessage {...messages.emailSent} />
                    </div>
                }
            </div>
            <div className="resendEmail--action">
                <button className="btn btn-secondary btn-small"
                        onClick={this.resendEmail}>{intl.formatMessage(messages.resendEmail)}</button>
            </div>
        </div>
    }
}

const messages = defineMessages({
    emailSent: {
        id: 'confirmEmail.emailSent',
        defaultMessage: 'Email sent'
    },
    resendEmail: {
        id: 'confirmEmail.resendEmail',
        defaultMessage: 'Resend Email'
    }
})

const mapStateToProps = (state) => {
    return {
        user: state.master.user,
        resendEmailStatus: state.master.emailVerification.generateVerificationTokenStatus
    }
}

const mapDispatchToProps = {
    generateEmailVerificationTokenAction
}


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ConfirmEmailContainer));