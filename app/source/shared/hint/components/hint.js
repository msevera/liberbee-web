/**
 * Created by Mike on 9/4/2017.
 */

'use strict';

import React from 'react';

class Hint extends React.Component {
    constructor() {
        super();
        this.state = {
            show: false
        }
    }

    componentDidMount() {
        window.addEventListener('click', this.onWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onWindowClick);
    }

    onWindowClick = (e) => {
        // not found: genuine outside event. Handle it.
        if (this.state.show === true) {
            var source = e.target;
            var found = false;

            // if source=dropdown elemnt then this event came from "somewhere" inside and should be ignored.
            while (source.parentNode) {
                found = (source === this.refs.hint);

                if (found) return;

                source = source.parentNode;
            }

            // not found: genuine outside event. Handle it.
            this.setState({
                show: false
            })
        }
    }

    onClick = () => {
        let {show} = this.state;

        this.setState({
            show: !show
        })
    }

    render() {
        let {text} = this.props;
        let {show} = this.state;

        return <div ref="hint" className={`hint ${show ? 'hint-is-visible' : ''}`}>
            <div onClick={this.onClick} className="hint--icon"></div>
            <div className="hint--content" dangerouslySetInnerHTML={{__html: text}}></div>
        </div>
    }
}

export default Hint;