/**
 * Created by Mike on 9/4/2017.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, defineMessages} from 'react-intl';
import CreateEditReview from './createEditReview';
import Review from './review';
import {resetModelToInitial} from "../../validation/actions";

class MyReview extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }

    constructor() {
        super();

        this.state = {
            editMode: false
        }
    }

    componentWillMount(){
        let b = 0;
    }

    buildEditMode() {
        let {user, title, removeAction, id, model, prop, validators, messages, placeholder, text, createEditLoading, removeLoading, intl, editAction, highlight, rating, changeRatingAction} = this.props;
        let {store} = this.context;

        store.dispatch(resetModelToInitial({
            model: model,
            initialData: {
                text
            }
        }));

        return <CreateEditReview
            title={title}
            user={user}
            rating={rating}
            id={id} model={model} prop={prop} validators={validators} messages={messages} placeholder={placeholder}
            createEditLoading={createEditLoading}
            removeLoading={removeLoading}
            onRatingChanged={changeRatingAction}
            onSave={editAction && this.onSaveEditClickHandler}
            onCancel={this.onCancelEditClickHandler}
            onRemove={removeAction && this.onRemoveClickHandler}
            className={highlight ? 'creteReview-highlight' : ''}/>
    }

    onSaveEditClickHandler = (data) => {
        let {editAction} = this.props;

        editAction && editAction(data).then(() => {
            this.setState({
                editMode: false
            })
        })
    }

    onRemoveClickHandler = (data) => {
        let {removeAction} = this.props;

        removeAction && removeAction(data)
    }

    onCancelEditClickHandler = () => {
        this.setState({
            editMode: false
        })
    }

    onEditClickHandler = () => {
        this.setState({
            editMode: true
        })
    }

    buildViewMode() {
        let {user, title, text, editAction, likesCount, intl, created, updated, likeAction, unlikeAction, highlight, collapsedHeight, rating, changeRatingAction} = this.props;
        return <Review user={user}
                       title={title}
                       rating={rating}
                       text={text}
                       created={created}
                       updated={updated}
                       readMoreClassName={highlight ? 'readMore-reviewHighlight' : ''}
                       className={highlight ? 'review-highlight' : ''}
                       changeRatingAction={changeRatingAction}
                       editAction={editAction && this.onEditClickHandler}
                       likeAction={likeAction}
                       unlikeAction={unlikeAction}
                       likesCount={likesCount}
                       collapsedHeight={collapsedHeight}/>
    }

    render() {
        let {editMode} = this.state;

        return editMode ? this.buildEditMode() : this.buildViewMode()
    }
}


export default injectIntl(MyReview);