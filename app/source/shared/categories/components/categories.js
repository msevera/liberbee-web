/**
 * Created by Mike on 9/4/2017.
 */

'use strict';

import React from 'react';
import {injectIntl, defineMessages} from 'react-intl';
import {withTools} from '../../../hoc';
import {Link} from 'react-router-dom';

class Categories extends React.Component {
    onSelectedCategoryChanged = (category) => {
        let {onSelectedCategoryChanged} = this.props;
        onSelectedCategoryChanged(category);
    }

    buildLink(category) {
        let {query, place, sort, lang, routeResolver} = this.props;
        let queryStringObj = {};

        query && (queryStringObj.q = query)
        lang && (queryStringObj.lang = lang)
        sort && (queryStringObj.sort = sort)
        place && place.slug && (queryStringObj.place = place.slug)

        let paramsObj = {};
        if (category) {
            paramsObj.category = `books/${category}`;
        }

        let linkObj = routeResolver.buildRouteFor('index', paramsObj, {
            redirect: true,
            reload: true,
            query: queryStringObj
        })

        return linkObj;
    }

    buildTopLink() {
        return this.buildLink();
    }

    render() {
        let {categories, ancestors, intl} = this.props;
        let isTopSelected = categories.every(c => !c.selected) && ancestors.every(c => !c.selected);


        return <div className="categories">
            {
                ancestors.length == 0 &&
                <div className="categories--header">
                    {
                        intl.formatMessage(messages.header)
                    }
                </div>
            }
            <div
                className={`categories--content ${ancestors.length > 0 ? `categories--content-lvl-${ancestors.length}` : ''}`}>
                {
                    ancestors && ancestors.length > 0 &&
                    <div className={`categories--top categories--item ${isTopSelected ?  'categories--item-is-loading' : ''}`}>
                        <Link to={this.buildTopLink()} onClick={this.onSelectedCategoryChanged}>
                            {intl.formatMessage(messages.gotoTop)}
                            <div className="ld ld-ring ld-cycle ld-small"></div>
                        </Link>
                    </div>
                }
                {
                    ancestors && ancestors.length > 0 &&
                    <ul className="categories--ancestors">
                        {
                            ancestors.map((ancestor, index) => {
                                return <li key={ancestor.slug}
                                    className={`categories--ancestor categories--ancestor${index} categories--item ${ancestor.loading ? 'categories--item-is-loading' : ''} ${ancestor.selected ? 'categories--ancestor-is-selected' : ''} ${index == ancestors.length - 1 ? 'categories--ancestor-is-active' : ''}`}>
                                    <Link
                                        onClick={() => this.onSelectedCategoryChanged(ancestor.slug)}
                                        to={this.buildLink(ancestor.slug)} title={ancestor.name}>
                                        {ancestor.name}
                                        <div className="ld ld-ring ld-cycle ld-small"></div>
                                    </Link>
                                </li>
                            })
                        }
                    </ul>
                }
                <ul className="categories--items">
                    {
                        categories.map((category) => {
                            return <li
                                className={`categories--item ${category.loading ? 'categories--item-is-loading' : ''} ${category.selected ? 'categories--item-is-selected' : ''}`}
                                key={category.slug}>
                                <Link
                                    onClick={() => this.onSelectedCategoryChanged(category.slug)}
                                    to={this.buildLink(category.slug)}
                                    title={category.name}>
                                    {category.name}
                                    <div className="ld ld-ring ld-cycle ld-small"></div>
                                </Link>
                            </li>
                        })
                    }
                </ul>
            </div>
        </div>
    }
}

const messages = defineMessages({
    header: {
        id: 'categories.header',
        defaultMessage: 'Categories'
    },
    gotoTop: {
        id: 'categories.gotoTop',
        defaultMessage: 'Go to top'
    }
})

export default withTools(injectIntl(Categories));