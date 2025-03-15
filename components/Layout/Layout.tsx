"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import Footer from "./Footer/Footer";
import Header from "./Header/Header";
import { pageNav } from "@/types/pageNav";
import Navbar from "./Navbar/navbar";
import Sidebar from "./Sidebar/Sidebar";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { CustomUser } from "@/global";
import { Loader2 } from "lucide-react";

type LayoutProps = {
  children: ReactNode;
  pageNavs: pageNav[];
  sideNavProps?: {
    title: string;
    childPages?: pageNav[];
  };
};

const Layout: React.FC<LayoutProps> = ({ children, pageNavs, sideNavProps }) => {
  const [isVisible, setIsVisible] = useState(true); // ヘッダーの表示状態
  const [lastScrollY, setLastScrollY] = useState(0); // 最後のスクロール位置
  const [openbar, setOpenbar] = useState(false);
  const { isAuthenticated,user,logout,isLoading } = useAuth0();

  useEffect(()=>{
    if(isAuthenticated){
      const customUser = user! as CustomUser;
      const checkGuild = async()=>{
        const isMember = customUser.profile
        if (!isMember) {
          alert("Horizonメンバーアカウント以外はログインできません");
          logout({ logoutParams: { returnTo: process.env.NEXT_PUBLIC_ROOT_PATH } });
        } else {
          // setAllowed(true);
        }
      }
      checkGuild();
    }
  },[isAuthenticated,user,isLoading])

  useEffect(() => {
    if (window !== undefined) {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [lastScrollY]);

  if (isLoading) {
    return <LoadingScreen />;
  }
  if(!isAuthenticated){
    return <LoginModal />
  }

    return (
      <div className="bg-white min-h-screen flex flex-col">
      <Head>
        <title>HorizonAtlas</title>
        <meta name="description" content="HorizonAtlasは、学習カリキュラムをまとめたHorizon部員専用のサービスです。" />
        <meta property="og:image" content="/horizon-atlas/app_image.png" />
        <link rel="icon" href="/horizon-atlas/favicon.ico" />
      </Head>
      <Sidebar openbar={openbar} setOpenbar={setOpenbar} pageNav={sideNavProps} />
      <div
        className="fixed top-0 z-50 w-full duration-500"
        style={isVisible ? { transform: "translateY(0px)" } : { transform: "translateY(-65%)" }}
      >
        <Header setOpenbar={setOpenbar} />
        <Navbar pageNavs={pageNavs} />
      </div>
      <div className="bg-gray-50 flex-grow">
        {children}
        <div className="h-5"></div>
      </div>
      <Footer />
    </div>
    
    );
};

function LoginModal() {
  const redirectUri =
    process.env.NEXT_PUBLIC_ROOT_PATH ?? "https://sakiyamamamama.github.io/horizon-atlas";
  const router = useRouter();
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">ログインが必要です</h2>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          onClick={() => {
            router.push(redirectUri);
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-purple-400" size={48} />
      <p className="text-lg font-semibold text-gray-700">読み込み中...</p>
    </div>
  );
}

export default Layout;
