/**
 * Created by Mike on 9/18/2017.
 */
'use strict';

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Popup from '../../popup/components/popup';
import FormGroupInput from '../../form/components/formGroupInput';
import FormGroupChecked from '../../form/components/formGroupChecked';
import FormGroupBookCondition from '../../form/components/formGroupBookConditions';
import {submitForm, clearFormErrors, resetForm} from '../../validation/actions';
import CoverUpload from '../../coverUpload/components/coverUpload';
import {
    hideCreateEditBookManuallyPopupAction,
    createEditBookManuallyAuthorsAutocompleteAction,
    createEditBookManuallyPublishersAutocompleteAction,
    setCreateEditBookManuallyStatusAction
} from '../createEditBookManuallyActions';

import history from '../../../../../utils/history';
import {addBookManuallyFormVaidators} from '../formValidators';
import {injectIntl, FormattedMessage, defineMessages} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';
import {messages as formMessages} from '../../form/messages';
import {messages as validationMessages} from '../../validation/messages';
import {withTools} from '../../../hoc';

class CreateEditBookManually extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }

    constructor() {
        super();
        this.validators = addBookManuallyFormVaidators;

        this.state = {
            file: null,
            coverImage: '',
            removeCover: false,
        }
    }

    componentDidMount() {
        let {store} = this.context;
        store.dispatch(resetForm({
            model: 'master.createEditBookManually.createEditBookManuallyModel',
            validators: this.validators
        }));
    }

    componentWillReceiveProps(nextProps) {
        let {cover} = this.props;
        if (nextProps.mode == 'edit' && cover != nextProps.cover) {
            this.setState({
                coverImage: nextProps.cover,
                file: null
            })
        }
    }

    onAddBook = () => {
        let {onConfirmBookManually, createEditDraftBookURI} = this.props;
        let {coverImage, removeCover, file} = this.state;
        let {store} = this.context;

        store.dispatch(submitForm({
            model: 'master.createEditBookManually.createEditBookManuallyModel',
            validators: this.validators
        }))
            .then((data) => {
                let isbn = data.isbn;
                if (isbn) {
                    let isbnTempArr = isbn.split(',');
                    let tempISBN10 = [];
                    let tempISBN13 = [];
                    isbnTempArr.forEach((isbnTemp) => {
                        isbnTemp = isbnTemp.replace(/-|\s/g, '');
                        if (isbnTemp.length == 10) {
                            tempISBN10.push(isbnTemp);
                        }

                        if (isbnTemp.length == 13) {
                            tempISBN13.push(isbnTemp);
                        }
                    })

                    if (tempISBN10.length > 0) {
                        data.isbn10 = tempISBN10;
                        delete data.isbn;
                    }

                    if (tempISBN13.length > 0) {
                        data.isbn13 = tempISBN13;
                        delete data.isbn;
                    }
                }

                if (file) {
                    data.cover = coverImage;
                }

                if (data.authors) {
                    data.authors = data.authors.split(',').map(i => i.trim());
                }

                if (data.publishers) {
                    data.publishers = data.publishers.split(',').map(i => i.trim());
                }

                if (removeCover) {
                    data.removeCover = removeCover;
                }

                onConfirmBookManually({...data, createEditDraftBookURI});
            });
    }

    onPopupClose = (clearState = true) => {
        let {hideCreateEditBookManuallyPopupAction} = this.props;
        let {store} = this.context;

        setTimeout(() => {
            if (clearState){
                this.setState({
                    file: null,
                    coverImage: ''
                });
                store.dispatch(resetForm({
                    model: 'master.createEditBookManually.createEditBookManuallyModel',
                    validators: this.validators
                }));
            }
        }, 500)

        hideCreateEditBookManuallyPopupAction();
    }

    onPopupCloseAndRedirect = () => {
        let {user, routeResolver} = this.props;
        this.onPopupClose(false);
        setTimeout(() => {
            history.push(routeResolver.buildRouteFor('userPendingBooks', {user: user.slug}).pathname, routeResolver.getReloadState('userPendingBooks', {redirect: true}));
        }, 0)

    }

    onDropAccepted = (acceptedFiles) => {
        let reader = new FileReader();
        let file = acceptedFiles[0];

        reader.onloadend = () => {
            this.setState({
                file,
                coverImage: reader.result,
                removeCover: false
            })
        }

        reader.readAsDataURL(file);
    }

    removeCover = () => {
        this.setState({
            file: null,
            coverImage: '',
            removeCover: true
        })
    }

    onAuthorsAutocompleteInputChangeHandler = (value) => {
        let {createEditBookManuallyAuthorsAutocompleteAction} = this.props;

        createEditBookManuallyAuthorsAutocompleteAction(value);
    }

    onPublisherAutocompleteInputChangeHandler = (value) => {
        let {createEditBookManuallyPublishersAutocompleteAction} = this.props;

        createEditBookManuallyPublishersAutocompleteAction(value);
    }

    getSuccessView() {
        let {show, intl} = this.props;

        return <Popup id="addNewBookPopup"
                      title={intl.formatMessage(messages.thankYou)}
                      show={show}
                      confirmAction={this.onPopupClose}
                      confirmActionText={intl.formatMessage(masterMessages.close)}
                      onPopupClose={this.onPopupClose}
        >
            <div className="actionStatus">
                <div>
                    <FormattedMessage {...messages.sendEmailNotification} />
                </div>
                <div>
                    <FormattedMessage {...messages.findPendingBooks} values={{
                        place: <a href="#" onClick={(e) => {
                            e.preventDefault();
                            this.onPopupCloseAndRedirect()
                        }}>
                            <FormattedMessage {...messages.userProfile} />
                        </a>
                    }}/>
                </div>
            </div>
        </Popup>
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                e.target.blur();
                this.onAddBook();

                break;
            }
        }
    }

    getDefaultView(mode) {
        let {show, intl, user, authorsAutocomplete, publishersAutocomplete, loading} = this.props;
        let {coverImage} = this.state;

        return <Popup id="createEditBookManuallyPopup"
                      title={intl.formatMessage(messages.addNewBook)}
                      show={show}
                      confirmAction={this.onAddBook}
                      confirmActionLoading={loading}
                      confirmActionText={mode == 'create' ? intl.formatMessage(messages.addBook) : intl.formatMessage(messages.editConfirm)}
                      cancelAction={this.onPopupClose}
                      cancelActionText={intl.formatMessage(masterMessages.cancel)}
                      onPopupClose={() => this.onPopupClose(false)}
        >
            <div className="createEditBookManually">
                <form className="form">
                    <FormGroupInput id="createEditBookManuallyTitle"
                                    required={true}
                                    label={intl.formatMessage(formMessages.bookTitle)}
                                    placeholder={intl.formatMessage(formMessages.bookTitlePlaceholder)}
                                    model="master.createEditBookManually.createEditBookManuallyModel"
                                    prop="title"
                                    validators={this.validators.title}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.titleRequired)
                                    }}/>
                    <FormGroupInput id="createEditBookManuallyAuthor"
                                    type="autocomplete"
                                    label={intl.formatMessage(formMessages.author)}
                                    placeholder={intl.formatMessage(formMessages.authorPlaceholder)}
                                    model="master.createEditBookManually.createEditBookManuallyModel"
                                    prop="authors"
                                    validators={this.validators.authors}
                                    messages={{}}
                                    suggestions={authorsAutocomplete.suggestions}
                                    onInputChange={this.onAuthorsAutocompleteInputChangeHandler}
                    />
                    <FormGroupInput id="createEditBookManuallyPublisher"
                                    type="autocomplete"
                                    required={true}
                                    label={intl.formatMessage(formMessages.publisher)}
                                    placeholder={intl.formatMessage(formMessages.publisherPlaceholder)}
                                    model="master.createEditBookManually.createEditBookManuallyModel"
                                    prop="publishers"
                                    validators={this.validators.publishers}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.publisherRequired)
                                    }}
                                    suggestions={publishersAutocomplete.suggestions}
                                    onInputChange={this.onPublisherAutocompleteInputChangeHandler}
                    />
                    <FormGroupInput id="createEditBookManuallyPublishYear"
                                    required={true}
                                    label={intl.formatMessage(formMessages.publishDate)}
                                    placeholder={intl.formatMessage(formMessages.publishDatePlaceholder)}
                                    model="master.createEditBookManually.createEditBookManuallyModel"
                                    prop="publishDate"
                                    validators={this.validators.publishDate}
                                    messages={{
                                        required: intl.formatMessage(validationMessages.publishYearRequired),
                                        year: intl.formatMessage(validationMessages.publishYearNotValid)
                                    }}/>
                    <FormGroupInput id="createEditBookManuallyISBN"
                                    label={intl.formatMessage(formMessages.isbn)}
                                    hintIcon="question"
                                    hintHTML={intl.formatMessage(formMessages.isbnHint)}
                                    placeholder={intl.formatMessage(formMessages.isbnPlaceholder)}
                                    model="master.createEditBookManually.createEditBookManuallyModel"
                                    prop="isbn"
                                    validators={this.validators.isbn}
                                    messages={{
                                        isbnMultiple: intl.formatMessage(validationMessages.isbnNotValid)
                                    }}/>
                    <div className="form--h">
                        <FormGroupInput id="createEditBookManuallyAmount"
                                        label={intl.formatMessage(messages.priceLabel)}
                                        inputClassName="txt-right w-50"
                                        suffix={user.geo.currencyCode}
                                        required={true}
                                        placeholder={intl.formatMessage(formMessages.pricePlaceholder)}
                                        model="master.createEditBookManually.createEditBookManuallyModel"
                                        prop="amount"
                                        validators={this.validators.amount}
                                        messages={{
                                            required: intl.formatMessage(validationMessages.priceRequired),
                                            decimal: intl.formatMessage(validationMessages.priceNotValid)
                                        }}/>
                        <div className="form--group ml-4">
                            <div className="form--label">
                                <label>{intl.formatMessage(messages.considerSwappingLabel)}</label>
                            </div>
                            <div className="form--h mt-2">
                                <FormGroupChecked id="createEditBookManuallySwapYes"
                                                  label={intl.formatMessage(messages.yes)}
                                                  model="master.createEditBookManually.createEditBookManuallyModel"
                                                  prop="swap"
                                                  name="swap"
                                                  className="form--noMargin"
                                                  value={true}
                                />
                                <FormGroupChecked id="createEditBookManuallySwapNo"
                                                  label={intl.formatMessage(messages.no)}
                                                  model="master.createEditBookManually.createEditBookManuallyModel"
                                                  prop="swap"
                                                  name="swap"
                                                  className="form--noMargin"
                                                  value={false}
                                />
                            </div>
                        </div>
                    </div>
                    <FormGroupBookCondition id="conditions"
                                            model="master.createEditBookManually.createEditBookManuallyModel"
                                            prop="condition"
                                            showLabel={true}
                                            validators={this.validators.condition}
                                            messages={{
                                                required: intl.formatMessage(validationMessages.bookConditionRequired)
                                            }}
                    />
                    <div className="form--group form--marginBottom form--marginTop">
                        <CoverUpload
                            onRemoveCover={this.removeCover}
                            onDropAccepted={this.onDropAccepted}
                            src={coverImage}
                        />
                    </div>
                </form>
            </div>
        </Popup>
    }

    buildPopup() {
        let {status, mode = 'create'} = this.props;

        if (mode == 'create') {
            switch (status) {
                case 'success': {
                    return this.getSuccessView()
                }

                default: {
                    return this.getDefaultView(mode)
                }
            }
        } else {
            return this.getDefaultView()
        }
    }

    render() {
        return this.buildPopup();
    }
}

const messages = defineMessages({
    addNewBook: {
        id: 'createEditBookManually.addNewBook',
        defaultMessage: 'Add new book'
    },
    addBook: {
        id: 'createEditBookManually.addBook',
        defaultMessage: 'Add book'
    },
    yes: {
        id: 'createEditBookManually.yes',
        defaultMessage: 'Yes'
    },
    no: {
        id: 'createEditBookManually.no',
        defaultMessage: 'No'
    },
    thankYou: {
        id: 'createEditBookManually.thankYou',
        defaultMessage: 'Thank you'
    },
    sendEmailNotification: {
        id: 'createEditBookManually.sendEmailNotification',
        defaultMessage: 'We will send you an email notification when your book will be approved by our managers.'
    },
    findPendingBooks: {
        id: 'createEditBookManually.findPendingBooks',
        defaultMessage: 'You can find your pending books in {place}'
    },
    userProfile: {
        id: 'createEditBookManually.userProfile',
        defaultMessage: 'User profile'
    },
    considerSwappingLabel: {
        id: 'createEditBookManually.considerSwapping',
        defaultMessage: 'Do you consider swapping?'
    },
    editConfirm: {
        id: 'createEditBookManually.editConfirmLabel',
        defaultMessage: 'Save'
    },
    priceLabel: {
        id: 'createEditBookManually.priceLabel',
        defaultMessage: 'Price you want to sell this book'
    }
});

const mapStateToProps = (state, props) => {
    return {
        status: state.master.createEditBookManually.general.status,
        loading: state.master.createEditBookManually.general.loading,
        user: state.master.user,
        show: state.master.createEditBookManually.general.show,
        cover: state.master.createEditBookManually.general.cover,
        mode: state.master.createEditBookManually.general.mode,
        authorsAutocomplete: state.master.createEditBookManually.general.authorsAutocomplete,
        publishersAutocomplete: state.master.createEditBookManually.general.publishersAutocomplete,
        createEditDraftBookURI: state.master.createEditBookManually.general.createEditDraftBookURI,
        onConfirmBookManually: props.onConfirmBookManually,
    }
}

const mapDispatchToProps = {
    hideCreateEditBookManuallyPopupAction,
    createEditBookManuallyAuthorsAutocompleteAction,
    createEditBookManuallyPublishersAutocompleteAction,
    setCreateEditBookManuallyStatusAction
}

export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(CreateEditBookManually)));