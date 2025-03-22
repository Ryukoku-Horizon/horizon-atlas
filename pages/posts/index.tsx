import Layout from "@/components/Layout/Layout";
import { HOME_NAV } from "@/constants/pageNavs";
import {  getAllTags, getEitherCourses, getPostsByCourse } from "@/lib/services/notionApiService";
import { PostMetaData } from "@/types/postMetaData";
import { GetStaticProps } from "next";
import SearchField from "@/components/SearchField/SearchField";
import Tags from "@/components/tag/Tags";
import { CurriculumService } from "@/lib/services/CurriculumService";
import Link from "next/link";
import { BsCompass } from "react-icons/bs";

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
        <div className="bg-gradient-to-b from-gray-100 to-white min-h-screen">
          <div className="container max-w-3xl mx-auto font-sans pt-24 px-6">
            <main className="mt-16 mb-5 flex flex-col gap-8">

              <section className="mb-12">
                <Link href={`/posts/course/basic`} className="block group">
                  <section className="relative bg-white/90 backdrop-blur-lg border border-gray-300/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:-translate-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-extrabold tracking-wide text-gray-900 group-hover:text-purple-700 transition-colors duration-100">
                        基礎班カリキュラム
                      </h2>
                      <BsCompass className="text-6xl text-purple-600 hover:text-purple-700 transition-all duration-300 group-hover:rotate-[660deg] group-hover:scale-[1.03]" />
                    </div>
                    <p className="text-lg text-gray-600/90 mt-3 leading-relaxed">
                      PythonやFletライブラリを通してアプリ開発を学べるカリキュラムです。初心者向けに丁寧に解説します！
                    </p>
                  </section>
                </Link>
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