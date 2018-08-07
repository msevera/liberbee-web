/**
 * Created by Mike on 9/19/2017.
 */

import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux'
import {
    loadDraftBooksAction,
    removeBookDraftAction,
    setDraftBooksFacetValueAction,
    setDraftBooksInitializedAction
} from '../../draftBooks/draftBooksActions';
import halson from 'halson';
import FacetCheckbox from '../../../shared/facets/components/facetCheckbox';
import queryString from 'query-string';
import Pagination from '../../../shared/pagination/components/pagination';
import PaginationSummary from '../../../shared/pagination/components/paginationSummary';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {withComponentExtended} from '../../../hoc';
import {messages as masterMessages} from '../../../master/masterMessages';
import Helmet from 'react-helmet';
import Empty from '../../../shared/empty/components/empty';
import PageLoader from "../../../shared/empty/components/pageLoader";

class DraftBooksContainer extends React.Component {
    static getResolved(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.resolved ? query.resolved : '';
    }

    static getPage(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = queryString.parse(searchQuery);
        }

        return query.page ? query.page : '';
    }

    constructor(props) {
        super();

        let page = DraftBooksContainer.getPage(props.location);
        this.state = {
            page: page != '' ? page : 1
        }
    }

    componentWillUnmount() {
        let {setDraftBooksInitializedAction} = this.props;
        setDraftBooksInitializedAction(false);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            page: nextProps.page
        })
    }

    _cutMax(value) {
        let max = 40;

        if (value.length > max) {
            value = value.substr(0, max) + '...';
        }

        return value;
    }

    getDraftBookRow(draftBook, idx) {
        let {removeBookDraftAction, intl, routeResolver} = this.props;
        let draftBookHal = halson(draftBook);
        let revisionHal = draftBookHal.getEmbed('revisions');

        let removeDraftBookURL = draftBookHal.getLink('removeDraftBook');
        let draftBookURL = routeResolver.buildRouteFor('draftBook', {draftBook: draftBookHal._id});

        return <tr key={draftBookHal._id} className={idx % 2 == 0 ? 'table--row-is-odd' : ''}>
            <td><Link to={draftBookURL}>{intl.formatMessage(messages.view)}</Link></td>
            <td title={revisionHal.data.title}>{this._cutMax(revisionHal.data.title)}</td>
            <td>
                {
                    draftBookHal.assignee &&
                    <Link
                        to={routeResolver.buildRouteFor('userBooks', {user: draftBookHal.assignee.slug}, {redirect: true})}>{draftBookHal.assignee.name}</Link>
                }
            </td>
            <td><Link
                to={routeResolver.buildRouteFor('userBooks', {user: draftBookHal.createdBy.slug}, {redirect: true})}>{draftBookHal.createdBy.name}</Link>
            </td>
            <td className="table--right">
                <div>{intl.formatDate(draftBookHal.created, {format: 'dateShort'})}</div>
            </td>
            <td>{draftBookHal.createCopy ?
                <span className="l-accent l-bold">{intl.formatMessage(messages.notResolved)}</span> :
                <span className="l-success l-bold">{intl.formatMessage(messages.resolved)}</span>}</td>
            <td>
                <button className="btn btn-link btn-linkSecondary" onClick={() => {
                    removeBookDraftAction(intl, removeDraftBookURL);
                }}>
                    {intl.formatMessage(masterMessages.remove)}
                </button>
            </td>

        </tr>
    }

    buildFacets() {
        let {facets} = this.props;

        return facets.map((facet) => {
            switch (facet.key) {
                case 'resolved': {
                    return this.buildResolvedFacets(facet);
                }
            }
        })
    }

    onSelectedFacetChanged = (facet, facetItem) => {
        let {setDraftBooksFacetValueAction, loadDraftBooksAction} = this.props;
        setDraftBooksFacetValueAction({facet, facetItem});
        loadDraftBooksAction({history: true})
    }

    buildResolvedFacets(facet) {
        let {intl} = this.props;

        return <FacetCheckbox className="facet-h" facet={facet} key={facet.key}
                              mapKeysToTitles={[{'key': 1, title: intl.formatMessage(messages.notResolved)}, {
                                  key: 0,
                                  title: intl.formatMessage(messages.resolved)
                              }]}
                              onSelectedFacetChanged={this.onSelectedFacetChanged}/>
    }

    onSelectedPageChanged = (page) => {
        let {loadDraftBooksAction} = this.props;
        this.setState({
            page
        });

        loadDraftBooksAction({page, history: true})
    }

    render() {
        let {books, facets, total, from, size, intl, initialized} = this.props;
        let {page} = this.state;
        let pagesCount = Math.ceil(total / size);

        let renderEmptyState = (!facets || !facets.length) && (!books || !books.length)


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
            {
                facets && facets.length > 0 &&
                <div className="row">
                    <div className="col-12 l-actions mb-5 d-flex justify-content-between align-items-center">
                        {
                            this.buildFacets()
                        }
                        {
                            pagesCount > 1 &&
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="mr-3">
                                    <PaginationSummary total={total} from={from + 1} size={size}/>
                                </div>
                                <Pagination total={total} itemPerPage={size} currentPage={page} pagesCount={pagesCount}
                                            adjacent={1} selectPage={this.onSelectedPageChanged}/>
                            </div>
                        }
                    </div>
                </div>
            }
            {
                books.length > 0 &&
                <div className={'row' + ((!facets || facets.length == 0) ? ' l-books' : '')}>
                    <div className="col-12 mb-5">
                        <table className="table">
                            <thead>
                            <tr>
                                <th></th>
                                <th>{intl.formatMessage(messages.title)}</th>
                                <th>{intl.formatMessage(messages.assignee)}</th>
                                <th>{intl.formatMessage(messages.draftBy)}</th>
                                <th className="table--right">{intl.formatMessage(messages.created)}</th>
                                <th>{intl.formatMessage(messages.status)}</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                books.map((book, idx) => {
                                    return this.getDraftBookRow(book, idx)
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            }
            {
                renderEmptyState &&
                <div className="row l-empty-draftBooks">
                    <div className="col-12">
                        <Empty className="empty-small" message={intl.formatMessage(messages.emptyPrimary)} />
                    </div>
                </div>
            }
        </div>
    }
}

const messages = defineMessages({
    emptyPrimary: {
        id: 'draftBooks.emptyPrimary',
        defaultMessage: 'No draft books fo review yet'
    },
    pageTitle: {
        id: 'draftBooks.pageTitle',
        defaultMessage: 'Drafts for review'
    },
    resolved: {
        id: 'draftBooks.resolved',
        defaultMessage: 'Resolved'
    },
    notResolved: {
        id: 'draftBooks.notResolved',
        defaultMessage: 'Not resolved'
    },
    yes: {
        id: 'draftBooks.yes',
        defaultMessage: 'Yes'
    },
    title: {
        id: 'draftBooks.title',
        defaultMessage: 'Title'
    },
    authors: {
        id: 'draftBooks.authors',
        defaultMessage: 'Authors'
    },
    publisher: {
        id: 'draftBooks.publisher',
        defaultMessage: 'Publisher'
    },
    year: {
        id: 'draftBooks.year',
        defaultMessage: 'Year'
    },
    assignee: {
        id: 'draftBooks.assignee',
        defaultMessage: 'Reviewer'
    },
    draftBy: {
        id: 'draftBooks.draftBy',
        defaultMessage: 'Draft by'
    },
    needCopy: {
        id: 'draftBooks.needCopy',
        defaultMessage: 'Need copy'
    },
    created: {
        id: 'draftBooks.created',
        defaultMessage: 'Created'
    },
    status: {
        id: 'draftBooks.status',
        defaultMessage: 'Status'
    },
    view: {
        id: 'draftBooks.view',
        defaultMessage: 'View'
    }
})

const mapStateToProps = (state, props) => {
    return {
        books: state.userData.draftBooks.books,
        initialized: state.userData.draftBooks.initialized,
        facets: state.userData.draftBooks.facets,
        actions: state.userData.general.actions,
        from: state.userData.draftBooks.from,
        size: state.userData.draftBooks.size,
        total: state.userData.draftBooks.total,
        page: state.userData.draftBooks.page
    }
}

const mapDispatchToProps = {
    loadDraftBooksAction,
    removeBookDraftAction,
    setDraftBooksFacetValueAction,
    setDraftBooksInitializedAction
}

const loadData = (props, context) => {
    let resolved = DraftBooksContainer.getResolved(props.location);
    let page = DraftBooksContainer.getPage(props.location);
    let facetsParams = {resolved};

    return context.store.dispatch(loadDraftBooksAction({facetsParams, page}));
}

export default withComponentExtended('pending', [], loadData)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(DraftBooksContainer)));