"use client";
import Link from 'next/link';
import { MdBlock } from 'notion-to-md/build/types';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import useCurriculumIdStore from '@/stores/curriculumIdStore';
import { getIcon } from '@/lib/getIconAndCover';

type Props = {
  mdBlock: MdBlock;
};

export default function ChildPage(props: Props) {
  const { mdBlock } = props;
  const title = mdBlock.parent.split('## ')[1]; 
  const pageId = mdBlock.blockId;
  const { curriculumId } = useCurriculumIdStore();
  const [icon,setIcon] = useState({type: "",url: ""})

  const newPath = `/posts/curriculums/${curriculumId}/${pageId}`; 
  useEffect(()=>{
    async function setData(){
      const icon_ = await getIcon(pageId,curriculumId);
      setIcon(icon_)
    }
    setData()
  },[pageId,curriculumId,mdBlock.blockId])

  return (
      <Link href={newPath} id={mdBlock.blockId}>
        <div className=' my-0.5 py-1 px-0.5 hover:bg-neutral-100 cursor-pointer text-neutral-500 flex'>
          {icon.type !=="emoji" &&<Image src={icon.url} alt={title} width={20} height={20} className='relative w-5 h-5 m-0 mr-1' />}
          {icon.type ==="emoji" &&<p className='relative w-5 h-5 m-0 mr-1 align-middle ml-0.5'>{icon.url}</p>}
          <span className='underline'>{title}</span>
        </div>
      </Link>
  );
}
