import React, { useEffect, useState } from "react";
import _ from 'lodash';
import Tooltip from "../Tooltip";
import ReactionTooltipContent from "./ReactionTooltipContent";
import EmojiReactionBubble from "./EmojiReactionBubble";
import withCurrentUserPersonalDetails from "../withCurrentUserPersonalDetails";
import * as ReactionList from '../../pages/home/report/ReactionList/ReactionList';
import * as PersonalDetailsUtils from '../../libs/PersonalDetailsUtils';
import emojis from '../../../assets/emojis';
import getPreferredEmojiCode from './getPreferredEmojiCode';
import * as Report from '../../libs/actions/Report';
import compose from "../../libs/compose";
import { withOnyx } from "react-native-onyx";
import ONYXKEYS from "../../ONYXKEYS";

/**
 * Given an emoji object and a list of senders it will return an
 * array of emoji codes, that represents all used variations of the
 * emoji.
 * @param {{ name: string, code: string, types: string[] }} emoji
 * @param {Array} users
 * @return {string[]}
 * */
const getUniqueEmojiCodes = (emoji, users) => {
    const emojiCodes = [];
    _.forEach(users, (user) => {
        const emojiCode = getPreferredEmojiCode(emoji, user.skinTone);

        if (emojiCode && !emojiCodes.includes(emojiCode)) {
            emojiCodes.push(emojiCode);
        }
    });
    return emojiCodes;
};

const ReactionItem =  (props) => {
    const [open,setOpen]=useState(false);
    const {reaction, toggleReaction, popoverReactionListAnchor} = props
    const reactionCount = reaction.users.length;
    const reactionUsers = _.map(reaction.users, sender => sender.accountID.toString());
    const emoji = _.find(emojis, e => e.name === reaction.emoji);
    const emojiCodes = getUniqueEmojiCodes(emoji, reaction.users);
    const hasUserReacted = Report.hasAccountIDReacted(props.currentUserPersonalDetails.accountID, reactionUsers);

    const onPress = () => {
        toggleReaction(emoji);
    };

    const onReactionListOpen = (event) => {
        const users = PersonalDetailsUtils.getPersonalDetailsByIDs(reactionUsers);
        setOpen(true);
        ReactionList.showReactionList(
            event,
            popoverReactionListAnchor.current,
            users,
            reaction.emoji,
            emojiCodes,
            reactionCount,
            hasUserReacted,
        );
    };

    useEffect(()=>{
        if(!open){
            return;
        }
        const users = PersonalDetailsUtils.getPersonalDetailsByIDs(reactionUsers);
        console.log('raadad',{
            users,
                emojiName:reaction.emoji,
                emojiCodes,
                emojiCount:reactionCount,
                hasUserReacted,
        },ReactionList.reactionListRef.current.setState)
        ReactionList.reactionListRef.current.setState({
            users,
                emojiName:reaction.emoji,
                emojiCodes,
                emojiCount:reactionCount,
                hasUserReacted,
        })
    },[reaction])

    useEffect(()=>{
        if(!props.modal.isVisible){
            setOpen(false)
        }
    },[props.modal.isVisible])

    return (
        <Tooltip
            renderTooltipContent={() => (
                <ReactionTooltipContent
                    emojiName={reaction.emoji}
                    emojiCodes={emojiCodes}
                    accountIDs={reactionUsers}
                />
            )}
            renderTooltipContentKey={[...reactionUsers, ...emojiCodes]}
            key={reaction.emoji}
        >
            <EmojiReactionBubble
                ref={props.forwardedRef}
                count={reactionCount}
                emojiCodes={emojiCodes}
                onPress={onPress}
                reactionUsers={reactionUsers}
                hasUserReacted={hasUserReacted}
                onReactionListOpen={onReactionListOpen}
            />
        </Tooltip>

    );
}

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        modal: {
            key: ONYXKEYS.MODAL,
        },
    })
    )(ReactionItem);