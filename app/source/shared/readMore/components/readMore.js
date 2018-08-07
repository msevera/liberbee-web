/**
 * Created by Mike on 9/29/2017.
 */

'use strict';

import React from 'react';
import {defineMessages, injectIntl} from 'react-intl';
import DOMUtils from "../../../../../utils/DOMUtils";

class ReadMore extends React.Component {
    constructor() {
        super();

        this.state = {
            expanded: false
        }
    }

    componentDidMount() {
        this.renderReadMore();
    }

    componentDidUpdate() {
        this.renderReadMore();
    }

    renderReadMore() {
        let {collapsedHeight} = this.props;
        let {readMore, readMoreAction} = this.refs;

        let height = readMore.offsetHeight;
        if (height < collapsedHeight) {
            DOMUtils.removeClass(readMoreAction, 'readMore--action-is-visible')
        } else {
            DOMUtils.addClass(readMoreAction, 'readMore--action-is-visible')
        }

    }

    expandCollapse = () => {
        let {expanded} = this.state;
        this.setState({
            expanded: !expanded
        })
    }

    render() {
        let {text, html, intl, collapsedHeight, className} = this.props;
        let {expanded} = this.state;
        let style = {};
        if (!expanded){
            style.maxHeight = collapsedHeight;
        }else{
            style.maxHeight = 'none';
        }

        return <div ref="readMore" className={`readMore ${expanded ? 'readMore-expanded' : ''} ${className ? className: ''}`}>
            {
                html &&
                <div style={style} className="readMore--content" dangerouslySetInnerHTML={{__html: html}}></div>
            }
            {
                text &&
                <div style={style} className="readMore--content">{text}</div>
            }
            <button ref="readMoreAction" className="readMore--action" onClick={this.expandCollapse}>
                {
                    !expanded ?
                        intl.formatMessage(messages.more) :
                        intl.formatMessage(messages.less)
                }
            </button>
        </div>
    }
}

let messages = defineMessages({
    more: {
        id: 'readMore.more',
        defaultMessage: '...more'
    },
    less: {
        id: 'readMore.less',
        defaultMessage: '...less'
    }
})

export default injectIntl(ReadMore);