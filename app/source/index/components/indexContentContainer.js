'use strict';

import Hamburger from "../../shared/hamburger/components/hamburger";

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/index.scss');
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    searchBooksAction,
    filterBooksAction,
    setSearchFacetValueAction,
    setSearchSortCriteriaActiveAction,
    loadMoreAction,
    setSelectedCategoryAction,
} from '../indexActions';
import {addToFavoritesAction, removeFromFavoritesAction} from '../../master/masterActions';
import halson from 'halson';
import DropDown from '../../shared/dropdown/components/dropdown';
import FacetCheckbox from '../../shared/facets/components/facetCheckbox';
import Categories from '../../shared/categories/components/categories';
import InfiniteScroll from 'react-infinite-scroller';
import Book from '../../shared/book/components/book';
import {withTools} from '../../hoc';
import {defineMessages, FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl';
import {messages as masterMessages} from '../../master/masterMessages';
import Empty from '../../shared/empty/components/empty';
import PageLoader from '../../shared/empty/components/pageLoader';
import DOMUtils from '../../../../utils/DOMUtils';

class IndexContentContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor() {
        super();

        this.state = {
            showCategories: false
        }
    }

    redirectCallback(book, index) {
        let {searchResponse, gtm} = this.props;
        gtm.ee.productClick(book, searchResponse.category, index, searchResponse.page, searchResponse.size);
    }

    getBook(book, index) {
        let {searchResponse, addToFavoritesAction, removeFromFavoritesAction, intl, routeResolver} = this.props;

        let bookHal = halson(book);
        let authorRes = bookHal.getEmbeds('authors');
        let topBookCopies = bookHal.getEmbed('topBookCopies');
        let bookDetailsURL = routeResolver.buildRouteFor('bookInfo', {
            book: book.slug
        }, {
            redirect: true,
            query: {
                place: searchResponse.place.slug
            }
        });


        let hasCopies = topBookCopies && topBookCopies.bookCopies;

        let removeFromFavoritesURI = bookHal.getLink('removeFromFavorites');
        let addToFavoritesURI = bookHal.getLink('addToFavorites');
        let bookSelfURI = bookHal.getLink('self');

        let actions = {};
        if (hasCopies) {
            actions = {
                gotoBookAction: true,
                gotoBookText: intl.formatMessage(messages.getBook)
            }
        } else {
            actions = {
                notAvailable: true,
            }
        }

        actions.favoriteAction = () => {
            addToFavoritesAction(intl, addToFavoritesURI, bookHal._id, bookSelfURI, bookHal.slug)
        }

        if (removeFromFavoritesURI) {
            actions.favoriteAction = () => {
                removeFromFavoritesAction(intl, removeFromFavoritesURI, bookHal._id, bookSelfURI, bookHal.slug)
            }
        }

        return <Book id={bookHal._id}
                     className={`book-index book-infoCenter`}
                     onClick={() => this.redirectCallback(book, index)}
                     title={bookHal.title}
                     favorite={bookHal.favorite}
                     authors={authorRes}
                     rating={bookHal.rating && bookHal.rating.value}
                     languages={bookHal.languages}
                     bookCopies={topBookCopies && topBookCopies.bookCopies}
                     bookInfoUrl={bookDetailsURL}
                     cover={bookHal.cover}
                     authorSelected={this.searchByAuthor}
                     authorUrlTemplateBuilder={(author) => this.buildLink(author.name, searchResponse.place, searchResponse.sort)}
                     {...actions}
        />
    }

    searchByAuthor = (author) => {
        let {searchResponse, searchBooksAction} = this.props;
        searchBooksAction({
            searchQuery: author.name,
            placeSlug: searchResponse.place.slug,
            placeText: searchResponse.place.text,
            sortQuery: searchResponse.sort,
            history: true
        }, {track: true})
    }

    buildLink(query, geo, sort, lang) {
        let {routeResolver} = this.props;
        let queryStringArray = [];

        query && queryStringArray.push(`q=${query}`);
        lang && queryStringArray.push(`lang=${lang}`);
        sort && queryStringArray.push(`sort=${sort}`);
        geo && geo.slug && queryStringArray.push(`place=${geo.slug}`);

        let queryString = queryStringArray.length > 0 ? `?${queryStringArray.join('&')}` : '';
        let pathname = `${routeResolver.buildRouteFor('index', {0: 'books'}).pathname}${queryString}`;

        return pathname;
    }

    getCategories(categories) {
        let {searchResponse} = this.props;

        return <Categories categories={categories.items}
                           ancestors={categories.ancestors}
                           query={searchResponse.query}
                           place={searchResponse.place}
                           sort={searchResponse.sort}
                           lang={searchResponse.lang}
                           onSelectedCategoryChanged={this.onSelectedCategoryChanged}/>
    }

    onSelectedSortCriteriaChanged = (sortCriteria) => {
        let {setSearchSortCriteriaActiveAction, filterBooksAction, gtm} = this.props;

        gtm.sendEvent('sortingOn', {sortingType: sortCriteria.key});
        setSearchSortCriteriaActiveAction(sortCriteria);
        filterBooksAction({history: true});
    }

    onSelectedFacetChanged = (facet, facetItem) => {
        let {setSearchFacetValueAction, filterBooksAction} = this.props;
        setSearchFacetValueAction({facet, facetItem});
        filterBooksAction({history: true});
    }

    onSelectedCategoryChanged = (category) => {
        let {setSelectedCategoryAction} = this.props;

        setSelectedCategoryAction(category);
    }

    getSortCriteria(criteria) {
        let {intl} = this.props;

        return <li onClick={() => this.onSelectedSortCriteriaChanged(criteria)} key={criteria.key}
                   className={'selector--item' + (criteria.selected ? ' selector--item-is-selected' : '')}>
            <span className="d-none d-sm-flex">
            {
                intl.formatMessage(messages[criteria.key])
            }
            </span>
            <span className="d-flex d-sm-none">
             {
                 intl.formatMessage(messages[criteria.key + 'Short'])
             }
            </span>
        </li>
    }

    getLangFacet(facet, className) {
        let {intl, gtm} = this.props;
        let title = intl.formatMessage(messages.bookLanguage);

        return <DropDown className={className} type="custom" title={title} key={facet}
                         selectedCount={facet.values.filter(i => i.selected).length}>
            <FacetCheckbox facet={facet} onSelectedFacetChanged={(facet, facetItem) => {
                !facetItem.selected && gtm.sendEvent('languageOn', {languageCode: facetItem.key})
                this.onSelectedFacetChanged(facet, facetItem)
            }}/>
        </DropDown>
    }

    onLoadMoreHandler = () => {
        const {actions, loadMoreAction, searchResponse, gtm} = this.props;
        if (actions.loadMore) {
            gtm.sendEvent('scrolledIndexToPage', {pageNumber: searchResponse.page + 1})
            loadMoreAction(actions.loadMore);
        }
    }

    onHamburgerClickHandler = () => {
        let {showCategories} = this.state;

        DOMUtils.freezeBody('categoriesShown', 'l-md-fixed');
        this.setState({
            showCategories: !showCategories
        })
    }

    onCloseCategories = () => {
        DOMUtils.unfreezeBody('categoriesShown', 'l-md-fixed')
        this.setState({
            showCategories: false
        })
    }

    getSelectedCategoryName() {
        let {categories} = this.props;
        let categoryName = '';
        if (!categories)
            return categoryName;

        let selectedCategory = categories.items.find(c => c.selected);
        if (selectedCategory) {
            categoryName = selectedCategory.name;
        } else if (categories.ancestors.length > 0) {
            categoryName = categories.ancestors[categories.ancestors.length - 1].name;
        }

        return categoryName;
    }

    renderContent() {
        const {books, facets, sortCriterias, actions, booksTotal, categories, intl, contentLoading} = this.props;
        const {showCategories} = this.state;

        let facetLanguages = facets.find(facet => facet.key === 'lang');
        let categoryName = this.getSelectedCategoryName();

        return books.length > 0 ?
            <div className="container">
                <div className="row">
                    <div className="col-12 l-actions">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="align-items-center d-flex">
                                <div className="d-flex d-lg-none mr-4" ref="hamburger">
                                    <Hamburger onClick={this.onHamburgerClickHandler}/>
                                </div>
                                {
                                    facetLanguages &&
                                    <div className="d-none d-md-flex">
                                        {
                                            this.getLangFacet(facetLanguages)
                                        }
                                    </div>
                                }
                            </div>
                            <div className="l-text16 d-none d-lg-flex">
                                <FormattedHTMLMessage {...messages.foundCountBooks}
                                                      values={{
                                                          count: booksTotal
                                                      }}/></div>
                            {
                                sortCriterias.length > 0 && <div>
                                    <ul className="selector">
                                        {
                                            sortCriterias.map((criteria) => {
                                                return this.getSortCriteria(criteria)
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                        </div>
                        {
                            !!categoryName &&
                            <div className="d-block d-md-none mt-3">
                                <div className="breadcrumb">
                                    {categoryName}
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <div className="row">
                    {
                        categories &&
                        <div ref="categories"
                             className={`col-3 l-indexCategories ${showCategories ? 'l-indexCategories-is-visible' : ''}`}>
                            <div className="l-categoriesContent">
                                {
                                    facetLanguages &&
                                    <div className="d-flex d-md-none mb-3">
                                        {
                                            this.getLangFacet(facetLanguages, 'dropdown-block')
                                        }
                                    </div>
                                }
                                {
                                    this.getCategories(categories)
                                }
                            </div>
                            <div className="l-indexCategoriesClose" onClick={this.onCloseCategories}></div>
                            <div className="l-indexCategoriesBg" onClick={this.onCloseCategories}></div>
                        </div>
                    }
                    <div
                        className={`col-lg-9 col-md-12 l-contentLoading ${contentLoading ? 'l-contentLoading-is-visible' : ''}`}>
                        <InfiniteScroll className="row justify-content-center justify-content-md-start"
                                        initialLoad={false}
                                        threshold={1000}
                                        pageStart={0}
                                        loadMore={this.onLoadMoreHandler}
                                        hasMore={!!actions.loadMore}
                                        loader={<div className="loadSpinner" key={0}>
                                            <FormattedMessage {...masterMessages.loading} />
                                        </div>}>

                            {
                                books.map((book, index) => {
                                    return <div key={book._id}
                                                className="col-md-4 col-sm-6 l-book">{this.getBook(book, index)}</div>
                                })

                            }

                        </InfiniteScroll>
                    </div>
                </div>
            </div> :
            <div className="container l-empty-indexSearch">
                <div className="row">
                    <div className="col-12">
                        <Empty className="empty-small" message={intl.formatMessage(messages.emptyPrimary)}
                               secondaryMessage={intl.formatMessage(messages.emptySecondary)}/>
                    </div>
                </div>
            </div>

    }

    render() {
        const {initialized} = this.props;

        return initialized ?
            this.renderContent() :
            <div className="container">
                <div className="row">
                    <div className="col-12 l-pageLoader">
                        <PageLoader/>
                    </div>
                </div>
            </div>
    }
}

const messages = defineMessages({
    emptyPrimary: {
        id: 'index.emptyPrimary',
        defaultMessage: 'It seems that we cannot find such a book'
    },
    emptySecondary: {
        id: 'index.emptySecondary',
        defaultMessage: 'Try to adjust search criteria'
    },
    welcomeDefault: {
        id: 'index.welcomeDefault',
        defaultMessage: 'Swap, buy or sell books',
    },
    welcomePersonalized: {
        id: 'index.welcomePersonalized',
        defaultMessage: 'Hey {user}, what book are you looking for?',
    },
    welcomeByPlace: {
        id: 'index.welcomeByPlace',
        defaultMessage: 'Books to swap or buy {place}'
    },
    welcomeByPlaceIn: {
        id: 'index.welcomeByPlaceIn',
        defaultMessage: 'Books to swap or buy in {place}'
    },
    foundCountBooks: {
        id: 'index.foundCountBooks',
        defaultMessage: 'Found <span class="l-accent">{count, number}</span> {count, plural,' +
        '=0 {books}' +
        'one {book}' +
        'few {books}' +
        'other {books}}',
    },
    bookLanguage: {
        id: 'index.bookLanguage',
        defaultMessage: 'Book language',
    },
    recent: {
        id: 'index.recent',
        defaultMessage: 'Recent',
    },
    recentShort: {
        id: 'index.recentShort',
        defaultMessage: 'Recent',
    },
    relevance: {
        id: 'index.relevance',
        defaultMessage: 'Popular',
    },
    relevanceShort: {
        id: 'index.relevanceShort',
        defaultMessage: 'Popular',
    },
    getBook: {
        id: 'index.getBook',
        defaultMessage: 'Get book',
    },
    subscribe: {
        id: 'index.subscribe',
        defaultMessage: 'Subscribe',
    },
    pageTitle: {
        id: 'index.pageTitle',
        defaultMessage: 'Liberbee - swap, sell or buy books'
    },
    pageMetaDescription: {
        id: 'index.metaDescription',
        defaultMessage: 'Have a lot of read books? Liberbee - will help you to sell books and find new ones for a great prices.'
    },
    pageMetaDescriptionAlt: {
        id: 'index.metaDescriptionAlt',
        defaultMessage: 'Swap or buy books in category {category}'
    }
});

const mapStateToProps = (state, props) => {
    return {
        books: state.index.search.books,
        initialized: state.index.initialized,
        contentLoading: state.index.search.contentLoading,
        facets: state.index.search.facets,
        actions: state.index.search.actions,
        sortCriterias: state.index.search.sortCriterias,
        categories: state.index.search.categories,
        searchResponse: state.index.search.response,
        booksTotal: state.index.search.total,
    }
}

const mapDispatchToProps = {
    searchBooksAction,
    filterBooksAction,
    setSearchFacetValueAction,
    setSearchSortCriteriaActiveAction,
    loadMoreAction,
    addToFavoritesAction,
    removeFromFavoritesAction,
    setSelectedCategoryAction
}

export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndexContentContainer)));