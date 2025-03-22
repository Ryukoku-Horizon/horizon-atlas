import fs from "fs";
import { getEditTimeData,getAllData,getSinglePage,getAllCategory } from "./lib/notionGateway.js";
import { insertCurriculum,insertblock,insertCategory } from "./lib/insert.js";
import {fetchAllMdBlock} from "./lib/dataSave.js"
import { deletePage,deleteCurriculum,deletePageByCurriculumId,deleteCategory } from "./lib/delete.js";
import path from "path";


const getCurrentData=async()=>{
    const editTimeData = await getEditTimeData();
    const currentData = fs.readFileSync("./notion_last_edit/curriculum.json");
    const parsedData = JSON.parse(currentData)
    const newData = editTimeData.filter((item1)=>parsedData.every((item2)=>item1.id !== item2.id))
    const editedData = editTimeData.filter((item1)=>parsedData.some((item2)=>item1.Last_edited_time !== item2.Last_edited_time && item1.id === item2.id))
    const deleteData = parsedData.filter((item1)=>editTimeData.every((item2)=>item1.id!==item2.id))
    console.log("edited",editedData)
    console.log("new",newData)
    console.log("delete",deleteData)
    fs.writeFileSync(`./notion_last_edit/curriculum.json`, JSON.stringify(editTimeData, null, 2))
    const categories = await getAllCategory()
    for(const category of categories){
        console.log("delete:",category.title)
        await deleteCategory(category.id)
        console.log("insert:",category.title)
        await insertCategory(category)
    }
    if(newData.length===0 && editedData.length===0 && deleteData.length===0){
        return null;
    }
    return {newData,editedData,deleteData}
}

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
        mkdir(dir);
        cleardir(dir);
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const initDir=(pageId)=>{
    const ogsDir = `./public/notion_data/eachPage/${pageId}/ogsData/`;
    const imageDir = `./public/notion_data/eachPage/${pageId}/image/`;
    const iframeDir = `./public/notion_data/eachPage/${pageId}/iframeData/`;
    const pageImageDir = `./public/notion_data/eachPage/${pageId}/pageImageData/`;
    const dirList = [ogsDir,imageDir,iframeDir,pageImageDir]
    mkAndClearDir(dirList);
}

const insertDatas=async(data)=>{
    const {mdBlocks,pageId} =await getSinglePage(data.title)
    await insertCurriculum(data);
    initDir(data);
    await insertblock(pageId,pageId,mdBlocks,pageId)
    await fetchAllMdBlock(mdBlocks,pageId)
}

const editDatas=async(data)=>{
    const {mdBlocks,pageId} = await getSinglePage(data.title)
    await insertCurriculum(data);
    initDir(data);
    await deletePage(pageId);
    await insertblock(pageId,pageId,mdBlocks,pageId)
    await fetchAllMdBlock(mdBlocks,pageId)
}

const deleteDatas=async(data)=>{
    await deleteCurriculum(data.id);
    await deletePageByCurriculumId(data.id);
    cleardir(`./public/notion_data/eachPage/${data.id}`)
}

getCurrentData().then(async(data)=>{
    if(!data){
        console.log("更新なし");
        process.exit(0);
    }
    try{
        const allData = await getAllData();
        const insertData =  allData.filter((item1)=>data.newData.some((item2)=>item1.id===item2.id))
        for(const item of insertData){
            console.log("reading:",item.title)
            wait(90)
            await insertDatas(item)
        }
        const editData = allData.filter((item1)=>data.editedData.some((item2)=>item1.id===item2.id))
        for(const item of editData){
            console.log("reading:",item.title)
            wait(90)
            await editDatas(item)
        }
        const deleteData = allData.filter((item1)=>data.deleteData.some((item2)=>item1.id===item2.id))
        for(const item of deleteData){
            wait(90)
            await deleteDatas(item)
        }
        return process.exit(0);
    }catch(e){
        console.log("error",e)
        process.exit(1);
    }
})
