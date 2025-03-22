"use client";
import { MdBlock } from 'notion-to-md/build/types'
import React, { useState } from 'react'
import MdBlockComponent from '../mdBlock';
import { ParagraphData } from '@/types/paragraph';
import { getColorProperty } from '@/lib/backgroundCorlor';
import { assignCss } from '@/lib/assignCssProperties';
import { useRouter } from 'next/router';

type Props={
    mdBlock:MdBlock;
    depth:number;
}

export default function ToggleBlock(props:Props) {
    const {mdBlock,depth} = props;
    const [isOpen, setIsOpen] = useState(false);
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
        <div className='my-1 border-neutral-800 pl-1.5' id={mdBlock.blockId}>
            <div className='flex'>
                <button
                    className="text-left space-x-1 p-1 rounded-lg hover:bg-neutral-200 transition"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className='relative top-[-5px]'>{isOpen ? "▼" : "▶︎"}</span>
                </button>
                <p style={{...colorProperty,whiteSpace: "pre"}}>
                    {textData.parent.map((text,i)=>{
                        const style = assignCss(text)
                        return (
                        <span key={i} style={style} onClick={()=>handleClick(text.href,text.scroll)}>
                            {text.plain_text}
                        </span>
                    )})}
                    {textData.parent.length===0 && <span className='opacity-0' >a</span>}
                </p>
            </div>
            {isOpen && mdBlock.children.map((child)=>(
                <div className='ml-4' key={child.blockId}>
                    <MdBlockComponent mdBlock={child} depth={depth + 1} />
                </div>
            ))}
        </div>
    )
}

