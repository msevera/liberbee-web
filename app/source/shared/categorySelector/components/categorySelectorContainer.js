'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, FormattedMessage, FormattedNumber, defineMessages} from 'react-intl';
import Popup from '../../popup/components/popup';
import {messages as formMessages} from "../../form/messages";
import {messages as validationMessages} from "../../validation/messages";
import {hideSelectCategoryPopupAction} from '../categorySelectorActions';
import {messages as masterMessages} from '../../../master/masterMessages';
import CategoriesTree from '../../categories/components/categoriesTree';

class CategorySelectorContainer extends React.Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor(props) {
        super();

        this.state = {
            filteredCategories: props.categories,
            filterFieldValue: '',
            selectedCategory: null,
            selectedCategoryId: null,
            expandOnlySelectedCategory: true,
        }
    }

    componentWillReceiveProps(nextProps) {
        let selectedCategory = nextProps.categories.find(cat => cat._id == nextProps.selectedCategoryId);

        this.setState({
            filteredCategories: nextProps.categories,
            selectedCategoryId: nextProps.selectedCategoryId,
            selectedCategory
        })
    }

    onPopupClose = () => {
        let {hideSelectCategoryPopupAction} = this.props;
        hideSelectCategoryPopupAction();

        setTimeout(() => {
            this.setState({
                expandOnlySelectedCategory: true
            })
        }, 300)
    }

    onPopupConfirm = () => {
        let {onSelectCategory, hideSelectCategoryPopupAction} = this.props;
        let {selectedCategory} = this.state;
        onSelectCategory(selectedCategory);

        hideSelectCategoryPopupAction();
    }

    onFilterInputChangeHandler = (e) => {
        let value = e.target.value;
        let categories = this.filterCategories(value);

        this.setState({
            filteredCategories: categories,
            filterFieldValue: value
        })

    }

    filterCategories(query) {
        let {categories} = this.props;
        let foundCategories = categories.filter(cat => cat.name.toLowerCase().includes(query.toLowerCase()));

        let results = new Map()
        foundCategories.forEach((cat) => {
            if (!results.has(cat._id)) {
                results.set(cat._id, cat)
            }

            if (cat.parent != null && !results.has(cat.parent)) {
                let parentCat = categories.find(c => c._id == cat.parent);
                results.set(parentCat._id, parentCat)
            }
        })

        return Array.from(results.values());
    }

    onSelectedCategoryChangedHandler = (category) => {
        this.setState({
            selectedCategory: category,
            selectedCategoryId: category._id
        });
    }

    render() {
        let {intl, show} = this.props;
        let {filteredCategories, filterFieldValue, selectedCategoryId, expandOnlySelectedCategory} = this.state;

        return <Popup show={show} id="categorySelectorPopup"
                      title={intl.formatMessage(messages.selectTitle)}
                      confirmAction={this.onPopupConfirm}
                      confirmActionText={intl.formatMessage(messages.select)}
                      cancelAction={this.onPopupClose}
                      cancelActionText={intl.formatMessage(masterMessages.cancel)}
                      onPopupClose={this.onPopupClose}>


            <div className="mb-3">
                <input type="text" className="txt" id="categorySelectorFilter"
                       onChange={this.onFilterInputChangeHandler}
                       value={filterFieldValue}
                       placeholder={intl.formatMessage(formMessages.categoriesFilterPlaceholder)}/>
            </div>
            <CategoriesTree categories={filteredCategories}
                            selectedCategoryId={selectedCategoryId}
                            expandOnlySelectedCategory={expandOnlySelectedCategory}
                            onOnlySelectedCategoryPathExpanded={() => {
                                this.setState({
                                    expandOnlySelectedCategory: false
                                })
                            }}
                            onSelectedCategoryChanged={this.onSelectedCategoryChangedHandler}/>


        </Popup>
    }
}

const messages = defineMessages({
    selectTitle: {
        id: 'categorySelector.selectTitle',
        defaultMessage: 'Select category'
    },
    select: {
        id: 'categorySelector.select',
        defaultMessage: 'Select'
    }
})

const mapStateToProps = (state, props) => {
    return {
        show: state.master.categorySelector.general.show,
        loading: state.master.categorySelector.general.loading,
        categories: state.master.categorySelector.general.categories,
        init: state.master.categorySelector.general.init
    }
}

const mapDispatchToProps = {
    hideSelectCategoryPopupAction
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(CategorySelectorContainer));