import useUserProfileStore from "@/stores/userProfile";
import { useCallback, useEffect, useState } from "react";
import useCheckVisiblityAnswer from "./useCheckVisiblityAnswer";

const useCheckRole=(visibility:string[],resourceType:"answer" | "info" | "curriculum",answerTitle:string)=>{
    const { userProfile } = useUserProfileStore();
    const [notVisible,setNotVisible] = useState(false);
    const [roleChecking,setRoleChecking] = useState(false)
    const [cannotLoad,setCannotLoad] = useState(false)
    const answerVisiblity = useCheckVisiblityAnswer()

    const checkRole=useCallback(async()=>{
        try{
            const usersRole = userProfile ? (userProfile.given_name ?? "体験入部") : "ゲスト";
            const isVisible = visibility.some((item)=>item===usersRole || item==="ゲスト")
            if(!isVisible && usersRole!=="幹事長" && usersRole!=="技術部員" && usersRole!=="admin"){
                setNotVisible(true)
            }else{
                if(resourceType==="answer"){
                    if(!userProfile){
                        setNotVisible(true)
                        return;
                    }
                    const progress = await answerVisiblity.getData(userProfile)
                    if(progress===null){
                        setNotVisible(true)
                        setCannotLoad(true)
                        return
                    }
                    const target = progress.find((p)=>p.title===answerTitle)
                    if(target?.value){
                        setNotVisible(false)
                        return
                    }
                    setNotVisible(true)
                    return
                }
                setNotVisible(false)
            }
        }finally{
            setRoleChecking(false)
        }
    },[userProfile,visibility])

    useEffect(()=>{
        checkRole()
    },[checkRole])

    return {
        notVisible,roleChecking,cannotLoad
    }
}

export default useCheckRole