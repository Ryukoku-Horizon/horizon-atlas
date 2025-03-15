import { deleteData } from "./supabaseDBGateway.js"

export async function deletePage(id){
    const result = await deleteData("PageData","curriculumId",id)
    console.log("deletePage",result)
}

export async function deleteCurriculum(id){
    const result = await deleteData("Curriculum","curriculumId",id)
    console.log("deleteCurriculum",result)
}