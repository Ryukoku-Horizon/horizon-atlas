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
        },
        sorts: [{ property: "date", direction: "ascending" }],
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
    const date = properties.date?.date?.start || "";

    return {
        id: post.id,
        title: properties.title?.title?.[0]?.plain_text || "untitled",
        date,
        tags: properties.tag?.multi_select ? getTags(properties.tag.multi_select) : [],
        category: properties.category?.select?.name || "",
        is_basic_curriculum: properties.is_basic_curriculum?.checkbox || false,
        visibility: properties.visibility?.multi_select ? getVisibilities(properties.visibility.multi_select) : []
    };
};

export const getSinglePage = async (title) => {
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
    };
};

// const getSingleblock = async (pageId) => {
//     const response = await notion.pages.retrieve({
//         page_id: pageId,
//       });
//     const filteredData = {
//         icon:response.icon
//     }
//     return response;
// };

const getSingleblock = async (pageId) => {
    const response = await notion.blocks.retrieve({
        block_id:pageId
      });
    
    return {
        icon:response.callout.icon,
        color:response.callout.color,
    };
};

// getAllData().then(data=>{console.log(data)})


// getAllData().then(data=>{
//     console.log(data);
//     fs.writeFileSync(`./public/notion_data/eachPage/${slug}/iframeData/${block.blockId}.json`, JSON.stringify(saveData, null, 2));
// })

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const l = [];

function writeBlock(block){
    getSingleblock(block.blockId).then(data_=>{
        l.push(data_)
    })
    if(block.children.length!==0){
        block.children.map((child)=>{
            writeBlock(child)
        })
    }
}

// getSinglePage("test").then(data=>{
//     data.map((item)=>{
//         console.log(item.blockId)
//         writeBlock(item)
//     })
//     wait(1000).then(_=>{
//         fs.writeFileSync(`./public/notion_data/page.json`, JSON.stringify(l, null, 2));
//     })
// })

getSinglePage("test").then(async({mdBlocks})=>{
    const a = [];
    for(const block of mdBlocks){
        const item = await getSingleblock(block.blockId)
        if(item.icon && item.icon.emoji){
            const parent = block.parent.replace(`${item.icon.emoji} `,"")
            const data = {
                ...item, 
                parent}
                a.push(data)
        }else{
            const data = {
                ...item, 
                parent:block.parent}
            a.push(data)
        }
    }
    fs.writeFileSync(`./public/notion_data/class.json`, JSON.stringify(a, null, 2))
})

// getSingleblock("1b7a501ef33780988739fe7c1d839004").then(item=>{
//     fs.writeFileSync(`./public/notion_data/class.json`, JSON.stringify(item, null, 2))
// })