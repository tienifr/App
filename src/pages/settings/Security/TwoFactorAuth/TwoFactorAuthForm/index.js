import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

function TwoFactorAuthForm(props) {
    return <BaseTwoFactorAuthForm ref={props.innerRef} autoComplete="one-time-code" />;
}

TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm