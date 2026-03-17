import { NUMBER_OF_POSTS_PER_PAGE } from "@/constants/numberOfPage";
import { PageInfo } from "@/types/page";

export const calculatePageNumber = (posts:PageInfo[]) => {
    const pageNumber = 
        (posts.length % NUMBER_OF_POSTS_PER_PAGE) != 0 ?
        Math.trunc(posts.length / NUMBER_OF_POSTS_PER_PAGE) + 1 :
        Math.trunc(posts.length / NUMBER_OF_POSTS_PER_PAGE);

    return pageNumber;
}

export const getPostsByTag=async(tagName:string, allPosts:PageInfo[])=>{
    const posts:PageInfo[] = allPosts.filter((post)=> {
        return post.tag.find((tag:string)=>tag.toLowerCase()==tagName.toLowerCase())
    });
    return posts;
}

export const getPostsByRole=async(roleName:string,pageAndMetadata:PageInfo[])=>{
    if(roleName==="幹事長" || roleName==="技術部員" || roleName==="admin"){
        return pageAndMetadata
    }
    const posts = pageAndMetadata.filter((post)=>{
        return post.visibility.find((vis:string)=>vis===roleName);
    })
    return posts;
}

export const getAllTags = async(allPosts:PageInfo[])=>{
    
    const allTagsDuplicationList = allPosts.flatMap((post)=>{
        return post.tag;
    })
    const set = new Set(allTagsDuplicationList);
    const allTags = Array.from(set);

    return allTags;
}