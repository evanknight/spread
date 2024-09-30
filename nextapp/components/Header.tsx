import React from "react";
import { Menu } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface HeaderProps {
  fetchGamesFromAPI: () => void;
  signOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ fetchGamesFromAPI, signOut }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/images/logos/logo-dark.png"
            alt="The Spread Logo"
            width={150}
            height={50}
            className="hidden dark:block"
          />
          <Image
            src="/images/logos/logo-light.png"
            alt="The Spread Logo"
            width={150}
            height={50}
            className="block dark:hidden"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              <EllipsisHorizontalIcon
                className="w-7 h-7 text-gray-400"
                aria-hidden="true"
              />
            </Menu.Button>
            <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={fetchGamesFromAPI}
                      className={`${
                        active
                          ? "bg-blue-500 text-white"
                          : "text-gray-900 dark:text-gray-300"
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Fetch Games from API
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={signOut}
                      className={`${
                        active
                          ? "bg-blue-500 text-white"
                          : "text-gray-900 dark:text-gray-300"
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Sign Out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Header;
