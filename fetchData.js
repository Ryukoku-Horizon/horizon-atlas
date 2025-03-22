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
    });

    const allPosts = posts.results;
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

    const allPosts = posts.results;
    return allPosts.map(getPageMetaData);
    // return allPosts
};

const getPageId = async (title) => {
    const res = await notion.databases.query({
        database_id:NOTION_DATABASE_ID,
        filter: {
            property: 'title',
            formula: { string: { equals: title } }
        }
    })
    return res.results[0].id
};

const getPageMetaData = (post) => {
    const getTags = (tags) => tags.map(tag => tag.name || "");
    const getVisibilities = (visibilities) => visibilities.map(visibility=> visibility.name || "");
    const properties = post.properties;

    return {
        id: post.id,
        cover:post.cover,
        icon:post.icon,
        last_edited_time:post.last_edited_time,
        title: properties.title?.title?.[0]?.plain_text || "untitled",
        tags: properties.tag?.multi_select ? getTags(properties.tag.multi_select) : [],
        category: properties.category?.select?.name || "",
        is_basic_curriculum: properties.is_basic_curriculum?.checkbox || false,
        visibility: properties.visibility?.multi_select ? getVisibilities(properties.visibility.multi_select) : [],
        order:properties.order.number
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

    const page = response.results.find(isFullPage);
    if (!page) throw new Error('Page not found');
    const mdBlocks =  await n2m.pageToMarkdown(page.id);
    return {
        mdBlocks,
        pageId:page.id
    };
    // return page
};

const getPage = async (id) => {
    const mdBlocks =  await n2m.pageToMarkdown(id);
    return mdBlocks
};

const getSinglePageData = async (pageId) => {
    const response = await notion.pages.retrieve({
        page_id: pageId,
      });
    return response
};

const getSingleblock = async (blockId) => {
    const response = await notion.blocks.retrieve({
        block_id:blockId
      });
      return response
};

const getChildblock = async (blockId) => {
    const response = await notion.blocks.children.list({
        "block_id":blockId
    })
      return response
};

// getSingleData("test").then(async(d)=>{
//     const data = await getSinglePageData("1b8a501ef337806c8615f492e93f80b0")
//     fs.writeFileSync(`./public/notion_data/class.json`, JSON.stringify(data, null, 2))
// })

getPage("1bea501ef33780dc9a9cd815e91b852e").then((data)=>
    fs.writeFileSync(`./public/notion_data/class.json`, JSON.stringify(data, null, 2))
)

// getAllData().then(data=>fs.writeFileSync(`./public/notion_data/class.json`, JSON.stringify(data, null, 2)))
