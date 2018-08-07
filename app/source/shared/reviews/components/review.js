/**
 * Created by Mike on 9/4/2017.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, defineMessages} from 'react-intl';
import Avatar from '../../avatar/components/avatar';
import ReadMore from '../../../shared/readMore/components/readMore';
import {messages as masterMessages} from '../../../master/masterMessages';
import differenceInDays from 'date-fns/difference_in_days';
import {Link} from 'react-router-dom';
import {withTools} from '../../../hoc'
import RatingSelector from '../../../shared/rating/components/ratingSelector';
import Rating from '../../../shared/rating/components/rating';

class Review extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }

    getDate() {
        let {intl, created, updated} = this.props;

        let date = created;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayISO = today.toISOString();

        let postDate = new Date(date);
        postDate.setHours(0, 0, 0, 0);
        let postDateISO = postDate.toISOString();

        let daysDiff = differenceInDays(new Date(todayISO), new Date(postDateISO));

        let formRelative = (daysDiff == 0 || daysDiff == 1)

        return formRelative ?
            intl.formatMessage(translationMessages.reviewAtTime, {
                day: intl.formatRelative(date, {units: 'day'}),
                time: intl.formatDate(date, {format: 'timeShort'})
            }) :
            intl.formatDate(date, {format: 'dateWithYear'})
    }

    render() {
        let {
            intl, title, user, text, className, likesCount, likeAction, unlikeAction, editAction, removeAction, rating,
            collapsedHeight, readMoreClassName, created, updated, routeResolver, changeRatingAction
        } = this.props;

        return <div className={`review ${className ? className : ''}`}>
            <div className="review--content">
                <div className="review--user">
                    <Link rel="nofollow"
                          to={routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}, {
                              redirect: true,
                              reload: true
                          })}>
                        <Avatar name={user.name} src={user.photo}/>
                    </Link>
                    <div className="review--header">
                        <div className="review--headerLeft">
                            <div className="review--userName">
                                <Link rel="nofollow"
                                      to={routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}, {
                                          redirect: true,
                                          reload: true
                                      })}>
                                    {title}
                                </Link>
                            </div>
                            <div className="review--date">
                                {this.getDate()}
                            </div>
                        </div>
                        <div className="review--headerRight">
                            {
                                editAction &&
                                <button className="btn btn-link btn-linkSecondary btn-noPaddings btn-sm"
                                        onClick={editAction}>{intl.formatMessage(masterMessages.edit)}</button>
                            }
                        </div>
                    </div>
                </div>
                <div className="review--body">
                    <div className="review--header">
                        <div className="review--headerLeft">
                            <div className="review--userName">
                                <Link rel="nofollow"
                                      to={routeResolver.buildRouteFor('userActiveBooks', {user: user.slug}, {
                                          redirect: true,
                                          reload: true
                                      })}>
                                    {title}
                                </Link>
                            </div>
                            <div className="review--bookRating">
                                <RatingSelector value={rating} disabled={!changeRatingAction}
                                                onSelectedValueChanged={changeRatingAction}/>
                            </div>
                            <div className="review--date">
                                {this.getDate()}
                            </div>
                        </div>
                        <div className="review--headerRight">
                            {
                                editAction &&
                                <button className="btn btn-link btn-linkSecondary btn-noPaddings"
                                        onClick={editAction}>{intl.formatMessage(masterMessages.edit)}</button>
                            }
                        </div>
                    </div>
                    <div className="review--text">
                        <ReadMore className={readMoreClassName} html={text} collapsedHeight={collapsedHeight}/>
                    </div>
                    <div className="review--footer">
                        <div className="review--likes">
                            {
                                likeAction &&
                                <div className="review--likesHeart" onClick={likeAction}></div>
                            }
                            {
                                unlikeAction &&
                                <div className="review--likesHeart-is-full" onClick={unlikeAction}></div>
                            }
                            {
                                !!likesCount &&
                                <div className="review--likesCount">{likesCount}</div>
                            }
                        </div>
                        <div className="review--bookRating d-flex d-md-none">
                            <RatingSelector value={rating} disabled={!changeRatingAction}
                                            onSelectedValueChanged={changeRatingAction}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

const translationMessages = defineMessages({
    reviewAtTime: {
        id: 'review.reviewAtTime',
        defaultMessage: '{day} at {time}'
    }
})

export default withTools(injectIntl(Review));