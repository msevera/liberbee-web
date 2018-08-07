/**
 * Created by Mike on 8/1/2017.
 */
'use strict';

import React, {Component} from 'react';
import {debounce} from 'throttle-debounce';

class Autocomplete extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedIdx: 0,
            selectedId: null,
            isFocused: false,
            value: typeof props.value !== 'undefined' ? props.value : ''
        }

        //this.onChangeAutocomplete = debounce(300, this.onChangeAutocomplete);
    }

    componentDidMount() {
        window.addEventListener('click', this.onWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onWindowClick);
    }

    onWindowClick = (e) => {
        if (this.state.isFocused === true) {
            var source = e.target;
            var found = false;

            // if source=dropdown elemnt then this event came from "somewhere" inside and should be ignored.
            while (source.parentNode) {
                found = (source === this.refs.autocomplete);

                if (found) return;

                source = source.parentNode;
            }

            // not found: genuine outside event. Handle it.
            this.closePopover()
        }
    }

    closePopover() {
        this.setState({
            isFocused: false
        })
    }

    openPopover() {
        let {isFocused, selectedId} = this.state;
        let {suggestions} = this.props;

        if (isFocused)
            return;

        let selectedIdx = 0;
        if (selectedId != null) {
            selectedIdx = suggestions.findIndex((sugg) => {
                return sugg.data._id == selectedId;
            })
        }

        this.setState({
            isFocused: true,
            selectedIdx
        })

        this.onHoveredValueChanged(selectedIdx, suggestions);
    }

    onInputChangeHandler = (event) => {
        const {value} = event.target;
        this.setState({
            value,
            isFocused: true,
        });

        this.onChangeAutocomplete(value);
    }

    onSelectedValueChangedHandler = (suggest) => {
        this.onSelectedValueChanged(suggest.data._id);
    }

    onSelectedValueChanged = (suggestId, meta) => {
        const {onSelectedValueChanged, onInputChange, suggestions} = this.props;
        let {value} = this.state;


        let suggest = suggestions.find((sugg) => {
            return sugg.data._id == suggestId;
        })

        if (suggest) {
            this.setState({
                value: suggest.title,
                isFocused: false
            });

            onInputChange && onInputChange(suggest.title);
            onSelectedValueChanged && onSelectedValueChanged(suggest.data, suggest.title, meta);
        } else {
            this.setState({
                isFocused: false
            });
            onSelectedValueChanged && onSelectedValueChanged(null, value, meta);
        }
    }

    onHoveredValueChanged = (index, suggestions) => {
        const {onHoveredValueChanged} = this.props;
        const {value} = this.state;

        let suggest = suggestions.find((sugg, idx) => {
            return idx == index;
        })

        if (suggest) {
            this.setState({
                selectedId: suggest.data._id
            })

            onHoveredValueChanged && onHoveredValueChanged(suggest.data, suggest.title)
        } else {
            this.setState({
                selectedId: null
            })

            onHoveredValueChanged && onHoveredValueChanged(null, value);
        }


    }

    onChangeAutocomplete(value) {
        const {onInputChange} = this.props;

        onInputChange && onInputChange(value);
    }

    onFocusHandler = (event) => {
        this.openPopover();

        const {onInputChange, value} = this.props;

        value && onInputChange && onInputChange(value);
    }

    onBlurHandler = (event) => {
        const {onInputBlur, value} = this.props;
        if (onInputBlur) {
            onInputBlur(value);
        }
        /*const {onInputChange, suggestions} = this.props;
         let {selectedId} = this.state;

         let suggest = suggestions.find((s) => {
         return s.data._id == selectedId;
         })

         suggest && onInputChange && onInputChange(suggest.data.text);*/
    }

    componentWillReceiveProps(nextProps) {
        let {suggestions, value} = this.props;

        this.setState({
            value: nextProps.value,
        })

        if (value != nextProps.value) {
            this.setState({
                selectedIdx: 0,
            })
        }

        if (!this.compareSuggestions(suggestions, nextProps.suggestions)) {
            this.setState({
                selectedIdx: 0,
                selectedId: null,
                //isFocused: true
            })

            this.onHoveredValueChanged(0, nextProps.suggestions);
        }
    }

    compareSuggestions(oldSuggestions, newSuggestions) {
        if (oldSuggestions.length != newSuggestions.length) {
            return false;
        }

        return oldSuggestions.every((oldSugg, idx) => {
            return newSuggestions[idx].data._id == oldSugg.data._id;
        })
    }

    shouldShowSuggestions() {
        const {suggestions} = this.props;
        const {isFocused, value} = this.state;

        if (!value || (suggestions.length == 0) || !isFocused) {
            return false;
        }

        return true;
    }

    onItemMouseEnter = (suggestion) => {
        let {suggestions} = this.props;

        let selectedIdx = suggestions.findIndex((sugg) => {
            return sugg.data._id == suggestion.data._id;
        })

        this.setState({
            selectedIdx
        })

        this.onHoveredValueChanged(selectedIdx, suggestions);
    }

    onItemKeyDown = (e) => {
        let {isFocused, selectedId} = this.state;
        let {tab = true} = this.props;

        let keyCode = e.keyCode;

        switch (keyCode) {
            case 9: { //TAB
                if (!tab)
                {
                    this.closePopover();
                    return;
                }

                this.onSelectedValueChanged(selectedId, {keyCode});
                break;
            }

            case 13: { //Enter
                this.onSelectedValueChanged(selectedId, {keyCode});
                break;
            }

            case 27: { //ESC
                this.closePopover()
                e.preventDefault();
                break;
            }

            case 38: { //Key down
                this.decreaseSelectedIdx();
                e.preventDefault();
                break;
            }

            case 40: { //Key up
                if (!isFocused) {
                    this.openPopover();
                } else {
                    this.increaseSelectedIdx();
                }
                e.preventDefault();
                break;
            }
        }


    }

    decreaseSelectedIdx() {
        let {selectedIdx} = this.state;
        let {suggestions} = this.props;

        if (selectedIdx > 0) {
            let newIdx = selectedIdx - 1;
            this.setState({
                selectedIdx: newIdx
            })

            this.onHoveredValueChanged(newIdx, suggestions);
        }
    }

    increaseSelectedIdx() {
        let {suggestions} = this.props;
        let {selectedIdx} = this.state;

        if (selectedIdx < suggestions.length - 1) {
            let newIdx = selectedIdx + 1;
            this.setState({
                selectedIdx: newIdx
            })

            this.onHoveredValueChanged(newIdx, suggestions);
        }
    }

    render() {
        let {suggestions, placeholder, inputClassName, className, disabled} = this.props;
        let {value, selectedIdx} = this.state;
        let shouldShowSuggestions = this.shouldShowSuggestions();

        return <div className={`autocomplete ${className ? className : ''}`} ref="autocomplete"
                    onKeyDown={this.onItemKeyDown}>
            <input type="text" className={inputClassName} placeholder={placeholder} disabled={disabled}
                   value={value} onChange={this.onInputChangeHandler}
                   onFocus={this.onFocusHandler} onBlur={this.onBlurHandler}/>
            {
                !disabled &&
                <ul className={'autocomplete--suggestions' + (shouldShowSuggestions ? ' autocomplete--suggestions-is-visible' : '')}>
                    {
                        suggestions.map((suggest, index) => {

                            let itemCss = 'autocomplete--item' + (selectedIdx == index ? ' autocomplete--item-is-hovered' : '')
                            return <li
                                onClick={() => this.onSelectedValueChangedHandler(suggest)}
                                onMouseEnter={() => this.onItemMouseEnter(suggest)}
                                className={itemCss}
                                key={index}>{suggest.text}</li>
                        })
                    }
                </ul>
            }

        </div>
    }
}

export default Autocomplete;