/**
 * Created by Mike on 4/13/2017.
 */

'use strict';

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/bookInfo.scss');
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    loadBookAction,
    changeGeoAction,
    createBookCopyAction,
    removeBookCopyAction,
    publishBookAction,
    unpublishBookAction,
    setInitializedAction,
    setNotFoundAction,
    editBookAction,
    rateBookAction
} from '../bookInfoActions';
import {
    loadBookReviewsAction,
    showCreateReviewAction
} from '../bookReviews/bookReviewsActions';
import {addToFavoritesAction, removeFromFavoritesAction, checkRequiredInfoAction} from '../../master/masterActions';
import {validateDealRequestAndLoadUserBookCopiesAction} from '../../master/getBook/getBookActions';
import AuthorsList from '../../shared/book/components/authorsList';
import DropDown from '../../shared/dropdown/components/dropdown';
import FacetMegaMenu from '../../shared/facets/components/facetMegaMenu';
import {Link} from 'react-router-dom';
import BookCover from '../../shared/book/components/bookCover';
import halson from 'halson';
import GetBookContainer from '../../master/getBook/components/getBookContainer';
import Avatar from '../../shared/avatar/components/avatar';
import {withComponentExtended} from '../../hoc';
import {FormattedMessage, FormattedNumber, FormattedHTMLMessage, defineMessages, injectIntl} from 'react-intl';
import Deal from '../../shared/book/components/deal';
import Helmet from 'react-helmet';
import {messages as masterMessages} from '../../master/masterMessages';
import CreateEditBookCopyContainer from '../../shared/createEditBookCopy/components/createEditBookCopyContainer';
import {showCreateBookCopyPopupAction} from '../../shared/createEditBookCopy/createEditBookCopyActions';
import Empty from '../../shared/empty/components/empty';
import queryString from 'query-string';
import LoadButton from '../../shared/button/components/loadButton';
import PageLoader from "../../shared/empty/components/pageLoader";
import NotFound from '../../notFound';
import BookCondition from '../../shared/book/components/bookCondition';
import BookReviewsContainer from '../bookReviews/components/bookReviewsContainer';
import ReadMore from '../../shared/readMore/components/readMore';
import RatingSelector from '../../shared/rating/components/ratingSelector';
import Rating from '../../shared/rating/components/rating';

class BookInfoContainer extends React.Component {
    static contextTypes = {
        auth: PropTypes.object.isRequired
    }

    constructor() {
        super();

        this.state = {
            descriptionExpanded: false
        }

        this.reviewsRef = React.createRef();
    }

    static getPlace(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.place ? query.place : '';
    }

    static getBook(match) {
        let bookSlug = match.params.book;

        return bookSlug ? bookSlug : '';
    }

    static getRSort(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.rsort ? query.rsort : '';
    }

    componentWillUnmount() {
        let {setInitializedAction, setNotFoundAction} = this.props;

        setInitializedAction(false);
        setNotFoundAction(false);
    }

    buildBookCopies(bookCopies) {
        let {validateDealRequestAndLoadUserBookCopiesAction, user, routeResolver, intl} = this.props;

        return bookCopies.map((bookCopy) => {


            let bookCopyHal = halson(bookCopy);
            let createDealRequestURI = bookCopyHal.getLink('createDealRequest');
            let city = bookCopyHal.geo.city;
            let country = bookCopyHal.geo.country;
            return <div className="bookCopies--item" key={bookCopyHal._id}>
                <div className="bookCopy">
                    <div className="bookCopy--container1">
                        <div className="bookCopy--container2">
                            <Link rel="nofollow"
                                  to={routeResolver.buildRouteFor('userActiveBooks', {user: bookCopyHal.user.slug}, {
                                      redirect: true,
                                      reload: true
                                  })}
                                  className="bookCopy--avatar">
                                <Avatar name={bookCopyHal.user.name} src={bookCopyHal.user.photo}/>
                            </Link>
                            <div className="bookCopy--user">
                                <Link rel="nofollow" className="bookCopy--userName"
                                      to={routeResolver.buildRouteFor('userActiveBooks', {user: bookCopyHal.user.slug}, {
                                          redirect: true,
                                          reload: true
                                      })}>{bookCopyHal.user.name}</Link>
                                <div className="bookCopy--userLocation">
                                    {city.name}
                                </div>
                            </div>
                        </div>
                        {/*<div className="bookCopy--rating">
                        <div className="rating">
                            <span>3,5</span>
                        </div>
                    </div>*/}
                        <div className="bookCopy--condition">
                            {
                                bookCopyHal.condition &&
                                <BookCondition className="bookCondition-normal" condition={bookCopyHal.condition}
                                               comment={bookCopyHal.comment}/>
                            }
                        </div>
                        <div className="bookCopy--deal">
                            <Deal align={bookCopyHal.deal.amount == 0 && 'center'}
                                  amount={bookCopyHal.deal.amount} swap={bookCopyHal.deal.swap}
                                  currencyCode={country.currencyCode}/>
                        </div>
                    </div>
                    {
                        (createDealRequestURI || user.slug !== bookCopyHal.user.slug) &&
                        <div className="bookCopy--action">
                            <LoadButton
                                className="btn btn-primary btn-sm-block"
                                loading={bookCopyHal.loading}
                                text={intl.formatMessage(messages.askBook)}
                                onClick={() => {
                                    validateDealRequestAndLoadUserBookCopiesAction({
                                        userId: bookCopyHal.user._id,
                                        bookCopyId: bookCopyHal._id
                                    })
                                }}/>

                        </div>
                    }
                </div>
            </div>

        })
    }

    buildFacets(facets) {
        return facets.map((facet) => {
            switch (facet.key) {
                case 'geo': {
                    return this.buildMegaMenuFacet(facet);
                }

                default: {
                    return this.buildDefaultFacet(facet);
                }
            }
        })
    }

    onMegaMenuFacetChanged = (facet, facetItem) => {
        let {changeGeoAction, match} = this.props;
        let bookSlug = BookInfoContainer.getBook(match);

        changeGeoAction({bookSlug, placeSlug: facetItem.slug, history: true});
    }

    buildMegaMenuFacet(facet) {
        let {geo, intl} = this.props;
        return <DropDown type="custom"
                         togglePrefixText={geo ? `${intl.formatMessage(messages.place)}:` : ''}
                         togglePrefixClassNames="dropdown--prefLight"
                         title={geo ? geo.text : intl.formatMessage(messages.selectPlace)}
                         key={facet.key}>
            <FacetMegaMenu
                columnsTitles={[intl.formatMessage(messages.country), intl.formatMessage(messages.region), intl.formatMessage(messages.city)]}
                facet={facet}
                onSelectedFacetChanged={this.onMegaMenuFacetChanged}/>
        </DropDown>
    }

    buildDefaultFacet(facet) {

    }

    buildLink(query, geo, sort, lang) {
        let {routeResolver} = this.props;
        let queryStringArray = [];

        query && queryStringArray.push(`q=${query}`);
        lang && queryStringArray.push(`lang=${lang}`);
        sort && queryStringArray.push(`sort=${sort}`);
        geo && geo.slug && queryStringArray.push(`place=${geo.slug}`);

        let pathname = routeResolver.buildRouteFor('index').pathname;
        let queryString = queryStringArray.length > 0 ? `?${queryStringArray.join('&')}` : '';


        if ((!geo || (geo && geo.slug == '')) && queryString) {
            pathname = `${routeResolver.buildRouteFor('index').pathname}${queryString}`;
        }

        if (geo && geo.slug != '') {
            pathname = `${routeResolver.buildRouteFor('index').pathname}${queryString}`;
        }


        return pathname;
    }

    putOnShelf = () => {
        let {showCreateBookCopyPopupAction, _id, actions, cover, slug} = this.props;
        showCreateBookCopyPopupAction({
            bookId: _id,
            bookSlug: slug,
            createEditBookCopyURI: actions.createBookCopy,
            cover
        });
    }

    removeBookCopy = () => {
        let {actions, removeBookCopyAction, match, location, intl} = this.props;

        let placeSlug = BookInfoContainer.getPlace(location);
        let bookSlug = BookInfoContainer.getBook(match);

        if (actions.removeBookCopy) {
            removeBookCopyAction(intl, actions.removeBookCopy, placeSlug, bookSlug);
        }
    }

    addToFavorites = () => {
        let {actions, addToFavoritesAction, _id, slug, intl} = this.props;

        addToFavoritesAction(intl, actions.addToFavorites, _id, actions.self, slug);
    }

    removeFromFavorites = () => {
        let {actions, removeFromFavoritesAction, _id, slug, intl} = this.props;

        removeFromFavoritesAction(intl, actions.removeFromFavorites, _id, actions.self, slug);
    }

    createBookCopy = ({amount, swap, condition, comment, bookId, createEditBookCopyURI}) => {
        let {createBookCopyAction, match, location, intl} = this.props;

        let placeSlug = BookInfoContainer.getPlace(location);
        let bookSlug = BookInfoContainer.getBook(match);

        createBookCopyAction(intl, createEditBookCopyURI, bookId, placeSlug, bookSlug, amount, swap, condition, comment);
    }

    publishBook = () => {
        let {publishBookAction, actions, match, location, intl} = this.props;
        let placeSlug = BookInfoContainer.getPlace(location);
        let bookSlug = BookInfoContainer.getBook(match);
        publishBookAction(intl, actions.publishBook, placeSlug, bookSlug)
    }

    unpublishBook = () => {
        let {unpublishBookAction, actions, match, location, intl} = this.props;
        let placeSlug = BookInfoContainer.getPlace(location);
        let bookSlug = BookInfoContainer.getBook(match);
        unpublishBookAction(intl, actions.unpublishBook, placeSlug, bookSlug)
    }

    editBook = () => {
        let {editBookAction, actions, routeResolver, intl} = this.props;
        editBookAction(intl, routeResolver, actions.createDraftFromBook)
    }

    buildAdmin() {
        const {actions, intl, editBookLoading} = this.props;
        return (actions.publishBook || actions.unpublishBook || actions.createDraftFromBook) &&
            <div className="row justify-content-end">
                <div className="col-12 l-bookInfoAdminActions">
                    <div className="adminActions">

                        {
                            (actions.publishBook || actions.unpublishBook) &&
                            <div className="adminActions--item">
                                <DropDown
                                    className={`dropdown-small ${actions.publishBook ? 'dropdown-warning' : 'dropdown-success'}`}
                                    type="custom"
                                    title={actions.publishBook ? intl.formatMessage(messages.unpublishedBookStatus) : intl.formatMessage(messages.publishedBookStatus)}>
                                    <div className="menu menu-small">
                                        {
                                            actions.publishBook &&
                                            <li onClick={this.publishBook}>
                                                <span>{intl.formatMessage(messages.publishBook)}</span>
                                            </li>

                                        }
                                        {
                                            actions.unpublishBook &&
                                            <li onClick={this.unpublishBook}>
                                                <span>{intl.formatMessage(messages.unpublishBook)}</span>
                                            </li>
                                        }
                                    </div>
                                </DropDown>
                            </div>
                        }
                        {
                            actions.createDraftFromBook &&
                            <div className="adminActions--item">
                                <LoadButton loading={editBookLoading} className="btn btn-secondary btn-small"
                                            onClick={this.editBook}>{intl.formatMessage(messages.editBook)}</LoadButton>
                            </div>
                        }
                    </div>
                </div>
            </div>
    }

    onRatingChanged = (value) => {
        let {rateBookAction, checkRequiredInfoAction, actions, intl} = this.props;
        let {auth} = this.context;

        if (auth.isAuthenticated) {
            rateBookAction(intl, actions.rateBook, value);
        } else {
            checkRequiredInfoAction();
        }
    }

    onShowReviewsClick = (e) => {
        e.preventDefault();
        this.scrollToRating();
    }

    scrollToRating() {
        this.reviewsRef.current.scrollIntoView();

        // now account for fixed header
        var scrolledY = window.scrollY;

        if (scrolledY) {
            window.scroll(0, scrolledY - 110);
        }
    }

    onCreateReviewClick = (e) => {
        let {showCreateReviewAction, slug} = this.props;
        e.preventDefault();
        showCreateReviewAction(slug);

        setTimeout(() => {
            this.scrollToRating();
        }, 50)
    }

    getBookRating(className) {
        const {
            rating, myRating, intl,
            reviewsTotal
        } = this.props;

        return <div className={`bookInfo--rating ${className ? className : ''}`}>
            <div className="bookInfo--ratingPart">
                {
                    rating &&
                    <div className="bookInfo--ratingValue">
                        <Rating value={rating.value}/>
                    </div>
                }
                {
                    rating &&
                    <div className="bookInfo--ratingVotesCount">(
                        {
                            intl.formatMessage(messages.votesCount, {
                                count: rating.votesCount
                            })
                        }
                        )</div>
                }
                <div className="bookInfo--ratingSelector d-none d-md-flex">
                    <RatingSelector className="ratingSelector-highlight" value={myRating}
                                    title={myRating ? intl.formatMessage(messages.myRating) : intl.formatMessage(messages.rateBook)}
                                    onSelectedValueChanged={this.onRatingChanged} showTitle={true}/>
                </div>
            </div>
            <div className="bookInfo--ratingSeparator d-none d-md-block">|</div>
            {
                rating &&
                <div className="bookInfo--ratingSeparator d-block d-md-none">|</div>
            }
            <div className="bookInfo--ratingReviewsPart">
                <div className="bookInfo--ratingReviewsTotal">
                    <a href="#"
                       onClick={reviewsTotal > 0 ? this.onShowReviewsClick : this.onCreateReviewClick}>
                        {
                            reviewsTotal > 0 ? intl.formatMessage(messages.reviewsCount, {count: reviewsTotal}) : intl.formatMessage(messages.createReview)
                        }
                    </a>
                </div>
            </div>
        </div>
    }

    getMobileBookRating(className){
        const {
            rating, myRating, intl,
            reviewsTotal
        } = this.props;

        return <div className={`bookInfo--rating bookInfo--ratingMobile ${className ? className : ''}`}>
            <div className="bookInfo--ratingPart d-flex d-sm-none">
                {
                    rating &&
                    <div className="bookInfo--ratingValue">
                        <Rating value={rating.value}/>
                    </div>
                }
                {
                    rating &&
                    <div className="bookInfo--ratingVotesCount">(
                        {
                            intl.formatMessage(messages.votesCount, {
                                count: rating.votesCount
                            })
                        }
                        )</div>
                }
                {
                    rating &&
                    <div className="bookInfo--ratingSeparator">|</div>
                }
                <div className="bookInfo--ratingReviewsPart">
                    <div className="bookInfo--ratingReviewsTotal">
                        <a href="#"
                           onClick={reviewsTotal > 0 ? this.onShowReviewsClick : this.onCreateReviewClick}>
                            {
                                reviewsTotal > 0 ? intl.formatMessage(messages.reviewsCount, {count: reviewsTotal}) : intl.formatMessage(messages.createReview)
                            }
                        </a>
                    </div>
                </div>
            </div>
            <div className="bookInfo--ratingSelector">
                <RatingSelector className="ratingSelector-highlight" value={myRating}
                                title={myRating ? intl.formatMessage(messages.myRating) : intl.formatMessage(messages.rateBook)}
                                onSelectedValueChanged={this.onRatingChanged} showTitle={true}/>
            </div>
        </div>
    }

    buildInfo() {
        const {
            title, geo, cover, languages, publishers, publishDate, authors, actions, description, intl,
            showCreateEditBookCopyLoading,
            addRemoveFromFavoritesLoading,
            removeBookCopyLoading,
            published
        } = this.props;

        return <div className="row l-bookInfo">
            <div className="col-12 d-block d-md-none bookInfo">
                <h1 className="bookInfo--title">{title}</h1>
                <div className="bookInfo--favorites">
                    {
                        !actions.removeFromFavorites &&
                        <span
                            className="icon icon-heart" onClick={this.addToFavorites}></span>
                    }
                    {
                        actions.removeFromFavorites &&
                        <span
                            className="icon icon-heartFull" onClick={this.removeFromFavorites}></span>
                    }
                </div>
            </div>
            <div className="col-auto pr-0 pr-md-3">
                <div className="bookInfo">
                    <div className="bookInfo--cover">
                        <BookCover className="bookCover-bookInfo" cover={cover} title={title}/>
                        <div className="bookInfo--shelf"></div>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="bookInfo">
                    <h1 className="bookInfo--title d-none d-md-block">{title}</h1>
                    {
                        authors && authors.length > 0 &&
                        <div className="bookInfo--author">
                            <div className="infoItem">
                                <div className="infoItem--label d-none d-sm-block"><FormattedMessage {...messages.by}/>:
                                </div>
                                <div className="infoItem--value">
                                    <AuthorsList className="authorsList-multi" authors={authors}
                                                 pushState={true}
                                                 authorUrlTemplateBuilder={author => this.buildLink(author.name, geo)}/>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        publishers && publishers.length > 0 &&
                        <div className="bookInfo--publisher">
                            <div className="infoItem">
                                <div className="infoItem--label d-none d-sm-block">
                                    <FormattedMessage {...messages.publisher}/>:
                                </div>
                                <div
                                    className="infoItem--value">{publishers.map(publ => publ.name).join(', ')}</div>
                            </div>
                            {
                                publishDate &&
                                <div className="bookInfo--publishDate">
                                    <div className="infoItem">
                                        <div className="infoItem--label">
                                            <FormattedMessage {...messages.publishDate}/>:
                                        </div>
                                        <div
                                            className="infoItem--value">{intl.formatDate(publishDate, {format: 'year'})}</div>
                                    </div>
                                </div>
                            }
                        </div>
                    }
                    {
                        languages && languages.length > 0 &&
                        <div className="bookInfo--language">
                            <div className="infoItem">
                                <div className="infoItem--label"><FormattedMessage {...messages.language}/>:</div>
                                <div className="infoItem--value">{languages.map(l => l.text).join(', ')}</div>
                            </div>
                        </div>
                    }
                    {
                        this.getBookRating('d-none d-sm-flex')
                    }
                    {
                        description &&
                        <div className="d-none d-xl-block bookInfo--description">
                            <ReadMore html={description} collapsedHeight={65}/>
                        </div>
                    }
                </div>
            </div>


            <div className="col-12 d-block d-lg-none l-bookInfoDescription">
                {
                    this.getMobileBookRating('d-flex d-md-none')
                }
                {
                    description &&
                    <div className="bookInfo--description">
                        <ReadMore html={description} collapsedHeight={44}/>
                    </div>
                }

            </div>

            <div className="col-12 col-lg-3 l-bookInfoActions">
                {
                    published &&
                    <div className="bookActions">
                        <div className="bookActions--item bookActions--sell">
                            {
                                !actions.removeBookCopy &&
                                <LoadButton
                                    className="btn btn-secondary btn-large btn-block btn-md-normal"
                                    loading={showCreateEditBookCopyLoading}
                                    onClick={this.putOnShelf}>
                                    <span
                                        className="icon icon-book"></span><FormattedMessage {...messages.putOnMyShelf}/>
                                </LoadButton>
                            }
                            {
                                actions.removeBookCopy &&
                                <LoadButton
                                    className="btn btn-secondary btn-large btn-block btn-md-normal"
                                    loading={removeBookCopyLoading}
                                    onClick={this.removeBookCopy}>
                                    <FormattedMessage {...messages.onMyShelf}/>
                                </LoadButton>
                            }
                        </div>
                        <div className="bookActions--item d-none d-md-block">
                            {
                                !actions.removeFromFavorites &&
                                <LoadButton className="btn btn-secondary btn-large btn-block btn-md-normal"
                                            loading={addRemoveFromFavoritesLoading}
                                            onClick={this.addToFavorites}><span
                                    className="icon icon-heart"></span><FormattedMessage {...messages.addToFavorites}/>
                                </LoadButton>
                            }
                            {
                                actions.removeFromFavorites &&
                                <LoadButton className="btn btn-secondary btn-large btn-block btn-md-normal"
                                            loading={addRemoveFromFavoritesLoading}
                                            onClick={this.removeFromFavorites}><span
                                    className="icon icon-heartFull"></span><FormattedMessage {...messages.inMyFavorites}/>
                                </LoadButton>
                            }
                        </div>
                    </div>
                }
            </div>
            {
                description &&
                <div className="col-12 d-none d-lg-block d-xl-none l-bookInfoDescription">
                    <div className="bookInfo--description">
                        <ReadMore html={description} collapsedHeight={44}/>
                    </div>
                </div>
            }
        </div>
    }

    buildUsersBookCopies() {
        const {bookCopies, facets, intl, published} = this.props;
        let hasFacets = facets.length > 0;

        return published ?
            [<div className={`row ${!bookCopies ? 'l-empty-bookInfo' : ''}`} key={0}>
                {
                    <div className="col-12">
                        <div className="bookCopies">
                            {
                                bookCopies && bookCopies.length > 0 &&
                                <div className="bookCopies--status">
                                    <FormattedHTMLMessage {...messages.ownersWhoHaveBook}
                                                          values={{count: bookCopies.length}}/>
                                </div>
                            }
                            {
                                bookCopies && bookCopies.length > 0 && hasFacets &&
                                <div className="bookCopies--facets">{this.buildFacets(facets)}</div>
                            }
                            {
                                bookCopies && bookCopies.length > 0 ?
                                    this.buildBookCopies(bookCopies) :
                                    <div className="bookCopies--empty">
                                        {
                                            hasFacets ?
                                                [<Empty className="empty-small empty-tiny empty-secondary" key={0}
                                                        message={intl.formatMessage(messages.emptyPrimary1)}
                                                        secondaryMessage={intl.formatMessage(messages.emptySecondary1)}/>,
                                                    <div className="bookCopies--emptyPlace" key={1}>
                                                        <div
                                                            className="bookCopies--facets">{this.buildFacets(facets)}</div>
                                                    </div>] :
                                                <div>
                                                    <Empty className="empty-small empty-tiny empty-secondary"
                                                           message={intl.formatMessage(messages.emptyPrimary2)}/>
                                                </div>
                                        }

                                    </div>
                            }
                        </div>
                    </div>
                }
            </div>,
                <div className="row" key={1}>
                    <div className="col-12">
                        <CreateEditBookCopyContainer onConfirmBookCopy={this.createBookCopy}/>
                    </div>
                </div>,
                <GetBookContainer key={2}/>] :
            <div className="bookCopies">
                <div className="bookCopies--empty">
                    <Empty className="empty-small"
                           message={intl.formatMessage(messages.bookIsNotActive)}/>
                </div>
            </div>
    }

    buildBookReviews() {
        return <div className="row mt-3 mt-md-5" ref={this.reviewsRef}>
            <div className="col-12">
                <BookReviewsContainer/>
            </div>
        </div>
    }

    render() {
        const {title, authors, intl, initialized, bookNotFound} = this.props;

        let authorsString = `${authors.map(a => a.name).join(', ')}`;
        let pageTitle = `${title}, ${authorsString}`;
        let metaDescription = intl.formatMessage(messages.pageMetaDescription, {
            title: title,
            author: authorsString
        });

        return bookNotFound ? <NotFound/> : <div className="container pb-0 pb-md-5">
            <Helmet>
                <title>
                    {intl.formatMessage(masterMessages.pageTitle, {title: pageTitle})}
                </title>
                <meta name="description" content={metaDescription}/>
            </Helmet>
            {
                initialized &&
                this.buildAdmin()
            }
            {
                initialized &&
                this.buildInfo()
            }
            {
                initialized &&
                this.buildUsersBookCopies()
            }
            {
                initialized &&
                this.buildBookReviews()
            }
            {
                !initialized &&
                <div className="row">
                    <div className="col-12 l-pageLoader">
                        <PageLoader/>
                    </div>
                </div>
            }
        </div>
    }
}

const messages = defineMessages({
    bookIsNotActive: {
        id: 'bookInfo.bookIsNotActive',
        defaultMessage: 'This book is not active anymore'
    },
    publishedBookStatus: {
        id: 'bookInfo.publishedBookStatus',
        defaultMessage: 'Book is published'
    },
    unpublishedBookStatus: {
        id: 'bookInfo.unpublishedBookStatus',
        defaultMessage: 'Book is unpublished'
    },
    publishBook: {
        id: 'bookInfo.publishBook',
        defaultMessage: 'Publish book'
    },
    unpublishBook: {
        id: 'bookInfo.unpublishBook',
        defaultMessage: 'Unpublish book'
    },
    emptyPrimary1: {
        id: 'bookInfo.emptyPrimary1',
        defaultMessage: 'It seems that no one in this place has this book'
    },
    emptySecondary1: {
        id: 'bookInfo.emptySecondary1',
        defaultMessage: 'Try to change place'
    },
    emptyPrimary2: {
        id: 'bookInfo.emptyPrimary2',
        defaultMessage: 'It seems that no one has this book'
    },
    pageMetaDescription: {
        id: 'bookInfo.metaDescription',
        defaultMessage: 'Book {title}, {author}, available at Liberbee for swapping or buying'
    },
    by: {
        id: 'bookInfo.by',
        defaultMessage: 'By'
    },
    publishDate: {
        id: 'bookInfo.publishDate',
        defaultMessage: 'Year'
    },
    publisher: {
        id: 'bookInfo.publisher',
        defaultMessage: 'Publisher'
    },
    language: {
        id: 'bookInfo.language',
        defaultMessage: 'Language'
    },
    moreDescription: {
        id: 'bookInfo.moreDescription',
        defaultMessage: '...more'
    },
    lessDescription: {
        id: 'bookInfo.lessDescription',
        defaultMessage: '...less'
    },
    ownersWhoHaveBook: {
        id: 'bookInfo.ownersWhoHaveBook',
        defaultMessage: 'The people who can give this book <span class="bookCopies--count">{count, number}</span>'
    },
    selectPlace: {
        id: 'bookInfo.selectPlace',
        defaultMessage: 'Select place'
    },
    place: {
        id: 'bookInfo.place',
        defaultMessage: 'Place'
    },
    addToFavorites: {
        id: 'bookInfo.addToFavorites',
        defaultMessage: 'Add to favorites'
    },
    inMyFavorites: {
        id: 'bookInfo.inMyFavorites',
        defaultMessage: 'In my favorites'
    },
    putOnMyShelf: {
        id: 'bookInfo.putOnMyShelf',
        defaultMessage: 'Put up for sale'
    },
    onMyShelf: {
        id: 'bookInfo.onMyShelf',
        defaultMessage: 'Remove from sale'
    },
    askBook: {
        id: 'bookInfo.askBook',
        defaultMessage: 'Request a book'
    },
    country: {
        id: 'bookInfo.country',
        defaultMessage: 'Country'
    },
    region: {
        id: 'bookInfo.region',
        defaultMessage: 'Region'
    },
    city: {
        id: 'bookInfo.city',
        defaultMessage: 'city'
    },
    editBook: {
        id: 'bookInfo.editBook',
        defaultMessage: 'Edit book'
    },
    votesCount: {
        id: 'bookInfo.votesCount',
        defaultMessage: '{count, number} {count, plural, one {vote} few {votes} other {votes}}'
    },
    reviewsCount: {
        id: 'bookInfo.reviewsCount',
        defaultMessage: '{count, number} {count, plural, one {review} few {reviews} other {reviews}}'
    },
    createReview: {
        id: 'bookInfo.createReview',
        defaultMessage: 'Create review'
    },
    myRating: {
        id: 'bookInfo.myRating',
        defaultMessage: 'My score',
    },
    rateBook: {
        id: 'bookInfo.rateBook',
        defaultMessage: 'Rate book',
    }

})

const mapStateToProps = (state, props) => {
    return {
        title: state.bookInfo.general.title,
        rating: state.bookInfo.general.rating,
        myRating: state.bookInfo.general.myRating,
        initialized: state.bookInfo.general.initialized,
        published: state.bookInfo.general.published,
        showCreateEditBookCopyLoading: state.bookInfo.general.showCreateEditBookCopyLoading,
        addRemoveFromFavoritesLoading: state.bookInfo.general.addRemoveFromFavoritesLoading,
        removeBookCopyLoading: state.bookInfo.general.removeBookCopyLoading,
        cover: state.bookInfo.general.cover,
        languages: state.bookInfo.general.languages,
        authors: state.bookInfo.general.authors,
        publishers: state.bookInfo.general.publishers,
        publishDate: state.bookInfo.general.publishDate,
        bookCopies: state.bookInfo.general.bookCopies,
        favorite: state.bookInfo.general.favorite,
        facets: state.bookInfo.general.facets,
        sourceUrl: state.bookInfo.general.sourceUrl,
        actions: state.bookInfo.general.actions,
        description: state.bookInfo.general.description,
        geo: state.bookInfo.general.geo,
        user: state.master.user,
        _id: state.bookInfo.general._id,
        slug: state.bookInfo.general.slug,
        bookNotFound: state.bookInfo.general.notFound,
        editBookLoading: state.bookInfo.general.editBookLoading,
        reviewsTotal: state.bookInfo.bookReviews.general.total
    }
}

const mapDispatchToProps = {
    loadBookAction,
    changeGeoAction,
    createBookCopyAction,
    removeBookCopyAction,
    addToFavoritesAction,
    removeFromFavoritesAction,
    validateDealRequestAndLoadUserBookCopiesAction,
    showCreateBookCopyPopupAction,
    publishBookAction,
    unpublishBookAction,
    setInitializedAction,
    setNotFoundAction,
    editBookAction,
    loadBookReviewsAction,
    rateBookAction,
    checkRequiredInfoAction,
    showCreateReviewAction
}

const loadData = (props, context) => {
    let placeSlug = BookInfoContainer.getPlace(props.location);
    let bookSlug = BookInfoContainer.getBook(props.match);
    let reviewsSort = BookInfoContainer.getRSort(props.location);
    let fnsToExecure = [
        context.store.dispatch(loadBookAction({placeSlug, bookSlug}, true)),
        context.store.dispatch(loadBookReviewsAction({bookSlug, sort: reviewsSort}))
    ];

    return Promise.all(fnsToExecure);
}

export default withComponentExtended('bookInfo', [], loadData, {
    canonical: (params) => {
        if (params.place && params.place != 'all') {
            return Object.assign({}, params, {place: 'all'})
        } else {
            return params;
        }
    }
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(BookInfoContainer)));
