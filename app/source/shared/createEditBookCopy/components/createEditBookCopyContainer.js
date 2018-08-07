'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import Popup from '../../popup/components/popup';
import {messages as formMessages} from "../../form/messages";
import {messages as validationMessages} from "../../validation/messages";
import FormGroupInput from '../../form/components/formGroupInput';
import FormGroupChecked from '../../form/components/formGroupChecked';
import FormGroupBookCondition from '../../form/components/formGroupBookConditions';
import {createEditBookCopyModelValidators, commentSymbolsCount} from '../formValidators';
import {hideCreateEditBookCopyPopupAction} from '../createEditBookCopyActions';
import {clearFormErrors, resetForm, submitForm} from "../../validation/actions";
import BookCover from '../../book/components/bookCover';
import {messages as masterMessages} from '../../../master/masterMessages';

class CreateEditBookCopyContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor(props) {
        super();

        let {showComment, bookId} = props;
        this.createEditBookCopyValidators = createEditBookCopyModelValidators;
        this.state = {
            showComment: showComment,
            bookId
        }
    }

    componentWillReceiveProps(nextProps) {
        let {showComment, bookId} = nextProps;
        if (bookId == this.state.bookId)
            return;

        this.setState({
            showComment,
            bookId
        })
    }

    componentDidMount() {
        let {store} = this.context;
        store.dispatch(resetForm({
            model: 'master.createEditBookCopy.createEditBookCopyModel',
            validators: this.createEditBookCopyValidators
        }));
    }


    onPopupClose = () => {
        let {hideCreateEditBookCopyPopupAction} = this.props;
        let {store} = this.context;

        hideCreateEditBookCopyPopupAction();

        setTimeout(() => {
            store.dispatch(resetForm({
                model: 'master.createEditBookCopy.createEditBookCopyModel',
                validators: this.createEditBookCopyValidators
            }));
        }, 500)
    }

    onPopupConfirm = () => {
        let {onConfirmBookCopy, createEditBookCopyURI, bookId, bookSlug} = this.props;
        let {store} = this.context;

        store.dispatch(submitForm({
            model: 'master.createEditBookCopy.createEditBookCopyModel',
            validators: this.createEditBookCopyValidators
        }))
            .then((requestModel) => {
                onConfirmBookCopy({
                    ...requestModel,
                    amount: requestModel.amount.toString().replace(',', '.'),
                    createEditBookCopyURI, bookId, bookSlug
                });

                setTimeout(() => {
                    store.dispatch(resetForm({
                        model: 'master.createEditBookCopy.createEditBookCopyModel',
                        validators: this.createEditBookCopyValidators
                    }));
                }, 500)
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


    onAddCommentClickHandler = (e) => {
        e.preventDefault();
        this.setState({
            showComment: true
        })
    }

    render() {
        let {intl, cover, currencyCode, mode = 'create', show, loading} = this.props;
        let {showComment} = this.state;

        return <Popup show={show} id="createEditBookCopyPopup"
                      title={mode == 'create' ? intl.formatMessage(messages.createTitle) : intl.formatMessage(messages.editTitle)}
                      confirmAction={this.onPopupConfirm}
                      confirmActionText={mode == 'create' ? intl.formatMessage(messages.createConfirm) : intl.formatMessage(messages.editConfirm)}
                      confirmActionLoading={loading}
                      cancelAction={this.onPopupClose}
                      cancelActionText={intl.formatMessage(masterMessages.cancel)}
                      onPopupClose={this.onPopupClose}>
            <form className="form" onKeyDown={this.onFormKeyDown}>
                <div className="bookPlate">
                    <div className="bookPlate--content">
                        <div className="bookPlate--cover">
                            <BookCover cover={cover}/>
                        </div>
                        <div className="bookPlate--data">
                            <div className="createBookCopy">
                                <div className="createBookCopy--priceTitle">
                                    {
                                        intl.formatMessage(messages.priceLabel)
                                    }
                                </div>
                                <div className="createBookCopy--price">
                                    <FormGroupInput id="dealAmount"
                                                    inputClassName="txt-right"
                                                    className="form--noMargin"
                                                    suffix={currencyCode}
                                                    required={true}
                                                    placeholder={intl.formatMessage(formMessages.pricePlaceholder)}
                                                    model="master.createEditBookCopy.createEditBookCopyModel"
                                                    prop="amount"
                                                    validators={this.createEditBookCopyValidators.amount}
                                                    messages={{
                                                        required: intl.formatMessage(validationMessages.priceRequired),
                                                        decimal: intl.formatMessage(validationMessages.priceNotValid)
                                                    }}/>
                                </div>
                                <div className="createBookCopy--considerSwapping">
                                    <FormGroupChecked id="dealSwap"
                                                      label={intl.formatMessage(messages.exchangeLabel)}
                                                      type="checkbox"
                                                      name="swap"
                                                      model="master.createEditBookCopy.createEditBookCopyModel"
                                                      prop="swap"
                                                      className="form--noMargin"
                                    />
                                </div>
                                <div className="createBookCopy--condition">
                                    <FormGroupBookCondition id="conditions"
                                                            model="master.createEditBookCopy.createEditBookCopyModel"
                                                            prop="condition"
                                                            validators={this.createEditBookCopyValidators.condition}
                                                            messages={{
                                                                required: intl.formatMessage(validationMessages.bookConditionRequired)
                                                            }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bookPlace--additional">
                        <div className="d-block d-sm-none">
                            <FormGroupBookCondition id="conditions"
                                                    model="master.createEditBookCopy.createEditBookCopyModel"
                                                    prop="condition"
                                                    validators={this.createEditBookCopyValidators.condition}
                                                    messages={{
                                                        required: intl.formatMessage(validationMessages.bookConditionRequired)
                                                    }}
                            />
                        </div>
                        {
                            !showComment ?
                                <a href="#" className="mt-3"
                                   onClick={this.onAddCommentClickHandler}>{intl.formatMessage(messages.addComment)}</a> :
                                <FormGroupInput id="createEditBookCopyComment"
                                                label={intl.formatMessage(formMessages.comment)}
                                                placeholder={intl.formatMessage(formMessages.commentPlaceholder)}
                                                model="master.createEditBookCopy.createEditBookCopyModel"
                                                prop="comment"
                                                type="textarea"
                                                validators={this.createEditBookCopyValidators.comment}
                                                messages={{
                                                    htmlLimitCharsTo: intl.formatMessage(messages.commentLimitChars, {
                                                        count: commentSymbolsCount
                                                    })
                                                }}/>
                        }
                    </div>
                </div>
            </form>
        </Popup>
    }
}

const messages = defineMessages({
    addComment: {
        id: 'createEditBookCopy.addComment',
        defaultMessage: '+ Add Comment'
    },
    commentLimitChars: {
        id: 'createEditBookCopy.descriptionLimitChars',
        defaultMessage: 'Comment can be {count} characters long'
    },
    createTitle: {
        id: 'createEditBookCopy.createTitle',
        defaultMessage: 'Putting book up for sale'
    },
    editTitle: {
        id: 'createEditBookCopy.editTitle',
        defaultMessage: 'Change price'
    },
    priceLabel: {
        id: 'createEditBookCopy.priceLabel',
        defaultMessage: 'Enter the price you want to sell this book'
    },
    createConfirm: {
        id: 'createEditBookCopy.createConfirmLabel',
        defaultMessage: 'Put up for sale'
    },
    editConfirm: {
        id: 'createEditBookCopy.editConfirmLabel',
        defaultMessage: 'Save'
    },
    exchangeLabel: {
        id: 'createEditBookCopy.considerSwapping',
        defaultMessage: 'Consider swapping'
    }
})

const mapStateToProps = (state, props) => {
    return {
        show: state.master.createEditBookCopy.general.show,
        showComment: state.master.createEditBookCopy.general.showComment,
        loading: state.master.createEditBookCopy.general.loading,
        createEditBookCopyURI: state.master.createEditBookCopy.general.createEditBookCopyURI,
        onConfirmBookCopy: props.onConfirmBookCopy,
        mode: props.mode,
        cover: state.master.createEditBookCopy.general.cover,
        bookId: state.master.createEditBookCopy.general.bookId,
        bookSlug: state.master.createEditBookCopy.general.bookSlug,
        currencyCode: state.master.user.geo.currencyCode
    }
}

const mapDispatchToProps = {
    hideCreateEditBookCopyPopupAction
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(CreateEditBookCopyContainer));