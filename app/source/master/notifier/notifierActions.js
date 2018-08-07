/**
 * Created by Mike on 9/26/2017.
 */

'use strict';

import reduxUtils from '../../../../utils/reduxUtils';

export const addMessage = reduxUtils.createAction('NOTIFIER_ADD_MESSAGE');
export const removeMessage = reduxUtils.createAction('NOTIFIER_REMOVE_MESSAGE');
export const markMessageAsActive = reduxUtils.createAction('NOTIFIER_MARK_AS_ACTIVE');
export const markMessageAsRemoved = reduxUtils.createAction('NOTIFIER_MARK_AS_REMOVED');