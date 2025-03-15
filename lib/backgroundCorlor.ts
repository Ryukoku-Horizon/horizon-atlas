import { CSSProperties } from "react"

export const getColorProperty=(color:string):CSSProperties=>{
    if(color==="default_background"){
        return {backgroundColor:"white",borderWidth:"1px",borderColor:"rgb(212 212 212)"}
    }else if(color==="gray_background"){
        return {backgroundColor:"rgb(248, 248, 247)"}
    }else if(color==="brown_background"){
        return {backgroundColor:"rgb(244, 238, 238)"}
    }else if(color==="orange_background"){
        return {backgroundColor:"rgb(251, 236, 221)"}
    }else if(color==="yellow_background"){
        return {backgroundColor:"rgb(251, 243, 219)"}
    }else if(color==="green_background"){
        return {backgroundColor:"rgb(237, 243, 236)"}
    }else if(color==="blue_background"){
        return {backgroundColor:"rgb(231, 243, 248)"}
    }else if(color==="purple_background"){
        return {backgroundColor:"rgb(248, 243, 252)"}
    }else if(color==="pink_background"){
        return {backgroundColor:"rgb(252, 241, 246)"}
    }else if(color==="red_background"){
        return {backgroundColor:"rgb(253, 235, 236)"}
    }
    return {backgroundColor:"white",borderWidth:"1px",borderColor:"rgb(212 212 212)"}
}