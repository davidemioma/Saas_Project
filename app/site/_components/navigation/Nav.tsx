import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ModeTggle";

const Nav = () => {
  return (
    <div className="fixed top-0 inset-x-0 z-10 bg-background flex items-center justify-between p-4">
      <aside className="flex items-center gap-2">
        <Image
          src="./assets/plura-logo.svg"
          width={40}
          height={40}
          alt="plural-logo"
        />

        <span className="text-xl font-bold"> Plura.</span>
      </aside>

      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <Link href={"#"}>Pricing</Link>

          <Link href={"#"}>About</Link>

          <Link href={"#"}>Documentation</Link>

          <Link href={"#"}>Features</Link>
        </ul>
      </nav>

      <aside className="flex gap-2 items-center">
        <Link
          href={"/agency"}
          className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
        >
          Login
        </Link>

        <UserButton />

        <ModeToggle />
      </aside>
    </div>
  );
};

export default Nav;
