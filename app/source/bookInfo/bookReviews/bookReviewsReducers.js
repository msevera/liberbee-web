/**
 * Created by Mike on 9/19/2017.
 */

'use strict';
import {combineReducers} from 'redux';
import {
    setBookReviewsAction,
    setInitializedAction,
    setCreatedBookReviewAction,
    setCreateEditReviewLoadingStatusAction,
    setUpdatedBookReviewAction,
    setRemoveReviewLoadingStatusAction,
    setRemovedBookReviewAction,
    setLikedBookReviewAction,
    setUnlikedBookReviewAction,
    setLikedMyBookReviewAction,
    setUnlikedMyBookReviewAction,
    setBookReviewsSortCriteriaActiveAction,
    setBookReviewsContentLoadingStatusAction,
    moreBookReviewsLoadedAction,
    setTopBookReviewAction,
    setBookReviewsActionsAction,
    setShowCreateReviewAction
} from './bookReviewsActions';

import {setBookRatingAction} from '../bookInfoActions'

import halson from 'halson';
import {validationReducer} from "../../shared/validation/validation";

export default combineReducers({
    general: (state = {
        initialized: false,
        reviews: [],
        showCreateReview: false,
        sortCriterias: [],
        currentUserReview: null,
        topReview: null,
        createEditReviewLoading: false,
        removeReviewLoading: false,
        contentLoading: false,
        from: 0,
        size: 0,
        total: 0,
        page: 0,
        sort: null,
        actions: {
            loadMore: null,
            loadReviews: null,
            createBookReview: null,
            updateBookReview: null
        }
    }, action) => {
        switch (action.type) {
            case setShowCreateReviewAction.type: {
                return {
                    ...state,
                    showCreateReview: action.data
                }
            }

            case setBookRatingAction.type: {
                let toUpdate = {
                    reviews: state.reviews.map((review) => {
                        if (review.user._id != action.data.userId)
                            return review;

                        return {
                            ...review,
                            bookRating: action.data.myRating
                        }
                    })
                };

                if (state.topReview && (state.topReview.user._id == action.data.userId)) {
                    toUpdate.topReview = {...state.topReview, bookRating: action.data.myRating};
                }

                if (state.currentUserReview && (state.currentUserReview.user._id == action.data.userId)) {
                    toUpdate.currentUserReview = {...state.currentUserReview, bookRating: action.data.myRating};
                }

                return {
                    ...state,
                    ...toUpdate
                }
            }

            case moreBookReviewsLoadedAction.type: {
                let dataHal = halson(action.data);
                return {
                    ...state,
                    initialized: true,
                    reviews: state.reviews.concat(dataHal.getEmbeds('bookReviews')),
                    sortCriterias: dataHal.getEmbeds('sortCriterias'),
                    currentUserReview: dataHal.getEmbed('currentUserReview'),
                    topReview: dataHal.getEmbed('topReview'),
                    from: dataHal.from,
                    size: dataHal.size,
                    total: dataHal.total,
                    page: dataHal.page,
                    sort: dataHal.sort,
                    actions: {
                        loadReviews: dataHal.getLink('self'),
                        loadMore: dataHal.getLink('next'),
                        createBookReview: dataHal.getLink('createBookReview')
                    }
                }
            }

            case setBookReviewsContentLoadingStatusAction.type: {
                return {
                    ...state,
                    contentLoading: action.data
                }
            }

            case setUnlikedMyBookReviewAction.type:
            case setLikedMyBookReviewAction.type: {
                return {
                    ...state,
                    currentUserReview: action.data
                }
            }

            case setUnlikedBookReviewAction.type:
            case setLikedBookReviewAction.type: {
                let toUpdate = {
                    reviews: state.reviews.map((review) => {
                        if (review._id != action.data._id)
                            return review;

                        return {...review, ...action.data}
                    })
                };

                if (state.topReview && (state.topReview._id == action.data._id)) {
                    toUpdate.topReview = {...state.topReview, ...action.data};
                }

                if (state.currentUserReview && (state.currentUserReview._id == action.data._id)) {
                    toUpdate.currentUserReview = {...state.currentUserReview, ...action.data};
                }

                return {
                    ...state,
                    ...toUpdate
                }
            }

            case setRemoveReviewLoadingStatusAction.type: {
                return {
                    ...state,
                    removeReviewLoading: action.data
                }
            }

            case setCreateEditReviewLoadingStatusAction.type: {
                return {
                    ...state,
                    createEditReviewLoading: action.data
                }
            }

            case setInitializedAction.type: {
                return {
                    ...state,
                    initialized: action.data
                }
            }

            case setCreatedBookReviewAction.type: {
                return {
                    ...state,
                    currentUserReview: {...action.data},
                    reviews: [{...action.data}, ...state.reviews]
                }
            }

            case setTopBookReviewAction.type: {
                return {
                    ...state,
                    currentUserReview: {...action.data},
                    topReview: {...action.data}
                }
            }

            case setUpdatedBookReviewAction.type: {
                let toUpdate = {
                    reviews: state.reviews.map((review) => {
                        if (review._id != action.data._id)
                            return review;

                        return {...review, ...action.data}
                    })
                };

                if (state.topReview && (state.topReview._id == action.data._id)) {
                    toUpdate.topReview = {...state.topReview, ...action.data};
                }

                if (state.currentUserReview && (state.currentUserReview._id == action.data._id)) {
                    toUpdate.currentUserReview = {...state.currentUserReview, ...action.data};;
                }

                return {
                    ...state,
                    ...toUpdate
                }
            }

            case setRemovedBookReviewAction.type: {
                let toUpdate = {
                    reviews: state.reviews.filter((review) => {
                        if (review._id != action.data)
                            return review;
                    })
                };

                if (state.topReview && (state.topReview._id == action.data)) {
                    toUpdate.topReview = null;
                }

                if (state.currentUserReview && (state.currentUserReview._id == action.data)) {
                    toUpdate.currentUserReview = null;
                }

                return {
                    ...state,
                    ...toUpdate
                }
            }

            case setBookReviewsAction.type: {
                let dataHal = halson(action.data)

                return {
                    ...state,
                    initialized: true,
                    contentLoading: false,
                    reviews: dataHal.getEmbeds('bookReviews'),
                    sortCriterias: dataHal.getEmbeds('sortCriterias'),
                    currentUserReview: dataHal.getEmbed('currentUserReview'),
                    topReview: dataHal.getEmbed('topReview'),
                    from: dataHal.from,
                    size: dataHal.size,
                    total: dataHal.total,
                    page: dataHal.page,
                    sort: dataHal.sort,
                    actions: {
                        loadReviews: dataHal.getLink('self'),
                        loadMore: dataHal.getLink('next'),
                        createBookReview: dataHal.getLink('createBookReview')
                    }
                }
            }

            case setBookReviewsActionsAction.type: {
                let dataHal = halson(action.data);
                return {
                    ...state,
                    sortCriterias: dataHal.getEmbeds('sortCriterias'),
                    contentLoading: false,
                    total: dataHal.total,
                    actions: {
                        loadReviews: dataHal.getLink('self'),
                        loadMore: dataHal.getLink('next'),
                        createBookReview: dataHal.getLink('createBookReview')
                    }
                }
            }

            case setBookReviewsSortCriteriaActiveAction.type: {
                return {
                    ...state,
                    sortCriterias: state.sortCriterias.map((criteria) => {
                        return {
                            ...criteria,
                            selected: criteria.key == action.data.key
                        }
                    })
                }
            }

            default:
                return state;
        }
    },
    createEditBookReviewModel: validationReducer(
        {
            text: ''
        }, 'bookInfo.bookReviews.createEditBookReviewModel'),
})