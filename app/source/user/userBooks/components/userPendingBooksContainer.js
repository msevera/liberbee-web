/**
 * Created by Mike on 9/26/2017.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import {removePendingBookAction, editDraftBookAction} from '../../userActions';
import halson from 'halson';
import Book from '../../../shared/book/components/book';
import {injectIntl, defineMessages} from 'react-intl';
import {withComponentExtended} from '../../../hoc';
import Empty from '../../../shared/empty/components/empty';
import {resetModelToInitial} from '../../../shared/validation/actions';
import {showEditDraftBookPopupAction} from '../../../shared/createEditBookManually/createEditBookManuallyActions';
import CreateEditBookManuallyContainer from '../../../shared/createEditBookManually/components/createEditBookManuallyContainer';
import commonUtils from '../../../../../utils/commonUtils';

class UserPendingBooksContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    getDraftBook(draftBook) {
        let {removePendingBookAction, intl, routeResolver, showEditDraftBookPopupAction} = this.props;
        let {store} = this.context;

        let draftBookHal = halson(draftBook);
        let revisionHal = draftBookHal.getEmbed('revisions');
        let removeDraftBookURI = draftBookHal.getLink('removeDraftBook');
        let indexPath = routeResolver.buildRouteFor('index', {0: 'books', place: 'all'}).pathname;
        let saveDraftURI = revisionHal.getLink('saveDraftRevision')

        let actions = {};

        let isbn = '';
        if (revisionHal.data.isbn10 && revisionHal.data.isbn10.length > 0) {
            isbn = revisionHal.data.isbn10.join(', ');
        }

        if (revisionHal.data.isbn13 && revisionHal.data.isbn13.length > 0) {
            if (isbn)
            {
                isbn += ', ';
            }
            isbn += revisionHal.data.isbn13.join(', ');
        }

        if (saveDraftURI) {
            actions = {
                customAction: () => {
                    store.dispatch(resetModelToInitial({
                        model: 'master.createEditBookManually.createEditBookManuallyModel',
                        initialData: {
                            title: revisionHal.data.title,
                            authors: revisionHal.data.authors ? revisionHal.data.authors.map(a => a.name).join(', ') : '',
                            publishers: revisionHal.data.publishers ? revisionHal.data.publishers.map(a => a.name).join(', ') : '',
                            publishDate: revisionHal.data.publishDate ? new Date(revisionHal.data.publishDate).getFullYear().toString() : '',
                            isbn,
                            amount: draftBookHal.createCopy.deal.amount,
                            swap: draftBookHal.createCopy.deal.swap,
                            condition: draftBookHal.createCopy.condition,
                            comment: draftBookHal.createCopy.comment,
                        }
                    }));
                    showEditDraftBookPopupAction({
                        cover: revisionHal.data.cover ? revisionHal.data.cover.resource : null,
                        createEditDraftBookURI: saveDraftURI
                    });
                },
                customActionText: intl.formatMessage(messages.edit)
            }
        }

        return <Book id={revisionHal._id}
                     title={revisionHal.data.title}
                     className="book-pending"
                     authors={revisionHal.data.authors.map((a, index) => {
                        return {
                            ...a,
                            _id: index
                        }
                     })}
                     publishers={revisionHal.data.publishers.map((p, index) => {
                         return {
                             ...p,
                             _id: index
                         }
                     })}
                     condition={draftBookHal.createCopy.condition}
                     comment={draftBookHal.createCopy.comment}
                     cover={revisionHal.data.cover}
                     deal={draftBookHal.createCopy.deal}
                     currencyCode={draftBookHal.createCopy.user.geo.currencyCode}
                     authorClickPushState={true}
                     showFavorite={false}
                     publishDate={revisionHal.data.publishDate}
                     isbn10={revisionHal.data.isbn10}
                     isbn13={revisionHal.data.isbn13}
                     rating={false}
                     gotoBookAction={true}
                     gotoBookText={intl.formatMessage(messages.edit)}
                     removeAction={() => {
                         removePendingBookAction(intl, removeDraftBookURI);
                     }}
                     {...actions}
                     authorUrlTemplateBuilder={(author) => `${indexPath}?q=${author.name}`}
        />
    }

    editBookManually = (data) => {
        let {editDraftBookAction, intl} = this.props;
        editDraftBookAction({
            ...data,
            intl,
            editDraftBookURI: data.createEditDraftBookURI
        });
    }

    render() {
        let {draftBooks, intl} = this.props;

        return <div className={`row justify-content-center justify-content-md-start ${draftBooks.length > 0 ? 'l-books' : 'l-empty-pendingBooks'}`}>
            <CreateEditBookManuallyContainer onConfirmBookManually={this.editBookManually}/>
            {
                draftBooks.length > 0 ?
                    draftBooks.map((draftBook) => {
                        return <div key={draftBook._id} className="col-md-6 col-lg-4 col-xl-3 l-book">{this.getDraftBook(draftBook)}</div>
                    }) :
                    <Empty className="empty-small" message={intl.formatMessage(messages.emptyPrimary)}
                           secondaryMessage={intl.formatMessage(messages.emptySecondary)}/>
            }
        </div>
    }
}

const messages = defineMessages({
    emptyPrimary: {
        id: 'userPendingBooks.emptyPrimary',
        defaultMessage: 'You do not have books on moderation'
    },
    emptySecondary: {
        id: 'userPendingBooks.emptySecondary',
        defaultMessage: 'The books that you add manually will appear here'
    },
    edit: {
        id: 'userPendingBooks.edit',
        defaultMessage: 'Edit'
    }
})

const mapStateToProps = (state, props) => {
    return {
        draftBooks: state.userData.books.draftBooks,
        actions: state.userData.general.actions,
        user: state.userData.user
    }
}

const mapDispatchToProps = {
    removePendingBookAction,
    editDraftBookAction,
    showEditDraftBookPopupAction
}

export default withComponentExtended('userPendingBooks')(injectIntl(connect(mapStateToProps, mapDispatchToProps)(UserPendingBooksContainer)));