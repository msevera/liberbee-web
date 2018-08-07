/**
 * Created by Mike on 11/4/2017.
 */

import React from 'react';
import {defineMessages, FormattedMessage, FormattedNumber, injectIntl} from 'react-intl';

class RatingSelector extends React.Component {
    static getDerivedStateFromProps(props, state) {
        if (props.value != state.value) {
            return {
                value: props.value
            }
        }

        return null;
    }

    constructor(props) {
        super();
        this.starsCount = 5;
        this.state = {
            value: props.value,
            hoveredValue: null
        }
    }

    onSelectStarHandler = (newValue) => {
        let {onSelectedValueChanged} = this.props;
        let {value} = this.state;
        if (value == newValue)
            return;

        this.setState({
            value: newValue
        });

        onSelectedValueChanged && onSelectedValueChanged(newValue);
    }

    onStarMouseEnterHandler = (value) => {
        this.setState({
            hoveredValue: value
        })
    }

    onRatingSelectorMouseLeaveHandler = () => {
        this.setState({
            hoveredValue: null
        })
    }

    getStars() {
        let {disabled} = this.props;
        let result = [];
        for (let i = 1; i <= this.starsCount; i++) {
            result.push(<div key={i} onMouseEnter={!disabled ? (() => this.onStarMouseEnterHandler(i)) : null}
                             onClick={!disabled ? (() => this.onSelectStarHandler(i)) : null}
                             className="ratingSelector--item"></div>);
        }

        return result;
    }

    render() {
        let {hoveredValue, value} = this.state;
        let {intl, title, className, disabled, showTitle = false} = this.props;

        return <div title={intl.formatMessage(messages.selectRating)}
                    className={`ratingSelector ${disabled ? 'ratingSelector-is-disabled' : ''} ${className ? className : ''} ${hoveredValue ? 'ratingSelector-hovered-' + hoveredValue : ''} ${value ? 'ratingSelector-selected-' + value : ''}`}
                    onMouseLeave={!disabled ? this.onRatingSelectorMouseLeaveHandler : null}>

            {
                title &&
                <div className="ratingSelector--title">
                    {title}:
                </div>
            }
            <div className="ratingSelector--content">
                {
                    this.getStars()
                }
            </div>
        </div>
    }
}


const messages = defineMessages({
    selectRating: {
        id: 'ratingSelector.selectRating',
        defaultMessage: 'Select rating',
    }
})

export default injectIntl(RatingSelector);