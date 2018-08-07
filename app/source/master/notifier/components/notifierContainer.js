/**
 * Created by Mike on 9/26/2017.
 */

'use strict';

import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router-dom';
import React from 'react';
import {addMessage, removeMessage, markMessageAsActive, markMessageAsRemoved} from '../notifierActions';

class NotifierContainer extends React.Component {
    constructor() {
        super();

        this.messageVisibityTime = 5000;
        this.active = [];
        this.removed = [];
    }

    removeMessage = (message) => {
        let {removeMessage, markMessageAsRemoved} = this.props;

        markMessageAsRemoved(message.id);

        setTimeout(() => {
            removeMessage(message.id);
            this.active = this.active.filter((id) => {
                return id != message.id;
            })

            this.removed = this.removed.filter((id) => {
                return id != message.id;
            })
        }, 500)
    }

    buildMessage(message) {
        let {markMessageAsActive} = this.props;
        let notifierCssClass = '';

        switch (message.type) {
            case 'success': {
                notifierCssClass = 'notifier--success';
                break;
            }

            case 'error': {
                notifierCssClass = 'notifier--error';
                break;
            }

            case 'alert': {
                notifierCssClass = 'notifier--alert';
                break;
            }
        }

        let statusClass = '';

        switch (message.status) {
            case 'created': {
                statusClass = 'notifier--message-is-created';
                if (!this.active.includes(message.id)) {
                    this.active.push(message.id);
                    setTimeout(() => {
                        markMessageAsActive(message.id);
                    }, 500)
                }
                break;
            }

            case 'active': {
                statusClass = 'notifier--message-is-active';
                if (!this.removed.includes(message.id)) {
                    this.removed.push(message.id);
                    setTimeout(() => {
                        this.removeMessage(message);
                    }, this.messageVisibityTime)

                }
                break;
            }

            case 'removed': {
                statusClass = 'notifier--message-is-removed';
                break;
            }
        }

        return <div key={message.id} className={`notifier--message ${notifierCssClass} ${statusClass}`}>
            <div className="notifier--pref"></div>
            <div className="notifier--content">
                {
                    message.title &&
                    <div className="notifier--title">{message.title}</div>
                }
                {
                    message.messageType == 'html' ?
                        <div className="notifier--text" dangerouslySetInnerHTML={{__html: message.text}}></div>:
                        <div className="notifier--text">{message.text}</div>
                }

            </div>
            <div className="notifier--close" onClick={() => this.removeMessage(message)}></div>
        </div>
    }

    render() {
        let {messages} = this.props;


        return <div className="notifier">
            {
                messages.map((message) => {
                    return this.buildMessage(message);
                })
            }
        </div>
    }
}

const mapStateToProps = (state) => {
    return {
        messages: state.master.notifier.messages
    }
}

const mapDispatchToProps = {
    addMessage, removeMessage,
    markMessageAsActive, markMessageAsRemoved
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NotifierContainer));