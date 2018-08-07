/**
 * Created by Mike on 9/25/2017.
 */

'use strict';

import React from 'react';
import PlacesAutocomplete from '../../autocomplete/components/placesAutocomplete';
import {defineMessages, injectIntl} from 'react-intl';
import LoadButton from '../../button/components/loadButton';

class PrimarySearch extends React.Component {
    onPrimarySearchKeyDown = (e) => {
        let {onSearch} = this.props;

        let keyCode = e.keyCode;

        switch (keyCode) {
            case 13: { //Enter
                onSearch();
                break;
            }
        }
    }

    render() {
        let {
            className,
            searchQuery, placeText, placesSuggestions,
            onChangeSearchQuery, onClearSearchQuery,
            renderPlacesAutocomplete = true,
            onPlaceAutocompleteSelectedValueChanged,
            onPlaceAutocompleteHoveredValueChanged,
            onPlaceAutocompleteInputValueChanged,
            onClearAutocomplete,
            onSearch,
            loading,
            intl,
            searchPlaceholder
        } = this.props;

        return <div className={`primarySearch ${className ? className : ''}`} onKeyDown={this.onPrimarySearchKeyDown}>
            <form className="primarySearch--content" onSubmit={e => e.preventDefault()}>
                <div className="primarySearch--query">
                    <input type="text" name="searchQuery"
                           placeholder={!searchPlaceholder ? intl.formatMessage(messages.searchPlaceholder): searchPlaceholder}
                           value={searchQuery}
                           onChange={onChangeSearchQuery}/>
                    <span onClick={onClearSearchQuery}
                          className={searchQuery ? 'primarySearch--clear primarySearch--clear-is-visible' : 'primarySearch--clear'}></span>
                </div>
                {
                    renderPlacesAutocomplete &&
                    <div className="primarySearch--autocomplete">
                        <div className="primarySearch--in">{intl.formatMessage(messages.in)}</div>
                        <PlacesAutocomplete suggestions={placesSuggestions} value={placeText}
                                            placeholder={intl.formatMessage(messages.placesPlaceholder)}
                                            onSelectedValueChanged={onPlaceAutocompleteSelectedValueChanged}
                                            onHoveredValueChanged={onPlaceAutocompleteHoveredValueChanged}
                                            onInputChange={onPlaceAutocompleteInputValueChanged}/>
                        <span onClick={onClearAutocomplete}
                              className={placeText ? 'primarySearch--clear primarySearch--clear-is-visible' : 'primarySearch--clear'}></span>
                    </div>
                }
            </form>
            <LoadButton className="btn btn-primary btn-big ld-simple"
                        loaderClassName="ld-white ld-thin"
                        loading={loading}
                        onClick={onSearch}>
                {
                    !loading &&
                    [<img src="/img/icons/search.svg" alt="" key={0}/>,<span key={1}>{intl.formatMessage(messages.searchButton)}</span>]
                }
            </LoadButton>
        </div>
    }
}

const messages = defineMessages({
    searchPlaceholder: {
        id: 'primarySearch.searchPlaceholder',
        defaultMessage: 'Book title, author or genre',
    },
    in: {
        id: 'primarySearch.in',
        defaultMessage: 'in',
    },
    placesPlaceholder: {
        id: 'primarySearch.placesPlaceholder',
        defaultMessage: 'City, country',
    },
    searchButton: {
        id: 'primarySearch.searchButton',
        defaultMessage: 'Search',
    }
});

export default injectIntl(PrimarySearch);
