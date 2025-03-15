"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostMetaData } from '@/types/postMetaData';

type Props = {
    course: string;
    posts: PostMetaData[];
    icons: {
        postId: string;
        icon: {
            type: string;
            url: string;
        };
    }[]
};

const SingleCourse = ({ course, posts,icons }: Props) => {
    return (
        <Link href={`/posts/course/${course}`}>
            <section className="bg-white border border-gray-200 rounded-md p-2 mb-4 mx-5 shadow-sm hover:bg-neutral-50 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">{course}</h2>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        {posts.length} カリキュラム
                    </span>
                </div>
                <div className="mt-2">
                    {posts.slice(0, 5).map((post) => {
                        const targetIcon = icons.filter((item)=>item.postId===post.curriculumId)

                        return (
                            <div key={post.curriculumId} className="flex items-center text-gray-700 mb-0.5 text-sm border-l border-gray-300 pl-2">
                                <div className="flex">
                                    {targetIcon[0] !==undefined && targetIcon[0].icon.type !=="emoji" && <Image
                                        src={(targetIcon[0].icon !== undefined) ? targetIcon[0].icon.url : "/horizon-atlas/file_icon.svg"}
                                        alt=""
                                        height={20}
                                        width={20}
                                        className="h-5 w-5 rounded mr-2"
                                    />}
                                    {targetIcon[0] !==undefined && targetIcon[0].icon.type ==="emoji" && <p
                                        className="h-5 w-5 rounded mr-2 text-lg"
                                    >{targetIcon[0].icon.url}</p>}
                                    <span>{post.title}</span>
                                </div>
                            </div>
                    )})}
                    {posts.length > 5 && <p className='text-neutral-400 text-sm'>  ...他{posts.length - 5}カリキュラム</p>}
                </div>
            </section>
        </Link>
    );
};

export default SingleCourse;
