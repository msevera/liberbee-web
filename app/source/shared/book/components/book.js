/**
 * Created by Mike on 8/31/2017.
 */

import React from 'react';
import {Link} from 'react-router-dom';
import AuthorsList from './authorsList';
import BookCover from './bookCover';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Deal from './deal';
import {messages as masterMessages} from '../../../master/masterMessages';
import {withTools} from '../../../hoc';
import LoadButton from '../../../shared/button/components/loadButton';
import Hint from '../../../shared/hint/components/hint';
import BookCondition from '../../../shared/book/components/bookCondition';
import Rating from '../../../shared/rating/components/rating';

class Book extends React.Component {

    constructor() {
        super();

        this.state = {
            hover: false
        }
    }

    onAuthorClick = (author) => {
        let {authorSelected} = this.props;

        authorSelected && authorSelected(author);
    }

    buildCities(bookCopies) {
        let grouppedCities = [];

        bookCopies.forEach((copy, idx) => {
            let city = copy.geo.cityName;

            if (!grouppedCities.includes(city)) {
                grouppedCities.push(city);
            }
        })

        return grouppedCities.map((city, idx) => {
            return <span key={idx}>{idx > 0 ? ', ' : ' '}{city}</span>
        })
    }

    onMouseEnter = () => {
        let {active = true} = this.props;
        if (!active)
            return;

        this.setState({
            hover: true
        })
    }

    onMouseLeave = () => {
        let {active = true} = this.props;
        if (!active)
            return;

        this.setState({
            hover: false
        })
    }

    buildInactivityLayer() {
        let {inactivityAction, inactivityActionText, inactivityActionLoading, intl} = this.props;

        return <div className="book--inactivityLayer">
            <div className="book--inactivityLayerBg"></div>
            <div className="book--inactivityLayerContent">
                <div className="book--inactivityLayerText">
                    {intl.formatMessage(messages.notActive)}
                    <div className="book--inactivityLayerHint">
                        <Hint text={intl.formatMessage(messages.notActiveDescription)}/>
                    </div>
                </div>
                {
                    inactivityAction &&
                    <div className="book--inactivityLayerActions">
                        <LoadButton
                            onClick={inactivityAction}
                            loading={inactivityActionLoading}
                            className="btn btn-small btn-secondary">
                            {inactivityActionText}
                        </LoadButton>
                    </div>
                }

            </div>
        </div>
    }

    buildBookActions() {
        let {
            bookInfoUrl,
            customAction,
            customActionText,
            customActionDisabled,
            customActionLoading,
            gotoBookAction,
            gotoBookText,
        } = this.props;


        return <div className="book--action">
            {
                !!customAction && (<div>
                    <LoadButton text={customActionText}
                                disabled={customActionDisabled}
                                onClick={!!customAction ? customAction : undefined}
                                loading={customActionLoading}
                                className="btn btn-primary btn-block"/>
                </div>)
            }
            {
                !!gotoBookAction && bookInfoUrl && (<div>
                    <Link className="btn btn-primary btn-block" to={bookInfoUrl}>{gotoBookText}</Link>
                </div>)
            }
        </div>
    }

    buildNotAvailable = () => {
        let {
            intl,
            notAvailableText,
        } = this.props;
        return <div
            className="book--notAvailable">{notAvailableText ? notAvailableText : intl.formatMessage(messages.notAvailable)}</div>
    }

    buildRemoveAction = () => {
        let {removeAction, removeTitle, intl} = this.props;

        if (!removeTitle) {
            removeTitle = intl.formatMessage(masterMessages.remove)
        }

        return <div title={removeTitle} className="book--remove" onClick={removeAction}></div>
    }

    buildFavoriteAction = () => {
        let {
            favorite,
            favoriteAction,
            intl,
        } = this.props;

        return <div
            title={favorite ? intl.formatMessage(messages.removeFromFavorites) : intl.formatMessage(messages.addToFavorites)}
            className={'book--favorite' + (favorite ? ' book--favorite-is-true' : '')}
            onClick={favoriteAction}></div>
    }

    render() {
        let {
            id,
            className,
            title,
            authors,
            authorClickPushState,
            languages,
            bookCopies,
            bookInfoUrl,
            cover,
            authorUrlTemplateBuilder,
            allowHover = true,
            rating,
            showRating = true,
            deal,
            publishers,
            publishDate,
            draftBy,
            isbn10,
            isbn13,
            intl,
            routeResolver,
            notAvailable = false,
            currencyCode,
            onClick,
            active = true,
            removeAction,
            showFavorite = true,
            condition,
            comment
        } = this.props;


        let {hover} = this.state;

        let hasCopies = !!bookCopies;

        let isbn10Text;
        if (isbn10 && isbn10.length > 0) {
            isbn10Text = isbn10.join(', ');
        }

        let isbn13Text;
        if (isbn13 && isbn13.length > 0) {
            isbn13Text = isbn13.join(', ');
        }

        let publishersText;
        if (publishers && publishers.length > 0) {
            publishersText = publishers.map(p => p.name).join(', ');
        }

        let languagesText;
        if (languages && languages.length > 0) {
            languagesText = languages.map(l => l.text).join(', ');
        }

        let preparedTitle = title;

        return <article
            className={'book' + (allowHover && hover ? ' book-is-hovered' : '') + (className ? ` ${className}` : '') +
            ` ${notAvailable ? 'book-notAvailable' : ''}` + ` ${!active ? 'book-is-inactive' : ''}`}
            key={id}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}>
            {
                bookInfoUrl ?
                    <Link onClick={onClick} to={bookInfoUrl}
                          className="book--cover">
                        <BookCover cover={cover} title={title}/>

                    </Link> :
                    <div className="book--cover">
                        <BookCover cover={cover} title={title}/>
                    </div>
            }
            <div className="book--content">
                {
                    bookInfoUrl ? <Link onClick={onClick} to={bookInfoUrl} className="book--title"
                                        title={title}>{preparedTitle}</Link> :
                        <div className="book--title" title={title}>{preparedTitle}</div>
                }
                {
                    authors && authors.length > 0 &&
                    <div className="book--author">
                        <AuthorsList authors={authors} authorUrlTemplateBuilder={authorUrlTemplateBuilder}
                                     onAuthorClick={this.onAuthorClick} pushState={authorClickPushState}/>
                    </div>
                }
                {
                    showRating &&
                    <div className="book--rating">
                        <Rating value={rating} />
                    </div>
                }
                {
                    publishersText &&
                    <div className="book--publisher">
                        <div className="infoItem infoItem-cutValue">
                            <div className="infoItem--label"><FormattedMessage {...messages.publisher} />:</div>
                            <div className="infoItem--value" title={publishersText}>{publishersText}</div>
                        </div>
                    </div>
                }
                {
                    publishDate &&
                    <div className="book--publishYear">
                        <div className="infoItem">
                            <div className="infoItem--label"><FormattedMessage {...messages.publishDate} />:</div>
                            <div className="infoItem--value">{intl.formatDate(publishDate, {format: 'year'})}</div>
                        </div>
                    </div>
                }
                {
                    isbn10Text &&
                    <div className="book--isbn">
                        <div className="infoItem infoItem-cutValue">
                            <div className="infoItem--label"><FormattedMessage {...messages.isbn10} />:</div>
                            <div className="infoItem--value" title={isbn10Text}>{isbn10Text}</div>
                        </div>
                    </div>
                }
                {
                    isbn13Text &&
                    <div className="book--isbn">
                        <div className="infoItem infoItem-cutValue">
                            <div className="infoItem--label"><FormattedMessage {...messages.isbn13} />:</div>
                            <div className="infoItem--value" title={isbn13Text}>{isbn13Text}</div>
                        </div>
                    </div>
                }

                {
                    hasCopies &&
                    <div className="book--locations">
                        {
                            this.buildCities(bookCopies)
                        }
                    </div>
                }
                {
                    draftBy &&
                    <div className="book--draftBy">
                        <div className="infoItem">
                            <div className="infoItem--label">Draft by:</div>
                            <div className="infoItem--value">
                                <Link
                                    to={routeResolver.buildRouteFor('userBooks', {user: draftBy.slug}, {redirect: true})}>{draftBy.name}</Link>
                            </div>
                        </div>
                    </div>
                }
                {
                    languages && languages.length > 0 &&
                    <div className="book--lang">
                        <div className="infoItem infoItem-cutValue">
                            <div className="infoItem--label"><FormattedMessage {...messages.language} />:</div>
                            <div className="infoItem--value" title={languagesText}>{languagesText}</div>
                        </div>
                    </div>
                }
                {
                    condition &&
                    <div className="book--condition">
                        <BookCondition condition={condition} comment={comment}/>
                    </div>
                }
                {
                    typeof deal !== 'undefined' && (<div className="book--deal">
                        <Deal className="deal-is-centered" amount={deal.amount} swap={deal.swap}
                              currencyCode={currencyCode} align="center"/>
                    </div>)
                }
            </div>
            {active && this.buildBookActions()}
            {active && notAvailable && this.buildNotAvailable()}
            {active && removeAction && this.buildRemoveAction()}
            {active && showFavorite && this.buildFavoriteAction()}
            {!active && this.buildInactivityLayer()}
        </article>
    }
}

const messages = defineMessages({
    notActiveDescription: {
        id: 'book.notActiveDescription',
        defaultMessage: 'This book is deactivated by administration and <b>will not be shows in search results anymore</b>'
    },
    notActive: {
        id: 'book.notActive',
        defaultMessage: 'This book is not active anymore'
    },
    notAvailable: {
        id: 'book.notAvailable',
        defaultMessage: 'Not available'
    },
    language: {
        id: 'book.language',
        defaultMessage: 'Language'
    },
    publisher: {
        id: 'book.publisher',
        defaultMessage: 'Publisher'
    },
    publishDate: {
        id: 'book.publishDate',
        defaultMessage: 'Year'
    },
    isbn10: {
        id: 'book.isbn10',
        defaultMessage: 'ISBN 10'
    },
    isbn13: {
        id: 'book.isbn13',
        defaultMessage: 'ISBN 13'
    },
    addToFavorites: {
        id: 'book.addToFavorites',
        defaultMessage: 'Add to favorites'
    },
    removeFromFavorites: {
        id: 'book.removeFromFavorites',
        defaultMessage: 'Remove from favorites'
    }
});

export default withTools(injectIntl(Book));
