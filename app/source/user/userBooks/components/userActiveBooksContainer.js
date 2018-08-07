/**
 * Created by Mike on 9/26/2017.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {loadUserBooksAction, removeBookCopyAction, editBookCopyAction} from '../../userActions';
import {addToFavoritesAction, removeFromFavoritesAction} from '../../../master/masterActions';
import halson from 'halson';
import Book from '../../../shared/book/components/book';
import GetBookContainer from '../../../master/getBook/components/getBookContainer';
import {validateDealRequestAndLoadUserBookCopiesAction} from '../../../master/getBook/getBookActions';
import {withComponentExtended} from '../../../hoc';
import {injectIntl, defineMessages} from 'react-intl';
import {showEditBookCopyPopupAction} from '../../../shared/createEditBookCopy/createEditBookCopyActions';
import CreateEditBookCopyContainer from '../../../shared/createEditBookCopy/components/createEditBookCopyContainer';
import {resetModelToInitial} from "../../../shared/validation/actions";
import Empty from '../../../shared/empty/components/empty';

class UserActiveBooksContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    getBook(bookCopy, index) {
        let {removeBookCopyAction, addToFavoritesAction, removeFromFavoritesAction, validateDealRequestAndLoadUserBookCopiesAction, intl, routeResolver, showEditBookCopyPopupAction} = this.props;
        let {store} = this.context;

        let bookCopyHal = halson(bookCopy)
        let bookRes = bookCopyHal.getEmbed('book');
        let authorRes = bookRes.getEmbeds('authors');
        let publishersRes = bookRes.getEmbeds('publishers');
        let bookDetailsURL = routeResolver.buildRouteFor('bookInfo', {
            book: bookRes.slug
        }, {redirect: true});

        let removeFromFavoritesURI = bookRes.getLink('removeFromFavorites');
        let addToFavoritesURI = bookRes.getLink('addToFavorites');
        let bookSelfURI = bookRes.getLink('self');
        let removeBookCopyURI = bookCopyHal.getLink('removeBookCopy');
        let editBookCopyURI = bookCopyHal.getLink('editBookCopy');
        let actions = {
            customAction: () => {
                validateDealRequestAndLoadUserBookCopiesAction({
                    userId: bookCopyHal.user,
                    bookCopyId: bookCopyHal._id
                })
            },
            customActionText: intl.formatMessage(messages.askForBook),
            customActionLoading: bookCopyHal.loading
        }

        if (editBookCopyURI) {
            actions = {
                customAction: () => {
                    store.dispatch(resetModelToInitial({
                        model: 'master.createEditBookCopy.createEditBookCopyModel',
                        initialData: {
                            ...bookCopyHal.deal,
                            condition: bookCopyHal.condition,
                            comment: bookCopyHal.comment
                        }
                    }));
                    showEditBookCopyPopupAction({
                        createEditBookCopyURI: editBookCopyURI,
                        bookId: bookRes._id,
                        bookSlug: bookRes.slug,
                        cover: bookRes.cover,
                        showComment: !!bookCopyHal.comment
                    });
                },
                customActionText: intl.formatMessage(messages.changeDeal),
                customActionLoading: bookCopyHal.loading
            }
        }

        if (removeBookCopyURI) {
            actions.removeAction = () => {
                removeBookCopyAction(intl, removeBookCopyURI, bookRes.slug);
            };
        }

        if (!bookRes.published) {
            actions = {
                inactivityAction: () => {
                    removeBookCopyAction(intl, removeBookCopyURI, bookRes.slug);
                },
                inactivityActionText: intl.formatMessage(messages.removeFromMyShelf)
            }
        }

        actions.favoriteAction = () => {
            addToFavoritesAction(intl, addToFavoritesURI, bookRes._id, bookSelfURI, bookRes.slug)
        }

        if (removeFromFavoritesURI) {
            actions.favoriteAction = () => {
                removeFromFavoritesAction(intl, removeFromFavoritesURI, bookRes._id, bookSelfURI, bookRes.slug)
            }
        }

        let indexPath = routeResolver.buildRouteFor('index', {0: 'books', place: 'all'}).pathname;

        return <Book id={bookRes._id}
                     onClick={() => this.redirectCallback(bookCopy, index)}
                     className="book-my"
                     active={bookRes.published}
                     title={bookRes.title}
                     rating={bookRes.rating && bookRes.rating.value}
                     authors={authorRes}
                     publishers={publishersRes}
                     deal={bookCopyHal.deal}
                     condition={bookCopyHal.condition}
                     comment={bookCopyHal.comment}
                     currencyCode={bookCopyHal.geo.currencyCode}
                     authorClickPushState={true}
                     favorite={bookRes.favorite}
                     languages={bookRes.languages}
                     bookInfoUrl={bookDetailsURL}
                     cover={bookRes.cover}
                     removeAction={this.removeAction}
                     removeTitle={intl.formatMessage(messages.removeFromMyShelf)}
                     {...actions}
                     authorUrlTemplateBuilder={(author) => `${indexPath}?q=${author.name}`}
        />
    }

    redirectCallback(bookCopy, index) {
        let {gtm} = this.props;
        gtm.ee.userBookCopyClick(bookCopy, index);
    }

    editBookCopy = ({amount, swap, condition, comment, bookId, bookSlug, createEditBookCopyURI}) => {
        let {editBookCopyAction, intl} = this.props;

        editBookCopyAction(intl, createEditBookCopyURI, bookId, amount, swap, condition, comment, bookSlug);
    }

    render() {
        let {bookCopies, intl, isLoggedUser} = this.props;

        return <div
            className={`row justify-content-center justify-content-md-start ${bookCopies.length > 0 ? 'l-books' : 'l-empty-activeBooks'}`}>
            {
                bookCopies.length > 0 ?
                    bookCopies.map((bookCopy, index) => {
                        return <div key={bookCopy._id}
                                    className="col-md-6 col-lg-4 col-xl-3 l-book">{this.getBook(bookCopy, index)}</div>
                    }) :
                    isLoggedUser ?
                        <Empty className="empty-small" message={intl.formatMessage(messages.emptyPrimary)}
                               secondaryMessage={intl.formatMessage(messages.emptySecondary)}/> :
                        <Empty className="empty-small" message={intl.formatMessage(messages.emptyPrimaryAnotherUser)}/>
            }
            <GetBookContainer/>
            <CreateEditBookCopyContainer mode="edit" onConfirmBookCopy={this.editBookCopy}/>
        </div>
    }
}

const messages = defineMessages({
    bookIsNotActive: {
        id: 'userActiveBooks.bookIsNotActive',
        defaultMessage: 'Book is not active anymore'
    },
    emptyPrimaryAnotherUser: {
        id: 'userActiveBooks.emptyPrimaryAnotherUser',
        defaultMessage: 'The bookshelf of this user is empty'
    },
    emptyPrimary: {
        id: 'userActiveBooks.emptyPrimary',
        defaultMessage: 'Your bookshelf is empty'
    },
    emptySecondary: {
        id: 'userActiveBooks.emptySecondary',
        defaultMessage: 'Here you will see the books you put up for sale and swapping'
    },
    askForBook: {
        id: 'userActiveBooks.askForBook',
        defaultMessage: 'Request a book'
    },
    changeDeal: {
        id: 'userActiveBooks.changeDeal',
        defaultMessage: 'Change price'
    },
    removeFromMyShelf: {
        id: 'userActiveBooks.removeFromMyShelf',
        defaultMessage: 'Remove from sale'
    }
})

const mapStateToProps = (state, props) => {
    return {
        isLoggedUser: state.master.user.slug == state.userData.user.slug,
        bookCopies: state.userData.books.bookCopies,
        actions: state.userData.general.actions,
        user: state.userData.user
    }
}

const mapDispatchToProps = {
    addToFavoritesAction,
    removeFromFavoritesAction,
    loadUserBooksAction,
    removeBookCopyAction,
    validateDealRequestAndLoadUserBookCopiesAction,
    showEditBookCopyPopupAction,
    editBookCopyAction
}

export default withComponentExtended('userActiveBooks')(injectIntl(connect(mapStateToProps, mapDispatchToProps)(UserActiveBooksContainer)));