import React from 'react'
import Image from "next/image";


function Header() {

    return (
        <header className="bg-neutral-50 text-white py-4 min-h-14">
            <div className="container mx-auto flex justify-between items-center px-4">
            <div>
                <Image src={'/horizon-atlas/logo_.png'} alt={''} width={32} height={16} className='w-32 top-[-20px] h-auto absolute left-0' />
            </div>
            <nav className="hidden md:flex space-x-6">
            </nav>
            </div>
        </header>
    )
}

export default Header