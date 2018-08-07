'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import {messages as masterMessages} from '../../../master/masterMessages';
import Autocomplete from '../../../shared/autocomplete/components/autocomplete';
import {
    draftAuthorsAutocompleteAction,
    searchAuthorAction,
    createAuthorAction,
    editAuthorAction,
    removeAuthorAction,
    removeAuthorFromRevisionAction,
    addAuthorToRevisionAction,
    authorSelectorShowPopupAction
} from "../authorsSelectorActions";
import CreateEditAuthorContainer from '../../../shared/createEditAuthor/components/createEditAuthorContainer';
import LoadButton from '../../../shared/button/components/loadButton';


class AuthorsSelectorContainer extends React.Component {
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
            lines: props.authors ? props.authors : [],
            editIdx: -1
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            lines: nextProps.authors
        })
    }

    onInputBlurHandler = (value, index) => {
        let {searchAuthorAction, revisionId} = this.props;
        searchAuthorAction({name: value, index, revisionId});
    }

    onInputChangeHandler = (value, index) => {
        let {draftAuthorsAutocompleteAction, revisionId} = this.props;
        let {lines} = this.state;

        let line = {...lines[index]};
        line.name = value;
        let newLines = [...lines];
        newLines[index] = line;

        this.setState({
            lines: newLines
        })

        draftAuthorsAutocompleteAction({name: value, index, revisionId});
    }

    onSelectedValueChangedHandler = (data, text, meta, index) => {
        let {searchAuthorAction, revisionId} = this.props;

        let {lines} = this.state;

        let line = {...lines[index]};
        line.name = text;
        let newLines = [...lines];
        newLines[index] = line;

        this.setState({
            lines: newLines
        })

        if (text) {
            searchAuthorAction({name: text, index, revisionId});
        }
    }

    onRemoveAuthor = (e, index) => {
        let {removeAuthorFromRevisionAction, revisionId} = this.props;
        e.preventDefault();

        let {lines} = this.state;
        let newLines = lines.filter((l, idx) => idx != index);
        this.setState({
            lines: newLines
        })

        removeAuthorFromRevisionAction({index, revisionId});
    }

    buildSuggestionsSource(authorsSuggestionsRes) {
        return authorsSuggestionsRes.map((suggest) => {
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
        let {intl, disabled, authorsAutocomplete} = this.props;

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
                        suggestions={this.buildSuggestionsSource(authorsAutocomplete.suggestions)}
                        highlight={data}
                        placeholder={intl.formatMessage(messages.authorPlaceholder)}
                        onSelectedValueChanged={(data, text, meta) => this.onSelectedValueChangedHandler(data, text, meta, index)}/>
            }
            {
                data.name && data.found != null &&
                <span
                    title={data.found ? intl.formatMessage(messages.authorFound) : intl.formatMessage(messages.authorNotFound)}
                    className={`entitySelector--itemValueNotification ${foundCssClass}`}></span>
            }
        </div>
    }

    buildBlock(line, index) {
        let {intl, disabled} = this.props;
        return <div className="entitySelector--item" key={index}>
            <div className="entitySelector--itemContent">
                <div className="entitySelector--itemHeading">
                    <div>{`${intl.formatMessage(messages.author)} #${index + 1}`}</div>
                    {
                        !disabled &&
                        <button className="btn btn-small btn-link btn-noPaddings"
                                onClick={(e) => this.onRemoveAuthor(e, index)}>{intl.formatMessage(masterMessages.remove)}</button>
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
                                onClick={(e) => this.onShowAuthorPopupEdit(e, index)}>{intl.formatMessage(masterMessages.edit)}</LoadButton>
                    }
                    {
                        line.found != null && !line.found &&
                        <button className="btn btn-block btn-small btn-secondary"
                                onClick={(e) => this.onShowAuthorPopupCreate(e, index)}>{intl.formatMessage(masterMessages.create)}</button>
                    }
                </div>
            }

        </div>
    }

    onAddAuthorHandler = (e) => {
        let {addAuthorToRevisionAction, revisionId} = this.props;
        e.preventDefault();

        let {lines} = this.state;
        let newLines = [...lines];
        newLines.push({...this.emptyLine});

        this.setState({
            lines: newLines
        })

        addAuthorToRevisionAction({name: '', index: newLines.length, revisionId})
    }

    onShowAuthorPopupEdit = (e, index) => {
        e.preventDefault();
        let {authorSelectorShowPopupAction, revisionId} = this.props;
        let {lines} = this.state;

        let author = lines[index];
        authorSelectorShowPopupAction({name: author.name, index, revisionId})

        this.setState({
            editIdx: index
        })
    }

    onShowAuthorPopupCreate = (e, index) => {
        e.preventDefault();
        let {authorSelectorShowPopupAction, revisionId} = this.props;
        authorSelectorShowPopupAction({name: '', index, revisionId});

        this.setState({
            editIdx: index
        })
    }

    onCreateAuthorHandler = (data) => {
        let {createAuthorAction, intl, revisionId} = this.props;
        let {lines, editIdx} = this.state;

        createAuthorAction({
            createAuthorURI: data.createEditAuthorURI,
            intl,
            ...data,
            index: editIdx,
            revisionId
        });
    }

    onEditAuthorHandler = (data) => {
        let {editAuthorAction, intl, revisionId} = this.props;
        let {editIdx} = this.state;
        editAuthorAction({
            editAuthorURI: data.createEditAuthorURI,
            intl,
            ...data,
            index: editIdx,
            revisionId
        });
    }

    onRemoveAuthorHandler = (data) => {
        let {removeAuthorAction, intl, revisionId} = this.props;
        let {editIdx} = this.state;

        removeAuthorAction({
            removeAuthorURI: data.removeAuthorURI,
            intl,
            index: editIdx,
            revisionId
        });
    }

    render() {
        let {lines} = this.state;
        let {intl, disabled} = this.props;

        return <div className={`entitySelector ${disabled ? 'entitySelector-is-disabled' : ''}`}>
            <CreateEditAuthorContainer onCreateAuthor={this.onCreateAuthorHandler}
                                       onEditAuthor={this.onEditAuthorHandler}
                                       onRemoveAuthor={this.onRemoveAuthorHandler}/>
            {
                !disabled &&
                <div className="entitySelector--actions">
                    <button className="btn btn-small btn-secondary"
                            onClick={this.onAddAuthorHandler}>{intl.formatMessage(messages.addAuthor)}
                    </button>
                </div>
            }
            {
                disabled && lines.length == 0 &&
                <span className="entitySelector--empty">{intl.formatMessage(messages.noAuthors)}</span>
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
    addAuthor: {
        id: 'authorsSelector.addAuthor',
        defaultMessage: 'Add author'
    },
    author: {
        id: 'authorsSelector.author',
        defaultMessage: 'Author'
    },
    authorPlaceholder: {
        id: 'authorsSelector.authorPlaceholder',
        defaultMessage: 'Enter author name here'
    },
    noAuthors: {
        id: 'authorsSelector.noAuthors',
        defaultMessage: 'No authors is assigned to book'
    },
    authorFound: {
        id: 'authorsSelector.authorFound',
        defaultMessage: 'This author exists in the system'
    },
    authorNotFound: {
        id: 'authorsSelector.authorNotFound',
        defaultMessage: 'There is no such author in the system'
    }
});

const mapStateToProps = (state, props) => {
    return {
        authors: props.authors,
        revisionId: props.revisionId,
        authorsAutocomplete: state.draftBook.draft.authorsAutocomplete,
    }
}

const mapDispatchToProps = {
    draftAuthorsAutocompleteAction,
    searchAuthorAction,
    createAuthorAction,
    editAuthorAction,
    removeAuthorAction,
    removeAuthorFromRevisionAction,
    addAuthorToRevisionAction,
    authorSelectorShowPopupAction
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(AuthorsSelectorContainer));