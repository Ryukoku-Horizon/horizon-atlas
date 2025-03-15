import { Client, isFullPage } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs";
import path from "path";
import axios from "axios";
import ogs from "open-graph-scraper";
import "dotenv/config"

const NOTION_TOKEN = process.env.NOTION_TOKEN_HORIZON;
const NOTION_DATABASE_ID = process.env.NOTION_DB_ID_HORIZON;

const IFRAMELY_API_KEY = process.env.IFRAMELY_API_KEY;

const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

const getAllData = async () => {
    const posts = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        page_size: 100,
        filter: {
            property: "published",
            checkbox: {
                equals: true,
            },
        }
    });

    const allPosts = posts.results.filter(isFullPage);
    return allPosts.map(getPageMetaData);
};

const getSingleData = async (title) => {
    const posts = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        page_size: 100,
        filter: {
            property: 'title',
            formula: { string: { equals: title } }
        }
    });

    const allPosts = posts.results.filter(isFullPage);
    return allPosts.map(getPageMetaData);
};

const getPageMetaData = (post) => {
    const getTags = (tags) => tags.map(tag => tag.name || "");
    const getVisibilities = (visibilities) => visibilities.map(visibility=> visibility.name || "");
    const properties = post.properties;

    return {
        id: post.id,
        title: properties.title?.title?.[0]?.plain_text || "untitled",
        tags: properties.tag?.multi_select ? getTags(properties.tag.multi_select) : [],
        category: properties.category?.select?.name || "",
        is_basic_curriculum: properties.is_basic_curriculum?.checkbox || false,
        visibility: properties.visibility?.multi_select ? getVisibilities(properties.visibility.multi_select) : []
    };
};

const getSinglePage = async (title) => {
    const response = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        filter: {
            property: 'title',
            formula: { string: { equals: title } }
        }
    });

    const pageIds = response.results.map(page => page.id);
    const page = response.results.find(isFullPage);
    if (!page) throw new Error('Page not found');

    const mdBlocks =  await n2m.pageToMarkdown(page.id);
    return {
        mdBlocks,
        pageId:pageIds[0]
    }
};

const downloadImage = async (imageUrl, savePath) => {
    try {
        const response = await axios({ url: imageUrl, method: "GET", responseType: "stream" });
        const dir = path.dirname(savePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        const writer = fs.createWriteStream(savePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
        console.log(`✅ 画像をダウンロードしました: ${savePath}`);
    } catch (error) {
        console.error("❌ 画像のダウンロードに失敗しました:", error);
    }
};

async function upsertCurriculum(title,is_basic_curriculum,visibility,category,tag,curriculumId){
    const url = `${SUPABASE_URL}/functions/v1/upsert_curriculum`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body:JSON.stringify({
            title,is_basic_curriculum,visibility,category,tag,curriculumId
        }),
    });
    const result = await res.json();
    console.log("upsertCurriculum",result);
}

async function upsertPage(curriculumId,parentId,blockData,blockId,type,pageId,order){
    const res = await fetch(`${SUPABASE_URL}/functions/v1/upsertPageData`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body:JSON.stringify({
            curriculumId,parentId,blockData,blockId,type,pageId,order
        })
    });
    const result = await res.json();
    console.log(result);
    const { error } = result;
    return error;
}

async function deleteData(table,where,value){
    const url = `${SUPABASE_URL}/functions/v1/deleteData`;
    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body:JSON.stringify({
            table,where,value
        }),
    });
    const result = await res.json();
    console.log(result.message);
}

async function deletePage(pageId){
    await deleteData("PageData","curriculumId",pageId)
}

async function useIframely(url) {
    try{
        const res = await fetch(`https://iframe.ly/api/oembed?url=${url}&api_key=${IFRAMELY_API_KEY}`);
        const data = await res.json();
        return data;
    }catch(e){
        console.warn(e);
        return;
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function insertblock(curriculumId,parentId,blocks,pageId){
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
        await upsertPage(curriculumId,parentId,blocks[k].parent,blocks[k].blockId,blocks[k].type,pageId,i);
    }
}

async function insertCurriculum(data,pageId){
    upsertCurriculum(
        data.title,
        data.is_basic_curriculum,
        data.visibility,
        data.category,
        data.tags,
        pageId);
}

const getSinglePageBlock = async (pageId) => {
    const response = await notion.pages.retrieve({
        page_id: pageId,
      });

    return {
        icon:response.icon,
        cover:response.cover
    };
};

const fetchAllMdBlock = async (mdBlocks,id) => {
    for (const block of mdBlocks) {
        if (block.type === 'image') {
            const match = block.parent.match(/!\[([^\]]+)\]\(([^\)]+)\)/);
            if (match) {
                const url = match[2].endsWith(')') ? match[2].slice(0, -1) : match[2];
                let exte = match[1].split(".")[1];
                if(exte===undefined || (exte!=="png" && exte!="jpg" && exte!="gif")){
                    exte = "png";
                }
                console.log("Downloading image:", block.blockId);
                await downloadImage(url, `./public/notion_data/eachPage/${id}/image/${block.blockId}.${exte}`);
            }
        }
        if(block.type==='bookmark'){
            const match = block.parent.match(/\((.*?)\)/g);
            if (match) {
                try{
                    const url = match[0].slice(1, -1);
                    const { result } = await ogs({url});
                    const { ogTitle,ogDescription,ogSiteName,ogUrl,ogImage } = result;
                    let favicon = result.favicon;
                    console.log("favicon",favicon);
                    if(favicon===undefined){
                        const domain = new URL(url).origin;
                        const {result:domain_result} = await ogs({url:domain});
                        if(domain_result.favicon != undefined){
                            if(domain_result.ogImage){
                                const { url:image_url } = domain_result.ogImage[0];
                                console.log("image_url",image_url);
                                const image_domain = new URL(image_url).origin;
                                console.log("image_domain",image_domain);
                                const favicon_domain = domain_result.favicon;
                                favicon = image_domain + "/" + (favicon_domain[0]==="/" ? favicon_domain.slice(1) : favicon_domain);
                                console.log("favicon2",favicon);
                            }
                        }
                    }
                    if(ogImage){
                        const { url } = ogImage[0];
                        const saveData = { ogTitle,ogDescription,ogSiteName,ogUrl,ImageUrl:url, favicon };
                        fs.writeFileSync(`./public/notion_data/eachPage/${id}/ogsData/${block.blockId}.json`, JSON.stringify(saveData, null, 2));
                    }else{
                        const saveData = { ogTitle,ogDescription,ogSiteName,ogUrl, favicon };
                        const isAllUndefined = Object.values(saveData).every(value => value === undefined);
                        if(isAllUndefined){
                            fs.writeFileSync(`./public/notion_data/eachPage/${id}/ogsData/${block.blockId}.json`, JSON.stringify(result, null, 2));
                        }else{
                            fs.writeFileSync(`./public/notion_data/eachPage/${id}/ogsData/${block.blockId}.json`, JSON.stringify(saveData, null, 2));
                        }
                    }
                }catch(e){console.warn(`⚠️ Open Graphの取得に失敗: ${e}`);}
            }
        }
        if(block.type==="embed"){
            const match = block.parent.match(/\((.*?)\)/g);
            if(match){
                const url = match[0].slice(1, -1);
                const embedData = await useIframely(url);
                if(embedData){
                    const saveData = {title:embedData.title, html:embedData.html}
                    fs.writeFileSync(`./public/notion_data/eachPage/${id}/iframeData/${block.blockId}.json`, JSON.stringify(saveData, null, 2));
                }
            }
        }
        if(block.type=="child_page"){
            let res = await getSinglePageBlock(block.blockId);
            if(res.icon){
                if(res.icon.type==="file"){
                    let exte = res.icon.file.url.split(".")[1];
                    if(exte===undefined || (exte!=="png" && exte!="jpg" && exte!="svg")){
                        exte = "png";
                    }
                    res.icon.file.url = `./public/notion_data/eachPage/${id}/pageImageData/icon/${block.blockId}.${exte}`
                    await downloadImage(res.icon.file.url,`./public/notion_data/eachPage/${id}/pageImageData/icon/${block.blockId}.${exte}`)
                }
            }
            if(res.cover){
                if(res.cover.type==="file"){
                    let exte = res.cover.file.url.split(".")[1];
                    if(exte===undefined || (exte!=="png" && exte!="jpg")){
                        exte = "png";
                    }
                    res.cover.file.url = `./public/notion_data/eachPage/${id}/pageImageData/cover/${block.blockId}.${exte}`
                    await downloadImage(res.cover.file.url,`./public/notion_data/eachPage/${id}/pageImageData/cover/${block.blockId}.${exte}`)
                }
            }
            fs.writeFileSync(`./public/notion_data/eachPage/${id}/pageImageData/${block.blockId}.json`, JSON.stringify(res, null, 2));
        }
        if (block.children.length > 0) {
            await fetchAllMdBlock(block.children,id);
        }
    }
};

function mkdir(dirPath){
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('📁 ディレクトリを作成しました:', dirPath);
    } else {
        console.log('✅ すでに存在しています:', dirPath);
    }
}

function cleardir(directory) {
    try {
        const files = fs.readdirSync(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                fs.unlinkSync(filePath);
            } else if (stat.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
            }
        }
        console.log(`Directory "${directory}" has been cleared.`);
    } catch (err) {
        console.error(`Error clearing directory: ${err.message}`);
    }
}

function mkAndClearDir(dirs){
    for(const dir of dirs){
        mkdir(dir)
        cleardir(dir)
    }
}

getAllData()
    .then(allData => {
        for(const data of allData){
            wait(1000).then(data_=>{
                getSinglePage(data.title).then(async({mdBlocks,pageId})=>{
                    // await insertCurriculum(data,pageId)
                    const ogsDir = `./public/notion_data/eachPage/${pageId}/ogsData/`;
                    const imageDir = `./public/notion_data/eachPage/${pageId}/image/`;
                    const iframeDir = `./public/notion_data/eachPage/${pageId}/iframeData/`;
                    const pageImageDir = `./public/notion_data/eachPage/${pageId}/pageImageData/`;
                    const dirList = [ogsDir,imageDir,iframeDir,pageImageDir]
                    mkAndClearDir(dirList)
                    await fetchAllMdBlock(mdBlocks, pageId);
                    let res = await getSinglePageBlock(pageId);
                    if(res.icon && res.icon.type==="file"){
                        let exte = res.icon.file.url.split(".")[1];
                        if(exte===undefined || (exte!=="png" && exte!="jpg"  && exte!="svg")){
                            exte = "png";
                        }
                        await downloadImage(res.icon.file.url, `./public/notion_data/eachPage/${pageId}/pageImageData/icon/${pageId}.${exte}`)
                        res.icon.file.url = `./public/notion_data/eachPage/${pageId}/pageImageData/icon/${pageId}.${exte}`
                    }
                    if(res.cover && res.cover.type==="file"){
                        let exte = res.cover.file.url.split(".")[1];
                        if(exte===undefined || (exte!=="png" && exte!="jpg")){
                            exte = "png";
                        }
                        await downloadImage(res.cover.file.url, `./public/notion_data/eachPage/${pageId}/pageImageData/cover/${pageId}.${exte}`)
                        res.cover.file.url = `./public/notion_data/eachPage/${pageId}/pageImageData/cover/${pageId}.${exte}`
                    }
                    fs.writeFileSync(`./public/notion_data/eachPage/${pageId}/pageImageData/${pageId}.json`, JSON.stringify(res, null, 2));
                })
            })
        }
    })
    .catch(error => console.error("❌ Notion API の取得でエラー:", error)); // 🔴 catch() 追加

// const title = "pythonのインストール"
// getSingleData(title).then(item=>{
//     item.map((data)=>{
//     getSinglePage(title).then(async({mdBlocks,pageId})=>{
//         await insertCurriculum(data,pageId)
//         const ogsDir = `./public/notion_data/eachPage/${pageId}/ogsData/`;
//         const imageDir = `./public/notion_data/eachPage/${pageId}/image/`;
//         const iframeDir = `./public/notion_data/eachPage/${pageId}/iframeData/`;
//         const pageImageDir = `./public/notion_data/eachPage/${pageId}/pageImageData/`;
//         const dirList = [ogsDir,imageDir,iframeDir,pageImageDir]
//         mkAndClearDir(dirList)
//         await fetchAllMdBlock(mdBlocks, pageId);
//         const res = await getSinglePageBlock(pageId);
//         fs.writeFileSync(`./public/notion_data/eachPage/${pageId}/pageImageData/${pageId}.json`, JSON.stringify(res, null, 2));
//         if(res.icon && res.icon.type==="file"){
//             let exte = res.icon.file.url.split(".")[1];
//             if(exte===undefined || (exte!=="png" && exte!="jpg"  && exte!="svg")){
//                 exte = "png";
//             }
//             await downloadImage(res.icon.file.url, `./public/notion_data/eachPage/${pageId}/pageImageData/icon/${pageId}.${exte}`)
//         }
//         if(res.cover && res.cover.type==="file"){
//             let exte = res.cover.file.url.split(".")[1];
//             if(exte===undefined || (exte!=="png" && exte!="jpg")){
//                 exte = "png";
//             }
//             await downloadImage(res.cover.file.url, `./public/notion_data/eachPage/${pageId}/pageImageData/cover/${pageId}.${cover}`)
//         }
//         await deletePage(pageId)
//         await insertblock(pageId,pageId,mdBlocks,pageId)
//     })})
// })

// getSingleData(title).then(data=>console.log(data))