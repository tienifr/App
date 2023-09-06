import {useContext} from 'react';
import SplashScreenHiddenContext from './SplashScreenHiddenContext';

function useSplashHiddenContext() {
    const context = useContext(SplashScreenHiddenContext);
    if (context === undefined) {
        throw new Error('useSplashHiddenContext must be used within an SplashHiddenContextProvider');
    }
    return context;
}

export default useSplashHiddenContext;
