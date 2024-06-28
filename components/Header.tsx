import React from "react";
import { ModeToggle } from "./mode-toggle";
import { Github } from "lucide-react";
import Image from "next/image";

const Header = () => {
  return (
    <div className="mb-10 w-full flex items-center justify-between p-5 dark:bg-black dark:backdrop-blur-lg backdrop-blur-lg z-50 top-0 bg-opacity-50 dark:bg-opacity-50 dark:backdrop-filter sticky">
      <div className="flex gap-4 items-center">
        <Image src="/logowebuefa.png" alt="logo" width={50} height={50} />
      <h1 className="text-xl font-bold">Eurocopa 2024</h1>
      </div>
      <div className="flex gap-4">
        <a href="https://github.com/adrianRacovitaJSX/euros24-app" target="_blank" rel="noreferrer">
        <button className="dark:bg-white bg-black text-white dark:text-black px-4 py-2 border-b dark:border-0 rounded-xl flex gap-2">
        <Github /><span className="hidden sm:block">Github</span>
        </button>
        </a>
      
        <ModeToggle />
      </div>
    </div>
  );
};

export default Header;
