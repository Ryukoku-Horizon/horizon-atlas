import "dotenv/config"
import { upsertCategory, upsertCurriculum,upsertPage,} from "./supabaseDBGateway.js"
import {getSingleblock,getSinglePageBlock} from "./notionGateway.js"
import {getPageImage,getCategoryImage} from "./dataSave.js"
import fs from "fs"
import { deletePage } from "./delete.js"

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const FILE_PATH = "./notion_last_edit/page.json"
// ファイルから保存データを読み込む関数
function loadLastEditedTimes() {
    if (!fs.existsSync(FILE_PATH)) {
        return {};
    }
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading page_info.json:", error);
        return {};
    }
}

function saveLastEditedTimes(data) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing to page_info.json:", error);
    }
}

async function insertHeading(curriculumId,pageId,parentId,block,i){
    const res = await getSingleblock(block.blockId)
    const data = {
        parent:res[res.type].rich_text.map((text)=>{
            return {
                annotations:text.annotations,
                plain_text:text.plain_text,
                href:text.href
            }
        }),
        color:res[res.type].color,
        is_toggleable:res[res.type].is_toggleable
    }
    await upsertPage(curriculumId,parentId,JSON.stringify(data),block.blockId,block.type,pageId,i);
}

async function insertParagragh(curriculumId,pageId,parentId,block,i){
    const res = await getSingleblock(block.blockId)
    const data = {
        color:res[res.type].color,
        parent:res[res.type].rich_text.map((text)=>{
            return {
                annotations:text.annotations,
                plain_text:text.plain_text,
                href:text.href
            }
        })
    }
    await upsertPage(curriculumId,parentId,JSON.stringify(data),block.blockId,block.type,pageId,i);
}

async function insertPageInfo(curriculumId,pageId,parentId,block,i){
    const res = await getSinglePageBlock(block.blockId);
    const lastEditedTimes = loadLastEditedTimes();  // 以前のデータを読み込む

    // 以前の `last_edited_time` と比較
    const lastSavedTime = lastEditedTimes[block.blockId];

    // アイコンとカバー画像を取得
    const pageImage = await getPageImage(curriculumId, pageId, res.cover, res.icon);

    // データを保存
    const data = {
        parent: block.parent,
        iconType: pageImage.iconType,
        iconUrl: pageImage.iconUrl,
        coverUrl: pageImage.coverUrl
    };

    await upsertPage(curriculumId, parentId, JSON.stringify(data), block.blockId, block.type, pageId, i);

    // `last_edited_time` を更新
    lastEditedTimes[block.blockId] = res.date;
    saveLastEditedTimes(lastEditedTimes);
    return true;
}

async function insertCallout(block,parentId,curriculumId,pageId,i){
    const res = await getSingleblock(block.blockId)
    const parent = res.callout.rich_text.map((text)=>{
        return {
            annotations:text.annotations,
            plain_text:text.plain_text,
            href:text.href
        }
    })
    if(res.icon && res.icon.emoji){
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
            parent
        }
        await upsertPage(curriculumId,parentId,JSON.stringify(data),block.blockId,block.type,pageId,i);
    }
}

export async function insertblock(curriculumId,parentId,blocks,pageId){
    for(let i=1;i<(blocks.length + 1);i++){
        await wait(90);
        const k = i -1;
        if(blocks[k].type==="child_page"){
            const isEdited = await insertPageInfo(curriculumId,pageId,parentId,blocks[k],i);
            if(isEdited){
                await deletePage(blocks[k].id)
            }
            if(blocks[k].children.length!==0){
                await insertblock(
                    curriculumId,
                    blocks[k].blockId,
                    blocks[k].children,
                    blocks[k].blockId);
            }
        }else{
            if(blocks[k].children.length!==0){
                await insertblock(
                    curriculumId,
                    blocks[k].blockId,
                    blocks[k].children,
                    pageId);
            }
            if(blocks[k].type==="callout"){
                await insertCallout(blocks[k],parentId,curriculumId,pageId,i)
            }else if(blocks[k].type==="paragraph" || blocks[k].type==="quote" || blocks[k].type==="toggle"){
                await insertParagragh(curriculumId,pageId,parentId,blocks[k],i)
            }else if(blocks[k].type ==='heading_1' || blocks[k].type ==='heading_2' || blocks[k].type ==='heading_3'){
                await insertHeading(curriculumId,pageId,parentId,blocks[k],i)
            }else{
                await upsertPage(curriculumId,parentId,blocks[k].parent,blocks[k].blockId,blocks[k].type,pageId,i);
            }
        }
        console.log(k + 1, "/", blocks.length)
    }
}

export async function insertCurriculum(data){
    const pageImage = await getPageImage(data.id,data.id,data.cover,data.icon)
    await upsertCurriculum(
        data.title,
        data.is_basic_curriculum,
        data.visibility,
        data.category,
        data.tags,
        data.id,
        pageImage.iconType,
        pageImage.iconUrl,
        pageImage.coverUrl,
        data.order);
}

export async function insertCategory(data){
    const pageImage = await getCategoryImage(data.id,data.cover,data.icon)
    // console.log("icon",pageImage.icon)
    await upsertCategory(
        data.id,
        data.title,
        data.description,
        pageImage.iconUrl,
        pageImage.iconType,
        pageImage.coverUrl,
    )
}