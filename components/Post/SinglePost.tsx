import React from 'react';
import { PostMetaData } from "@/types/postMetaData";
import Link from 'next/link';
import Image from 'next/image';

type Props = {
    postData:PostMetaData;
    icon:{
        type:string;
        url:string;
    }
}

const SinglePost = (props:Props) => {
    const {title, tags, curriculumId} = props.postData;
    const {icon} = props;
    return (
        <Link href={`/posts/curriculums/${curriculumId}/${curriculumId}`}>
            <section className='mb-4 mx-5 rounded-md p-3 shadow-md hover:shadow-none hover:translate-y-1 hover:bg-neutral-50 transition-all duration-200 border'>
                <div className='flex w-auto h-9 my-1'>
                    {icon.type !=="emoji" &&<Image src={icon.url} alt={title} width={30} height={30} className='relative w-8 h-8 m-0 mr-1 bottom-1' />}
                    {icon.type ==="emoji" &&<p className='relative w-8 h-8 m-0 mr-1 bottom-1 text-3xl align-middle'>{icon.url}</p>}
                    <h2 className='text-xl font-medium mb-2 line-clamp-1'>
                        {title}
                    </h2>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                {tags.map((tag, i) => (
                    <span
                        key={i}
                        className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            </section>
        </Link>
    )
}

export default SinglePost