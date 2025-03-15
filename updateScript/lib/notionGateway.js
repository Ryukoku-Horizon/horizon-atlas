import "dotenv/config"
import { NotionToMarkdown } from "notion-to-md";
import { Client, isFullPage } from "@notionhq/client";

const token = process.env.NOTION_TOKEN_HORIZON
const db = process.env.NOTION_DB_ID_HORIZON

const notion = new Client({ auth:token });
const n2m = new NotionToMarkdown({ notionClient: notion });

export const getEditTimeData = async () => {
    const posts = await notion.databases.query({
        database_id:db,
        page_size: 100,
        filter: {
            property: "published",
            checkbox: {
                equals: true,
            },
        }
    });

    const allPosts = posts.results.filter(isFullPage);
    return allPosts.map(getEditTime);
};

export const getAllData = async () => {
    const posts = await notion.databases.query({
        database_id:db,
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

const getEditTime = (post) => {
    const properties = post.properties;
    const utcDate = new Date(properties["Last edited time"].last_edited_time);

    return {
        id: post.id,
        Last_edited_time:utcDate.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
    };
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

export const getSinglePage = async (title) => {
    const response = await notion.databases.query({
        database_id: db,
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

export const getSinglePageBlock = async (pageId) => {
    const response = await notion.pages.retrieve({
        page_id: pageId,
      });

    return {
        icon:response.icon,
        cover:response.cover
    };
};

export const getSingleblock = async (blockId) => {
    const response = await notion.blocks.retrieve({
        block_id:blockId
      });
    
    return response;
};
