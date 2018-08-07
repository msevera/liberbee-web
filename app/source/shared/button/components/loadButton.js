import React from 'react';

class LoadButton extends React.Component {
    constructor() {
        super();
    }

    render() {
        let {className, loaderClassName, text, loading, disabled, onClick, children} = this.props;

        return <button className={`ld-over ${className ? className : ''} ${loading ? 'ld-running': ''}`}
                        disabled={disabled}
                        onClick={!loading ? onClick: undefined}>
            {text}
            {children}
            <div className={`ld ld-ring ld-cycle ${loaderClassName ? loaderClassName : ''}`}></div>
        </button>
    }
}

export default LoadButton;