'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import Popup from '../../../shared/popup/components/popup';
import {messages as formMessages} from "../../../shared/form/messages";
import {messages as validationMessages} from "../../../shared/validation/messages";
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import {updateInfoModelValidators} from '../formValidators';
import {hideUpdateInfoPopupAction, updateInfoAction, updateInfoPlacesAutocompleteAction} from '../updateInfoActions';
import {clearFormErrors, resetForm, submitForm, setFormItem} from "../../../shared/validation/actions";
import {messages as masterMessages} from '../../../master/masterMessages';
import AvatarUpload from '../../../shared/avatar/components/avatarUpload';
import Avatar from "../../../shared/avatar/components/avatar";

class UpdateInfoContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor(props) {
        super();

        this.validators = updateInfoModelValidators;
        this.state = {
            location: '',
            locationId: '',
            file: null,
            avatarImage: props.avatar,
            avatarUpdated: false
        }
    }

    componentDidMount() {
        let {store} = this.context;
        store.dispatch(resetForm({
            model: 'userData.updateInfo.updateInfoModel',
            validators: this.validators
        }));
    }


    onPopupClose = (clearState = true) => {
        let {hideUpdateInfoPopupAction, avatar} = this.props;

        setTimeout(() => {
            clearState && this.setState({
                avatarUpdated: false,
                avatarImage: avatar
            })
        }, 500)

        hideUpdateInfoPopupAction();
    }

    onPopupConfirm = () => {
        let {updateInfoAction, actions, intl} = this.props;
        let {store} = this.context;

        store.dispatch(submitForm({
            model: 'userData.updateInfo.updateInfoModel',
            validators: this.validators
        }))
            .then((updateInfoModel) => {
                let newProfilePicture = this.avatarUpload.getWrappedInstance().getCroppedImage();
                if (newProfilePicture){
                    updateInfoModel.avatar = newProfilePicture;
                }

                updateInfoAction({
                    ...updateInfoModel,
                    intl,
                    updateInfoURI: actions.updateInfo
                })
            });
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

    autocompleteInputChangeHandler = (value) => {
        let {updateInfoPlacesAutocompleteAction} = this.props;
        updateInfoPlacesAutocompleteAction({place: value})
    }

    autocompleteInputBlurHandler = (value) => {
        let {store} = this.context;
        let {location, locationId} = this.state;
        store.dispatch(setFormItem({
            model: 'userData.updateInfo.updateInfoModel',
            prop: 'location',
            value: location,
            validators: this.validators.location
        }))
        store.dispatch(setFormItem({
            model: 'userData.updateInfo.updateInfoModel',
            prop: 'locationId',
            value: locationId,
            validators: {}
        }))
    }

    autocompleteSelectedValueChanged = (data, text, meta) => {

    }

    autocompleteHoveredValueChanged = (data, text) => {
        if (data) {
            this.setState({
                location: text,
                locationId: data._id
            })
        }
    }

    buildPlacesSuggestionsSource(placesSuggestionsRes, query) {
        return placesSuggestionsRes.map((suggest) => {

            let secondaryTerms = suggest.terms
                .map((term, idx) => {
                    return <span key={idx}>{idx > 0 ? ', ' : ''}{term.text}</span>
                })

            let queryRegexp = new RegExp('(' + query + ')', 'i')
            let primaryText = suggest.text.replace(queryRegexp, '<span class="autocomplete--highlight">$1</span>')

            return {
                data: suggest,
                title: suggest.text,
                text: (<span>
                    <span className="autocomplete--primary" dangerouslySetInnerHTML={{__html: primaryText}}></span>
                    {
                        !!secondaryTerms && <span className="autocomplete--secondary"> ({secondaryTerms})</span>
                    }
                </span>)
            }
        })
    }

    onAvatarChangedHandler = (image) => {
        this.setState({
            avatarImage: image,
            avatarUpdated: true
        })
    }

    render() {
        let {intl, show, placesAutocomplete, userName, avatar, loading} = this.props;
        let {avatarImage, avatarUpdated} = this.state;

        return <Popup show={show} id="updateInfoPopup"
                      title={intl.formatMessage(messages.title)}
                      confirmAction={this.onPopupConfirm}
                      confirmActionText={intl.formatMessage(messages.confirm)}
                      confirmActionLoading={loading}
                      cancelAction={this.onPopupClose}
                      cancelActionText={intl.formatMessage(masterMessages.cancel)}
                      onPopupClose={this.onPopupClose}>

            <div>
                <form className="form" onKeyDown={this.onFormKeyDown}>
                    <div className="updateInfo mt-3">
                        <div className="updateInfo--avatar">
                            <AvatarUpload
                                ref={(avatarUpload) => { this.avatarUpload = avatarUpload; }}
                                src={avatarImage}
                                userName={userName}
                                updated={avatarUpdated}
                                onAvatarChanged={this.onAvatarChangedHandler}
                            />
                        </div>
                        <FormGroupInput id="fullName"
                                        required={true}
                                        label={intl.formatMessage(formMessages.fullName)}
                                        placeholder={intl.formatMessage(formMessages.fullNamePlaceholder)}
                                        model="userData.updateInfo.updateInfoModel"
                                        prop="fullName"
                                        validators={this.validators.fullName}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.nameRequired)
                                        }}/>
                        <FormGroupInput id="location"
                                        required={true}
                                        label={intl.formatMessage(formMessages.city)}
                                        placeholder={intl.formatMessage(formMessages.cityPlaceholder)}
                                        type="autocomplete"
                                        model="userData.updateInfo.updateInfoModel"
                                        prop="location"
                                        suggestions={placesAutocomplete.suggestions}
                                        suggestionsBuilder={this.buildPlacesSuggestionsSource}
                                        onInputChange={this.autocompleteInputChangeHandler}
                                        onInputBlur={this.autocompleteInputBlurHandler}
                                        onSelectedValueChanged={this.autocompleteSelectedValueChanged}
                                        onHoveredValueChanged={this.autocompleteHoveredValueChanged}
                                        validators={this.validators.location}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.cityRequired)
                                        }}

                        />
                    </div>
                </form>
            </div>
        </Popup>
    }
}

const messages = defineMessages({
    title: {
        id: 'updateInfo.title',
        defaultMessage: 'Update my info'
    },
    confirm: {
        id: 'updateInfo.confirm',
        defaultMessage: 'Update'
    }
})

const mapStateToProps = (state, props) => {
    return {
        show: state.userData.updateInfo.general.show,
        loading: state.userData.updateInfo.general.loading,
        userName: state.userData.user.name,
        actions: state.userData.general.actions,
        placesAutocomplete: state.userData.updateInfo.general.placesAutocomplete,
        avatar: state.userData.user.photo,
    }
}

const mapDispatchToProps = {
    hideUpdateInfoPopupAction,
    updateInfoAction,
    updateInfoPlacesAutocompleteAction
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(UpdateInfoContainer));