/**
 * Created by Mike on 9/4/2017.
 */

'use strict';

import React from 'react';

class LineSelector extends React.Component {
    constructor(props) {
        super();
        this.state = {
            statePoints: props.statePoints,
            selected: props.selected
        }
    }

    buildPoint(point, index) {
        let {selected, statePoints} = this.props;
        return <li className={`lineSelector--item ${selected == point.value ? 'lineSelector--item-is-selected' : ''}`}>
            <div className="lineSelector--point">
                <div className="lineSelector--dot"></div>
                {
                    (selected == point.value /*|| index == 0 || index == statePoints.length - 1*/) &&
                    <div className="lineSelector--text">{point.text}</div>
                }
            </div>
            {
                (index != statePoints.length - 1) &&
                <div className="lineSelector--line"></div>
            }
        </li>
    }

    render() {
        let {statePoints, className} = this.props;

        return <ul className={`lineSelector ${className ? ' className' : ''}`}>
            {
                statePoints.map((point, index) => {
                    return this.buildPoint(point, index);
                })
            }
        </ul>
    }
}

export default LineSelector;