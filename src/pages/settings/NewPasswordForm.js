import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../components/Text';
import withLocalize, {
    withLocalizePropTypes,
} from '../../components/withLocalize';
import styles from '../../styles/styles';
import TextInput from '../../components/TextInput';
import * as ComponentUtils from '../../libs/ComponentUtils';

const propTypes = {
    /** String to control the first password box in the form */
    password: PropTypes.string.isRequired,

    /** Function to update the first password box in the form */
    updatePassword: PropTypes.func.isRequired,

    /** Callback function for when form is submitted  */
    onSubmitEditing: PropTypes.func.isRequired,

    /** Boolean to show the error */
    shouldShowPasswordError: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

class NewPasswordForm extends React.PureComponent {
    render() {
        return (
            <View style={styles.mb6}>
                <TextInput
                    autoFocus
                    label={`${this.props.translate('setPasswordPage.enterPassword')}`}
                    secureTextEntry
                    autoComplete={ComponentUtils.NEW_PASSWORD_AUTOCOMPLETE_TYPE}
                    textContentType="newPassword"
                    value={this.props.password}
                    onChangeText={password => this.props.updatePassword(password)}
                    onSubmitEditing={() => this.props.onSubmitEditing()}
                />
                <Text
                    style={[
                        styles.formHelp,
                        styles.mt1,
                        this.props.shouldShowPasswordError && styles.formError,
                    ]}
                >
                    {this.props.translate('setPasswordPage.newPasswordPrompt')}
                </Text>
            </View>
        );
    }
}

NewPasswordForm.propTypes = propTypes;

export default withLocalize(NewPasswordForm);
