import React from "react";
import { ModeToggle } from "./mode-toggle";
import { Github } from "lucide-react";
import Image from "next/image";

const Header = () => {
  return (
    <header className="block sm:sticky top-0 z-50 w-full mb-10">
      <div className="backdrop-blur-lg bg-white/50 dark:bg-black/50 ">
        <div className="mx-auto max-w-[90rem] px-6 py-3">
          <div className="flex items-center justify-between">
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
        </div>
      </div>
    </header>
  );
};

export default Header;