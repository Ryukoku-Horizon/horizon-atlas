"use client";
import { MdBlock } from 'notion-to-md/build/types'
import React from 'react'
import MdBlockComponent from '../mdBlock';
import Paragraph from '../paragraph/paragraph';
import { getColorProperty } from '@/lib/backgroundCorlor';
import Image from 'next/image';

type Props={
    mdBlock:MdBlock
    depth:number;
}

type Data ={
    icon:{
        type:string,
        emoji:string | undefined;
        file:{
            url:string;
            expiry_time:string;
        } | undefined;
        external:{
            url:string;
        } | undefined;
    } | null;
    color:string;
    parent:string;
}

export default function Callout(props:Props) {
    const {mdBlock,depth} = props;
    const data:Data = JSON.parse(mdBlock.parent)
    let parent = data.parent.split("> ")[1];
    if(data.icon?.emoji){
        parent = parent.replace(data.icon.emoji,"")
    }
    const icon = data.icon
    const backgroundColor = getColorProperty(data.color)
    if(mdBlock.children.length > 0 && parent.includes(mdBlock.children[0].parent)){
        return (
            <div className='p-2 px-3 mb-3 mt-4 rounded relative' id={mdBlock.blockId} style={backgroundColor}>
                <div className='absolute top-2 left-2'>
                    {icon && icon.type==="emoji" && <p className='text-xl relative left-1'>{icon.emoji}</p>}
                    {icon && icon.type!=="emoji" && icon.external && <Image src={icon.external.url} alt={''} width={20} height={20} className='w-5 h-5 m-0.5 top-0.5' />}
                </div>
                <div className='ml-6'>
                    <Paragraph  mdBlock={mdBlock} quote={true} parent={parent.replaceAll("#","")} depth={depth} />
                    {mdBlock.children.slice(1).map((child, i)=>(
                        <div className='ml-2 mt-0.5' key={i}>
                            <MdBlockComponent mdBlock={child} depth={depth +1} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return (
        <div className='p-2 px-3 mb-3 mt-4 rounded relative' id={mdBlock.blockId} style={backgroundColor}>
            <div className='absolute top-2 left-2'>
                {icon && icon.type==="emoji" && <p className='text-xl relative left-1'>{icon.emoji}</p>}
                {icon && icon.type!=="emoji" && icon.external && <Image src={icon.external.url} alt={''} width={20} height={20} className='w-5 h-5 m-0.5 top-0.5' />}
            </div>
            <div className='ml-6'>
                <Paragraph mdBlock={mdBlock} quote={true} parent={parent} depth={depth} />
                {mdBlock.children.map((child, i)=>(
                    <div className='ml-2 mt-0.5' key={i}>
                        <MdBlockComponent mdBlock={child} key={i} depth={depth +1} />
                    </div>
                ))}
            </div>
        </div>
    )
}
