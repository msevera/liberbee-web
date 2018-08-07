/**
 * Created by Mike on 6/5/2017.
 */

'use strict';

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/addBook.scss');
import React from 'react';
import {connect} from 'react-redux';
import {
    removeBookCopyAction,
    loadMoreAction,
} from '../addBookActions';
import {addToFavoritesAction, removeFromFavoritesAction} from '../../master/masterActions';
import halson from 'halson';
import Book from '../../shared/book/components/book';
import InfiniteScroll from 'react-infinite-scroller';
import {withTools} from '../../hoc';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {messages as masterMessages} from '../../master/masterMessages';
import {showCreateBookCopyPopupAction} from '../../shared/createEditBookCopy/createEditBookCopyActions';
import {showCreateDraftBookPopupAction} from '../../shared/createEditBookManually/createEditBookManuallyActions';
import Empty from '../../shared/empty/components/empty';

class AddBookContentContainer extends React.Component {
    getBook(book) {
        let {addToFavoritesAction, removeFromFavoritesAction, removeBookCopyAction, intl, routeResolver, showCreateBookCopyPopupAction} = this.props;

        book = halson(book);
        let bookSelfURI = book.getLink('self');
        let createBookCopyURI = book.getLink('createBookCopy');
        let removeBookCopyURI = book.getLink('removeBookCopy');
        let removeFromFavoritesURI = book.getLink('removeFromFavorites');
        let addToFavoritesURI = book.getLink('addToFavorites');
        let bookDetailsURL = routeResolver.buildRouteFor('bookInfo', {place: 'all', book: book.slug}, {redirect: true});

        let bookHasCopies = book.getEmbeds('bookCopies');
        let authors = book.getEmbeds('authors');
        let publishers = book.getEmbeds('publishers');
        let bookAdded = bookHasCopies.length > 0;
        let actions = {customActionText: intl.formatMessage(messages.addToShelf)};

        if (!!createBookCopyURI) {
            actions.customAction = () => {
                showCreateBookCopyPopupAction({
                    createEditBookCopyURI: createBookCopyURI,
                    bookId: book._id,
                    bookSlug: book.slug,
                    cover: book.cover
                });
            }

            actions.customActionLoading = book.loading;
        }

        if (removeBookCopyURI) {
            actions.removeAction = () => {
                removeBookCopyAction(intl, removeBookCopyURI, book.slug);
            };
        }

        actions.favoriteAction = () => {
            addToFavoritesAction(intl, addToFavoritesURI, book._id, bookSelfURI, book.slug)
        }

        if (removeFromFavoritesURI) {
            actions.favoriteAction = () => {
                removeFromFavoritesAction(intl, removeFromFavoritesURI, book._id, bookSelfURI, book.slug)
            }
        }

        if (bookAdded) {
            actions.customAction = () => {
            };
            actions.customActionText = intl.formatMessage(messages.bookAdded);
            actions.customActionDisabled = true
        }

        return <Book id={book._id}
                     className="book-add"
                     bookInfoUrl={bookDetailsURL}
                     allowHover={!bookAdded}
                     title={book.title}
                     authors={authors}
                     publishers={publishers}
                     publishDate={book.publishDate}
                     rating={book.rating && book.rating.value}
                     favorite={book.favorite}
                     isbn10={book.isbn10}
                     isbn13={book.isbn13}
                     languages={book.languages}
                     cover={book.cover}
                     removeTitle={intl.formatMessage(messages.removeFromMyShelf)}
                     {...actions}
        />
    }

    onAddBookManuallyShow = (e) => {
        let {showCreateDraftBookPopupAction, actions} = this.props;
        e.preventDefault();

        showCreateDraftBookPopupAction({
            createEditDraftBookURI: actions.createDraftBook
        });
    }

    onLoadMoreHandler = () => {
        const {addBookActions, loadMoreAction} = this.props;
        if (addBookActions.loadMore) {
            loadMoreAction(addBookActions.loadMore);
        }
    }

    render() {
        const {books, searchInitiated, addBookActions, intl, searchLoadingStatus} = this.props;

        return  books.length > 0 ?
            <InfiniteScroll className={`row justify-content-center justify-content-md-start l-books l-contentLoading l-contentLoadingSecondary ${searchLoadingStatus ? 'l-contentLoading-is-visible': ''}`}
                            pageStart={0}
                            loadMore={this.onLoadMoreHandler}
                            hasMore={!!addBookActions.loadMore}
                            loader={<div
                                className="loadSpinner" key={0}>{intl.formatMessage(masterMessages.loading)}</div>}>
                {
                    books.map((book) => {
                        return <div key={book._id} className="col-md-6 col-lg-4 col-xl-3 l-book">{this.getBook(book)}</div>
                    })

                }

            </InfiniteScroll> :
            <div className="row d-flex justify-content-center l-empty-addBook ">
                <div className="col-8 l-textCenter">
                    {
                        searchInitiated ?
                            <Empty className="empty-small" renderImg={false}
                                   message={intl.formatMessage(messages.emptyPrimary)}
                                   secondaryMessage={[
                                       <FormattedMessage {...messages.emptySecondary} />,
                                       <a href="#" className="ml-1"
                                          onClick={this.onAddBookManuallyShow}><FormattedMessage {...messages.addBookManually} /></a>]
                                   }/> :
                            <div>
                                <Empty renderImg={false}
                                       secondaryMessage={<FormattedMessage {...messages.useSearchAbove} />} />

                            </div>

                    }

                </div>
            </div>
    }
}

const messages = defineMessages({
    emptyPrimary: {
        id: 'addBook.emptyPrimary',
        defaultMessage: 'It seems that we cannot find such a book'
    },
    emptySecondary: {
        id: 'addBook.emptySecondary',
        defaultMessage: 'Try to adjust search criteria or'
    },
    addBookManually: {
        id: 'addBook.addBookManually',
        defaultMessage: 'Add book manually'
    },
    useSearchAbove: {
        id: 'addBook.useSearchAbove',
        defaultMessage: 'Please use search bar above to find book you want to sell or swap'
    },
    removeFromMyShelf: {
        id: 'addBook.removeFromMyShelf',
        defaultMessage: 'Remove from sale'
    },
    bookAdded: {
        id: 'addBook.bookAdded',
        defaultMessage: 'On sale'
    },
    addToShelf: {
        id: 'addBook.addToShelf',
        defaultMessage: 'Put up for sale'
    }
})

const mapStateToProps = (state, props) => {
    return {
        books: state.addBook.search.books,
        actions: state.master.general.actions,
        addBookActions: state.addBook.general.actions,
        searchInitiated: state.addBook.search.searchInitiated,
        searchLoadingStatus: state.addBook.search.searchLoadingStatus,
    }
}

const mapDispatchToProps = {
    addToFavoritesAction,
    removeFromFavoritesAction,
    removeBookCopyAction,
    loadMoreAction,
    showCreateDraftBookPopupAction,
    showCreateBookCopyPopupAction,
}

export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(AddBookContentContainer)));
