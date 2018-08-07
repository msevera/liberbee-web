/**
 * Created by Mike on 9/27/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import PrimarySearch from '../../../shared/primarySearch/components/primarySearch';
import {searchBookAction} from '../../draftBookActions';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';
import {messages as formMessages} from '../../../shared/form/messages';
import {withTools} from '../../../hoc';
import AssociateBookContentContainer from './associateBookContentContainer';

class AssociateBookContainer extends React.Component {
    constructor(props) {
        super();

        this.state = {
            search: ''
        };
    }

    search = () => {
        let {searchBookAction} = this.props;
        let {search} = this.state;

        this.setState({
            searchPressed: true
        })

        searchBookAction({searchQuery: search, history: true});
    }

    handleChange = (event) => {
        const {value} = event.target;

        this.setState({
            search: value
        });
    }

    clearSearch = () => {
        this.setState({
            search: ''
        })
    }

    buildRevision() {
        let {draftBookModel, intl} = this.props;

        return <div className="l-fixed l-associateSide">
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(formMessages.isbn10)}:</div>
                <div className="infoItem--value">{draftBookModel.isbn10}</div>
            </div>
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(formMessages.isbn13)}:</div>
                <div className="infoItem--value">{draftBookModel.isbn13}</div>
            </div>
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(formMessages.bookTitle)}:</div>
                <div className="infoItem--value">{draftBookModel.title}</div>
            </div>
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(formMessages.author)}:</div>
                <div className="infoItem--value">{draftBookModel.authors.map(a => a.name).join(', ')}</div>
            </div>
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(messages.publisher)}:</div>
                <div className="infoItem--value">{draftBookModel.publishers.map(a => a.name).join(', ')}</div>
            </div>
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(messages.publishDate)}:</div>
                <div className="infoItem--value">{draftBookModel.publishDate}</div>
            </div>
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(messages.language)}:</div>
                <div className="infoItem--value">{draftBookModel.languages}</div>
            </div>
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(formMessages.numberOfPages)}:</div>
                <div className="infoItem--value">{draftBookModel.pages}</div>
            </div>
            <div className="infoItem">
                <div className="infoItem--label">{intl.formatMessage(formMessages.bookFormat)}:</div>
                <div className="infoItem--value">{draftBookModel.bindings}</div>
            </div>
        </div>
    }

    render() {
        let {actions, intl, loading, onAssociateBookCliked} = this.props;
        let {search} = this.state;

        return <div>
            <div className="row">
                <div className="col-12">
                    <div
                        className="l-addBookSearch m-auto d-flex flex-column align-items-center justify-content-center">
                        <div className="l-hero mb-5">{intl.formatMessage(messages.title)}</div>
                        {
                            actions.getBooks &&
                            <PrimarySearch searchQuery={search}
                                           loading={loading}
                                           onChangeSearchQuery={this.handleChange}
                                           onClearSearchQuery={this.clearSearch}
                                           onSearch={this.search}
                                           renderPlacesAutocomplete={false}
                            />
                        }
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-3">
                    {
                        this.buildRevision()
                    }
                </div>
                <div className="col-9">
                    <AssociateBookContentContainer onAssociateBookCliked={onAssociateBookCliked}/>
                </div>
            </div>
        </div>
    }
}

let messages = defineMessages({
    title: {
        id: 'associateBook.title',
        defaultMessage: 'Find book to associate with'
    },
    publisher: {
        id: 'associateBook.publisher',
        defaultMessage: 'Publisher'
    },
    publishDate: {
        id: 'associateBook.publishDate',
        defaultMessage: 'Publish date'
    },
    language: {
        id: 'associateBook.language',
        defaultMessage: 'Language'
    }
})

const mapStateToProps = (state, props) => {
    return {
        actions: state.master.general.actions,
        loading: state.draftBook.associates.loading,
        draftBookModel: state.draftBook.bookModel
    }
}

const mapDispatchToProps = {
    searchBookAction
}


export default withTools(injectIntl(connect(mapStateToProps, mapDispatchToProps)(AssociateBookContainer)));