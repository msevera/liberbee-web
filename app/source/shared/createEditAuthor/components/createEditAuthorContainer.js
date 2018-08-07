'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import Popup from '../../popup/components/popup';
import {messages as formMessages} from "../../form/messages";
import {messages as validationMessages} from "../../validation/messages";
import FormGroupInput from '../../form/components/formGroupInput';
import {createEditAuthorModelValidators} from '../formValidators';
import {hideCreateEditAuthorPopupAction} from '../createEditAuthorActions';
import {clearFormErrors, submitForm} from "../../validation/actions";
import {messages as masterMessages} from '../../../master/masterMessages';

class CreateEditAuthorContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor(props) {
        super();

        this.createEditAuthorModelValidators = createEditAuthorModelValidators;
    }

    onPopupClose = () => {
        let {hideCreateEditAuthorPopupAction} = this.props;
        hideCreateEditAuthorPopupAction();
    }

    onPopupConfirm = () => {
        let {onCreateAuthor, onEditAuthor, createEditAuthorURI, mode} = this.props;
        let {store} = this.context;

        store.dispatch(submitForm({
            model: 'master.createEditAuthor.createEditAuthorModel',
            validators: this.createEditAuthorModelValidators
        }))
            .then((authorModel) => {
                mode == 'create' ?
                    onCreateAuthor({
                        names: {...authorModel},
                        createEditAuthorURI
                    }) :
                    onEditAuthor({
                        names: {...authorModel},
                        createEditAuthorURI
                    })
            });
    }

    onPopupRemove = () => {
        let {onRemoveAuthor, removeAuthorURI} = this.props;
        onRemoveAuthor({removeAuthorURI})
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
        let {intl, mode = 'create', show, removeAuthorURI, loading} = this.props;

        return <Popup show={show} id="createEditAuthorEditPopup"
                      title={mode == 'create' ? intl.formatMessage(messages.createTitle) : intl.formatMessage(messages.editTitle)}
                      confirmAction={this.onPopupConfirm}
                      confirmActionLoading={loading}
                      confirmActionText={mode == 'create' ? intl.formatMessage(messages.createConfirm) : intl.formatMessage(messages.editConfirm)}
                      cancelAction={this.onPopupClose}
                      cancelActionText={intl.formatMessage(masterMessages.cancel)}
                      removeAction={removeAuthorURI && this.onPopupRemove}
                      removeActionText={intl.formatMessage(messages.removeAuthor)}
                      onPopupClose={this.onPopupClose}>
            <div className="createEditAuthor">
                <div className="form" onKeyDown={this.onFormKeyDown}>
                    <FormGroupInput id="authorEn"
                                    required={true}
                                    label={intl.formatMessage(formMessages.authorNameOnEnglish)}
                                    placeholder={intl.formatMessage(formMessages.authorNameEnPlaceholder)}
                                    model="master.createEditAuthor.createEditAuthorModel"
                                    prop="en"
                                    validators={this.createEditAuthorModelValidators.en}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.authorNameRequired)
                                    }}/>
                    <FormGroupInput id="authorUk"
                                    required={true}
                                    label={intl.formatMessage(formMessages.authorNameOnUkrainian)}
                                    placeholder={intl.formatMessage(formMessages.authorNameUkPlaceholder)}
                                    model="master.createEditAuthor.createEditAuthorModel"
                                    prop="uk"
                                    validators={this.createEditAuthorModelValidators.uk}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.authorNameRequired)
                                    }}/>

                    <FormGroupInput id="authorRu"
                                    required={true}
                                    label={intl.formatMessage(formMessages.authorNameOnRussian)}
                                    placeholder={intl.formatMessage(formMessages.authorNameRuPlaceholder)}
                                    model="master.createEditAuthor.createEditAuthorModel"
                                    prop="ru"
                                    validators={this.createEditAuthorModelValidators.ru}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.authorNameRequired)
                                    }}/>

                </div>
            </div>
        </Popup>
    }
}

const messages = defineMessages({
    createTitle: {
        id: 'createEditAuthor.createTitle',
        defaultMessage: 'Add new author'
    },
    editTitle: {
        id: 'createEditAuthor.editTitle',
        defaultMessage: 'Edit author'
    },
    createConfirm: {
        id: 'createEditAuthor.createConfirmLabel',
        defaultMessage: 'Create author'
    },
    editConfirm: {
        id: 'createEditAuthor.editConfirmLabel',
        defaultMessage: 'Save'
    },
    removeAuthor: {
        id: 'createEditAuthor.removeAuthor',
        defaultMessage: 'Remove'
    }
})

const mapStateToProps = (state, props) => {
    return {
        mode: state.master.createEditAuthor.general.mode,
        loading: state.master.createEditAuthor.general.loading,
        show: state.master.createEditAuthor.general.show,
        createEditAuthorURI: state.master.createEditAuthor.general.createEditAuthorURI,
        removeAuthorURI: state.master.createEditAuthor.general.removeAuthorURI,
    }
}

const mapDispatchToProps = {
    hideCreateEditAuthorPopupAction
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(CreateEditAuthorContainer));