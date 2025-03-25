import type { GetStaticProps } from "next";
import SinglePost from "@/components/Post/SinglePost";
import { PostMetaData } from "@/types/postMetaData";
import {  courseIsBasic, getPostsByRole } from "@/lib/services/notionApiService";
import { BASIC_NAV, HOME_NAV } from "@/constants/pageNavs";
import { pageNav } from "@/types/pageNav";
import Layout from "@/components/Layout/Layout";
import { useEffect, useState } from "react";
import { CurriculumService } from "@/lib/services/CurriculumService";
import { useAuth0 } from "@auth0/auth0-react";
import { CategoryService } from "@/lib/services/CategoryService";
import { Category } from "@/types/category";
import Image from "next/image";

type pagePath = {
    params: { course:string }
  }

export const getStaticPaths = async() =>{
    const allCategories = await CurriculumService.getAllCategories();
    const removedEmptyCourses = allCategories.filter((category)=>category!=='');

     const paramsList: pagePath[] = (
        await Promise.all(
            removedEmptyCourses.map(async (course: string) => {
                return  { params: { course: course } }
            })
        )
    ).flat();
    return {
        paths:paramsList,
        fallback:'blocking'
    }
  }

type Props={
    posts:PostMetaData[];
    currentCourse:string;
    pageNavs:pageNav[];
    categoryData:Category | undefined;
}

// getStaticProps関数
export const getStaticProps: GetStaticProps = async (context) => {
    const currentCourse:string = typeof context.params?.course == 'string' ? context.params.course: "";
    const posts = await CurriculumService.getCurriculumByCategory(currentCourse);
    const isBasic = await courseIsBasic(currentCourse,posts);
    const currentNav:pageNav = {title:currentCourse,id:`/posts/course/${currentCourse}`};
    const pageNavs = isBasic ? [HOME_NAV,BASIC_NAV,currentNav] :[HOME_NAV,currentNav];

    const allCategory = await CategoryService.getAllCategory()
    const targetCategory = allCategory.find((item)=>{
        return item.title === currentCourse
    })


    return {
        props: {
          posts,
          currentCourse,
          pageNavs,
          categoryData:targetCategory
        },
    };
};

const CoursePage = ({ posts, currentCourse,pageNavs,categoryData }: Props)=> {
    const [postsByRole, setPostsByRole] = useState(posts);
    const {user} = useAuth0();

    useEffect(()=>{
        async function setData(){
            const usersRole = user?.given_name ?? "体験入部"
            const postsByRole = await getPostsByRole(usersRole,posts);
            setPostsByRole(postsByRole);
        }
        setData()
    },[posts,user])

    return (
        <Layout pageNavs={pageNavs}> 
            <div className='pt-20 pb-8'>
                {categoryData && categoryData.cover !=="" && <Image src={categoryData.cover} alt={''} width={120} height={120} className='h-56 top-0' style={{width:"100vw"}} />}
                <section className={'px-2 bg-white pb-10'} style={(!categoryData || categoryData.cover !=="") ? {} : {paddingTop:"4rem"}}>
                    {(!categoryData || categoryData.iconType ==="") && <Image src={"/horizon-atlas/file_icon.svg"} alt={''} width={20} height={20} className='relative w-12 h-12 sm:w-14 sm:h-14 m-0' style={categoryData && categoryData.cover !=="" ? {top:"-25px",left:"3px"} : {marginBottom:"1.25rem"}} />}
                    {categoryData && categoryData.iconType !== "emoji" && categoryData.iconType!=="" && <Image src={categoryData.iconUrl} alt={''} width={20} height={20} className='relative w-12 h-12 sm:w-14 sm:h-14 m-0' style={categoryData && categoryData.cover!=="" ? {top:"-25px",left:"3px"} : {marginBottom:"1.25rem"}} />}
                    {categoryData && categoryData.iconType === "emoji" && <p className='relative w-12 h-12 sm:w-14 sm:h-14 text-5xl sm:text-6xl' style={categoryData.cover!=="" ? {top:"-25px",left:"3px"} : {marginBottom:"1.25rem"}}>{categoryData.iconUrl}</p>}
                    <h2 className='w-full text-3xl font-bold'>{currentCourse}</h2>
                    <div className="mt-8">
                        <p>{categoryData?.description}</p>
                    </div>
                    <div className="mt-8">
                        {postsByRole.map((post)=>{
                            return (
                                <div key={post.curriculumId}>
                                    <SinglePost
                                    postData={post}
                                    />
                                </div>
                            )
                        })}
                        </div>
                </section>
            </div>
        </Layout>
    );
}

export default CoursePage;