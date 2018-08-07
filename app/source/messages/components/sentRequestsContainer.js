/**
 * Created by Mike on 10/17/2017.
 */

'use strict';

import React from 'react';
import {connect} from 'react-redux';
import ConversationContainer from '../conversation/components/conversationContainer';
import {withComponentExtended} from '../../hoc';

class SentRequestsContainer extends React.Component {
     render() {
        return <div>
           List of sent requests
        </div>
    }
}

const mapStateToProps = (state, props) => {
    return {
        match: props.match,
    }
}

const mapDispatchToProps = {}

const routes = [
    {
        id: ConversationContainer.id,
        absolutePath: `/messages/:type/:data`,
        componentLoader: ConversationContainer
    }
]

export default withComponentExtended('sentRequests', routes, null, null, false)(connect(mapStateToProps, mapDispatchToProps)(SentRequestsContainer));