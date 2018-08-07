/**
 * Created by Mike on 9/27/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {loadMoreAction, associateDraftWithBookAction} from '../../draftBookActions';
import InfiniteScroll from 'react-infinite-scroller';
import Book from '../../../shared/book/components/book';
import halson from 'halson';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';
import {withTools} from '../../../hoc';
import Empty from '../../../shared/empty/components/empty';

class AssociateBookContentContainer extends React.Component {
    onBookAssociate = (bookId) => {
        let {onAssociateBookCliked, associateDraftWithBookAction, draftBookActions, intl} = this.props;
        associateDraftWithBookAction(draftBookActions.associateDraftWithBook, bookId, intl);
        onAssociateBookCliked();
    }

    getBook(book) {
        let {associatedBook, intl, routeResolver} = this.props;

        book = halson(book);
        let bookDetailsURL = routeResolver.buildRouteFor('bookInfo', {place: 'all', book: book.slug}, {redirect: true});
        let authors = book.getEmbeds('authors');
        let publishers = book.getEmbeds('publishers');
        let isAssociated = associatedBook && associatedBook._id == book._id;

        let actions = {
            customActionText: intl.formatMessage(messages.associateWith),
            customAction: () => this.onBookAssociate(book._id)
        };


        if (isAssociated) {
            actions.customAction = () => {
            };
            actions.customActionText = intl.formatMessage(messages.associated);
            actions.customActionDisabled = true
        }

        let indexPath = routeResolver.buildRouteFor('index', {0: 'books', place: 'all'}).pathname;

        return <Book id={book._id}
                     className="book-add"
                     bookInfoUrl={bookDetailsURL}
                     allowHover={!isAssociated}
                     title={book.title}
                     authors={authors}
                     showFavorite={false}
                     isbn10={book.isbn10}
                     isbn13={book.isbn13}
                     rating={book.rating && book.rating.value}
                     publishers={publishers}
                     publishDate={book.publishDate}
                     languages={book.languages}
                     cover={book.cover}
                     {...actions}
                     authorUrlTemplateBuilder={(author) => `${indexPath}?q=${author.name}`}
        />
    }

    onLoadMoreHandler = () => {
        const {draftBookActions, loadMoreAction} = this.props;
        if (draftBookActions.loadMore) {
            loadMoreAction(draftBookActions.loadMore);
        }
    }

    render() {
        let {books, draftBookActions, searchInitiated, intl, loading} = this.props;

        return books.length > 0 ?
            <InfiniteScroll className={`row l-books l-contentLoading l-contentLoadingSecondary ${loading ? 'l-contentLoading-is-visible': ''}`}
                            pageStart={0}
                            loadMore={this.onLoadMoreHandler}
                            hasMore={!!draftBookActions.loadMore}
                            loader={<div
                                className="loadSpinner" key={0}>{intl.formatMessage(masterMessages.loading)}</div>}>
                {
                    books.map((book) => {
                        return <div key={book._id} className="col-4 l-book">{this.getBook(book)}</div>
                    })

                }

            </InfiniteScroll> :
            <div className="row d-flex l-empty-associateBook">
                <div className="col-8 l-textCenter">
                    {
                        searchInitiated ?
                            <Empty className="empty-small" renderImg={false}
                                   message={intl.formatMessage(messages.emptyPrimary1)}
                                   secondaryMessage={intl.formatMessage(messages.emptySecondary1)} /> :
                            <Empty renderImg={false}
                                   secondaryMessage={intl.formatMessage(messages.emptySecondary2)} />


                    }

                </div>
            </div>
    }
}

let messages = defineMessages({
    emptyPrimary1: {
        id: 'associateBook.emptyPrimary1',
        defaultMessage: 'It seems that we cannot find such a book'
    },
    emptySecondary1: {
        id: 'associateBook.emptySecondary1',
        defaultMessage: 'Try to adjust search criteria'
    },
    emptySecondary2: {
        id: 'associateBook.emptyPrimary2',
        defaultMessage: 'Please use search bar above to find book for association'
    },
    associateWith: {
        id: 'associateBook.associateWith',
        defaultMessage: 'Associate with'
    },
    associated: {
        id: 'associateBook.associated',
        defaultMessage: 'Associated'
    },
})

const mapStateToProps = (state, props) => {
    return {
        books: state.draftBook.associates.books,
        loading: state.draftBook.associates.loading,
        searchInitiated: state.draftBook.associates.searchInitiated,
        draftBookActions: state.draftBook.general.actions,
        associatedBook: state.draftBook.draft.book,
    }
}

const mapDispatchToProps = {
    loadMoreAction,
    associateDraftWithBookAction
}


export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(AssociateBookContentContainer)));