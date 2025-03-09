import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

function About() {
    return (
        <section id="about" className="py-20 bg-white px-8">
            <motion.h3
                className="text-3xl font-bold text-gray-800 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
            >
                About HorizonAtlas
            </motion.h3>
            <div className="w-16 h-1 bg-purple-700 mx-auto my-4"></div>

            <motion.p
                className="text-xl mt-4 text-gray-700 leading-relaxed max-w-3xl mx-auto text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
            >
                HorizonAtlasは、龍谷大学プログラミング部Horizonの部員専用の学習支援アプリです
            </motion.p>
            
            <motion.p
                className="text-lg mt-3 text-gray-600 leading-relaxed max-w-3xl mx-auto text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
            >
                プログラミングの基礎からアプリ開発まで、幅広いカリキュラムを提供し、部員の学習をサポートします。
            </motion.p>

            <motion.div
                className="flex justify-center mt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                viewport={{ once: true }}
            >
                <Link href={"/about"} className="px-4 py-2 bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:bg-purple-800 transition">
                    詳しく
                </Link>
            </motion.div>
        </section>
    )
}

export default About
