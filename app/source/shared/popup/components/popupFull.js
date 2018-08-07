/**
 * Created by Mike on 9/25/2017.
 */


import React from 'react';
import DOMUtils from '../../../../../utils/DOMUtils';

class PopupFull extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPopup: props.show
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            showPopup: nextProps.show
        })
    }

    componentDidUpdate() {
        let {showPopup} = this.state;
        let {id, fixed} = this.props;

        if (!id || !fixed) return;

        if (showPopup) {
            DOMUtils.freezeBody(id);
        } else {
            DOMUtils.unfreezeBody(id);
        }
    }

    componentDidMount() {
        let {showPopup} = this.state;
        let {id, fixed} = this.props;

        if (!id || !fixed) return;

        if (showPopup) {
            DOMUtils.freezeBody(id);
        } else {
            DOMUtils.unfreezeBody(id);
        }
    }

    onCloseClick = () => {
        let {onClose} = this.props;

        this.setState({
            showPopup: false
        });

        if (onClose) {
            onClose()
        }
    }

    render() {
        let {children, className, fixed} = this.props;
        let {showPopup} = this.state;


        return <div className={'popupFull' + (showPopup ? ' popupFull-is-visible' : '') + (fixed ? ' popupFull-fixed': '') + (className ? ' ' + className: '')}>
            <div className="popupFull--bg">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="popupFull--container">
                                <div className="popupFull--close" onClick={this.onCloseClick}></div>
                                <div className="popupFull--content">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default PopupFull