/**
 * Created by Mike on 4/13/2017.
 */


'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    setInitializedAction,
    createBookReviewAction,
    saveBookReviewAction,
    removeBookReviewAction,
    preCreateBookReviewAction,
    likeBookReviewAction,
    unlikeBookReviewAction,
    setBookReviewsSortCriteriaActiveAction,
    filterBookReviewsAction,
    loadMoreAction,
    setShowCreateReviewAction,
    showCreateReviewAction
} from '../bookReviewsActions';

import {rateBookAction} from '../../bookInfoActions'

import {Link} from 'react-router-dom';
import halson from 'halson';
import {FormattedMessage, FormattedNumber, FormattedHTMLMessage, defineMessages, injectIntl} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';
import {messages as validationMessages} from '../../../shared/validation/messages';
import {messages as formMessages} from '../../../shared/form/messages';
import LoadButton from '../../../shared/button/components/loadButton';
import PageLoader from "../../../shared/empty/components/pageLoader";
import CreateEditReview from '../../../shared/reviews/components/createEditReview';
import {reviewValidators} from '../formValidators';
import {resetModelToInitial, submitForm} from "../../../shared/validation/actions";
import Review from '../../../shared/reviews/components/review';
import MyReview from '../../../shared/reviews/components/myReview';
import {withTools} from '../../../hoc'
import queryString from 'query-string';
import InfiniteScroll from 'react-infinite-scroller';

class BookReviewsContainer extends React.Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
    }

    static getBook(match) {
        let bookSlug = match.params.book;

        return bookSlug ? bookSlug : '';
    }

    constructor() {
        super();
        this.model = 'bookInfo.bookReviews.createEditBookReviewModel';
        this.validators = reviewValidators;
        this.state = {
            showCurrentUserReview: false
        }
    }

    componentWillUnmount() {
        let {setInitializedAction, setShowCreateReviewAction} = this.props;

        setInitializedAction(false);
        setShowCreateReviewAction(false)
    }

    buildActions(review) {
        if (!review)
            return {};

        let {preCreateBookReviewAction, loggedUser} = this.props;
        let {auth} = this.context;

        let reviewHal = halson(review);
        let likeBookReviewURI = reviewHal.getLink('likeBookReview');
        let unlikeBookReviewURI = reviewHal.getLink('unlikeBookReview');
        let updateBookReviewURI = reviewHal.getLink('updateBookReview');
        let removeBookReviewURI = reviewHal.getLink('removeBookReview');
        let likeAction = null;
        let unlikeAction = null;
        let editAction = null;
        let removeAction = null;
        let changeRatingAction = null;
        if (!auth.isAuthenticated) {
            likeAction = {};
            likeAction.likeAction = () => {
                preCreateBookReviewAction();
            }
        } else {
            if (likeBookReviewURI) {
                likeAction = {}
                likeAction.likeAction = () => {
                    this.likeReviewHandler(likeBookReviewURI)
                }
            }

            if (unlikeBookReviewURI) {
                unlikeAction = {}
                unlikeAction.unlikeAction = () => {
                    this.unlikeReviewHandler(unlikeBookReviewURI)
                }
            }

            if (updateBookReviewURI) {
                editAction = {}
                editAction.editAction = (data) => {
                    return this.onEditSaveReviewClick(data, updateBookReviewURI)
                }
            }

            if (removeBookReviewURI) {
                removeAction = {}
                removeAction.removeAction = () => {
                    return this.onRemoveReviewClick(review._id, removeBookReviewURI)
                }
            }

            if (loggedUser._id == review.user._id) {
                changeRatingAction = {};
                changeRatingAction.changeRatingAction = (value) => {
                    return this.onRateBookHandler(value);
                }
            }
        }

        return {
            likeAction,
            unlikeAction,
            editAction,
            removeAction,
            changeRatingAction
        }
    }

    onRateBookHandler = (value) => {
        let {bookInfoActions, rateBookAction, intl} = this.props;
        rateBookAction(intl, bookInfoActions.rateBook, value)
    }


    buildReviewItem(review) {
        let {createEditReviewLoading, removeReviewLoading, intl} = this.props;

        let reviewHal = halson(review);
        let actions = this.buildActions(review);

        if (actions.editAction || actions.removeAction) {
            return <MyReview user={reviewHal.user}
                             rating={reviewHal.bookRating}
                             title={intl.formatMessage(messages.myReview)}
                             text={reviewHal.text}
                             created={reviewHal.created}
                             updated={reviewHal.updated}
                             collapsedHeight={65}
                             {...actions.likeAction}
                             {...actions.unlikeAction}
                             {...actions.editAction}
                             {...actions.removeAction}
                             {...actions.changeRatingAction}
                             likesCount={reviewHal.likesCount}
                             validators={this.validators}
                             createEditLoading={createEditReviewLoading}
                             removeLoading={removeReviewLoading}
                             messages={{
                                 htmlRequired: intl.formatMessage(validationMessages.reviewRequired)
                             }}
                             id="myBookReview"
                             model={this.model}
                             prop="text"
                             placeholder={intl.formatMessage(formMessages.reviewPlaceholder)}
            />
        }

        return <Review user={review.user}
                       rating={reviewHal.bookRating}
                       title={review.user.name}
                       text={review.text}
                       created={review.created}
                       updated={review.updated}
                       {...actions.likeAction}
                       {...actions.unlikeAction}
                       likesCount={review.likesCount}
                       collapsedHeight={65}/>
    }

    likeReviewHandler = (likeBookReviewURI) => {
        let {likeBookReviewAction, intl} = this.props;
        likeBookReviewAction({likeBookReviewURI, intl})
    }

    unlikeReviewHandler = (unlikeBookReviewURI) => {
        let {unlikeBookReviewAction, intl} = this.props;
        unlikeBookReviewAction({unlikeBookReviewURI, intl})
    }

    addReviewClickHandler = () => {
        let {bookSlug, showCreateReviewAction} = this.props;

        showCreateReviewAction(bookSlug)
    }

    onCreateReviewCancelClick = () => {
        let {setShowCreateReviewAction} = this.props;
        setShowCreateReviewAction(false)
    }

    onCreateReviewSaveClick = (data) => {
        let {actions, createBookReviewAction, setShowCreateReviewAction, intl, match} = this.props;
        let bookSlug = BookReviewsContainer.getBook(match);

        data.text = data.text.trim();
        createBookReviewAction({
            intl,
            createBookReviewURI: actions.createBookReview,
            bookSlug,
            ...data
        }).then(() => {
            setShowCreateReviewAction(false);
        })
    }

    onEditSaveReviewClick = (data, updateBookReviewURI) => {
        let {saveBookReviewAction, intl, match} = this.props;
        let bookSlug = BookReviewsContainer.getBook(match);

        data.text = data.text.trim();
        return saveBookReviewAction({
            intl,
            updateBookReviewURI,
            bookSlug,
            ...data
        })
    }

    onRemoveReviewClick = (reviewId, removeBookReviewURI) => {
        let {removeBookReviewAction, intl, match} = this.props;
        let bookSlug = BookReviewsContainer.getBook(match);
        return removeBookReviewAction({
            intl,
            removeBookReviewURI,
            bookSlug,
            reviewId
        }).then(() => {
            this.setState({
                showCurrentUserReview: false
            })
        })
    }

    onSelectedSortCriteriaChanged = (sortCriteria) => {
        let {setBookReviewsSortCriteriaActiveAction, filterBookReviewsAction, bookSlug} = this.props;
        setBookReviewsSortCriteriaActiveAction(sortCriteria);
        filterBookReviewsAction({history: true, bookSlug})
    }

    buildSortCriterias() {
        let {sortCriterias, intl} = this.props;

        return <div className="sorting">
            <div className="sorting--title">{intl.formatMessage(messages.sortTitle)}:</div>
            <ul className="sorting--content">
                {
                    sortCriterias.map((sort) => {
                        return <li key={sort.key} onClick={() => this.onSelectedSortCriteriaChanged(sort)}
                                   className={`sorting--item ${sort.selected ? 'sorting--item-is-selected' : ''}`}>
                            <span>{intl.formatMessage(messages[sort.key])} </span>
                        </li>
                    })
                }
            </ul>
        </div>
    }

    onShowCurrentUserReviewHandler = (e) => {
        let {showCurrentUserReview} = this.state;
        this.setState({
            showCurrentUserReview: !showCurrentUserReview
        })
        e.preventDefault();
    }

    buildCurrentUserReviewSelector() {
        let {intl} = this.props;
        let {showCurrentUserReview} = this.state;

        return <div onClick={this.onShowCurrentUserReviewHandler}>
            <input type="checkbox" id="showCurrentUserReview" checked={showCurrentUserReview}
                   name="showCurrentUserReview"
                   readOnly/>
            <label className="mb-0" htmlFor="showCurrentUserReview"
                   title={intl.formatMessage(messages.showMyReviewOnly)}>
                {intl.formatMessage(messages.showMyReviewOnly)}
            </label>
        </div>
    }

    onLoadMoreHandler = () => {
        const {actions, loadMoreAction} = this.props;
        if (actions.loadMore) {
            loadMoreAction(actions.loadMore);
        }
    }

    render() {
        const {initialized, actions, reviews, loggedUser, reviewsTotal, currentUserReview, createEditReviewLoading,
            removeReviewLoading, intl, sortCriterias, topReview, contentLoading, myRating, showCreateReview} = this.props;
        const {showCurrentUserReview} = this.state;
        let {auth} = this.context;
        let topReviewHal = halson(topReview);
        let topReviewActions = this.buildActions(topReview);

        return <div className={`reviews ${reviews.length > 0 || topReview ? 'reviews-has-items' : ''}`}>
            {
                initialized &&
                <div className="reviews--status">
                    <div className="reviews--statusTitle">
                        {
                            reviews.length > 0 || topReview ?
                                <FormattedHTMLMessage {...messages.title}
                                                      values={{count: reviewsTotal}}/> :
                                <span>{intl.formatMessage(messages.emptyTitle)}</span>
                        }
                    </div>
                    <div className="reviews--statusActions">
                        {
                            (!auth.isAuthenticated || (!showCreateReview && actions.createBookReview)) &&
                            <button className="btn btn-link btn-noPaddings btn-sm"
                                    onClick={this.addReviewClickHandler}>{intl.formatMessage(messages.addReview)}</button>
                        }
                    </div>
                </div>
            }
            {
                initialized && actions.createBookReview && showCreateReview &&
                <div className="reviews--createReview">
                    <CreateEditReview user={loggedUser}
                                      validators={this.validators}
                                      rating={myRating}
                                      onRatingChanged={this.onRateBookHandler}
                                      messages={{
                                          htmlRequired: intl.formatMessage(validationMessages.reviewRequired)
                                      }}
                                      id="createBookReview"
                                      model={this.model}
                                      prop="text"
                                      placeholder={intl.formatMessage(formMessages.reviewPlaceholder)}
                                      createEditLoading={createEditReviewLoading}
                                      onCancel={this.onCreateReviewCancelClick}
                                      onSave={this.onCreateReviewSaveClick}/>
                </div>
            }
            {
                initialized && topReview &&
                <div className="reviews--top">
                    <MyReview key={topReviewHal._id} user={topReviewHal.user}
                              title={topReviewHal.user._id == loggedUser._id ? intl.formatMessage(messages.myReview) : topReviewHal.user.name}
                              highlight={true}
                              text={topReviewHal.text}
                              rating={topReviewHal.bookRating}
                              created={topReviewHal.created}
                              updated={topReviewHal.updated}
                              {...topReviewActions.changeRatingAction}
                              {...topReviewActions.likeAction}
                              {...topReviewActions.unlikeAction}
                              {...topReviewActions.editAction}
                              {...topReviewActions.removeAction}
                              likesCount={topReviewHal.likesCount}
                              validators={this.validators}
                              createEditLoading={createEditReviewLoading}
                              removeLoading={removeReviewLoading}
                              collapsedHeight={65}
                              messages={{
                                  htmlRequired: intl.formatMessage(validationMessages.reviewRequired)
                              }}
                              id="topBookReview"
                              model={this.model}
                              prop="text"
                              placeholder={intl.formatMessage(formMessages.reviewPlaceholder)}/>
                </div>
            }
            {
                initialized &&
                <div className="reviews--items">
                    {
                        (sortCriterias.length > 0 || currentUserReview) &&
                        <div className="reviews--itemsActions">
                            <div className="reviews--itemsActionsLeft">
                                {sortCriterias.length > 0 && this.buildSortCriterias()}
                                {reviews.length > 1 && currentUserReview && this.buildCurrentUserReviewSelector()}
                            </div>
                        </div>
                    }
                    {
                        reviews.length > 0 && !showCurrentUserReview &&
                        <div
                            className={`reviews--itemsContent l-contentLoading l-contentLoadingTop0 ${contentLoading ? 'l-contentLoading-is-visible' : ''}`}>
                            <InfiniteScroll className="reviews--itemsContent"
                                            initialLoad={false}
                                            threshold={100}
                                            pageStart={0}
                                            loadMore={this.onLoadMoreHandler}
                                            hasMore={!!actions.loadMore}
                                            loader={<div className="loadSpinner" key={0}>
                                                <FormattedMessage {...masterMessages.loading} />
                                            </div>}>

                                {
                                    reviews.map((review) => {
                                        return <div key={review._id} className="reviews--item">
                                            {this.buildReviewItem(review)}
                                        </div>
                                    })

                                }

                            </InfiniteScroll>
                        </div>
                    }
                    {
                        showCurrentUserReview && currentUserReview &&
                        <div className="reviews--itemsContent">
                            <div className="reviews--item">
                                {this.buildReviewItem(currentUserReview)}
                            </div>
                        </div>
                    }
                </div>
            }
            {
                !initialized &&
                <div className="row">
                    <div className="col-12 l-pageLoader l-bookInfo-pageLoader">
                        <PageLoader className="pageLoader-secondary pageLoader-absolute"/>
                    </div>
                </div>
            }
        </div>
    }
}

const messages = defineMessages({
    title: {
        id: 'bookReviews.title',
        defaultMessage: 'Book reviews <span class="reviews--count">{count, number}</span>'
    },
    emptyTitle: {
        id: 'bookReviews.emptyTitle',
        defaultMessage: 'Be the first, and leave review'
    },
    addReview: {
        id: 'bookReviews.addReview',
        defaultMessage: 'Add review'
    },
    sortTitle: {
        id: 'bookReviews.sortTitle',
        defaultMessage: 'Sort by'
    },
    popularity: {
        id: 'bookReviews.sortByPopularity',
        defaultMessage: 'Popularity'
    },
    date: {
        id: 'bookReviews.sortByDate',
        defaultMessage: 'Date'
    },
    myReview: {
        id: 'bookReviews.myReview',
        defaultMessage: 'My review'
    },
    showMyReviewOnly: {
        id: 'bookReviews.showMyReviewOnly',
        defaultMessage: 'Show my review'
    }
})

const mapStateToProps = (state, props) => {
    return {
        bookId: state.bookInfo.general._id,
        bookSlug: state.bookInfo.general.slug,
        loggedUser: state.master.user,
        reviews: state.bookInfo.bookReviews.general.reviews,
        contentLoading: state.bookInfo.bookReviews.general.contentLoading,
        sortCriterias: state.bookInfo.bookReviews.general.sortCriterias,
        reviewsTotal: state.bookInfo.bookReviews.general.total,
        initialized: state.bookInfo.bookReviews.general.initialized,
        actions: state.bookInfo.bookReviews.general.actions,
        bookInfoActions: state.bookInfo.general.actions,
        currentUserReview: state.bookInfo.bookReviews.general.currentUserReview,
        topReview: state.bookInfo.bookReviews.general.topReview,
        createEditReviewLoading: state.bookInfo.bookReviews.general.createEditReviewLoading,
        removeReviewLoading: state.bookInfo.bookReviews.general.removeReviewLoading,
        myRating: state.bookInfo.general.myRating,
        showCreateReview: state.bookInfo.bookReviews.general.showCreateReview
    }
}

const mapDispatchToProps = {
    setInitializedAction,
    createBookReviewAction,
    saveBookReviewAction,
    removeBookReviewAction,
    preCreateBookReviewAction,
    likeBookReviewAction,
    unlikeBookReviewAction,
    setBookReviewsSortCriteriaActiveAction,
    filterBookReviewsAction,
    loadMoreAction,
    rateBookAction,
    setShowCreateReviewAction,
    showCreateReviewAction
}

export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(BookReviewsContainer)));
