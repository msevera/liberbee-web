/**
 * Created by Mike on 9/8/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import SetLocationStep from './setLocationStep';
import ConfirmEmailStep from './confirmEmailStep';
import {
    completeTutorialAction,
    setResendEmailVerificationStatusAction
} from '../../masterActions'

class RequiredInfoContainer extends React.Component {
    constructor() {
        super();

        this.stepsCount = 0;

        this.state = {
            activeStep: 0
        }
    }

    gotoNextStep = (e) => {
        let {onLastStep, onStepIndexChanged} = this.props;

        e.preventDefault();
        let {activeStep} = this.state;

        if (activeStep == this.stepsCount - 1) {
            onLastStep();
        } else {
            let newStep = ++activeStep;
            this.setState({
                activeStep: newStep
            })

            onStepIndexChanged(newStep);
        }
    }

    buildLocationStep() {
        let {userLocation} = this.props;

        return <SetLocationStep onSkip={this.gotoNextStep} onNext={this.gotoNextStep}
                                specified={userLocation.specified}/>
    }

    buildConfirmEmailStep() {
        let {user, setResendEmailVerificationStatusAction, resendEmailStatus} = this.props;
        return <ConfirmEmailStep status={resendEmailStatus} onSkip={(e) => {
            this.gotoNextStep(e)
            setTimeout(() => {
                setResendEmailVerificationStatusAction({status: ''});
            }, 500);
        }} user={user}/>
    }


    getTutorialSteps() {
        let {userGeoCompleted, emailConfirmed} = this.props;

        let steps = [];

        if (!userGeoCompleted) {
            steps.push(this.buildLocationStep());
        }

        if (!emailConfirmed) {
            steps.push(this.buildConfirmEmailStep());
        }

        return steps;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            activeStep: nextProps.stepIndex
        })
    }

    render() {
        let {activeStep} = this.state;

        let steps = this.getTutorialSteps();

        this.stepsCount = steps.length;
        ;

        return <div className="requiredInfo">
            {
                steps.length && React.cloneElement(steps.find((component, idx) => {
                    return idx == activeStep;
                }), {steps: steps.length})
            }
        </div>
    }
}

const mapStateToProps = (state, props) => {
    return {
        actions: state.master.general.actions,
        userGeoCompleted: state.master.general.userGeoCompleted,
        userLocation: state.master.general.userLocation,
        emailConfirmed: state.master.general.emailConfirmed,
        user: state.master.user,
        stepIndex: props.stepIndex,
        resendEmailStatus: state.master.emailVerification.generateVerificationTokenStatus
    }
}

const mapDispatchToProps = {
    completeTutorialAction,
    setResendEmailVerificationStatusAction
}


export default connect(mapStateToProps, mapDispatchToProps)(RequiredInfoContainer);