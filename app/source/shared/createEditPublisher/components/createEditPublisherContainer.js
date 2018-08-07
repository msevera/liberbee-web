'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import Popup from '../../popup/components/popup';
import {messages as formMessages} from "../../form/messages";
import {messages as validationMessages} from "../../validation/messages";
import FormGroupInput from '../../form/components/formGroupInput';
import {createEditPublisherModelValidators} from '../formValidators';
import {hideCreateEditPublisherPopupAction} from '../createEditPublisherActions';
import {clearFormErrors, submitForm} from "../../validation/actions";
import {messages as masterMessages} from '../../../master/masterMessages';

class CreateEditPublisherContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor(props) {
        super();

        this.createEditPublisherModelValidators = createEditPublisherModelValidators;
    }

    onPopupClose = () => {
        let {hideCreateEditPublisherPopupAction} = this.props;
        hideCreateEditPublisherPopupAction();
    }

    onPopupConfirm = () => {
        let {onCreatePublisher, onEditPublisher, createEditPublisherURI, mode} = this.props;
        let {store} = this.context;

        store.dispatch(submitForm({
            model: 'master.createEditPublisher.createEditPublisherModel',
            validators: this.createEditPublisherModelValidators
        }))
            .then((publisherModel) => {
                mode == 'create' ?
                    onCreatePublisher({
                        names: {...publisherModel},
                        createEditPublisherURI
                    }) :
                    onEditPublisher({
                        names: {...publisherModel},
                        createEditPublisherURI
                    })
            });
    }

    onPopupRemove = () => {
        let {onRemovePublisher, removePublisherURI} = this.props;
        onRemovePublisher({removePublisherURI})
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                e.target.blur();
                this.onPopupConfirm();

                break;
            }
        }
    }

    render() {
        let {intl, mode = 'create', show, removePublisherURI, loading} = this.props;

        return <Popup show={show} id="createEditPublisherEdit"
                      title={mode == 'create' ? intl.formatMessage(messages.createTitle) : intl.formatMessage(messages.editTitle)}
                      confirmAction={this.onPopupConfirm}
                      confirmActionLoading={loading}
                      confirmActionText={mode == 'create' ? intl.formatMessage(messages.createConfirm) : intl.formatMessage(messages.editConfirm)}
                      cancelAction={this.onPopupClose}
                      cancelActionText={intl.formatMessage(masterMessages.cancel)}
                      removeAction={removePublisherURI && this.onPopupRemove}
                      removeActionText={intl.formatMessage(messages.removePublisher)}
                      onPopupClose={this.onPopupClose}>
            <div className="createEditPublisher">
                <form className="form" onKeyDown={this.onFormKeyDown}>
                    <FormGroupInput id="publisherEn"
                                    required={true}
                                    label={intl.formatMessage(formMessages.publisherNameOnEnglish)}
                                    placeholder={intl.formatMessage(formMessages.publisherNameEnPlaceholder)}
                                    model="master.createEditPublisher.createEditPublisherModel"
                                    prop="en"
                                    validators={this.createEditPublisherModelValidators.en}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.publisherNameRequired)
                                    }}/>
                    <FormGroupInput id="publisherUk"
                                    required={true}
                                    label={intl.formatMessage(formMessages.publisherNameOnUkrainian)}
                                    placeholder={intl.formatMessage(formMessages.publisherNameUkPlaceholder)}
                                    model="master.createEditPublisher.createEditPublisherModel"
                                    prop="uk"
                                    validators={this.createEditPublisherModelValidators.uk}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.publisherNameRequired)
                                    }}/>

                    <FormGroupInput id="publisherRu"
                                    required={true}
                                    label={intl.formatMessage(formMessages.publisherNameOnRussian)}
                                    placeholder={intl.formatMessage(formMessages.publisherNameRuPlaceholder)}
                                    model="master.createEditPublisher.createEditPublisherModel"
                                    prop="ru"
                                    validators={this.createEditPublisherModelValidators.ru}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.publisherNameRequired)
                                    }}/>

                </form>
            </div>
        </Popup>
    }
}

const messages = defineMessages({
    createTitle: {
        id: 'createEditPublisher.createTitle',
        defaultMessage: 'Add new publisher'
    },
    editTitle: {
        id: 'createEditPublisher.editTitle',
        defaultMessage: 'Edit publisher'
    },
    createConfirm: {
        id: 'createEditPublisher.createConfirmLabel',
        defaultMessage: 'Create publisher'
    },
    editConfirm: {
        id: 'createEditPublisher.editConfirmLabel',
        defaultMessage: 'Save'
    },
    removePublisher: {
        id: 'createEditPublisher.removePublisher',
        defaultMessage: 'Remove'
    }
})

const mapStateToProps = (state, props) => {
    return {
        mode: state.master.createEditPublisher.general.mode,
        loading: state.master.createEditPublisher.general.loading,
        show: state.master.createEditPublisher.general.show,
        createEditPublisherURI: state.master.createEditPublisher.general.createEditPublisherURI,
        removePublisherURI: state.master.createEditPublisher.general.removePublisherURI,
    }
}

const mapDispatchToProps = {
    hideCreateEditPublisherPopupAction
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(CreateEditPublisherContainer));