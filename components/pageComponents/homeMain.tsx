import Link from "next/link"
import { BsCompass } from "react-icons/bs"
import SingleCourse from "../Post/SingleCourse"
import Tags from "../tag/Tags"
import SinglePost from "../Post/SinglePost"
import { useEffect, useState } from "react"
import { Profile } from "@/types/profile"
import { Category } from "@/types/category"
import { PageInfo } from "@/types/page"
import { getPostsByRole } from "@/lib/services/notionApiService"
import Loader from "../loader/loader"

type Props={
    userProfile:Profile | null
    categoryAndCurriculums:{
        category: Category;
        curriculums: PageInfo[];
    }[]
    noCaterizedCurriculums:PageInfo[]
    allTags:string[]
}

export const HomeMain=({userProfile,categoryAndCurriculums,noCaterizedCurriculums,allTags}:Props)=>{
    const [postsByRole, setPostsByRole] = useState(noCaterizedCurriculums);
    const [courseByRole,setCourseByRole] = useState<{
        category: Category;
        curriculums: PageInfo[];
    }[]>(categoryAndCurriculums)
    const [loading,setLoading] = useState(false)

    useEffect(()=>{
      async function setData(){
        try{
          setLoading(true)
          const usersRole = userProfile ? (userProfile.given_name ?? "体験入部") : "ゲスト"
          if(usersRole !=="幹事長" && usersRole !=="技術部員" && usersRole!=="admin"){
            const postsByRole = await getPostsByRole(usersRole,noCaterizedCurriculums);
            setPostsByRole(postsByRole);
            const courseByRole = await Promise.all(categoryAndCurriculums.map(async(item)=>{
              const postsByRole = item.curriculums.filter((item2)=>item2.visibility.some((item3)=>item3===usersRole))
              return {curriculums:postsByRole,category:item.category};
            }))
            const filteredCourse = courseByRole.filter((item)=>item.curriculums.length!==0)
            setCourseByRole(filteredCourse)
          }
        }finally{
          setLoading(false)
        }
      }
      setData()
  },[noCaterizedCurriculums,userProfile?.given_name])

    return (
        <div className="bg-gradient-to-b from-gray-100 to-white min-h-screen">
            <div className="container max-w-3xl mx-auto font-sans pt-24 px-6">
              <main className="mt-16 mb-5 flex flex-col gap-8">

                <section className="mb-4">
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
                {loading && <Loader size={20} />}
                {!loading && <div>
                  {courseByRole.sort((a,b)=>a.category.order - b.category.order).map((item,i)=>{
                      return (
                        <SingleCourse key={i} category={item.category} />
                      )
                  })}
                </div>}
                <Tags allTags={allTags} />
                {!loading && postsByRole.length!==0 && <div className="mt-5">
                  <p className="font-bold m-2">その他の資料</p>
                  {postsByRole.map((item)=>(
                    <SinglePost postData={{...item,id:item.curriculumId}} key={item.curriculumId} />
                  ))}
                </div>}
                {userProfile && <ImprovementRequest />}
              </main>
            </div>
          </div>
    )
}

export const ImprovementRequest = () => {
  return (
    <div className="mt-2 rounded-xl border border-purple-200 bg-purple-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-purple-900">
              カリキュラムの改善にご協力ください
            </p>
            <p className="text-sm text-purple-800">
              内容の誤りや分かりにくい点があれば、お気軽にお知らせください。
            </p>
            <p className="text-sm text-purple-800">（大学アカウントのみアクセスできます）</p>
          </div>
        </div>

        <Link
          href={"https://docs.google.com/forms/d/e/1FAIpQLScW_wz_h2Yd5ij50k8vH91EPUn_0EenEOJ9M147bcVl8KTQLA/viewform?usp=dialog"}
          target="_blank"
          className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition"
        >
          改善要請はこちら
        </Link>
      </div>
    </div>
  );
};
