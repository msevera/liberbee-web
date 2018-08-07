import React from 'react';

class Hamburger extends React.Component {
    onClickHandler = () => {
        let {onClick} = this.props;
        onClick()
    }

    render() {
        let {active} = this.props;
        return <div className={`hamburger ${active ? 'hamburger-is-active': ''}`} onClick={this.onClickHandler}>
            <div className="hamburger--item"></div>
            <div className="hamburger--item"></div>
            <div className="hamburger--item"></div>
        </div>
    }
}

export default Hamburger;