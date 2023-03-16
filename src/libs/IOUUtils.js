import _ from 'underscore';
import CONST from '../CONST';

const currencyDigitsData = {"ADP":0,"AFN":0,"ALL":0,"AMD":2,"BHD":3,"BIF":0,"BYN":2,"BYR":0,"CAD":2,"CHF":2,"CLF":4,"CLP":0,"COP":2,"CRC":2,"CZK":2,"DEFAULT":2,"DJF":0,"DKK":2,"ESP":0,"GNF":0,"GYD":2,"HUF":2,"IDR":2,"IQD":0,"IRR":0,"ISK":0,"ITL":0,"JOD":3,"JPY":0,"KMF":0,"KPW":0,"KRW":0,"KWD":3,"LAK":0,"LBP":0,"LUF":0,"LYD":3,"MGA":0,"MGF":0,"MMK":0,"MNT":2,"MRO":0,"MUR":2,"NOK":2,"OMR":3,"PKR":2,"PYG":0,"RSD":0,"RWF":0,"SEK":2,"SLL":0,"SOS":0,"STD":0,"SYP":0,"TMM":0,"TND":3,"TRL":0,"TWD":2,"TZS":2,"UGX":0,"UYI":0,"UYW":4,"UZS":2,"VEF":2,"VND":0,"VUV":0,"XAF":0,"XOF":0,"XPF":0,"YER":0,"ZMK":0,"ZWD":0}

function getCurrencyUnits(currency) {
    return 10 ** currencyDigitsData[currency];
}

/**
 * Calculates the amount per user given a list of participants
 * @param {Array} participants - List of logins for the participants in the chat. It should not include the current user's login.
 * @param {Number} total - IOU total amount
 * @param {Boolean} isDefaultUser - Whether we are calculating the amount for the current user
 * @returns {Number}
 */
function calculateAmount(participants, total, currency, isDefaultUser = false) {
    console.('currency', currency);

    // Convert to cents before working with iouAmount to avoid
    // javascript subtraction with decimal problem -- when dealing with decimals,
    // because they are encoded as IEEE 754 floating point numbers, some of the decimal
    // numbers cannot be represented with perfect accuracy.
    // Cents is temporary and there must be support for other currencies in the future
    const iouAmount = Math.round(parseFloat(total * getCurrencyUnits(currency)));

    console.log('iouAmount', iouAmount, 'total', total);
    const totalParticipants = participants.length + 1;
    const amountPerPerson = Math.round(iouAmount / totalParticipants);

    console.log('amountPerPerson', amountPerPerson);

    if (!isDefaultUser) {
        return amountPerPerson;
    }

    const sumAmount = amountPerPerson * totalParticipants;
    const difference = iouAmount - sumAmount;

    console.log('difference', difference);

    return iouAmount !== sumAmount ? (amountPerPerson + difference) : amountPerPerson;
}

/**
 * The owner of the IOU report is the account who is owed money and the manager is the one who owes money!
 * In case the owner/manager swap, we need to update the owner of the IOU report and the report total, since it is always positive.
 * For example: if user1 owes user2 $10, then we have: {ownerEmail: user2, managerEmail: user1, total: $10 (a positive amount, owed to user2)}
 * If user1 requests $17 from user2, then we have: {ownerEmail: user1, managerEmail: user2, total: $7 (still a positive amount, but now owed to user1)}
 *
 * @param {Object} iouReport
 * @param {String} actorEmail
 * @param {Number} amount
 * @param {String} currency
 * @param {String} type
 * @returns {Object}
 */
function updateIOUOwnerAndTotal(iouReport, actorEmail, amount, currency, type = CONST.IOU.REPORT_ACTION_TYPE.CREATE) {
    if (currency !== iouReport.currency) {
        return iouReport;
    }

    const iouReportUpdate = {...iouReport};

    if (actorEmail === iouReport.ownerEmail) {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL ? -amount : amount;
    } else {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL ? amount : -amount;
    }

    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        iouReportUpdate.ownerEmail = iouReport.managerEmail;
        iouReportUpdate.managerEmail = iouReport.ownerEmail;
        iouReportUpdate.total = -iouReportUpdate.total;
    }

    iouReportUpdate.hasOutstandingIOU = iouReportUpdate.total !== 0;

    return iouReportUpdate;
}

/**
 * Returns the list of IOU actions depending on the type and whether or not they are pending.
 * Used below so that we can decide if an IOU report is pending currency conversion.
 *
 * @param {Array} reportActions
 * @param {Object} iouReport
 * @param {String} type - iouReportAction type. Can be oneOf(create, decline, cancel, pay, split)
 * @param {String} pendingAction
 * @param {Boolean} filterRequestsInDifferentCurrency
 *
 * @returns {Array}
 */
function getIOUReportActions(reportActions, iouReport, type = '', pendingAction = '', filterRequestsInDifferentCurrency = false) {
    return _.chain(reportActions)
        .filter(action => action.originalMessage
            && action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU
            && (!_.isEmpty(type) ? action.originalMessage.type === type : true))
        .filter(action => action.originalMessage.IOUReportID.toString() === iouReport.reportID.toString())
        .filter(action => (!_.isEmpty(pendingAction) ? action.pendingAction === pendingAction : true))
        .filter(action => (filterRequestsInDifferentCurrency ? action.originalMessage.currency !== iouReport.currency : true))
        .value();
}

/**
 * Returns whether or not an IOU report contains money requests in a different currency
 * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
 *
 * @param {Array} reportActions
 * @param {Object} iouReport
 *
 * @returns {Boolean}
 */
function isIOUReportPendingCurrencyConversion(reportActions, iouReport) {
    // Pending money requests that are in a different currency
    const pendingRequestsInDifferentCurrency = _.chain(getIOUReportActions(
        reportActions,
        iouReport,
        CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        true,
    )).map(action => action.originalMessage.IOUTransactionID)
        .sort()
        .value();

    // Pending cancelled money requests that are in a different currency
    const pendingCancelledRequestsInDifferentCurrency = _.chain(getIOUReportActions(
        reportActions,
        iouReport,
        CONST.IOU.REPORT_ACTION_TYPE.CANCEL,
        CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        true,
    )).map(action => action.originalMessage.IOUTransactionID)
        .sort()
        .value();

    const hasPendingRequests = Boolean(pendingRequestsInDifferentCurrency.length || pendingCancelledRequestsInDifferentCurrency.length);

    // If we have pending money requests made offline, check if all of them have been cancelled offline
    // In order to do that, we can grab transactionIDs of all the created and cancelled money requests and check if they're identical
    if (hasPendingRequests && _.isEqual(pendingRequestsInDifferentCurrency, pendingCancelledRequestsInDifferentCurrency)) {
        return false;
    }

    // Not all requests made offline had been cancelled,
    // simply return if we have any pending created or cancelled requests
    return hasPendingRequests;
}

export {
    calculateAmount,
    updateIOUOwnerAndTotal,
    getIOUReportActions,
    isIOUReportPendingCurrencyConversion,
    getCurrencyUnits,
};
