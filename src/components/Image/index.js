import React from 'react';
import {Image as RNImage} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import {defaultProps, imagePropTypes} from './imagePropTypes';
import RESIZE_MODES from './resizeModes';

class Image extends React.Component {
    constructor(props) {
        super(props);

        this.debouncedConfigureImageSource = _.debounce(this.configureImageSource, 220);

        this.state = {
            imageSource: undefined,
        };
    }

    componentDidMount() {
        this.debouncedConfigureImageSource();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.source === this.props.source) {
            return;
        }

        this.setState({
            imageSource: this.getImageSource(),
        });
        this.configureOnLoad();
    }

    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     * @returns {Object} - the configured image source
     */
    getImageSource() {
        const source = this.props.source;
        let imageSource = source;
        if (this.props.isAuthTokenRequired) {
            // There is currently a `react-native-web` bug preventing the authToken being passed
            // in the headers of the image request so the authToken is added as a query param.
            // On native the authToken IS passed in the image request headers
            const authToken = lodashGet(this.props, 'session.encryptedAuthToken', null);
            imageSource = {uri: `${source.uri}?encryptedAuthToken=${encodeURIComponent(authToken)}`};
        }

        return imageSource;
    }

    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source. The natural image dimensions can then be retrieved using this source
     * and as a result the `onLoad` event needs to be maunually invoked to return these dimensions
     */
    configureImageSource() {
        this.props.onLoadStart();
        const imageSource = this.state.imageSource;
                // If an onLoad callback was specified then manually call it and pass
        // the natural image dimensions to match the native API
        if (this.props.onLoad == null) {
            return;
        }

        RNImage.getSize(imageSource.uri, (width, height) => {
            this.props.onLoad({nativeEvent: {width, height}});
        });
    }


    render() {
        // Omit the props which the underlying RNImage won't use
        const forwardedProps = _.omit(this.props, ['source', 'onLoad', 'session', 'isAuthTokenRequired']);
        const source = this.getImageSource();

        if (this.props.shouldLog) {
            console.log('uri', this.props.source);
            console.log('rest source', this.state.imageSource);
            console.log('rest defaultSource', rest.defaultSource);
        }

        // eslint-disable-next-line react/jsx-props-no-spreading
        return <RNImage {...forwardedProps} source={source} />;
    }
}

Image.propTypes = imagePropTypes;
Image.defaultProps = defaultProps;

const ImageWithOnyx = withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);
ImageWithOnyx.resizeMode = RESIZE_MODES;
export default ImageWithOnyx;
