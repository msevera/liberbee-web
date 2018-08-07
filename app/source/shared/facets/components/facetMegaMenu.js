/**
 * Created by Mike on 9/4/2017.
 */

'use strict';

import React from 'react';

class FacetMegaMenu extends React.Component {

    constructor(props) {
        super();

        let selectedPath = [];
        this.buildSelectedPath(props.facet, selectedPath);
        selectedPath = selectedPath.reverse();

        this.state = {
            selectedPath,
            hoveredPath: selectedPath.slice()
        }

    }

    componentWillReceiveProps(nextProps) {
        let selectedPath = [];
        this.buildSelectedPath(nextProps.facet, selectedPath);
        selectedPath = selectedPath.reverse();

        this.setState({
            selectedPath,
            hoveredPath: selectedPath.slice()
        })
    }

    buildSelectedPath(facet, result) {

        if (facet.selected) {
            return true;
        }

        if (facet.values && facet.values.length > 0) {
            let selectedFacetFound = facet.values.find((facetItem) => {
                return this.buildSelectedPath(facetItem, result);
            })

            if (selectedFacetFound) {
                result.push(selectedFacetFound.key);
                return true;
            }
        }
    }

    onSelectedFacetChanged = (e, facetItem, nestedLvl) => {
        let {onSelectedFacetChanged, facet} = this.props;
        let {selectedPath} = this.state;

        selectedPath.splice(nestedLvl, selectedPath.length, facetItem.key);

        this.setState({
            selectedPath,
            hoveredPath: selectedPath.slice()
        })

        onSelectedFacetChanged(facet, facetItem);
        e.preventDefault();
    }

    onHoverFacetChanged = (e, facetItem, nestedLvl) => {
        /*let {hoveredPath} = this.state;

         let newHoveredPath = hoveredPath.slice();
         newHoveredPath.splice(nestedLvl, hoveredPath.length, facetItem.key);

         this.setState({
         hoveredPath: newHoveredPath
         })

         e.preventDefault();*/
    }

    getSelected() {
        let {selectedPath} = this.state;

        return selectedPath[selectedPath.length - 1];
    }

    buildFacetColumns(facets) {
        let columns = [];
        this.buildFacetLevel(facets, 0, columns)
        return columns;
    }

    buildFacetLevel(facetItem, nestedLvl, columns, columnsVisible) {
        let {hoveredPath} = this.state;

        let items = [];
        let itemHovered = false;

        facetItem.values && facetItem.values.forEach((facetItem) => {
            itemHovered = itemHovered || hoveredPath.includes(facetItem.key);
            let selectedCss = this.getSelected() == facetItem.key ? ' facet--item-is-selected' : '';
            let hoveredCss = hoveredPath.includes(facetItem.key) ? ' facet--item-is-hovered' : '';

            items.push(<li key={facetItem.key} className={'facet--item' + selectedCss + hoveredCss}
                           onMouseEnter={(e) => this.onHoverFacetChanged(e, facetItem, nestedLvl)}
                           onClick={(e) => this.onSelectedFacetChanged(e, facetItem, nestedLvl)}>
                {facetItem.text}
            </li>);
        })

        if (items.length > 0) {
            let visibleCss = nestedLvl == 0 || columnsVisible || itemHovered ? ' facet--items' : '';
            let list = <ul key={facetItem.key} className={visibleCss}>{items}</ul>;

            if (!columns[nestedLvl]) {
                columns[nestedLvl] = {
                    visible: false,
                    elements: []
                };
            }

            columns[nestedLvl].visible = nestedLvl == 0 || columns[nestedLvl].visible || columnsVisible || itemHovered;
            columns[nestedLvl].elements.push(list);
        }

        facetItem.values && facetItem.values.forEach((facetItem) => {
            let nextColumnVisible = hoveredPath.includes(facetItem.key);
            this.buildFacetLevel(facetItem, nestedLvl + 1, columns, nextColumnVisible)
        })

    }

    render() {
        let {facet, columnsTitles} = this.props;
        let facetColumns = this.buildFacetColumns(facet);

        return <div className="facet facet-megaMenu">
            {
                facetColumns.map((col, idx) => {
                    let visibleCss = col.visible ? ' facet--column-is-visible' : '';
                    return <div key={idx} className={'facet--column' + visibleCss + (' facet--column' + idx)}>
                        <div className="facet--columnTitle">{columnsTitles[idx]}</div>
                        {col.elements}
                    </div>
                })
            }
        </div>
    }
}

export default FacetMegaMenu;