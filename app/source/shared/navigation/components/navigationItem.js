/**
 * Created by Mike on 10/10/2017.
 */

'use strict';

import React from 'react';
import NavigationItemMenu from './navigationIteMenu';

class NavigationItem extends React.Component {
    constructor() {
        super();

        this.delay = 500;
        this.delayTimeoutValue = null;

        this.state = {
            showContent: false
        }
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
        if (this.state.showContent === true) {
            var source = e.target;
            var found = false;

            // if source=navItem elemnt then this event came from "somewhere" inside and should be ignored.
            while (source.parentNode) {
                found = (source === this.refs.navItem);

                if (found) return;

                source = source.parentNode;
            }

            // not found: genuine outside event. Handle it.
            this.setState({
                showContent: false
            })
        }
    }

    onContentEnter = () => {
        this.delayTimeoutValue && clearTimeout(this.delayTimeoutValue);

        this.setState({
            showContent: true
        })
    }

    onContentLeave = () => {
        this.delayTimeoutValue && clearTimeout(this.delayTimeoutValue);

        this.delayTimeoutValue = setTimeout(() => {
            this.setState({
                showContent: false
            })
        }, this.delay)
    }

    onContentClick = () => {
        let {showContent} = this.state;

        this.setState({
            showContent: !showContent
        })
    }

    buildContent() {
        let {children, showOn} = this.props;
        let {showContent} = this.state;

        if (children.length > 1) {
            return React.Children.map(children, (child) => {

                let props = {...child.props};

                if (child.type == NavigationItemMenu) {
                    props.show = showContent;
                }

                return React.cloneElement(child, props);
            })
        } else {
            return children;
        }
    }

    render() {
        let {children, showOn, showArrow=true, className} = this.props;
        let {showContent} = this.state;

        let actions = {};
        switch (showOn) {
            case 'click': {
                actions.onClick = this.onContentClick;
                break;
            }

            case 'hover': {
                actions.onMouseEnter = this.onContentEnter;
                actions.onMouseLeave = this.onContentLeave;
                break;
            }
        }

        return <li {...actions} ref="navItem"
                   className={'nav--item' + (children.length > 1 ? ' nav--item-has-menu' : '') + (showContent ? ' nav--item-menu-is-visible' : '') + (className ? ' ' + className : '')}>
            {
                <div>{this.buildContent()}</div>
            }
            {
                (children.length > 1 && showArrow) &&
                <span className="nav--itemArrow"></span>
            }
        </li>
    }
}

export default NavigationItem;