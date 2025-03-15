import Layout from "@/components/Layout/Layout";
import BasicCurriculum from "@/components/Post/basicCurriculum";
import { HOME_NAV } from "@/constants/pageNavs";
import {  getAllTags, getEitherCourses, getPostsByCourse } from "@/lib/services/notionApiService";
import { PostMetaData } from "@/types/postMetaData";
import { GetStaticProps } from "next";
import SearchField from "@/components/SearchField/SearchField";
import Tags from "@/components/tag/Tags";
import { CurriculumService } from "@/lib/services/CurriculumService";

type Props = {
  courseAndPosts:{
    course: string;
    posts:PostMetaData[];
  }[];
  allTags:string[];
};

export const getStaticProps: GetStaticProps = async () => {
  const allPosts:PostMetaData[] = await CurriculumService.getAllCurriculum();
  const notBasicCourses = await getEitherCourses(false,allPosts);
  const removeEmptyCourses = notBasicCourses.filter((course)=>course!=="")
  const courseAndPosts = await Promise.all(removeEmptyCourses.map(async(course)=>{
    const posts = await getPostsByCourse(course,allPosts);
    return {
        course,
        posts
    }
  }))
  const allTags = await getAllTags(allPosts);
  return {
      props: {
        courseAndPosts,
        allTags,
      },
      // revalidate: 600
  };
};

const PostsPage = ({ allTags }: Props)=> {
  
    return (
      <Layout pageNavs={[HOME_NAV]}>  
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
          <div className="container max-w-screen-lg mx-auto font-mono pt-20 px-5">
            <main className="mt-16 mb-3 flex flex-col gap-5">
          <section className="mb-10">
            <BasicCurriculum />
          </section>
          <SearchField searchKeyWord={""} />
          <Tags allTags={allTags} />
        </main>
        </div>
      </div>
      </Layout>
    );
  }

  export default  PostsPage;