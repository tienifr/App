import Text from '@components/Text';
import React from 'react';
import { View } from 'react-native';
import { TChildrenRenderer, TNode, type CustomRendererProps, type TBlock } from 'react-native-render-html';

type ThreadTitleRendererProps = CustomRendererProps<TBlock> & {

};

function ThreadTitleRenderer({tnode}: ThreadTitleRendererProps) {
    const renderFn = (tnode: TNode)=>{
        const children = tnode.children;

        return children.map((c, index)=>{
            if(c.tagName==='blockquote'){
                return <View key={index} style={[...Object.values(c.styles), {width:'100%'}]}>
                {renderFn(c)}
            </View>
            }
            if(c.tagName){
                return <Text numberOfLines={1}>
                    <TChildrenRenderer key={index} tchildren={[c]} propsForChildren={{
                    numberOfLines:1
                }}/>
                </Text>
            }
            if('data' in c){
                     return <Text  key={index} style={[...Object.values(c.styles), {flex: 1, flexWrap: 'wrap'}]} numberOfLines={1}>
                    {c.data}
                </Text> 
            }
            return <View key={index} style={[...Object.values(c.styles), {flexDirection:'row', width:'100%'}]}>
                {renderFn(c)}
            </View>
        })
    }
    return <View style={[...Object.values(tnode.styles), {flexDirection:'row'}]}>
        {renderFn(tnode)}
    </View>
}

ThreadTitleRenderer.displayName = 'ThreadTitleRenderer';

export default ThreadTitleRenderer;
