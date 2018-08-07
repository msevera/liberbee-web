/**
 * Created by Mike on 9/25/2017.
 */


'use strict';

import React from 'react';
import Dropzone from 'react-dropzone';
import {injectIntl, defineMessages} from 'react-intl';
import commonUtils from '../../../../../utils/commonUtils';
import Avatar from "./avatar";
import AvatarEditor from 'react-avatar-editor';
import Slider from 'react-rangeslider'


class AvatarUpload extends React.Component {
    constructor(props) {
        super();
        this.state = {
            zoom: 0,
            avatarImage: props.src,
            updated: props.updated
        }

        this.getCroppedImage = this.getCroppedImage.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            avatarImage: nextProps.src,
            updated: nextProps.updated
        })
    }

    handleZoomChange = value => {
        this.setState({
            zoom: value
        })
    };

    chooseProfilePicture = (e) => {
        let {dropzoneRef} = this.refs;
        e.preventDefault();
        dropzoneRef.open();
    }

    onDropAcceptedHandler = (acceptedFiles) => {
        let {onAvatarChanged} = this.props;
        let reader = new FileReader();
        let file = acceptedFiles[0];

        reader.onloadend = () => {
            this.setState({
                updated: true,
                avatarImage: reader.result
            })

            onAvatarChanged(reader.result);
        }

        reader.readAsDataURL(file);
    }

    getCroppedImage() {
        let {updated} = this.state;
        if (updated) {
            const canvasScaled = this.avatarEditor.getImageScaledToCanvas();
            const dataURl = canvasScaled.toDataURL();
            return dataURl;
        }
    }

    setEditorRef = (editor) => this.avatarEditor = editor;

    render() {
        let {disabled, src, intl, userName} = this.props;

        let {zoom, avatarImage, updated} = this.state;

        return <div className="avatarEditor">
            {
                updated &&
                <div className="avatarEditor--choosePicture">
                    <button className="btn btn-small btn-secondary" onClick={this.chooseProfilePicture}>
                        {intl.formatMessage(messages.changeAvatar)}
                    </button>
                </div>
            }
            <Dropzone
                ref="dropzoneRef"
                disabled={disabled}
                className="avatarEditor--dropZone"
                multiple={false}
                disableClick={!!updated}
                onDropAccepted={this.onDropAcceptedHandler}
                accept="image/jpeg, image/png"
            >
                {
                    updated ? <div>
                            <AvatarEditor
                                ref={this.setEditorRef}
                                disableDrop={true}
                                image={avatarImage}
                                width={150}
                                height={150}
                                border={50}
                                color={[255, 255, 255, 0.6]} // RGBA
                                scale={zoom / 100 + 1}
                                borderRadius={150}
                                rotate={0}
                            />
                        </div> :
                        <div className="avatarEditor--img">
                            <Avatar className="avatar-big avatar-full avatar-sm-full" name={userName} src={avatarImage}/>
                            <div className="avatarEditor--change">
                                <div
                                    className="avatarEditor--changeAction">{intl.formatMessage(messages.changeAvatar)}</div>
                                <div className="avatarEditor--changeBg"></div>
                            </div>
                        </div>
                }

            </Dropzone>
            {
                updated &&
                <div className="avatarEditor--zoomSlider">
                    <Slider
                        min={0}
                        max={200}
                        tooltip={false}
                        value={zoom}
                        onChange={this.handleZoomChange}
                    />
                </div>
            }

        </div>
    }
}

const messages = defineMessages({
    changeAvatar: {
        id: 'avatarUpload.changeAvatar',
        defaultMessage: 'Change profile picture'
    }
})

export default injectIntl(AvatarUpload, {withRef: true});