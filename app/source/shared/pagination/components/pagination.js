/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 14.06.16
 * Time: 12:14
 */

import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, defineMessages} from 'react-intl';

class Pagination extends React.Component {

    static propTypes = {
        total: PropTypes.number,
        adjacent: PropTypes.number,
        itemPerPage: PropTypes.number,
        currentPage: PropTypes.number,
        pagesCount: PropTypes.number,
        selectPage: PropTypes.func,
        urlPattern: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.buttons = [];
    }

    getUrlFromPattern = (urlPattern, pageNumber) => {
        return urlPattern.replace(/{([?&]?)(page)(&?)}/, (str, p1, p2, p3) => {
            if (pageNumber === 1) {
                return p3 === '&' ? p1 : '';
            }
            return p1 + 'page=' + pageNumber + p3;
        });
    };

    btnClickHandler(page, e) {
        const {selectPage} = this.props;

        selectPage(page);

        e.preventDefault();
    }

    generateButtonsArray() {
        const {adjacent, currentPage, pagesCount} = this.props;

        const adjacentBase = adjacent * 2;          // current page + left + right adjustment       x . [ x [x] x x ] . x = 4
        let buttonsCount = adjacentBase + 4;        // 4 = start/end buttons with delimiters:       [ x . ] x x x x [ . x ]

        buttonsCount = (buttonsCount > pagesCount) ? pagesCount : buttonsCount;

        this.buttons = Array.from(new Array(buttonsCount + 1), (x, i) => i);

        if (pagesCount > (adjacentBase + 4)) {
            this.buttons[buttonsCount - 1] = '...';
        }
        this.buttons[buttonsCount] = pagesCount;

        if (currentPage > adjacentBase && pagesCount > (adjacentBase + 4)) {
            this.buttons[2] = '...';

            let cnt = buttonsCount - adjacentBase - 1;
            let value = currentPage - adjacent;

            if (currentPage > pagesCount - 5) {
                this.buttons[buttonsCount - 1] = pagesCount - 1;
                value = pagesCount - adjacentBase - 1;
            }

            while (cnt < (buttonsCount - 1)) {
                this.buttons[cnt] = value;
                cnt++;
                value++;
            }
        }

        this.buttons.shift();
    }

    renderPageButton(n, i) {
        if (!/\d+/.test(n)) {
            return this.renderDelimiter(i);
        }

        const {currentPage, urlPattern, pagesCount} = this.props;
        let className = 'pagination--item';
        let btnClassName = 'btn btn-secondary btn-small btn-pagination';

        let btnClickHandler = this.btnClickHandler.bind(this, n);

        if (n == currentPage) {
            className += ' pagination--item-is-active';
            btnClassName += ' btn-is-active';
            btnClickHandler = e => e.preventDefault();
        }

        return (
            <div key={i} className={className}>
                {
                    !!urlPattern ? (
                        <a
                            href={this.getUrlFromPattern(urlPattern, n)}
                            onClick={btnClickHandler}
                            className={btnClassName}
                        >
                            {n}
                        </a>
                    ) : (
                        <button
                            onClick={btnClickHandler}
                            className={btnClassName}
                        >
                            {n}
                        </button>
                    )
                }
            </div>
        );
    }

    renderDelimiter(i) {
        let {urlPattern} = this.props;
        let page = this.buttons[2] - 1;
        if (i != 1) {
            page = this.buttons[this.buttons.length - 3] + 1;
        }

        const delimiterClick = (e) => {
            const {selectPage} = this.props;
            selectPage(page);
            e.preventDefault();
        };

        return (
            <div key={i} className="pagination--item">
                {
                    !!urlPattern ? (
                        <a
                            href={this.getUrlFromPattern(urlPattern, page)}
                            onClick={delimiterClick}
                            className="btn btn-secondary btn-small"
                        >...</a>
                    ) : (
                        <button
                            onClick={delimiterClick}
                            className="btn btn-secondary btn-small"
                        >...</button>
                    )
                }
            </div>
        );
    }

    renderNavPage(text, page, additionalClassName = '') {
        let className = 'pagination--item' + additionalClassName;
        let {urlPattern} = this.props;

        const createMarkup = () => ({__html: text});
        let clickHandler = null;
        let btnDisabled = 'disabled';
        if (page) {
            clickHandler = this.btnClickHandler.bind(this, page);
            btnDisabled = null;
        }

        return (
            <div className={className}>
                {
                    !!btnDisabled || !urlPattern ? (
                        <button
                            disabled={btnDisabled}
                            onClick={clickHandler}
                            className="btn btn-secondary btn-small"
                            dangerouslySetInnerHTML={createMarkup()}
                        />
                    ) : (
                        <a
                            href={this.getUrlFromPattern(urlPattern, page)}
                            onClick={clickHandler}
                            className="btn btn-secondary btn-small"
                            dangerouslySetInnerHTML={createMarkup()}
                        />
                    )
                }
            </div>
        );
    }

    renderGoToFirstPage(text) {
        var additionalClassName = '';
        const {currentPage} = this.props;
        let clickPage = 1;

        if (currentPage == 1) {
            clickPage = null;
            additionalClassName += ' pagination--item-is-disabled';
        }

        return this.renderNavPage(text, clickPage, additionalClassName);
    }

    renderGoToLastPage(text) {
        const {currentPage, pagesCount} = this.props;
        let additionalClassName = '';
        let clickPage = pagesCount;

        if (currentPage == pagesCount) {
            clickPage = null;
            additionalClassName += ' pagination--item-is-disabled';
        }

        return this.renderNavPage(text, clickPage, additionalClassName);
    }

    renderGoToNextPage(text, className = '') {
        const {currentPage, pagesCount} = this.props;
        let clickPage = currentPage + 1;
        let additionalClassName = className;

        if (clickPage > pagesCount) {
            clickPage = null;
            additionalClassName += ' pagination--item-is-disabled';
        }

        return this.renderNavPage(text, clickPage, additionalClassName);
    }

    renderGoToPreviousPage(text, className = '') {
        const {currentPage} = this.props;
        let clickPage = currentPage - 1;
        let additionalClassName = className;

        if (clickPage < 1) {
            clickPage = null;
            additionalClassName += ' pagination--item-is-disabled';
        }

        return this.renderNavPage(text, clickPage, additionalClassName);
    }

    render() {
        const {pagesCount, intl} = this.props;
        let result = null;

        if (pagesCount > 1) {
            this.generateButtonsArray();
            result = (
                <div className="pagination">
                    {this.renderGoToFirstPage('&lt;&lt;')}
                    {this.renderGoToPreviousPage(intl.formatMessage(messages.prev))}

                    {this.buttons.map((item, i) => (
                        this.renderPageButton(item, i)
                    ))}

                    {this.renderGoToNextPage(intl.formatMessage(messages.next))}
                    {this.renderGoToLastPage('&gt;&gt;')}
                </div>
            );
        }

        return result;
    }


}

let messages = defineMessages({
    prev: {
        id: 'pagination.prev',
        defaultMessage: 'Prev'
    },
    next: {
        id: 'pagination.next',
        defaultMessage: 'Next'
    }
})

export default injectIntl(Pagination);
