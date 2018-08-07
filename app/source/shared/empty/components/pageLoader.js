/**
 * Created by Mike on 11/4/2017.
 */

import React from 'react';

class PageLoader extends React.Component {
    render() {
        let {className} = this.props;

        return <div className={`pageLoader ${className ? className : ''}`}>
            <div className="pageLoader--spinner">
                <ul className="pageLoader--list">
                    <li className="pageLoader--item pageLoader--bookFirst"></li>
                    <li className="pageLoader--item pageLoader--bookSecond"></li>
                    <li className="pageLoader--item pageLoader--bookThird"></li>
                    <li className="pageLoader--item pageLoader--bookFourth"></li>
                    <li className="pageLoader--item pageLoader--bookFifth"></li>
                    <li className="pageLoader--item pageLoader--bookSixth"></li>
                </ul>
                <div className="pageLoader--shelf"></div>
            </div>
        </div>
    }
}

export default PageLoader;