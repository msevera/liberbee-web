/**
 * Created by Mike on 8/5/2017.
 */

'use strict';

import React, {Component} from 'react';
import Autocomplete from './autocomplete';

class PlacesAutocomplete extends Component {
    constructor(props){
        super();
        this.state = {
            value: props.value
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        })
    }

    buildPlacesSuggestionsSource(placesSuggestionsRes, query) {
        return placesSuggestionsRes.map((suggest) => {

            let secondaryTerms = suggest.terms
                .map((term, idx) => {
                    return <span key={idx}>{idx > 0 ? ', ' : ''}{term.text}</span>
                })

            let queryRegexp = new RegExp('(' + query + ')', 'i')
            let primaryText = suggest.text.replace(queryRegexp, '<span class="autocomplete--highlight">$1</span>')

            return {
                data: suggest,
                title: suggest.text,
                text: (<span>
                    <span className="autocomplete--primary" dangerouslySetInnerHTML={{__html: primaryText}}></span>
                    {
                        !!secondaryTerms && <span className="autocomplete--secondary"> ({secondaryTerms})</span>
                    }
                </span>)
            }
        })
    }

    onSelectedValueChangedHandler = (data, text, meta) => {
        let {onSelectedValueChanged} = this.props;

        this.setState({
            value: text
        })

        console.log(data);
        if (onSelectedValueChanged){
            onSelectedValueChanged(data, text, meta);
        }
    }

    onHoveredValueChangedHandler = (data, text) => {
        let {onHoveredValueChanged} = this.props;

        if (onHoveredValueChanged){
            onHoveredValueChanged(data, text);
        }
    }

    render() {
        let {suggestions, onInputChange, inputClassName, placeholder} = this.props;
        let {value} = this.state;

        let placesSuggestionsRes = this.buildPlacesSuggestionsSource(suggestions, value);

        return <Autocomplete key="liberbee" value={value} placeholder={placeholder}
                             suggestions={placesSuggestionsRes}
                             inputClassName={inputClassName}
                             highlight={value}
                             onInputChange={onInputChange}
                             onHoveredValueChanged={this.onHoveredValueChangedHandler}
                             onSelectedValueChanged={this.onSelectedValueChangedHandler} />

    }
}

export default PlacesAutocomplete;