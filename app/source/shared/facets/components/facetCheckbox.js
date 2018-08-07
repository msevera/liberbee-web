/**
 * Created by Mike on 9/4/2017.
 */

'use strict';

import React from 'react';
import {injectIntl} from 'react-intl';

class FacetCheckbox extends React.Component {
    onSelectedFacetChanged = (facet, facetItem, e) => {
        let {onSelectedFacetChanged} = this.props;
        onSelectedFacetChanged(facet, facetItem);
        e.preventDefault();
    }

    buildTitle(facetItem) {
        let {mapKeysToTitles} = this.props;


        if (facetItem.text)
            return facetItem.text;

        if (!mapKeysToTitles || mapKeysToTitles.length == 0)
            return facetItem.key;

        let res = mapKeysToTitles.find((mapItem) => {
            return mapItem.key == facetItem.key;
        })

        if (!res)
            return facetItem.key;

        return res.title;
    }

    render() {
        let {facet, className, intl} = this.props;

        return <ul className={'facet' + (className ? ' ' + className : '')}>
            {
                facet.values.map((facetItem) => {
                    return <li key={facetItem.key}
                               onClick={(e) => this.onSelectedFacetChanged(facet, facetItem, e)}>
                        <input type="checkbox" id={facetItem.key} checked={facetItem.selected} name={facetItem.key}
                               readOnly/>
                        <label htmlFor={facetItem.key} title={this.buildTitle(facetItem.key)}>
                            <span className="facet--text">
                                <span>{this.buildTitle(facetItem)}</span>
                                {
                                    typeof facetItem.count != 'undefined' &&
                                    <span className="facet--count">{intl.formatNumber(facetItem.count)}</span>
                                }
                            </span>
                        </label>

                    </li>
                })
            }
        </ul>
    }
}

export default injectIntl(FacetCheckbox);