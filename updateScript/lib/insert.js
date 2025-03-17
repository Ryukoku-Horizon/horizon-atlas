import "dotenv/config"
import { upsertCurriculum,upsertPage} from "./supabaseDBGateway.js"
import {getSingleblock,getSinglePageBlock} from "./notionGateway.js"
import {getPageImage} from "./dataSave.js"

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function insertPageInfo(curriculumId,pageId,parentId,block,i){
    const res = await getSinglePageBlock(block.blockId);
    const pageImage = await getPageImage(curriculumId,pageId,res)
    const data = {
        parent:block.parent,
        iconType:pageImage.iconType,
        iconUrl:pageImage.iconUrl,
        coverUrl:pageImage.coverUrl
    }
    await upsertPage(curriculumId,parentId,JSON.stringify(data),block.blockId,block.type,pageId,i);
}

async function insertCallout(block,parentId,curriculumId,pageId,i){
    const res = await getSingleblock(block.blockId)
    if(res.icon && res.icon.emoji){
        const parent = block.parent.replace(`${item.icon.emoji} `,"")
        const data = {
            icon:res.callout.icon,
            color:res.callout.color,
            parent
        }
        await upsertPage(curriculumId,parentId,JSON.stringify(data),block.blockId,block.type,pageId,i);
    }else{
        const data = {
            icon:res.callout.icon,
            color:res.callout.color,
            parent:block.parent
        }
        await upsertPage(curriculumId,parentId,JSON.stringify(data),block.blockId,block.type,pageId,i);
    }
}

export async function insertblock(curriculumId,parentId,blocks,pageId){
    for(let i=1;i<(blocks.length + 1);i++){
        await wait(90);
        const k = i -1;
        if(blocks[k].children.length!==0){
            await insertblock(
                curriculumId,
                blocks[k].blockId,
                blocks[k].children,
                blocks[k].type==="child_page" ? blocks[k].blockId : pageId);
        }
        if(blocks[k].type==="callout"){
            await insertCallout(blocks[k],parentId,curriculumId,pageId,i)
        }else if(blocks[k].type==="child_page"){
            await insertPageInfo(curriculumId,pageId,parentId,blocks[k],i)
        }else{
            await upsertPage(curriculumId,parentId,blocks[k].parent,blocks[k].blockId,blocks[k].type,pageId,i);
        }
        console.log(k + 1, "/", blocks.length)
    }
}

export async function insertCurriculum(data,pageId){
    const res = await getSinglePageBlock(pageId);
    const pageImage = await getPageImage(pageId,pageId,res)
    await upsertCurriculum(
        data.title,
        data.is_basic_curriculum,
        data.visibility,
        data.category,
        data.tags,
        pageId,
        pageImage.iconType,
        pageImage.iconUrl,
        pageImage.coverUrl);
}