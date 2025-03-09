import Link from 'next/link';
import { MdBlock } from 'notion-to-md/build/types';
import React, { useEffect, useState } from 'react';
import Image from "next/image"
import { MdOutlineArrowOutward } from "react-icons/md";

type Props = {
  mdBlock: MdBlock;
};

export default function Link_to_page(props: Props) {
  const { mdBlock } = props;
  const [url,setUrl] = useState("");
  const [title,setTitle] = useState("");
  
  useEffect(()=>{
    async function setPage(){
      const TitleRegex = /\[([^\]]+)\]/g;
      const UrlRegex = /\(([^)]+)\)/g;
      const titleMatch = mdBlock.parent.match(TitleRegex);
        if(titleMatch){
            setTitle(titleMatch[0].slice(1,-1))
        }
      const urlMatch = mdBlock.parent.match(UrlRegex);
        if(urlMatch){
          setUrl(urlMatch[0].slice(1,-1))
        }
    }
    setPage();
  },[mdBlock.blockId])

  return (
    <Link href={url} target='_brank' rel="noopener noreferrer" 
     className='my-2 flex hover:bg-neutral-100 hover:text-neutral-600 p-0.5' id={mdBlock.blockId}>
      <div className='relative m-0 ml-0.5 mr-1.5 bottom-0.5'>
        <Image src={`/horizon-atlas/notion_data/eachPage/${url.split("/")[4]}/icon.png`} 
        alt={title} width={3.3} height={3.3} className='w-6 h-auto' />
        <MdOutlineArrowOutward size={18} className='absolute w-4 h-auto text-neutral-700 right-[-2.3px] bottom-[-3px] stroke-1 stroke-white' style={{clipPath:"inset(1px 1px 1px 1px)"}} />
      </div>
      <span className="text-neutral-500 underline">
        {title}
      </span>
    </Link>
  );
}
