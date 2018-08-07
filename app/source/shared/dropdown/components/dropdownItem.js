import React from 'react';

class DropDownItem extends React.Component {

    onItemClick(e) {
        let { onClick } = this.props;

        if (!!onClick) {
            onClick();
        }
    }

    render() {
        let { text, isSelected } = this.props;
        let itemClasses = 'dropdown--item';
        if (!!isSelected) {
            itemClasses += ' dropdown--item-is-selected';
        }

        return (
            <li className={itemClasses} onClick={()=> this.onItemClick()}>
                <span>{text}</span>
            </li>
        );
    }
}

export default DropDownItem

