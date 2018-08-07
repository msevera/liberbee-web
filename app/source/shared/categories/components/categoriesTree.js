'use strict';

import React from 'react';
import {injectIntl, defineMessages} from 'react-intl';
import {withTools} from '../../../hoc';

class CategoriesTree extends React.Component {
    constructor() {
        super();

        this.state = {
            expanded: [],
            selectedId: null,
            selectedPath: []
        }
    }

    setSelectionState(categoryId, categories, expanded, expandOnlySelectedCategory=false) {
        let {onOnlySelectedCategoryPathExpanded} = this.props;
        let selectedPath = [];
        this.getPathIds(categoryId, categories, selectedPath);

        let newState = {
            selectedPath: selectedPath,
            selectedId: categoryId,
        }

        if (expandOnlySelectedCategory)
        {
            newState.expanded = selectedPath;
            if (onOnlySelectedCategoryPathExpanded && categories.length > 0){
                onOnlySelectedCategoryPathExpanded();
            }
        }else{
            newState.expanded = expanded
        }

        this.setState(newState);
    }

    componentWillReceiveProps(nextProps) {
        let {expandOnlySelectedCategory} = nextProps;


        expandOnlySelectedCategory && this.setSelectionState(nextProps.selectedCategoryId, nextProps.categories, this.state.expanded, expandOnlySelectedCategory);
    }

    onSelectedCategoryChanged = (e, category) => {
        e.preventDefault();

        let {onSelectedCategoryChanged, categories} = this.props;
        let {expanded} = this.state;

        let foundExpanded = expanded.find(ex => ex == category._id);

        let newExpanded = [...expanded];
        if (foundExpanded) {
            newExpanded = newExpanded.filter(ex => ex != foundExpanded);
        } else {
            newExpanded.push(category._id);
        }

        this.setSelectionState(category._id, categories, newExpanded);

        if (onSelectedCategoryChanged) {
            onSelectedCategoryChanged(category);
        }
    }

    getPathIds(categoryId, categories, result) {
        if (!categories.length)
            return;

        let foundCategory = categories.find(cat => cat._id == categoryId);
        if (foundCategory && foundCategory.parent) {
            result.push(foundCategory.parent);
            this.getPathIds(foundCategory.parent, categories, result)
        }
    }

    buildCategoryItem(category, level) {
        let {selectedPath, selectedId} = this.state;

        return <li key={category._id} className={`categoriesTree--item
            ${selectedPath.includes(category._id) ? 'categoriesTree--item-is-hovered' : ''}
            ${selectedId == category._id ? 'categoriesTree--item-is-selected' : ''}`}>
            {
                [<span onClick={(e) => this.onSelectedCategoryChanged(e, category)}>
                                        {category.name}
                                    </span>,
                    this.buildBranch(category, level)]
            }
        </li>
    }

    buildBranch(category, level) {
        let {categories} = this.props;
        let {expanded} = this.state;

        let foundCategories = categories.filter(cat => cat.parent == category._id);
        if (foundCategories.length > 0) {
            return <ul
                className={`categoriesTree--lvl${level} ${expanded.includes(category._id) ? 'categoriesTree--expanded' : ''}`}>
                {
                    foundCategories.map((cat) => {
                        return this.buildCategoryItem(cat, level++);
                    })
                }
            </ul>
        }
    }

    buildCategories() {
        let {categories} = this.props;

        let roots = categories.filter(cat => !cat.parent);
        return roots.map((cat) => {
            return this.buildCategoryItem(cat, 1);
        })
    }

    render() {
        return <ul className="categoriesTree">
            {
                this.buildCategories()
            }
        </ul>
    }
}

export default withTools(injectIntl(CategoriesTree));