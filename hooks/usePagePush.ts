// use_client
import { useRouter } from "next/router";
import { useCallback } from "react";

export function usePageLink(){
    const router = useRouter()
    const {category} = router.query as {category: string | undefined}

    const scrollToSection = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            const yOffset = -100; 
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
        element?.classList.add("highlight")
        setTimeout(()=>{
            element?.classList.remove("highlight");
        },1600)
    };

    const handleClick =useCallback((href?:string | null, scroll?:string,is_same_bp?:boolean)=>{
        if(href && href!==""){

            let targetHref = href;
            // "posts/curriculums/p/" のような形になっていたら "posts/curriculums/" に直す
            // (ドメイン付きでも対応できるようにする)
            if (targetHref.includes("/posts/curriculums/p/")) {
                targetHref = targetHref.replace("/posts/curriculums/p/", "/posts/curriculums/");
            }
            // 自ドメインが含まれている場合は相対パス化
            const domainAndBase = "https://ryukoku-horizon.github.io/horizon-atlas";
            if (targetHref.startsWith(domainAndBase)) {
                targetHref = targetHref.replace(domainAndBase, "");
            }
            if (targetHref === "") targetHref = "/";

            if(router.asPath===targetHref){
                if(scroll){
                    scrollToSection(scroll)
                }
            }else{
                if(scroll){
                    if(category && is_same_bp){
                        const query = `?category=${category}`
                        router.push(`${targetHref}${query}#${scroll}`)
                        return;
                    }else{
                        router.push(`${targetHref}#${scroll}`)
                    }
                }else{
                    if(targetHref.startsWith("/posts/curriculums") || targetHref.startsWith("https://ryukoku-horizon.github.io/horizon-atlas")){
                        if(category && is_same_bp){
                            const query = `?category=${category}`
                            router.push(`${targetHref}${query}`)
                            return;
                        }
                        router.push(`${targetHref}`)
                    }else if(!targetHref.startsWith("http://") && !targetHref.startsWith("https://")){
                        return;
                    }else{
                        window.open(targetHref, '_blank')
                    }
                }
            }
        }
    },[category])

    return {handleClick}
}