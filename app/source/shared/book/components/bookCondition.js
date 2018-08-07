/**
 * Created by Mike on 11/4/2017.
 */

import React from 'react';
import {injectIntl} from 'react-intl';
import {messages as bookMessages} from '../bookMessages';

class BookCondition extends React.Component {
    constructor() {
        super();

        this.state = {
            showComment: false
        }
    }

    buildCondition() {
        let {condition, intl} = this.props;
        switch (condition) {
            case 10: {
                return intl.formatMessage(bookMessages.conditionNew)
            }

            case 20: {
                return intl.formatMessage(bookMessages.conditionExcellent)
            }

            case 30: {
                return intl.formatMessage(bookMessages.conditionGood)
            }

            case 40: {
                return intl.formatMessage(bookMessages.conditionNotBad)
            }
        }
    }

    getCssClasses() {
        let {condition} = this.props;
        switch (condition) {
            case 10: {
                return 'bookCondition-new'
            }

            case 20: {
                return 'bookCondition-excellent'
            }

            case 30: {
                return 'bookCondition-good'
            }

            case 40: {
                return 'bookCondition-notBad'
            }
        }
    }

    onCommentClick = () => {
        let {showComment} = this.state;

        this.setState({
            showComment: !showComment
        })
    }

    componentDidMount() {
        window.addEventListener('click', this.onWindowClick);
        window.addEventListener('touchend', this.onWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onWindowClick);
        window.removeEventListener('touchend', this.onWindowClick);
    }

    onWindowClick = (e) => {
        // not found: genuine outside event. Handle it.
        if (this.state.showComment === true) {
            var source = e.target;
            var found = false;

            // if source=dropdown elemnt then this event came from "somewhere" inside and should be ignored.
            while (source.parentNode) {
                found = (source === this.refs.comment);

                if (found) return;

                source = source.parentNode;
            }

            // not found: genuine outside event. Handle it.
            this.setState({
                showComment: false
            })
        }
    }

    render() {
        let {className, intl, comment} = this.props;
        let {showComment} = this.state;

        return <div className={`bookCondition ${this.getCssClasses()} ${className ? className : ''}`}>
            <div className="bookCondition--label">{intl.formatMessage(bookMessages.bookCondition)}:</div>
            <div className="bookCondition--state">
                {this.buildCondition()}
            </div>
            {
                comment &&
                [<div key={1} ref="comment"
                      className="bookCondition--comment"
                      onClick={this.onCommentClick}>

                </div>,
                <div key={2}
                    className={`bookCondition--commentContent ${showComment ? 'bookCondition--commentContent-is-visible' : ''}`}>
                    {comment}
                </div>]
            }
        </div>

    }
}

export default injectIntl(BookCondition);