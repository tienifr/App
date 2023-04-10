import React from 'react';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import CONST from '../CONST';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import Clipboard from '../libs/Clipboard';
import SelectionScraper from '../libs/SelectionScraper';

class CopySelectionHelper extends React.Component {
    componentDidMount() {
        const copyShortcutConfig = CONST.KEYBOARD_SHORTCUTS.COPY;
        this.unsubscribeCopyShortcut = KeyboardShortcut.subscribe(
            copyShortcutConfig.shortcutKey,
            this.copySelectionToClipboard,
            copyShortcutConfig.descriptionKey,
            copyShortcutConfig.modifiers,
            false,
        );
    }

    componentWillUnmount() {
        if (!this.unsubscribeCopyShortcut) {
            return;
        }

        this.unsubscribeCopyShortcut();
    }

    copySelectionToClipboard() {
        const selection = SelectionScraper.getCurrentSelection();
        if (!selection) {
            return;
        }
        const parser = new ExpensiMark();
        if (!Clipboard.canSetHtml()) {
            console.log('selection', selection);
            Clipboard.setString(parser.htmlToMarkdown(selection));
            return;
        }

        console.log('Str.htmlDecode(parser.htmlToText(selection))', Str.htmlDecode(parser.htmlToText(selection)));
        console.log('selection', selection);
        Clipboard.setHtml(selection, Str.htmlDecode(parser.htmlToText(selection)));
    }

    render() {
        return null;
    }
}

export default CopySelectionHelper;
