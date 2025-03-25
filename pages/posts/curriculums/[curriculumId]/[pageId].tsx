import { GetStaticProps } from 'next';
import React, { useEffect } from 'react';
import { PostMetaData } from '@/types/postMetaData';
import { MdBlock } from 'notion-to-md/build/types';
import MdBlockComponent from '@/components/mdBlocks/mdBlock';
import { pageNav } from '@/types/pageNav';
import { BASIC_NAV, HOME_NAV } from '@/constants/pageNavs';
import Image from 'next/image';
import Layout from '@/components/Layout/Layout';
import { CurriculumService } from '@/lib/services/CurriculumService';
import { PageDataService } from '@/lib/services/PageDataService';
import useCurriculumIdStore from '@/stores/curriculumIdStore';
import { IconInfo } from '@/types/iconInfo';
import useIconStore from '@/stores/iconStore';

type postPath = {
  params: { curriculumId:string,pageId:string }
}

type Props = {
  title:string;
  metadata:PostMetaData;
  mdBlocks:MdBlock[];
  pageNavs:pageNav[];
  pageId:string;
  childrenData?:{title:string;childPages:pageNav[]};
  iconInfo:IconInfo[];
  iconType:string;
  iconUrl:string;
  coverUrl:string;
};

export const getStaticPaths = async () => {
  const allCurriculumid:string[] = await CurriculumService.getAllCurriculumId();
  const rootPages = allCurriculumid.map((id)=>{
    return {
        curriculumId:id,
        pageId:id
    }
  })
  const allChildId = await PageDataService.getChildPageIds();
  const allPageId = [...rootPages,...allChildId]

  const paths: postPath[] = allPageId.map((data) => {
    return { params: { 
      curriculumId:data.curriculumId,
      pageId:data.pageId }
     };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pageId = params?.pageId as string;
  const curriculumId = params?.curriculumId as string;

  const mdBlocks:MdBlock[] = await PageDataService.getPageDataByPageId(pageId);
  const singlePost:PostMetaData = await CurriculumService.getCurriculumById(curriculumId);

  const courseNav: pageNav = { title: singlePost.category ? singlePost.category : "", id: `/posts/course/${singlePost.category}` };
  const postNav: pageNav = { title: singlePost.title, id: `/posts/curriculums/${curriculumId}/${curriculumId}` };
  const pageNavs: pageNav[] = singlePost.is_basic_curriculum
    ? [HOME_NAV, BASIC_NAV, courseNav, postNav]
    : (singlePost.category ===undefined || singlePost.category === "")
    ? [HOME_NAV, postNav]
    : [HOME_NAV, courseNav, postNav];

  const getListToPage =(blocks:MdBlock[])=>{
    const link_to_pageBlocks:MdBlock[] = [];
    for(const block of blocks){
      if(block.type==="link_to_page"){
        link_to_pageBlocks.push(block)
      }
      if(block.children.length!==0){
        link_to_pageBlocks.push(...getListToPage(block.children))
      }
    }
    return link_to_pageBlocks;
  }
  const listToPageBlocks = getListToPage(mdBlocks);
  const UrlRegex = /\(([^)]+)\)/g;
  const iconInfoList:IconInfo[] = [];
  for(const block of listToPageBlocks){
    const urlMatch = block.parent.match(UrlRegex);
    if(urlMatch){
      const url = urlMatch[0].slice(1,-1)
      const pageId_ = url.split("/")[4]
      const iconInfo:IconInfo = await PageDataService.getPageIcon(pageId_)
      iconInfoList.push(iconInfo)
    }
  }

    if(curriculumId!==pageId){
      const childrenData = await PageDataService.getChildrenData(pageId);
      const childPageNavs = await PageDataService.getPageNavs(pageId);
      const titleAndIcon = await PageDataService.getTitleAndIcon(pageId);
      return {
        props:{
          title:titleAndIcon.title ? titleAndIcon.title : "",
          metadata:singlePost,
          mdBlocks,
          pageNavs:[...pageNavs,...childPageNavs],
          childrenData,
          pageId,
          iconInfo:iconInfoList,
          iconUrl:titleAndIcon.iconUrl,
          iconType:titleAndIcon.iconType,
          coverUrl:titleAndIcon.coverUrl
        }
      }
    }
  return {
    props: {
      title:singlePost.title,
      metadata: singlePost,
      mdBlocks,
      pageNavs,
      pageId,
      iconInfo:iconInfoList,
      iconUrl:singlePost.iconUrl,
      iconType:singlePost.iconType,
      coverUrl:singlePost.coverUrl
    },
  };
};

const Post =({ metadata, mdBlocks,pageNavs,childrenData,pageId,iconInfo,title,iconType,iconUrl,coverUrl}: Props) => {
  const { setCurriculumId } = useCurriculumIdStore();
  const { setIcons } = useIconStore();
  useEffect(()=>{
    setIcons(iconInfo);
    setCurriculumId(metadata.curriculumId);
  },[metadata.curriculumId,pageId,iconInfo])
  return (
    <Layout pageNavs={pageNavs} sideNavProps={childrenData}>
      <div className='pt-20 pb-8'>
      {coverUrl!=="" && <Image src={coverUrl} alt={''} width={120} height={120} className='h-56 top-0' style={{width:"100vw"}} />}
        <section className='px-2 bg-white pb-10' style={coverUrl!=="" ? {} : {paddingTop:"4rem"}}>
          <div>
          {iconType==="" && <Image src={"/horizon-atlas/file_icon.svg"} alt={''} width={20} height={20} className='relative w-12 h-12 sm:w-14 sm:h-14 m-0' style={coverUrl!=="" ? {top:"-25px",left:"3px"} : {marginBottom:"1.25rem"}} />}
          {iconType !== "emoji" && iconType!=="" && <Image src={iconUrl} alt={''} width={20} height={20} className='relative w-12 h-12 sm:w-14 sm:h-14 m-0' style={coverUrl!=="" ? {top:"-25px",left:"3px"} : {marginBottom:"1.25rem"}} />}
          {iconType === "emoji" && <p className='relative w-12 h-12 sm:w-14 sm:h-14 text-5xl sm:text-6xl' style={coverUrl!=="" ? {top:"-25px",left:"3px"} : {marginBottom:"1.25rem"}}>{iconUrl}</p>}
            <h2 className='w-full text-3xl font-bold'>{title}</h2>
          </div>
          <div className='border-b mt-2'></div>
          {pageId === metadata.curriculumId && <>
            {metadata.tags.map((tag:string,i:number)=>(
              <p className='text-white bg-sky-500 rounded-xl font-medium mt-2 px-2 inline-block mr-2' key={i}>
                {tag}
              </p>
            ))}
          </>}
          <div className='mt-4 font-medium'>
            <div key={pageId}>
              {mdBlocks.map((mdBlock)=>(
                <MdBlockComponent mdBlock={mdBlock} depth={0} key={mdBlock.blockId} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <script async src="//cdn.iframe.ly/embed.js"></script>
    </Layout>
  )
}

export default Post
