type Data = {
    icon: {
      type: string;
      file: {
        url: string;
      } | undefined;
      external:{
        url:string;
      } | undefined;
      emoji:string | undefined;
    } | null;
    cover:{
        type:string;
        file: {
            url: string;
        } | undefined;
        external:{
            url:string; 
        } | undefined;
    } | null;
  }

export const getIcon=async(pageId:string,curriculumId:string)=>{
    const res = await fetch(`/horizon-atlas/notion_data/eachPage/${curriculumId}/pageImageData/${pageId}.json`)
    const data:Data = await res.json();
    if(data.icon){
        if(data.icon.type==="file"){
            if(data.icon.file){
                const url = data.icon.file.url
                return {type:"file",url:url.replace("./public","/horizon-atlas")}
            }
        }else if(data.icon.type==="external"){
            if(data.icon.external){
                return {type: "external",url:data.icon.external.url}
            }
        }else if(data.icon.type==="emoji"){
            if(data.icon.emoji){
                return {type:  "emoji",url: data.icon.emoji}
            }
        }
    }
    return {type:"",url:"/horizon-atlas/file_icon.svg"};
}
