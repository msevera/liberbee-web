/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 23.09.16
 * Time: 10:38
 */

import React from 'react';
import DropDownItem from './dropdownItem';

class DropDownIconItem extends DropDownItem {

    render() {
        let { text, isSelected, showIcon } = this.props;
        let itemClasses = 'dropdown--item';
        if (!!isSelected) {
            itemClasses += ' dropdown--item-is-selected';
        }

        let icon = null;
        if(!!showIcon) {
            icon = <i className="stockStatus stockStatus-fullSmall"></i>;
        }

        return (
            <li className={itemClasses} onClick={()=> this.onItemClick()}>
                {text}
                {icon}
            </li>
        );
    }
}

export default DropDownIconItem;
