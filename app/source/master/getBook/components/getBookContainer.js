/**
 * Created by Mike on 10/3/2017.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import PopupFull from '../../../shared/popup/components/popupFull';
import {
    showGetBookPopupAction,
    validateDealRequestAndLoadUserBookCopiesAction,
    createDealRequestAction,
    removeBookCopyAndValidateDealRequest
} from '../getBookActions';
import {addToFavoritesAction, removeFromFavoritesAction} from '../../../master/masterActions';
import FormGroupInput from '../../../shared/form/components/formGroupInput';
import AuthorsList from '../../../shared/book/components/authorsList';
import halson from 'halson';
import BookCover from '../../../shared/book/components/bookCover';
import Book from '../../../shared/book/components/book';
import {submitForm, clearFormErrors} from '../../../shared/validation/actions';
import {withRouter, Redirect} from 'react-router-dom';
import {requestModelFormValidators, messageSymbolsCount, messageWordsCount} from '../formValidators';
import Deal from '../../../shared/book/components/deal';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';
import {withTools} from '../../../hoc';
import DOMUtils from '../../../../../utils/DOMUtils';
import queryString from 'query-string';
import LoadButton from '../../../shared/button/components/loadButton';
import BookCondition from '../../../shared/book/components/bookCondition';

class GetBookContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    static getPlace(match) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.place ? query.place : '';
    }

    constructor() {
        super();

        this.state = {
            showBookRequestPopup: false
        }

        this.getBookValidators = requestModelFormValidators;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            showBookRequestPopup: nextProps.show
        })
    }

    componentWillUnmount() {
        let {showGetBookPopupAction} = this.props;
        showGetBookPopupAction(false);
        DOMUtils.unfreezeBody('getBookFullPopup');
    }

    onCreateDealRequest = () => {
        let {createDealRequestAction, intl} = this.props;
        let {store} = this.context;

        store.dispatch(submitForm({model: 'master.getBook.requestModel'}))
            .then((requestModel) => {
                requestModel.message = requestModel.message.trim();

                createDealRequestAction({...requestModel}, intl)
            });
    }

    onGetBookClose = () => {
        let {showGetBookPopupAction, bookCopies, gtm} = this.props;
        let {store} = this.context;

        gtm.ee.removeFromCart(bookCopies);

        this.setState({
            showBookRequestPopup: false
        })

        setTimeout(() => {
            showGetBookPopupAction(false);
            store.dispatch(clearFormErrors({model: 'master.getBook.requestModel'}))
        }, 500)
    }

    buildBooksInRequest() {
        let {bookCopies, inRequest, user, removeBookCopyAndValidateDealRequest, intl, routeResolver} = this.props;

        let booksInRequest = [];
        inRequest.forEach((copyInRequest) => {
            let bookCopy = bookCopies.find((bookCopy) => {
                return copyInRequest === bookCopy._id;
            })

            bookCopy && booksInRequest.push(bookCopy);
        })

        return booksInRequest.map((bookCopy) => {
            let book = halson(bookCopy).getEmbed('book');
            let authors = book.getEmbeds('authors');
            let indexPath = routeResolver.buildRouteFor('index', {0: 'books', place: 'all'}).pathname


            return <div key={bookCopy._id} className="getBook--item">
                <div className="bookPlate">
                    <div className="bookPlate--content">
                        <div className="bookPlate--cover">
                            <BookCover cover={book.cover} title={book.title}/>
                        </div>
                        <div className="bookPlate--data">
                            <div className="bookPlate--title">{book.title}</div>
                            <div className="infoItem">
                                <div className="infoItem--label">{intl.formatMessage(messages.by)}:</div>
                                <div className="infoItem--value">
                                    <AuthorsList authors={authors}
                                                 authorUrlTemplateBuilder={(author) => `${indexPath}?q=${author.name}`}
                                                 pushState={true}/>
                                </div>
                            </div>
                            <div className="infoItem">
                                <div className="infoItem--label">{intl.formatMessage(messages.language)}:</div>
                                <div className="infoItem--value">{book.languages.map(l => l.text).join(', ')}</div>
                            </div>
                            <div className="infoItem">
                                <div className="infoItem--label">{intl.formatMessage(messages.location)}:</div>
                                <div className="infoItem--value">{user.geo.city}</div>
                            </div>
                            {
                                bookCopy.condition &&
                                <div className="infoItem">
                                    <BookCondition className="bookCondition-normal" condition={bookCopy.condition}
                                                   comment={bookCopy.comment}/>
                                </div>
                            }
                            <div>
                                <Deal align="left" amount={bookCopy.deal.amount} swap={bookCopy.deal.swap}
                                      currencyCode={bookCopy.geo.currencyCode}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="getBook--remove" onClick={() => {
                    removeBookCopyAndValidateDealRequest({bookCopyId: bookCopy._id});
                }}></div>
            </div>
        })
    }

    getBook(bookCopy) {
        let {validateDealRequestAndLoadUserBookCopiesAction, addToFavoritesAction, removeFromFavoritesAction, location, intl, routeResolver} = this.props;

        let bookCopyHal = halson(bookCopy)
        let bookRes = bookCopyHal.getEmbed('book');

        let authorRes = bookRes.getEmbeds('authors');
        let placeSlug = GetBookContainer.getPlace(location);

        let removeFromFavoritesURI = bookRes.getLink('removeFromFavorites');
        let addToFavoritesURI = bookRes.getLink('addToFavorites');
        let bookSelfURI = bookRes.getLink('self');
        let createDealRequestURI = bookCopyHal.getLink('createDealRequest');

        let actions = {};
        if (createDealRequestURI && !bookCopy.isAddedToRequest) {
            actions = {
                customAction: () => {
                    validateDealRequestAndLoadUserBookCopiesAction({
                        userId: bookCopyHal.user,
                        bookCopyId: bookCopyHal._id
                    });
                },
                customActionText: intl.formatMessage(messages.add),
                customActionLoading: bookCopy.loading
            }
        } else {
            actions.customAction = () => {
            };
            actions.customActionText = intl.formatMessage(messages.added);
            actions.customActionDisabled = true
        }

        actions.favoriteAction = () => {
            addToFavoritesAction(intl, addToFavoritesURI, bookRes._id, bookSelfURI)
        }

        if (removeFromFavoritesURI) {
            actions.favoriteAction = () => {
                removeFromFavoritesAction(intl, removeFromFavoritesURI, bookRes._id, bookSelfURI)
            }
        }

        let indexPath = routeResolver.buildRouteFor('index', {0: 'books', place: 'all'}).pathname;

        return <Book id={bookRes._id}
                     className="book-get book-infoCenter"
                     title={bookRes.title}
                     authors={authorRes}
                     deal={bookCopyHal.deal}
                     comment={bookCopyHal.comment}
                     condition={bookCopyHal.condition}
                     currencyCode={bookCopyHal.geo.currencyCode}
                     authorClickPushState={true}
                     rating={bookRes.rating && bookRes.rating.value}
                     favorite={bookRes.favorite}
                     languages={bookRes.languages}
                     bookInfoUrl={routeResolver.buildRouteFor('bookInfo', {
                         book: bookRes.slug
                     }, {redirect: true, query: {place: placeSlug}})}
                     cover={bookRes.cover}
                     {...actions}
                     authorUrlTemplateBuilder={(author) => `${indexPath}?q=${author.name}`}
        />
    }

    render() {
        let {user, bookCopies, intl, loading} = this.props;
        let {showBookRequestPopup} = this.state;

        return <PopupFull show={showBookRequestPopup} onClose={this.onGetBookClose} id="getBookFullPopup" fixed={true}>
            <div className="mt-3 mt-md-5 row">
                <div className="col-12">
                    <div className="popup popup-static">
                        <div className="popup--container">
                            <div className="popup--header popup--headerCenter">
                                <span>
                                {intl.formatMessage(messages.askForBooksFrom, {
                                    user: user && user.name ? user.name : ''
                                })}
                                </span>
                            </div>
                            <div className="popup--content">
                                <div className="getBook">
                                    <div className="getBook--items">
                                        {
                                            this.buildBooksInRequest()
                                        }
                                    </div>
                                    <div className="getBook--message">
                                        <form className="form">
                                            <FormGroupInput id="draftBookDescription"
                                                            placeholder={intl.formatMessage(messages.descriptionPlaceholder)}
                                                            model="master.getBook.requestModel"
                                                            prop="message"
                                                            type="richtext"
                                                            validators={this.getBookValidators.message}
                                                            messages={{
                                                                htmlRequired: intl.formatMessage(messages.descriptionRequired),
                                                                htmlLimitWordsFrom: intl.formatMessage(messages.descriptionLimitWords, {
                                                                    count: messageWordsCount
                                                                }),
                                                                htmlLimitCharsTo: intl.formatMessage(messages.descriptionLimitChars, {
                                                                    count: messageSymbolsCount
                                                                })
                                                            }}/>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="popup--footer">
                                <div></div>
                                <div className="popup--footerMainActions">
                                    <button className="btn btn-link btn-linkSecondary btn-xs-block"
                                            onClick={this.onGetBookClose}>{intl.formatMessage(masterMessages.cancel)}
                                    </button>
                                    <LoadButton className="btn btn-primary btn-noShadow btn-xs-block"
                                                onClick={this.onCreateDealRequest}
                                                loading={loading}
                                                text={intl.formatMessage(messages.sendRequest)}>
                                    </LoadButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {

                bookCopies && bookCopies.length > 0 &&
                [
                    <div key="0" className="row mt-5">
                        <div className="col-12 l-text18 l-bold">
                            {intl.formatMessage(messages.otherBooks, {user: user.name})}
                        </div>
                    </div>,
                    <div key="1" className="justify-content-center justify-content-md-start l-books row">
                        {
                            bookCopies.map((bookCopy) => {
                                return <div key={bookCopy._id}
                                            className="col-md-6 col-lg-3 l-book">{this.getBook(bookCopy)}</div>
                            })
                        }
                    </div>
                ]
            }
        </PopupFull>
    }
}

const messages = defineMessages({
    askForBooksFrom: {
        id: 'getBook.askForBooksFrom',
        defaultMessage: 'Request a book from {user}'
    },
    sendRequest: {
        id: 'getBook.sendRequest',
        defaultMessage: 'Send request'
    },
    by: {
        id: 'getBook.by',
        defaultMessage: 'By'
    },
    language: {
        id: 'getBook.language',
        defaultMessage: 'Language'
    },
    location: {
        id: 'getBook.location',
        defaultMessage: 'Location'
    },
    owner: {
        id: 'getBook.owner',
        defaultMessage: 'Owner'
    },
    add: {
        id: 'getBook.add',
        defaultMessage: 'Add'
    },
    added: {
        id: 'getBook.added',
        defaultMessage: 'Added'
    },
    descriptionPlaceholder: {
        id: 'getBook.descriptionPlaceholder',
        defaultMessage: 'Enter here a few words about your self'
    },
    descriptionRequired: {
        id: 'getBook.descriptionRequired',
        defaultMessage: 'Message is required'
    },
    descriptionLimitWords: {
        id: 'getBook.descriptionLimitWords',
        defaultMessage: 'Please enter at least {count} words'
    },
    descriptionLimitChars: {
        id: 'getBook.descriptionLimitChars',
        defaultMessage: 'Message can be {count} characters long'
    },
    otherBooks: {
        id: 'getBook.otherBooks',
        defaultMessage: 'Other books of {user}'
    }
})

const mapStateToProps = (state, props) => {
    return {
        bookCopies: state.master.getBook.general.bookCopies,
        inRequest: state.master.getBook.general.inRequest,
        show: state.master.getBook.general.show,
        user: state.master.getBook.general.user,
        loading: state.master.getBook.general.loading
    }
}

const mapDispatchToProps = {
    showGetBookPopupAction,
    validateDealRequestAndLoadUserBookCopiesAction,
    addToFavoritesAction,
    removeFromFavoritesAction,
    createDealRequestAction,
    removeBookCopyAndValidateDealRequest
}


export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(GetBookContainer)));