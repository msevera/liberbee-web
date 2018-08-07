/**
 * Created by Mike on 9/4/2017.
 */


'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, defineMessages} from 'react-intl';
import Avatar from '../../avatar/components/avatar';
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import {submitForm} from "../../validation/actions";
import LoadButton from "../../button/components/loadButton";
import RatingSelector from "../../rating/components/ratingSelector";
import {messages as masterMessages} from "../../../master/masterMessages";

class CreateEditReview extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }

    onCancelHandler = () => {
        let {onCancel} = this.props;
        onCancel()
    }

    onSaveHandler = () => {
        let {onSave, model, validators} = this.props;
        let {store} = this.context;

        store.dispatch(submitForm({model, validators}))
            .then((data) => {
                onSave(data);
            })
    }

    onFormKeyDown = (e) => {
        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                e.target.blur();
                this.onSaveHandler();

                break;
            }
        }
    }


    render() {
        let {intl, title, user, id, model, prop, validators, messages, placeholder, className, onRemove, onSave, createEditLoading, removeLoading, rating, onRatingChanged} = this.props;

        return <div className={`createReview ${className ? className : ''}`}>
            <div className="createReview--content">
                <div className="createReview--user">
                    <Avatar name={user.name} src={user.photo}/>
                    <div className="createReview--header">
                        <div className="createReview--headerLeft">
                            {
                                title &&
                                <div className="createReview--title">{title}</div>
                            }
                            <div className="createReview--bookRating">
                                <RatingSelector value={rating} onSelectedValueChanged={onRatingChanged}/>
                            </div>
                        </div>
                        {
                            onRemove &&
                            <div className="createReview--headerLeft d-flex d-md-none">
                                <div className="createReview--remove" onClick={onRemove}></div>
                            </div>
                        }
                    </div>
                </div>
                <div className="createReview--body">
                    {

                        <div className="createReview--header">
                            <div className="createReview--headerLeft">
                                {
                                    title &&
                                    <div className="createReview--title">{title}</div>
                                }
                                <div className="createReview--bookRating">
                                    <RatingSelector value={rating} onSelectedValueChanged={onRatingChanged}/>
                                </div>
                            </div>
                        </div>
                    }
                    <div className="createReview--text">
                        <form name="review" className="form">
                            <FormGroupInput id={id}
                                            placeholder={placeholder}
                                            model={model}
                                            prop={prop}
                                            type="richtext"
                                            validators={validators.text}
                                            messages={messages}/>
                        </form>
                    </div>
                    <div className="createReview--footer">
                        <div>
                            {
                                onRemove &&
                                <LoadButton loading={removeLoading}
                                            className="btn btn-link btn-linkSecondary btn-noPaddings d-none d-md-inline-flex"
                                            onClick={onRemove}>{intl.formatMessage(translationMessages.removeReview)}</LoadButton>
                            }
                        </div>
                        <div>
                            <button className="btn btn-link btn-linkSecondary btn-sm-block"
                                    onClick={this.onCancelHandler}>{intl.formatMessage(masterMessages.cancel)}</button>
                            {
                                onSave &&
                                <LoadButton loading={createEditLoading}
                                            className="btn btn-secondary btn-sm-block mb-2 mb-md-0"
                                            onClick={this.onSaveHandler}>{intl.formatMessage(translationMessages.saveReview)}</LoadButton>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

const translationMessages = defineMessages({
    saveReview: {
        id: 'createEditReview.saveReview',
        defaultMessage: 'Save review'
    },
    removeReview: {
        id: 'createEditReview.removeReview',
        defaultMessage: 'Remove review'
    }
})

export default injectIntl(CreateEditReview);