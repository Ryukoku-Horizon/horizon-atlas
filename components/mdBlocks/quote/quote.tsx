"use client";
import { MdBlock } from 'notion-to-md/build/types'
import React from 'react'
import MdBlockComponent from '../mdBlock';
import { ParagraphData } from '@/types/paragraph';
import { getColorProperty } from '@/lib/backgroundCorlor';
import { useRouter } from 'next/router';
import { assignCss } from '@/lib/assignCssProperties';

type Props={
    mdBlock:MdBlock;
    depth:number;
}

export default function Quote(props:Props) {
    const {mdBlock,depth} = props;
    const textData:ParagraphData = JSON.parse(mdBlock.parent)
    const colorProperty = getColorProperty(textData.color);

    const router = useRouter()

    const scrollToSection = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            const yOffset = -100; 
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
        element?.classList.add("highlight")
        setTimeout(()=>{
            element?.classList.remove("highlight");
        },1600)
    };

    const handleClick =(href:string | null, scroll:string | undefined)=>{
        if(href && href!==""){
            if(router.asPath===href){
                if(scroll){
                    scrollToSection(scroll)
                }
            }else{
                if(scroll){
                    router.push(`${href}#${scroll}`)
                }else{
                    router.push(href)
                }
            }
        }
    }

    return (
        <div className='my-1 border-l-2 border-neutral-800 pl-3' id={mdBlock.blockId}>
            <p style={{...colorProperty,whiteSpace: "pre"}}>
                    {textData.parent.map((text,i)=>{
                        const style = assignCss(text)
                        return (
                        <span key={i} style={style} onClick={()=>handleClick(text.href,text.scroll)}>{text.plain_text}</span>
                    )})}
                    {textData.parent.length===0 && <span className='opacity-0' >a</span>}
                </p>
            {mdBlock.children.map((child,i)=>(
                <MdBlockComponent key={i} mdBlock={child} depth={depth + 1} />
            ))}
        </div>
    )
}

