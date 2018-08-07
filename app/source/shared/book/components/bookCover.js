import React from 'react';
import {Link} from 'react-router-dom';
import coverBuilder from "../../../../../utils/coverBuilder";
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import LazyLoad from 'react-lazy-load';

class BookCover extends React.Component {
    constructor(props) {
        super();

        this.state = {
            showFallback: !props.cover,
            loaded: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            showFallback: !nextProps.cover
        })
    }

    componentDidMount() {
        let {img} = this.refs;

        if (!img || !img.complete)
            return;

        img.naturalWidth === 0 ? this.onError() : this.onLoad();
    }

    onLoad = () => {
        this.setState({
            showFallback: false,
            loaded: true
        })
    }

    onError = () => {
        this.setState({
            showFallback: true
        })
    }

    getCoverUrl(cover) {
        return coverBuilder.getCoverUrl(cover);
    }

    render() {
        let {title, cover, className, intl} = this.props;
        let {showFallback, loaded} = this.state;
        let src = !showFallback && cover ? this.getCoverUrl(cover.resource) : '';
        return <div
            className={`bookCover ${showFallback ? 'bookCover-is-empty' : ''} ${className ? className : ''}  ${!loaded ? 'bookCover-is-loading' : ''}`}>

            {
                !showFallback ?
                    <div className="bookCover--img">
                        {

                            <LazyLoad offset={400}>
                                <img ref="img" src={src} alt={title}
                                     onError={this.onError} onLoad={this.onLoad}/>
                            </LazyLoad>

                        }
                        <div className="bookCover--loader">Loading...</div>
                    </div> :
                    <span>{intl.formatMessage(messages.emptyCover)}</span>
            }

        </div>
    }
}

const messages = defineMessages({
    emptyCover: {
        id: 'bookCover.emptyCover',
        defaultMessage: 'No Cover'
    }
});

export default injectIntl(BookCover);