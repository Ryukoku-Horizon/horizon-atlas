import React from 'react'
import Image from "next/image";
import { motion } from 'framer-motion';


function Header() {
    const scrollToSection = (targetId:string) => {
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
      };

    return (
        <header className="bg-neutral-50 text-white py-4 min-h-14">
            <div className="container mx-auto flex justify-between items-center px-4">
            <div>
                <Image src={'/horizon-atlas/logo_.png'} alt={''} width={32} height={16} className='w-32 top-[-20px] h-auto absolute left-0' />
            </div>
            <nav className="hidden md:flex space-x-6">
                {['about', 'curriculums'].map((section) => (
                <motion.button
                    key={section}
                    onClick={()=>scrollToSection(section)}
                    className="text-gray-800 hover:text-purple-700 text-lg font-medium relative group"
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                >
                    {section}
                    <span className="absolute bottom-0 left-0 w-0 h-1 bg-purple-700 transition-all group-hover:w-full"></span>
                </motion.button>
                ))}
            </nav>
            </div>
        </header>
    )
}

export default Header