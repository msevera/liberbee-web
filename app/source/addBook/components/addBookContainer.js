/**
 * Created by Mike on 6/5/2017.
 */

'use strict';

import DOMUtils from "../../../../utils/DOMUtils";

(process.env.APP_ENV === 'browser') && require('../../../../resources/styles/addBook.scss');
import React from 'react';
import {connect} from 'react-redux';
import {
    searchBookAction,
    createBookCopyAction,
    createDraftBookAction
} from '../addBookActions';
import PopupFull from '../../shared/popup/components/popupFull';
import PrimarySearch from '../../shared/primarySearch/components/primarySearch';
import quesryString from 'query-string';
import {withComponentExtended} from '../../hoc';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {messages as masterMessages} from '../../master/masterMessages';
import Helmet from 'react-helmet';
import CreateEditBookCopyContainer from '../../shared/createEditBookCopy/components/createEditBookCopyContainer';
import CreateEditBookManuallyContainer from '../../shared/createEditBookManually/components/createEditBookManuallyContainer';
import {showCreateBookCopyPopupAction} from '../../shared/createEditBookCopy/createEditBookCopyActions';
import {showCreateDraftBookPopupAction} from '../../shared/createEditBookManually/createEditBookManuallyActions';
import AddBookContentContainer from './addBookContentContainer';

class AddBookContainer extends React.Component {
    static getQuery(location) {
        let query = '';
        let searchQuery = location.search;
        if (searchQuery) {
            query = quesryString.parse(searchQuery);
        }

        return query.q ? query.q : '';
    }

    constructor(props) {
        super();

        this.state = {
            search: AddBookContainer.getQuery(props.location),
            searchPressed: false,
            showAddBookManually: props.showAddBookManually
        };
    }

    componentDidMount(){
       this.handleFooterVisibility();
    }

    componentDidUpdate(){
        this.handleFooterVisibility();
    }

    handleFooterVisibility(){
        let {books} = this.props;

        let footer = document.getElementsByClassName('l-footer')[0];

        if (books.length > 0)
        {
            DOMUtils.addClass(footer, 'd-none');
        }else{
            DOMUtils.removeClass(footer, 'd-none');
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            showAddBookManually: nextProps.showAddBookManually,
        })
    }

    handleChange = (event) => {
        const {value} = event.target;

        this.setState({
            search: value
        });
    }

    clearSearch = () => {
        let {searchBookAction} = this.props;
        this.setState({
            search: ''
        })
    }

    search = () => {
        let {searchBookAction} = this.props;
        let {search} = this.state;

        this.setState({
            searchPressed: true
        })

        searchBookAction({searchQuery: search, history: true}, true);
    }

    createBookCopy = ({amount, swap, condition, comment, bookId, bookSlug, createEditBookCopyURI}) => {
        let {createBookCopyAction, intl} = this.props;
        createBookCopyAction(intl, createEditBookCopyURI, bookId, amount, swap, condition, comment, bookSlug);
    }

    createBookManually = (data) => {
        let {createDraftBookAction, intl} = this.props;
        createDraftBookAction({
            ...data,
            intl,
            createDraftBookURI: data.createEditDraftBookURI
        });
    }

    onAddBookManuallyShow = (e) => {
        let {showCreateDraftBookPopupAction, actions} = this.props;
        e.preventDefault();

        showCreateDraftBookPopupAction({
            createEditDraftBookURI: actions.createDraftBook
        });
    }

    onFullPopupClose = () => {
        let {history, user, routeResolver} = this.props;
        let urlToPush = routeResolver.buildRouteFor('userBooks', {user: user.slug}).pathname;
        history.push(urlToPush, routeResolver.getReloadState('userBooks', {reload: true}));
    }

    render() {
        const {actions, intl, searchLoadingStatus} = this.props;
        let {search} = this.state;

        return <PopupFull className="popupFull-zAuto popupFull-addBook" onClose={this.onFullPopupClose} show={true}>
            <Helmet>
                <title>
                    {
                        intl.formatMessage(masterMessages.pageTitle, {
                            title: intl.formatMessage(messages.pageTitle)
                        })
                    }
                </title>
            </Helmet>
            <div className="row">
                <div className="col-12">
                    <div
                        className="l-addBookSearch m-auto d-flex flex-column align-items-center justify-content-center">
                        <div className="l-hero mb-4 mb-md-5 l-addBookSearchText">
                            <FormattedMessage {...messages.title}/>
                        </div>
                        {
                            actions.getBooks &&
                            <PrimarySearch searchQuery={search} className="primarySearch-white"
                                           loading={searchLoadingStatus}
                                           onChangeSearchQuery={this.handleChange}
                                           onClearSearchQuery={this.clearSearch}
                                           onSearch={this.search}
                                           renderPlacesAutocomplete={false}
                                           searchPlaceholder={intl.formatMessage(messages.searchPlaceholder)}
                            />
                        }
                        <div className="w-100 mt-2 d-flex align-items-center">
                            <span className="l-textSecondary l-text16 l-sm-text14">{intl.formatMessage(messages.foundNothing)}</span>
                            <button className="btn btn-link btn-sm-small"
                                    onClick={this.onAddBookManuallyShow}>{intl.formatMessage(messages.addManually)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <AddBookContentContainer />

            <div className="row">
                <div className="col-12">
                    <CreateEditBookCopyContainer onConfirmBookCopy={this.createBookCopy}/>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <CreateEditBookManuallyContainer onConfirmBookManually={this.createBookManually} />
                </div>
            </div>
        </PopupFull>
    }
}

const messages = defineMessages({
    pageTitle: {
        id: 'addBook.pageTitle',
        defaultMessage: 'Add book'
    },
    title: {
        id: 'addBook.title',
        defaultMessage: 'Search the book that you want to sell or swap'
    },
    addManually: {
        id: 'addBook.addManually',
        defaultMessage: '+ Add book manually'
    },
    foundNothing: {
        id: 'addBook.foundNothing',
        defaultMessage: 'Found nothing?'
    },
    searchPlaceholder: {
        id: 'addBook.searchPlaceholder',
        defaultMessage: 'Book title or ISBN',
    },
})

const mapStateToProps = (state, props) => {
    return {
        books: state.addBook.search.books,
        actions: state.master.general.actions,
        user: state.master.user,
        searchLoadingStatus: state.addBook.search.searchLoadingStatus,
        showAddBookManually: state.addBook.general.showAddBookManually
    }
}

const mapDispatchToProps = {
    searchBookAction,
    createBookCopyAction,
    showCreateDraftBookPopupAction,
    showCreateBookCopyPopupAction,
    createDraftBookAction
}

const loadData = (props, context) => {
    let searchQuery = AddBookContainer.getQuery(props.location);

    return context.store.dispatch(searchBookAction({searchQuery}));
}

export default withComponentExtended('addBook', [], loadData)(injectIntl(connect(mapStateToProps, mapDispatchToProps)(AddBookContainer)));
