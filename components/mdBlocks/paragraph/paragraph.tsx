import React, { useEffect } from 'react';
import { getColorProperty } from '@/lib/backgroundCorlor';
import { MdBlock } from '@/types/MdBlock';
import RenderParent from '../renderParent';
import { RenderChildren } from '../mdBlock';

type Props={
    mdBlock:MdBlock;
    depth:number;
}

export default function Paragraph(props:Props){
    const {mdBlock,depth} = props;
    const textData = mdBlock.parent.paragraph
    useEffect(()=>{
        if(textData?.parent.length==1 && textData.parent[0].href && !textData.parent[0].mention){
            console.log(textData)
        }
    },[])
    if(!textData)return;
    const colorProperty = getColorProperty(textData.color);

    return (
        <div className='mb-0.5 mt-1' id={mdBlock.blockId}>
            <p style={colorProperty} className="break-words">
                {textData.parent.map((text,i) => {
                    return <RenderParent key={i} text={text} i={i} />
                })}
                {textData.parent.length===0 && <span className='opacity-0' >a</span>}
            </p>
            <RenderChildren mdBlocks={mdBlock.children} depth={depth + 1} />
        </div>
    )
}