/**
 * Created by Mike on 9/25/2017.
 */

'use strict';

import React from 'react';
import Dropzone from 'react-dropzone';
import {injectIntl, defineMessages} from 'react-intl';
import commonUtils from '../../../../../utils/commonUtils';

class CoverUpload extends React.Component {
    render() {
        let {disabled, src, onRemoveCover, onDropAccepted, intl} = this.props;

        return <div className="d-flex align-items-center flex-column">
            <Dropzone
                disabled={disabled}
                className={'coverUpload' + (!src ? ' coverUpload-empty' : '') + (disabled ? ' coverUpload-disabled' : '')}
                activeClassName="coverUpload-active" multiple={false}
                onDropAccepted={onDropAccepted}
                accept="image/jpeg, image/png"
            >
                {src ?
                    <div className="coverUpload--img">
                        <img src={src}
                             alt="Book cover"/>
                        {
                            !disabled &&
                            <div className="coverUpload--change">
                                <div className="coverUpload--changeBg"></div>
                                <div className="coverUpload--changeAction">
                                    {intl.formatMessage(messages.changeCover)}
                                </div>
                            </div>
                        }

                    </div> :
                    !disabled ?
                        <div>
                            <div className="coverUpload--drag"></div>
                            <div className="coverUpload--text">{intl.formatMessage(messages.dragNDrop)}</div>
                            <div className="coverUpload--maxSize">({intl.formatMessage(messages.maxSize)})</div>
                            <div className="coverUpload--uploadAction">
                                <div
                                    className="btn btn-primary btn-noShadow btn-small">{intl.formatMessage(messages.browse)}</div>
                            </div>
                        </div> :
                        'Empty cover'}
            </Dropzone>
            {
                (src && !disabled) &&
                <button className="btn btn-link btn-linkSecondary"
                        onClick={onRemoveCover}>{intl.formatMessage(messages.removeCover)}</button>
            }
        </div>
    }
}

const messages = defineMessages({
    dragNDrop: {
        id: 'coverUpload.dragNDrop',
        defaultMessage: 'Drag and drop cover here'
    },
    maxSize: {
        id: 'coverUpload.maxSize',
        defaultMessage: 'Max. 2mb'
    },
    browse: {
        id: 'coverUpload.browse',
        defaultMessage: 'Browse'
    },
    removeCover: {
        id: 'coverUpload.removeCover',
        defaultMessage: 'Remove cover'
    },
    changeCover: {
        id: 'coverUpload.changeCover',
        defaultMessage: 'Change cover'
    }
})

export default injectIntl(CoverUpload);