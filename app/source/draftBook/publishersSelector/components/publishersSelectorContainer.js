'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';
import Autocomplete from '../../../shared/autocomplete/components/autocomplete';
import {
    draftPublishersAutocompleteAction,
    searchPublisherAction,
    createPublisherAction,
    editPublisherAction,
    removePublisherAction,
    removePublisherFromRevisionAction, addPublisherToRevisionAction,
    publisherSelectorShowPopupAction
} from "../publishersSelectorActions";
import {setFormItem, submitForm} from "../../../shared/validation/actions";
import CreateEditPublisherContainer from '../../../shared/createEditPublisher/components/createEditPublisherContainer';
import LoadButton from '../../../shared/button/components/loadButton';

class PublishersSelectorContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor(props) {
        super();

        this.emptyLine = {
            name: '',
            found: null
        }

        this.state = {
            lines: props.publishers ? props.publishers : [],
            editIdx: -1
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            lines: nextProps.publishers
        })
    }

    onInputBlurHandler = (value, index) => {
        let {searchPublisherAction, revisionId} = this.props;
        let {lines} = this.state;
        let {store} = this.context;

        store.dispatch(setFormItem({
            model: 'draftBook.bookModel',
            prop: 'publishers',
            value: lines.filter(i => !!i.name),
            validators: {}
        }));

        searchPublisherAction({name: value, index, revisionId});
    }

    onInputChangeHandler = (value, index) => {
        let {draftPublishersAutocompleteAction, revisionId} = this.props;
        let {lines} = this.state;

        let line = {...lines[index]};
        line.name = value;
        let newLines = [...lines];
        newLines[index] = line;

        this.setState({
            lines: newLines
        })

        draftPublishersAutocompleteAction({name: value, index, revisionId});
    }

    onSelectedValueChangedHandler = (data, text, meta, index) => {
        let {searchPublisherAction, revisionId} = this.props;

        let {lines} = this.state;

        let line = {...lines[index]};
        line.name = text;
        let newLines = [...lines];
        newLines[index] = line;

        this.setState({
            lines: newLines
        })

        if (text) {
            searchPublisherAction({name: text, index, revisionId});
        }
    }

    onRemovePublisher = (e, index) => {
        e.preventDefault();

        let {removePublisherFromRevisionAction, revisionId} = this.props;
        let {store} = this.context;
        let {lines} = this.state;

        let newLines = lines.filter((l, idx) => idx != index);
        this.setState({
            lines: newLines
        })

        store.dispatch(setFormItem({
            model: 'draftBook.bookModel',
            prop: 'publishers',
            value: newLines.filter(i => !!i.name),
            validators: {}
        }));

        removePublisherFromRevisionAction({index, revisionId});
    }

    buildSuggestionsSource(publishersSuggestionsRes) {
        return publishersSuggestionsRes.map((suggest) => {
            let primaryText = suggest.highlight;

            return {
                data: suggest,
                title: suggest.text,
                text: (<span>
                    <span className="autocomplete--primary" dangerouslySetInnerHTML={{__html: primaryText}}></span>
                </span>)
            }
        })
    }

    buildFormGroup(data, index) {
        let {intl, disabled, publishersAutocomplete} = this.props;

        let foundCssClass = '';
        if (data.name && data.found != null) {
            foundCssClass = data.found ? 'entitySelector--itemValueNotificationSuccess' : 'entitySelector--itemValueNotificationError';
        }

        return <div className={`entitySelector--itemValue`} key={index}>
            {
                disabled ?
                    <span>{data.name}</span> :
                    <Autocomplete
                        tab={false}
                        disabled={disabled}
                        className="autocomplete-full"
                        inputClassName="txt txt-noBorder txt-small"
                        value={data.name}
                        onInputBlur={(value) => this.onInputBlurHandler(value, index)}
                        onInputChange={(value) => this.onInputChangeHandler(value, index)}
                        suggestions={this.buildSuggestionsSource(publishersAutocomplete.suggestions)}
                        highlight={data}
                        placeholder={intl.formatMessage(messages.publisherPlaceholder)}
                        onSelectedValueChanged={(data, text, meta) => this.onSelectedValueChangedHandler(data, text, meta, index)}/>
            }
            {
                data.name && data.found != null &&
                <span
                    title={data.found ? intl.formatMessage(messages.publisherFound) : intl.formatMessage(messages.publisherNotFound)}
                    className={`entitySelector--itemValueNotification ${foundCssClass}`}></span>
            }
        </div>
    }

    buildBlock(line, index) {
        let {intl, disabled} = this.props;
        return <div className="entitySelector--item" key={index}>
            <div className="entitySelector--itemContent">
                <div className="entitySelector--itemHeading">
                    <div>{`${intl.formatMessage(messages.publisher)} #${index + 1}`}</div>
                    {
                        !disabled &&
                        <button className="btn btn-small btn-link btn-noPaddings"
                                onClick={(e) => this.onRemovePublisher(e, index)}>{intl.formatMessage(masterMessages.remove)}</button>
                    }
                </div>
                {
                    this.buildFormGroup(line, index)
                }
            </div>
            {
                !disabled && line.name && line.found != null &&
                <div className="entitySelector--itemActions">
                    {
                        line.found != null && line.found &&
                        <LoadButton className="btn btn-block btn-small btn-secondary"
                                    loading={line.loading}
                                onClick={(e) => this.onShowPublisherPopupEdit(e, index)}>{intl.formatMessage(masterMessages.edit)}</LoadButton>
                    }
                    {
                        line.found != null && !line.found &&
                        <button className="btn btn-block btn-small btn-secondary"
                                onClick={(e) => this.onShowPublisherPopupCreate(e, index)}>{intl.formatMessage(masterMessages.create)}</button>
                    }
                </div>
            }

        </div>
    }

    onAddPublisherHandler = (e) => {
        e.preventDefault();

        let {addPublisherToRevisionAction, revisionId} = this.props;
        let {lines} = this.state;
        let {store} = this.context;

        let newLines = [...lines];
        newLines.push({...this.emptyLine});

        this.setState({
            lines: newLines
        })

        addPublisherToRevisionAction({name: '', index: newLines.length, revisionId})

        store.dispatch(setFormItem({
            model: 'draftBook.bookModel',
            prop: 'publishers',
            value: newLines.filter(i => !!i.name),
            validators: {}
        }));


    }

    onShowPublisherPopupEdit = (e, index) => {
        e.preventDefault();
        let {publisherSelectorShowPopupAction, revisionId} = this.props;
        let {lines} = this.state;

        let publisher = lines[index];
        publisherSelectorShowPopupAction({name: publisher.name, index, revisionId})

        this.setState({
            editIdx: index
        })
    }

    onShowPublisherPopupCreate = (e, index) => {
        e.preventDefault();
        let {publisherSelectorShowPopupAction, revisionId} = this.props;
        publisherSelectorShowPopupAction({name: '', index, revisionId});

        this.setState({
            editIdx: index
        })
    }

    onCreatePublisherHandler = (data) => {
        let {createPublisherAction, intl, revisionId} = this.props;
        let {lines, editIdx} = this.state;

        createPublisherAction({
            createPublisherURI: data.createEditPublisherURI,
            intl,
            ...data,
            index: editIdx,
            revisionId
        });
    }

    onEditPublisherHandler = (data) => {
        let {editPublisherAction, intl, revisionId} = this.props;
        let {editIdx} = this.state;
        editPublisherAction({
            editPublisherURI: data.createEditPublisherURI,
            intl,
            ...data,
            index: editIdx,
            revisionId
        });
    }

    onRemovePublisherHandler = (data) => {
        let {removePublisherAction, intl, revisionId} = this.props;
        let {editIdx} = this.state;

        removePublisherAction({
            removePublisherURI: data.removePublisherURI,
            intl,
            index: editIdx,
            revisionId
        });
    }

    render() {
        let {lines} = this.state;
        let {intl, disabled} = this.props;

        return <div className={`entitySelector ${disabled ? 'entitySelector-is-disabled' : ''}`}>
            <CreateEditPublisherContainer onCreatePublisher={this.onCreatePublisherHandler}
                                          onEditPublisher={this.onEditPublisherHandler}
                                          onRemovePublisher={this.onRemovePublisherHandler}/>
            {
                !disabled &&
                <div className="entitySelector--actions">
                    <button className="btn btn-small btn-secondary"
                            onClick={this.onAddPublisherHandler}>{intl.formatMessage(messages.addPublisher)}
                    </button>
                </div>
            }
            {
                disabled && lines.length == 0 &&
                <span className="entitySelector--empty">{intl.formatMessage(messages.noPublishers)}</span>
            }
            <div className="entitySelector--content">
                {
                    lines.map((line, index) => {
                        return this.buildBlock(line, index);
                    })
                }
            </div>
        </div>
    }
}

const messages = defineMessages({
    addPublisher: {
        id: 'publishersSelector.addPublisher',
        defaultMessage: 'Add publisher'
    },
    publisher: {
        id: 'publishersSelector.publisher',
        defaultMessage: 'Publisher'
    },
    publisherPlaceholder: {
        id: 'publishersSelector.publisherPlaceholder',
        defaultMessage: 'Enter publisher name here'
    },
    noPublishers: {
        id: 'publishersSelector.noPublishers',
        defaultMessage: 'No publishers is assigned to book'
    },
    publisherFound: {
        id: 'publishersSelector.publisherFound',
        defaultMessage: 'This publisher exists in the system'
    },
    publisherNotFound: {
        id: 'publishersSelector.publisherNotFound',
        defaultMessage: 'There is no such publisher in the system'
    }
});

const mapStateToProps = (state, props) => {
    return {
        publishers: props.publishers,
        revisionId: props.revisionId,
        publishersAutocomplete: state.draftBook.draft.publishersAutocomplete,
    }
}

const mapDispatchToProps = {
    draftPublishersAutocompleteAction,
    searchPublisherAction,
    createPublisherAction,
    editPublisherAction,
    removePublisherAction,
    removePublisherFromRevisionAction,
    addPublisherToRevisionAction,
    publisherSelectorShowPopupAction
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(PublishersSelectorContainer));