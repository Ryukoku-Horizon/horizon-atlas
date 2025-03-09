import { motion } from 'framer-motion'
import React from 'react'

type Props = {
  pageNum: number;
}

function Curriculums({ pageNum }: Props) {
  return (
    <section id="curriculums" className="py-20 bg-gray-50 px-8">
        <h3 className="text-3xl font-bold text-gray-800 text-center">curriculums</h3>
        <div className="w-16 h-1 bg-purple-700 mx-auto mb-8"></div>
        <p className="text-lg mt-4 text-gray-600">
          Python基礎文法やGitHubの基礎など幅広い分野のカリキュラムを公開しており、
          現在<span className="font-bold text-purple-700">合計{pageNum}ページ</span>のカリキュラムがあります。
          <br />カリキュラムの一部を紹介します。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
        {[
            { title: 'Python基礎文法', description: 'pythonの基礎文法を通してプログラミングの基本を学ぶ' },
            { title: 'Flet', description: 'Flelを使って実際にアプリケーションを作成する' },
            { title: 'Git、GitHub基礎', description: 'Git/GitHubの学習を通して、バージョン管理やチーム開発の方法を学ぶ' },
        ].map((curriculum, index) => (
            <motion.div 
            key={index} 
            className="bg-white rounded-xl shadow-lg p-6 text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            >
            <h4 className="text-xl font-bold text-purple-700">{curriculum.title}</h4>
            <p className="text-gray-600 mt-2">{curriculum.description}</p>
            </motion.div>
        ))}
        </div>
    </section>
  )
}

export default Curriculums