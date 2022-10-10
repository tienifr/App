/**
 * Estimate error password should be show in set password page
 *
 * @param {Event} event
 * @returns {Boolean}
 */
export default function didClickOutsideInputField(event) {
    return (!event.relatedTarget || event.currentTarget.parentElement !== event.relatedTarget.parentElement);
}
