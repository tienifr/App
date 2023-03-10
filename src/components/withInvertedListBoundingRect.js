import React, {createContext} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const InvertedListBoundingRectContext = createContext(null);
const invertedListBoundingRectPropTypes = {
    boundingClientRect: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        left: PropTypes.number,
        top: PropTypes.number,
    }),
    setBoundingClientRect: PropTypes.func.isRequired,
};

const invertedListBoundingRectProviderPropTypes = {
    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

class InvertedListBoundingRectProvider extends React.Component {
    constructor(props) {
        super(props);

        this.setBoundingClientRect = this.setBoundingClientRect.bind(this);

        this.state = {
            boundingClientRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                left: 0,
                top: 0,
            },
        };
    }

    setBoundingClientRect(boundingClientRect) {
        this.setState({
            boundingClientRect,
        });
    }

    render() {
        return (
            <InvertedListBoundingRectContext.Provider value={{
                boundingClientRect: this.state.boundingClientRect,
                setBoundingClientRect: this.setBoundingClientRect,
            }}
            >
                {this.props.children}
            </InvertedListBoundingRectContext.Provider>
        );
    }
}

InvertedListBoundingRectProvider.propTypes = invertedListBoundingRectProviderPropTypes;

export default function (WrappedComponent) {
    const WithInvertedListBoundingRect = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <InvertedListBoundingRectContext.Consumer>
            {invertedListBoundingRectProps => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <WrappedComponent {...invertedListBoundingRectProps} {...props} innerRef={ref} />
            )}
        </InvertedListBoundingRectContext.Consumer>
    ));

    WithInvertedListBoundingRect.displayName = `withInvertedListBoundingRect(${getComponentDisplayName(WrappedComponent)})`;
    return WithInvertedListBoundingRect;
}

export {
    InvertedListBoundingRectProvider,
    invertedListBoundingRectPropTypes,
};
