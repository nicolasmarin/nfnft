import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import { AppConfig } from '@/utils/AppConfig';

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Main = (props: IMainProps) => (
  <div className="w-full px-1 text-gray-700 antialiased">
    {props.meta}

    <div className="w-full">
      <header className="border-b border-gray-300 flex justify-between items-center py-4">
        <div className="ml-10">
          <h1 className="text-3xl font-bold text-gray-900">
            <Image width="170" height="50" src="/logo-text.svg" alt={AppConfig.description} priority={false} />
          </h1>
        </div>
        <div className="mr-10">
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl content py-5 text-xl">
        {props.children}
      </main>

      <footer className="p-4 bg-gray-200 sm:p-6 text-black">
        <div className="mx-auto max-w-screen-xl">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <Link className="flex items-center mb-4 no-underline" href="/">
                <Image src="/logo.svg" width={32} height={32} className="mr-2 h-8" alt={`${AppConfig.title} Logo`} />
                <span className="self-center text-2xl font-semibold whitespace-nowrap">{AppConfig.title}</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:gap-6">
              <div>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">Follow us</h2>
                <ul className="">
                  <li className="mb-4">
                    <a href="https://twitter.com/nfts2me" target="_blank">Twitter</a>
                  </li>
                  <li>
                    <a href="https://discord.com/invite/Usmgxj2Msk">Discord</a>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">Legal</h2>
                <ul className="">
                  <li className="mb-4">
                    <Link href="#">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link href="#">Terms &amp; Conditions</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-gray-700 sm:text-center">© 2023 <Link href="/">{AppConfig.title}</Link>. All Rights Reserved. </span>
            <div className="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
              <a href="https://twitter.com/agsola" target="_blank" className="text-gray-700 hover:text-black dark:hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
);

export { Main };
