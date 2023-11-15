import {useTabAnimation} from '@react-navigation/material-top-tabs';
import PropTypes from 'prop-types';
import * as React from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import refPropTypes from './refPropTypes';

const propTypes = {
    /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
     * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
    forwardedRef: refPropTypes,

    /* Whether we're in a tab navigator */
    isInTabNavigator: PropTypes.bool.isRequired,
};

const defaultProps = {
    forwardedRef: () => {},
};

export default function (WrappedComponent) {
    // The component with tab animation prop
    const WrappedComponentWithTabAnimation = React.forwardRef((props, ref) => {
        const animation = useTabAnimation();

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                tabAnimation={animation}
                ref={ref}
            />
        );
    })

    WrappedComponentWithTabAnimation.displayName = `withAnimation(${getComponentDisplayName(WrappedComponent)})`;

    // Return a component with tab animation prop if this component is in tab navigator, otherwise return itself
    const WithTabAnimation = React.forwardRef((props, ref) => {
        if (props.isInTabNavigator) {
            return (
                <WrappedComponentWithTabAnimation
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            );
        }
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
            />
        );
    });

    WithTabAnimation.propTypes = propTypes;
    WithTabAnimation.defaultProps = defaultProps;
    WithTabAnimation.displayName = `withTabAnimation(${getComponentDisplayName(WrappedComponent)})`;

    return WithTabAnimation;
}
