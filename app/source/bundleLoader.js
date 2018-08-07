/**
 * Created by Mike on 5/8/2017.
 */

'use strict';

import React, {Component} from 'react';

class BundleLoader extends Component {
    state = {
        // short for "module" but that's a keyword in js, so "mod"
        mod: null
    }

    componentWillMount() {
        this.load(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.load !== this.props.load) {
            this.load(nextProps)
        }
    }

    load(props) {
        this.setState({
            mod: null
        })

        if (props.async){
            props.load((mod) => {
                this.setState({
                    // handle both es imports and cjs
                    mod: mod.default ? mod.default : mod
                })
            })
        }


    }

    render() {
        let comp = this.props.async ? this.props.children(this.state.mod) : this.props.children(this.props.load);
        return comp;
    }
}

export default BundleLoader