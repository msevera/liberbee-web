/**
 * Created by Mike on 9/10/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {userLocationGeoAutocompleteAction, userLocationGeoSetLocationAction} from '../../masterActions'
import PlacesAutocomplete from '../../../shared/autocomplete/components/placesAutocomplete';
import {injectIntl, defineMessages} from 'react-intl';

class SetUserLocationContainer extends React.Component {
    constructor() {
        super();

        this.state = {
            place: ''
        }
    }

    onPlaceAutocomplete = (value) => {
        let {userLocationGeoAutocompleteAction} = this.props;

        this.setState({
            place: value
        })

        userLocationGeoAutocompleteAction(value);
    }

    onPlaceAutocompleteSelectedValueChanged = (data) => {
        let {userLocationGeoSetLocationAction} = this.props;
        if (data) {
            userLocationGeoSetLocationAction(data);
        }
    }

    render() {
        let {userLocation, intl} = this.props;
        let {place} = this.state;

        return <form onSubmit={e => e.preventDefault()}><PlacesAutocomplete
            placeholder={intl.formatMessage(messages.city)}
            inputClassName="txt"
            suggestions={userLocation.autocomplete.suggestions}
            value={place}
            onInputChange={this.onPlaceAutocomplete}
            onSelectedValueChanged={this.onPlaceAutocompleteSelectedValueChanged}/></form>
    }
}

const messages = defineMessages({
    city: {
        id: 'setUserLocation.city',
        defaultMessage: 'City name'
    }
})

const mapStateToProps = (state) => {
    return {
        actions: state.master.general.actions,
        userGeoCompleted: state.master.general.userGeoCompleted,
        userLocation: state.master.general.userLocation,
        emailConfirmed: state.master.general.emailConfirmed,
        user: state.master.user
    }
}

const mapDispatchToProps = {
    userLocationGeoAutocompleteAction,
    userLocationGeoSetLocationAction,
}


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SetUserLocationContainer));