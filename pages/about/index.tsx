import Header from '@/components/top/header'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router';

function AboutDetail() {
    const router = useRouter();
    return (
        <>
            <Header />
                <motion.section 
                    className="bg-purple-700 text-white text-center py-16"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <motion.h1 
                        className="text-5xl font-bold"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        about HorizonAtlas
                    </motion.h1>
                </motion.section>
                <section className="py-20 bg-gray-50 px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h2
                        className="text-4xl font-bold text-gray-800"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        HorizonAtlasとは？
                    </motion.h2>
                    <div className="w-16 h-1 bg-purple-700 mx-auto my-4"></div>

                    <motion.p
                        className="text-lg text-gray-700 mt-4 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        HorizonAtlasは、龍谷大学プログラミング部Horizonの部員専用の学習支援サービスです。
                        プログラミングの基礎からアプリ開発まで、幅広いカリキュラムを提供し、部員の学習をサポートします。
                    </motion.p>
                </div>

                <div className="max-w-4xl mx-auto mt-16">
                    <p
                        className="text-2xl font-semibold text-gray-800 w-full text-left flex justify-between items-center p-4 border-b-2 border-purple-300 transition"
                    >
                        サービス名の由来
                    </p>
                    <AnimatePresence>
                        <motion.div
                            className="mt-4 text-lg text-gray-700 space-y-4 px-4 py-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="font-bold">HorizonAtlasという名前の由来</p>
                            <p>
                                「HorizonAtlas」は、プログラミング部Horizonの名前と、地図帳を意味するAtlasを組み合わせたものです。
                                多様なカリキュラムを通じて、部員が学習の道しるべを見つけられるような、技術知識の地図帳を目指しています。
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="max-w-4xl mx-auto mt-16">
                <p
                        className="text-2xl font-semibold text-gray-800 w-full text-left flex justify-between items-center p-4 border-b-2 border-purple-300 transition"
                    >
                        主な機能
                    </p>
                    <AnimatePresence>
                        <motion.ul
                            className="mt-4 text-lg text-gray-700 space-y-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <li>
                                <span className="font-bold">最新のカリキュラムをいつでも閲覧</span>
                                <p className="ml-5 mt-1 text-gray-600">
                                    Horizonでは、Notionを活用してカリキュラムを制作しています。HorizonAtlasはそれを自動で読み込み、常に最新の学習内容を提供します。
                                </p>
                            </li>

                            <li>
                                <span className="font-bold">カテゴリ別に整理されたカリキュラム</span>
                                <p className="ml-5 mt-1 text-gray-600">
                                    ただデータを並べるのではなく、カテゴリごとに整理。学びたい内容を直感的に見つけられます。
                                </p>
                            </li>

                            <li>
                                <span className="font-bold">キーワード & タグ検索で簡単に探せる</span>
                                <p className="ml-5 mt-1 text-gray-600">
                                    必要なカリキュラムをすぐに見つけられる検索機能を搭載しています。
                                </p>
                            </li>

                            <li>
                                <span className="font-bold">部員が進捗を確認できる</span>
                                <p className="ml-5 mt-1 text-gray-600">
                                    部員がGoogleフォームに提出したデータを反映し、常に最新の進捗を確認できます。
                                </p>
                            </li>
                        </motion.ul>
                    </AnimatePresence>
                </div>
                <div className="max-w-4xl mx-auto mt-16 py-8 text-center">
                    <motion.button 
                        className="bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition hover:bg-purple-600"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => router.push("/")}
                    >
                        トップページに戻る
                    </motion.button>
                </div>
            </section>
        </>
    )
}

export default AboutDetail
