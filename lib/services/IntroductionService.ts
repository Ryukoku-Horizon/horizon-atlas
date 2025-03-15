import { IntroductionGateway } from "../Gateways/IntroductionGateway"

export class IntroductionService{
    static getAllIntroduction=async()=>{
        const data = await IntroductionGateway.getAllIntroduction();
        return data.map((item)=>{
            return {
                title:item.title,
                description:item.description,
                pageId:item.pageId
            }
        })
    }
    static getIntroduction=async(pageId:string)=>{
        const data = await IntroductionGateway.getIntroduction(pageId);
        return {
            title:data[0].title,
            description:data[0].description,
            pageId:data[0].pageId
        }
    }
}