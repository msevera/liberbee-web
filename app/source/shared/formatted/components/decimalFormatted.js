import React from 'react';
import ReactDOM from 'react-dom';
import {injectIntl} from 'react-intl';

class DecimalFormatter extends React.Component {
    constructor(props){
        super();

        this.state = {
            value: props.value
        }
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({
            value: nextProps.value
        })
    }

    normalizeValue = (str) => {
        // strips everything that is not a number (positive or negative).
        return Number(str.replace(/[^0-9-]/g, ""))
    }

    calculateValue = (str) => {
        let value = this.normalizeValue(str);
        return value/100;
    }

    updateValues = (event) => {
        let str = event.target.value;
        let value = this.calculateValue(str);

        this.setState({
            value
        })

        return value;
    }


    onChange = (e) => {
        let {onChange} = this.props;
        let value = this.updateValues(e);

        if (onChange)
        {
            onChange(this._prepareValueForEvents(value))
        }
    }

    onBlur = (e) => {
        let {onBlur} = this.props;
        let value = this.updateValues(e);

        if (onBlur)
        {
            onBlur(this._prepareValueForEvents(value))
        }
    }

    _prepareValueForEvents(value){
        return {
            target: {
                value
            }
        }
    }

    _handleInputRef = input => {
        const element = ReactDOM.findDOMNode(input);
        const isActive = element === document.activeElement;

        if (element && !isActive) {
            if (this.props.autoFocus) {
                element.focus();
            }
        }

        return element;
    };

    render(){
        let {intl, className} = this.props;
        let {value} = this.state;

        let formattedValue = intl.formatNumber(value, {
            minimumFractionDigits: 2
        });

        return <input className={className}
                      ref={input => this.input = this._handleInputRef(input)}
                      type="text"
                      value={formattedValue}
                      onChange={this.onChange}
                      onBlur={this.onBlur}  />
    }
}

export default injectIntl(DecimalFormatter);