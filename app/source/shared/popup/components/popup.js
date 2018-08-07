/**
 * Created by Mike on 6/22/2017.
 */

'use strict';

import React, {Component} from 'react';
import DOMUtils from '../../../../../utils/DOMUtils';
import ButtonLoad from '../../../shared/button/components/loadButton';

class Popup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showPopup: props.show
        }

        this.onCloseClick = this.onCloseClick.bind(this);
    }

    onCloseClick() {
        let {onPopupClose, hideClose} = this.props;

        if (hideClose)
            return;

        this.setState({
            showPopup: false
        });

        if (onPopupClose) {
            onPopupClose()
        }
    }

    onBgClick = (e) => {
        if (DOMUtils.hasClass(e.target, 'popup--overflow')) {
            this.onCloseClick(e);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            showPopup: nextProps.show
        })
    }

    componentDidUpdate() {
        let {showPopup} = this.state;
        let {id} = this.props;

        if (!id) return;

        if (showPopup) {
            DOMUtils.freezeBody(id);
        } else {
            DOMUtils.unfreezeBody(id);
        }
    }

    componentDidMount() {
        let {showPopup} = this.state;
        let {id} = this.props;

        if (!id) return;

        if (showPopup) {
            DOMUtils.freezeBody(id);
        } else {
            DOMUtils.unfreezeBody(id);
        }
    }

    render() {
        let {title, children, hideClose, confirmAction, confirmActionText, confirmActionLoading, cancelAction, cancelActionText = 'Cancel', removeAction, removeActionText} = this.props;
        let {showPopup} = this.state;

        return <div className={'popup' + (showPopup ? ' popup-is-visible' : '')}>
            <div className="popup--bg"></div>
            <div className="popup--overflow" onClick={this.onBgClick}>
                <div className="popup--container">
                    <div className={'popup--header' + (!title ? ' popup--noPadding popup--noHeight' : '')}><span>{title}</span>
                        {!hideClose && <div className="popup--close" onClick={this.onCloseClick}></div>}
                    </div>
                    <div className="popup--content">{children}</div>
                    {
                        (confirmAction || cancelAction) &&
                        <div className="popup--footer">
                            <div>
                                {
                                    removeAction && <button className="btn btn-noPaddings btn-link btn-xs-block" onClick={(e) => {
                                        e.preventDefault();
                                        removeAction();
                                    }}>{removeActionText}</button>
                                }
                            </div>
                            <div className="popup--footerMainActions">
                                {
                                    cancelAction && <button className="btn btn-link btn-linkSecondary btn-xs-block" onClick={(e) => {
                                        e.preventDefault();
                                        this.onCloseClick();
                                        cancelAction();
                                    }}>{cancelActionText}</button>
                                }
                                {
                                    confirmAction && <ButtonLoad className="btn btn-primary btn-noShadow btn-xs-block"
                                                                 text={confirmActionText}
                                                                 loading={confirmActionLoading}
                                                                 onClick={(e) => {
                                                                     e.preventDefault();
                                                                     confirmAction()
                                                                 }}/>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    }
}

export default Popup;