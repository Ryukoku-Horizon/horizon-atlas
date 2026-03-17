import { assignCss } from "@/lib/assignCssProperties"
import { renderTextWithBreaks } from "./renderTextWithBreaks"
import Image from "next/image"
import { AtlRichTextEntity } from "@/types/pageData"
import { usePageLink } from "@/hooks/usePagePush"

type Props={
    text:AtlRichTextEntity
    i:number
}

const RenderParent=({text,i}:Props)=>{
    const { handleClick } = usePageLink()

    if(text.mention && text.mention.content){
        if(text.mention.type==="link_mention"){
            return (<span className='underline text-slate-700 hover:bg-neutral-200/50 inline-flex cursor-pointer pb-0.5 pt-0.5 t-1' key={`${i}`} onClick={()=>handleClick(text.href,text.scroll,text.is_same_bp)}>
                {text.mention.content.icon_url && <img src={text.mention.content.icon_url} className='w-5 h-5 m-0 t-0.5 mr-1' />}
                <span className='text-slate-500 mr-1'>{text.mention.content.link_provider}</span>{text.mention.content.title}
            </span>)
        }else if(text.mention.type==="prossedPage"){
            return (<span className='text-slate-700 hover:bg-neutral-200/50 inline-flex cursor-pointer pb-0.5 pt-0.5 t-1' key={`${i}`} onClick={()=>handleClick(text.href,text.scroll,text.is_same_bp)}>
                {(!text.mention.content.iconUrl || text.mention.content.iconUrl==="") &&<Image src={"/horizon-atlas/file_icon.svg"} alt={text.mention.content.title} width={20} height={20} className='relative w-5 h-5 m-0 mr-1 t-1' />}
                {text.mention.content.iconType !=="emoji" && text.mention.content.iconType !=="custom_emoji" && text.mention.content.iconUrl!=="" && <Image src={text.mention.content.iconUrl} alt={text.mention.content.title} width={20} height={20} className='relative w-5 h-5 m-0 mr-1 t-1' />}
                {text.mention.content.iconType ==="custom_emoji" && <img src={text.mention.content.iconUrl} alt={text.mention.content.title} width={20} height={20} className='relative w-5 h-5 m-0 mr-1 t-1' />}
                {text.mention.content.iconType ==="emoji" &&<span className='relative w-5 h-5 m-0 mr-1 align-middle ml-0.5 text-lg no-underline'>{text.mention.content.iconUrl}</span>}
                <span className='underline'>{text.mention.content.title}</span>
            </span>)
        }
    }
    const style = assignCss(text);
    return renderTextWithBreaks(text.plain_text,style,()=>handleClick(text.href,text.scroll,text.is_same_bp))
}

export default RenderParent