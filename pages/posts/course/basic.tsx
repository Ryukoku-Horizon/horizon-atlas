import Layout from "@/components/Layout/Layout";
import SingleCourse from "@/components/Post/SingleCourse";
import { BASIC_NAV, HOME_NAV } from "@/constants/pageNavs";
import {  getBasicCourses, getPostsByCourse, getPostsByRole } from "@/lib/services/notionApiService";
import { PostMetaData } from "@/types/postMetaData";
import type { GetStaticProps,} from "next";
import { CurriculumService } from "@/lib/services/CurriculumService";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PageInfoService } from "@/lib/services/PageInfoService";

type Props={
    courseAndPosts: {
        course: string;
        posts: PostMetaData[];
    }[];
    icons: {
        iconType: string;
        iconUrl: string;
        pageId: string;
    }[]
}

// getStaticProps関数
export const getStaticProps: GetStaticProps = async () => {
    const basicPosts = await CurriculumService.getBasicCurriculum();
    const basicCourse = await getBasicCourses(basicPosts);
    const courseAndPosts = await Promise.all(basicCourse.map(async(course)=>{
        const posts = await getPostsByCourse(course,basicPosts);
        return {
            course,
            posts
        }
    }))
    const icons = await Promise.all(basicPosts.map(async(post)=>{
        const icon = await PageInfoService.getIconByPageId(post.curriculumId)
        return icon;
    }))

    return {
        props: {
            courseAndPosts,
            icons
        },
    };
};

export default function BasicCoursePageList({courseAndPosts,icons}: Props){
    const [dataByRole,setDataByRole] = useState(courseAndPosts);
    const { user } = useAuth0();
    useEffect(()=>{
        async function setData(){
            const usersRole = user?.given_name ?? "体験入部"
            const dataByRole:{
                course: string;
                posts: PostMetaData[];
            }[] = [];
            for(const i of courseAndPosts){
                const postsByRole = await getPostsByRole(usersRole,i.posts);
                dataByRole.push({course:i.course,posts:postsByRole});
            }
            setDataByRole(dataByRole);
        }
        setData();
    },[courseAndPosts,user])

    return (
        <Layout pageNavs={[HOME_NAV,BASIC_NAV]}>
            <div className="h-full w-full mx-auto font-mono pt-20 ">
                <main className="w-full mt-16 mb-3">
                    <h1 className="text-5xl font-medium text-center mb-16">基礎班カリキュラム</h1>
                    <section className="gap-3 mx-auto">
                        {dataByRole.map((courseAndPosts,i)=>{
                            return (<SingleCourse course={courseAndPosts.course} posts={courseAndPosts.posts} key={i} icons={icons} />)
                        })}
                    </section>
                </main>
            </div>
        </Layout>  
    );
}
