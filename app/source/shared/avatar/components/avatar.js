/**
 * Created by Mike on 10/10/2017.
 */

'use strict';

import React from 'react';

class Avatar extends React.Component {
    constructor() {
        super();

        this.state = {
            fallback: false
        }
    }

    componentDidMount() {
        let {img} = this.refs;

        if (!img || !img.complete)
            return;

        img.naturalWidth === 0 ? this.onLoadError() : this.onLoadSuccess();
    }

    onLoadError = () => {
        this.setState({
            fallback: true
        })
    }

    onLoadSuccess = () => {
        this.setState({
            fallback: false
        })
    }

    buildContent(name, src) {
        if (src) {
            return <img ref="img" src={src} alt={name} onError={this.onLoadError} onLoad={this.onLoadSuccess}/>
        }

        let nameArr = name.split(' ');
        return nameArr.map((n) => n[0]);
    }


    render() {
        let {className, name, src} = this.props;
        let {fallback} = this.state;

        return <div className={'avatar' + (className ? ' ' + className : '')}>
            {
                fallback ?
                    this.buildContent(name, null) :
                    this.buildContent(name, src)
            }
        </div>
    }
}

export default Avatar;