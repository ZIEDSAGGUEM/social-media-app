"use client";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import Image from "next/image";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { searchUsers } from "@/lib/actions";
const Navbar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    try {
      const users = await searchUsers(query);
      setResults(users);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce the search function

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="h-24 flex items-center justify-between">
      {/* LEFT */}
      <div className="md:hidden lg:block w-[20%]">
        <Link
          href="/"
          className="font-bold text-3xl bg-gradient-to-r from-green-500 to-purple-600 text-transparent bg-clip-text"
        >
          Z_SOCIAL
        </Link>
      </div>
      {/* CENTER */}
      <div className="hidden md:flex w-[50%] text-sm items-center justify-between">
        {/* LINKS */}
        <div className="flex gap-6 text-gray-300">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/home.png"
              alt="Homepage"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span>Homepage</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/friends.png"
              alt="Friends"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span>Friends</span>
          </Link>
        </div>
        <div className="relative hidden xl:flex p-2 bg-slate-100 items-center rounded-full shadow-sm focus-within:shadow-md transition-shadow duration-200">
          {/* Input field */}
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none w-full pl-4 pr-2 py-2 rounded-full text-gray-400 placeholder-gray-400 focus:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* Search icon */}
          <Image
            src="/search.png"
            alt="search"
            width={16}
            height={16}
            className="mr-4 cursor-pointer"
          />

          {/* Search results dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 p-3 z-10">
              {results.map((user) => (
                <Link
                  href={`/profile/${user.username}`}
                  key={user.id}
                  className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200"
                >
                  {/* User avatar */}
                  <Image
                    src={user.avatar || "/defaultAvatar.png"}
                    alt="avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />

                  {/* User details */}
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">
                      {user.name || user.username}
                    </p>
                    <p className="text-sm text-gray-500">{user.surname}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-[30%] flex items-center gap-4 xl:gap-8 justify-end">
        <ClerkLoading>
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div className="cursor-pointer">
              <Image src="/people.png" alt="" width={24} height={24} />
            </div>
            <div className="cursor-pointer">
              <Image src="/messages.png" alt="" width={20} height={20} />
            </div>
            <div className="cursor-pointer">
              <Image src="/notifications.png" alt="" width={20} height={20} />
            </div>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2 text-sm text-white">
              <Image src="/login.png" alt="" width={20} height={20} />
              <Link href="/sign-in">Login/Register</Link>
            </div>
          </SignedOut>
        </ClerkLoaded>
        <MobileMenu />
      </div>
    </div>
  );
};

export default Navbar;
