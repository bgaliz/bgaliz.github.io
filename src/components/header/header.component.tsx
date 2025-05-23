import React from "react"
import lang from "@/lang/index"

export const Header = () => {
    return (
        <header className="flex z-[1] relative content-center flex-wrap justify-between w-[100%] h-[100px] absolute px-[120px] bg-[#292F3D] bg-transparent">
           <div className="absolute w-full h-full bg-[#303030] left-0 z-[-1] opacity-[20%] drop-shadow-md" /> 
            
            <div>
                <span className="text-2xl">
                    Galiz<strong>Code</strong>
                </span>
            </div>

            <ul className="flex text-base gap-8">
                <li className="content-center">
                    {lang.ptbr.header.menu.home}
                </li>
                <li className="content-center">
                    {lang.ptbr.header.menu.aboutMe}
                </li>
                <li className="content-center">
                    {lang.ptbr.header.menu.projects}
                </li>
                <li className="content-center">
                    {lang.ptbr.header.menu.contact}
                </li>
            </ul>
        </header>
    )
}