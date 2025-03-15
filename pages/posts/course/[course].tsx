import type { GetStaticProps } from "next";
import SinglePost from "@/components/Post/SinglePost";
import { PostMetaData } from "@/types/postMetaData";
import Pagenation from "@/components/pagenation/Pagenation";
import { calculatePageNumber, courseIsBasic, getPostsByRole } from "@/lib/services/notionApiService";
import { BASIC_NAV, HOME_NAV } from "@/constants/pageNavs";
import { pageNav } from "@/types/pageNav";
import Layout from "@/components/Layout/Layout";
import { useEffect, useState } from "react";
import { NUMBER_OF_POSTS_PER_PAGE } from "@/constants/numberOfPage";
import { CurriculumService } from "@/lib/services/CurriculumService";
import { useAuth0 } from "@auth0/auth0-react";
import { getIcon } from "@/lib/getIconAndCover";
import { IconData } from "@/types/iconData";

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
}

// getStaticProps関数
export const getStaticProps: GetStaticProps = async (context) => {
    const currentCourse:string = typeof context.params?.course == 'string' ? context.params.course: "";
    const posts = await CurriculumService.getCurriculumByCategory(currentCourse);
    const isBasic = await courseIsBasic(currentCourse,posts);
    const currentNav:pageNav = {title:currentCourse,id:`/posts/course/${currentCourse}`};
    const pageNavs = isBasic ? [HOME_NAV,BASIC_NAV,currentNav] :[HOME_NAV,currentNav];

    return {
        props: {
          posts,
          currentCourse,
          pageNavs,
        },
    };
};

const CoursePage = ({ posts, currentCourse,pageNavs }: Props)=> {
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = NUMBER_OF_POSTS_PER_PAGE;
    const [postsByRole, setPostsByRole] = useState(posts);
    const [numberOfPages,setNumberOfPages] = useState(1);
    const [icon, setIcon] = useState<IconData[]>([]);
    const {user} = useAuth0();

    useEffect(()=>{
        async function setData(){
            const usersRole = user?.given_name ?? "体験入部"
            const postsByRole = await getPostsByRole(usersRole,posts);
            setPostsByRole(postsByRole);
            setNumberOfPages(calculatePageNumber(postsByRole));
        }
        setData()
    },[posts,user])
    useEffect(()=>{
        async function setIconData(){
            const icon= await Promise.all(posts.map(async(post)=>{
                const icon = await getIcon(post.curriculumId,post.curriculumId)
                return {
                    postId:post.curriculumId,
                    icon
                }
            }))
            setIcon(icon)
        }
        setIconData()
    },[posts,postsByRole])

    return (
        <Layout pageNavs={pageNavs}> 
            <div className="h-full w-full mx-auto font-mono pt-20">
                <main className="w-full mt-16 mb-3">
                    <h1 className="text-5xl font-medium text-center mb-16">{currentCourse}</h1>
                    <section className="mx-auto">
                        {postsByRole.slice(postsPerPage * (currentPage - 1), postsPerPage * currentPage).map((post)=>{
                            const targetIcon = icon.filter((item)=>item.postId===post.curriculumId)
                            return (
                                <div key={post.curriculumId}>
                                    <SinglePost
                                    postData={post}
                                    icon={(targetIcon[0] !==undefined && targetIcon[0].icon !== undefined) ? targetIcon[0].icon : {type:"",url:"/horizon-atlas/file_icon.svg"}}
                                    />
                                </div>
                        )})}
                    </section>
                </main>
                <Pagenation numberOfPage={numberOfPages} currentPage={currentPage} setPage={setCurrentPage} />
            </div>
        </Layout>
    );
}

export default CoursePage;