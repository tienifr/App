import React from 'react';
import CONST from '../../../../CONST';
import BasePaymentsPage from './BasePaymentsPage';

const PaymentsPage = () => (
    <BasePaymentsPage shouldListenForResize positionOfMethodMenu={CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM} />
);

PaymentsPage.displayName = 'PaymentsPage';

export default PaymentsPage;
