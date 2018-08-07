/**
 * Created by Mike on 9/8/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import WelcomeStep from './welcomeStep';
import SetLocationStep from './setLocationStep';
import ConfirmEmailStep from './confirmEmailStep';
import FinalStep from './finalStep';
import {completeTutorialAction, setResendEmailVerificationStatusAction} from '../../masterActions';
import Popup from '../../../shared/popup/components/popup';

class TutorialContainer extends React.Component {
    constructor(props) {
        super();

        let {userGeoCompleted, showTutorial, showEmailVerification} = props;


        let activeStep = userGeoCompleted && showTutorial && showEmailVerification ? 3 : 0;

        this.stepsCount = 0;
        this.wizardStatus = new Set();
        this.state = {
            activeStep: activeStep
        }
    }

    gotoNextStep = (e) => {
        let {onLastStep} = this.props;

        e.preventDefault();
        let {activeStep} = this.state;

        if (activeStep == this.stepsCount - 1) {
            onLastStep();
        } else {
            this.setState({
                activeStep: ++activeStep
            })
        }
    }

    buildLocationStep() {
        let {userLocation} = this.props;

        return <SetLocationStep onSkip={(e) => {
            this.wizardStatus.delete('location')
            this.gotoNextStep(e);
        }} onNext={(e) => {
            this.wizardStatus.add('location')
            this.gotoNextStep(e);
        }} specified={userLocation.specified}/>
    }

    buildConfirmEmailStep() {
        let {user, setResendEmailVerificationStatusAction, resendEmailStatus} = this.props;
        return <ConfirmEmailStep status={resendEmailStatus} onSkip={(e) => {
            this.gotoNextStep(e);
            setTimeout(() => {
                setResendEmailVerificationStatusAction({status: ''});
            }, 500);
        }} user={user}/>
    }

    getTutorialSteps() {
        let {userGeoCompleted, emailConfirmed, actions, completeTutorialAction, hideWelcomeStep, hideFinalStep, user} = this.props;

        let steps = [];

        if (!hideWelcomeStep) {
            steps.push(<WelcomeStep onNext={this.gotoNextStep}/>)
        }

        if (!userGeoCompleted) {
            steps.push(this.buildLocationStep());
        } else {
            this.wizardStatus.add('location')
        }

        if (!emailConfirmed) {
            steps.push(this.buildConfirmEmailStep());
        } else {
            this.wizardStatus.add('email')
        }

        if (!hideFinalStep) {
            steps.push(<FinalStep user={user} createBookAction={actions.createBook}
                                  onComplete={() => completeTutorialAction(Array.from(this.wizardStatus))}/>);
        }

        return steps;
    }

    onClose(completeTutorial){
        let {completeTutorialAction} = this.props;

        if (completeTutorial){
            completeTutorialAction(Array.from(this.wizardStatus));
        }
    }

    render() {
        let {activeStep} = this.state;
        let {showTutorial} = this.props;
        let steps = this.getTutorialSteps();

        this.stepsCount = steps.length;

        if (activeStep > steps.length - 1) {
            activeStep = steps.length - 1;
        }

        let showClose = activeStep == steps.length - 1 ? true: false;

        return <Popup hideClose={!showClose} show={showTutorial} onPopupClose={() => this.onClose(showClose)}>
            <div className="tutorial">
                {
                    React.cloneElement(steps.find((component, idx) => {
                        return idx == activeStep;
                    }), {steps: steps.length})
                }
            </div>
        </Popup>
    }
}

const mapStateToProps = (state, props) => {
    return {
        actions: state.master.general.actions,
        userGeoCompleted: state.master.general.userGeoCompleted,
        userLocation: state.master.general.userLocation,
        emailConfirmed: state.master.general.emailConfirmed,
        user: state.master.user,
        resendEmailStatus: state.master.emailVerification.generateVerificationTokenStatus,
        showEmailVerification: state.master.emailVerification.show,
        tutorialCompleted: state.master.general.tutorialCompleted,
        showTutorial: !state.master.general.tutorialCompleted && !!state.master.general.actions.completeTutorial
    }
}

const mapDispatchToProps = {
    completeTutorialAction,
    setResendEmailVerificationStatusAction
}


export default connect(mapStateToProps, mapDispatchToProps)(TutorialContainer);