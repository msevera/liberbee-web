/**
 * Created by Mike on 6/5/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux'
import {loadFavoriteBooksAction, setFavoritesInitializedAction} from '../../userActions';
import {removeFromFavoritesAction} from '../../../master/masterActions';
import halson from 'halson';
import Book from '../../../shared/book/components/book';
import {withComponentExtended} from '../../../hoc';
import {injectIntl, defineMessages} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';
import Helmet from 'react-helmet';
import Empty from '../../../shared/empty/components/empty';
import PageLoader from "../../../shared/empty/components/pageLoader";

class FavoriteBooksContainer extends React.Component {

    componentWillUnmount() {
        let {setFavoritesInitializedAction} = this.props;
        setFavoritesInitializedAction(false);
    }

    getBook(book) {
        let {isLoggedUser, removeFromFavoritesAction, intl, routeResolver} = this.props;
        let bookHal = halson(book);
        let authorRes = bookHal.getEmbeds('authors');
        let bookDetailsURL = routeResolver.buildRouteFor('bookInfo', {
            place: 'all',
            book: bookHal.slug
        }, {redirect: true});
        let removeFromFavoritesURI = bookHal.getLink('removeFromFavorites');
        let bookSelfURI = bookHal.getLink('self');

        let actions = {};
        if (!isLoggedUser) {
            actions = {
                gotoBookAction: true,
                gotoBookText: intl.formatMessage(messages.viewBook)
            }
        }

        if (removeFromFavoritesURI) {
            actions.favoriteAction = () => {
                removeFromFavoritesAction(intl, removeFromFavoritesURI, bookHal._id, bookSelfURI, bookHal.slug)
            }
        }

        if (!bookHal.published) {
            actions = {
                inactivityAction: () => {
                    removeFromFavoritesAction(intl, removeFromFavoritesURI, bookHal._id, bookSelfURI, bookHal.slug)
                },
                inactivityActionText: intl.formatMessage(messages.removeFromFavorites)
            }
        }

        let indexPath = routeResolver.buildRouteFor('index', {0: 'books', place: 'all'}).pathname;

        return <Book id={bookHal._id}
                     className="book-fav book-infoCenter"
                     title={bookHal.title}
                     authors={authorRes}
                     authorClickPushState={true}
                     active={bookHal.published}
                     rating={bookHal.rating && bookHal.rating.value}
                     favorite={true}
                     languages={bookHal.languages}
                     bookInfoUrl={bookDetailsURL}
                     cover={bookHal.cover}
                     authorSelected={this.searchByAuthor}
                     {...actions}
                     authorUrlTemplateBuilder={(author) => `${indexPath}?q=${author.name}`}
        />
    }

    render() {
        let {books, intl, initialized} = this.props;


        return <div className="container l-relative">
            <Helmet>
                <title>
                    {
                        intl.formatMessage(masterMessages.pageTitle, {
                            title: intl.formatMessage(messages.pageTitle)
                        })
                    }
                </title>
            </Helmet>
            {
                !initialized &&
                <PageLoader className="pageLoader-secondary pageLoader-absolute"/>
            }
            <div className="row"></div>
            <div className={`row justify-content-center justify-content-md-start ${books.length > 0 ? 'l-books' : 'l-empty-favoriteBooks'}`}>
                {
                    books.length > 0 ?
                        books.map((book) => {
                            return <div key={book._id} className="col-md-6 col-lg-4 col-xl-3 l-book">{this.getBook(book)}</div>
                        }) :
                        <Empty className="empty-small" message={intl.formatMessage(messages.emptyPrimary)}
                               secondaryMessage={intl.formatMessage(messages.emptySecondary)}/>
                }
            </div>
        </div>
    }
}

const messages = defineMessages({
    removeFromFavorites: {
        id: 'favoriteBooks.removeFromFavorites',
        defaultMessage: 'Remove from favorites'
    },
    emptyPrimary: {
        id: 'favoriteBooks.emptyPrimary',
        defaultMessage: 'No favorite books'
    },
    emptySecondary: {
        id: 'favoriteBooks.emptySecondary',
        defaultMessage: 'It seems that you have not marked any book as favorite yet'
    },
    pageTitle: {
        id: 'favoriteBooks.pageTitle',
        defaultMessage: 'Favorites'
    },
    viewBook: {
        id: 'favoriteBooks.viewBook',
        defaultMessage: 'View book'
    }
})

const mapStateToProps = (state, props) => {
    return {
        books: state.userData.favorite.books,
        initialized: state.userData.favorite.initialized,
        actions: state.userData.general.actions,
        user: state.userData.user
    }
}

const mapDispatchToProps = {
    loadFavoriteBooksAction,
    removeFromFavoritesAction,
    setFavoritesInitializedAction
}

const loadData = (props, context) => {
    return context.store.dispatch(loadFavoriteBooksAction());
}

export default withComponentExtended('favorites', [], loadData)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(FavoriteBooksContainer)));