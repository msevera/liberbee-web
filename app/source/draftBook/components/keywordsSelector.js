'use strict';

import React from 'react';
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import {messages as masterMessages} from '../../master/masterMessages';

class KeywordsSelector extends React.Component {
    constructor(props) {
        super();

        this.emptyLine = {
            en: '',
            uk: '',
            ru: ''
        }

        this.state = {
            lines: this._completeEmptyProps(props.keywords)
        }
    }

    _completeEmptyProps(keywords) {
        let emptyLineKeys = Object.keys(this.emptyLine);
        return keywords.map((keyword) => {
            let resultKeyword = emptyLineKeys.reduce((result, item, index) => {
                let keywordValue = keyword[item];
                if (keywordValue) {
                    result[item] = keywordValue;
                } else {
                    result[item] = ''
                }

                return result;
            }, {})

            return resultKeyword;
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            lines: this._completeEmptyProps(nextProps.keywords)
        })
    }

    onInputBlurHandler = () => {
        let {onKeywordsChanged} = this.props;
        let {lines} = this.state;

        onKeywordsChanged(lines);
    }

    onInputChangeHandler = (e, prop, index) => {
        e.preventDefault();

        let {lines} = this.state;
        let value = e.target.value;

        let line = {...lines[index]};
        line[prop] = value;
        let newLines = [...lines];
        newLines[index] = line;

        this.setState({
            lines: newLines
        })

    }

    onRemoveKeyword = (e, index) => {
        let {onKeywordsChanged} = this.props;
        e.preventDefault();

        let {lines} = this.state;
        let newLines = lines.filter((l, idx) => idx != index);
        this.setState({
            lines: newLines
        })

        onKeywordsChanged(newLines);
    }

    buildFormGroup(data, prop, index) {
        let {intl, disabled} = this.props;
        return <div className={`keywordsSelector--itemValue`} key={prop + index}>
            <label htmlFor={prop + index} className="keywordsSelector--lang">{prop}:</label>
            {
                disabled ?
                    <span>{data}</span> :
                    <input id={prop + index} type="text" placeholder={intl.formatMessage(messages.keywordPlaceholder)}
                           className="txt txt-small txt-noBorder" value={data}
                           onBlur={this.onInputBlurHandler}
                           onChange={(e) => this.onInputChangeHandler(e, prop, index)}/>
            }
        </div>
    }

    buildBlock(line, index) {
        let {intl, disabled} = this.props;
        return <div className={`keywordsSelector--item ${disabled ? 'keywordsSelector-is-disabled' : ''}`} key={index}>
            <div className="keywordsSelector--itemActions">
                <div>{`${intl.formatMessage(messages.keyword)} #${index + 1}`}</div>
                {
                    !disabled &&
                    <button className="btn btn-small btn-link btn-noPaddings"
                            onClick={(e) => this.onRemoveKeyword(e, index)}>{intl.formatMessage(masterMessages.remove)}</button>
                }
            </div>
            {
                Object.keys(line).map((key) => {
                    let data = line[key];
                    return this.buildFormGroup(data, key, index)
                })
            }
        </div>
    }

    onAddKeywordHandler = (e) => {
        let {onKeywordsChanged} = this.props;
        e.preventDefault();

        let {lines} = this.state;
        let newLines = [...lines];
        newLines.push({...this.emptyLine});

        this.setState({
            lines: newLines
        })

        onKeywordsChanged(newLines);
    }

    render() {
        let {lines} = this.state;
        let {intl, disabled} = this.props;

        return <div className="keywordsSelector">
            {
                !disabled &&
                <div className="keywordsSelector--actions">
                    <button className="btn btn-small btn-secondary"
                            onClick={this.onAddKeywordHandler}>{intl.formatMessage(messages.addKeyword)}
                    </button>
                </div>
            }
            {
                disabled && lines.length == 0 &&
                <span className="keywordsSelector--empty">{intl.formatMessage(messages.noKeywords)}</span>
            }
            <div className="keywordsSelector--content">
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
    addKeyword: {
        id: 'keywordSelector.addKeyword',
        defaultMessage: 'Add keyword'
    },
    keyword: {
        id: 'keywordSelector.keyword',
        defaultMessage: 'Keyword'
    },
    keywordPlaceholder: {
        id: 'keywordSelector.keywordPlaceholder',
        defaultMessage: 'Enter keyword here'
    },
    noKeywords: {
        id: 'keywordSelector.noKeywords',
        defaultMessage: 'No keywords is assigned to book'
    }
})

export default injectIntl(KeywordsSelector);