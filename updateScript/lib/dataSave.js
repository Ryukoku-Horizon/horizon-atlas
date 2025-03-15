import "dotenv/config"
import path from "path";
import axios from "axios";
import ogs from "open-graph-scraper";
import fs from "fs";
import { getSinglePageBlock } from "./notionGateway.js";

const IFRAMELY_API_KEY = process.env.IFRAMELY_API_KEY;

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

export async function getPageIcon(curriculumId,pageId){
    let res = await getSinglePageBlock(pageId);
    if(res.icon && res.icon.type==="file"){
        let exte = res.icon.file.url.split(".")[1];
        if(exte===undefined || (exte!=="png" && exte!="jpg"  && exte!="svg")){
            exte = "png";
        }
        await downloadImage(res.icon.file.url, `./public/notion_data/eachPage/${curriculumId}/pageImageData/icon/${pageId}.${exte}`)
        res.icon.file.url = `./public/notion_data/eachPage/${curriculumId}/pageImageData/icon/${pageId}.${exte}`
    }
    if(res.cover && res.cover.type==="file"){
        let exte = res.cover.file.url.split(".")[1];
        if(exte===undefined || (exte!=="png" && exte!="jpg")){
            exte = "png";
        }
        await downloadImage(res.cover.file.url, `./public/notion_data/eachPage/${curriculumId}/pageImageData/cover/${pageId}.${exte}`)
        res.cover.file.url = `./public/notion_data/eachPage/${curriculumId}/pageImageData/cover/${pageId}.${exte}`
    }
    fs.writeFileSync(`./public/notion_data/eachPage/${curriculumId}/pageImageData/${pageId}.json`, JSON.stringify(res, null, 2));    
}

export const fetchAllMdBlock = async (mdBlocks,id) => {
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
            await getPageIcon(id,block.blockId);
        }
        if (block.children.length > 0) {
            await fetchAllMdBlock(block.children,id);
        }
    }
};