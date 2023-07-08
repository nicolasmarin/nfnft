import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

import { AppConfig } from '@/utils/AppConfig';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

const Index = () => {
  const [ projects, setProjects]  = useState([]);
  const { address: wallet, isConnected } = useAccount();

  useEffect(() => {
    const getProjects = async () => {
      let data = { 
        wallet
      }
      const responseProjects = await fetch(
        `/api/get-projects/`,
        {
          body: JSON.stringify(data),
          method: 'POST'
        }
      );

      const projectsJSON = await responseProjects.json();
      console.log("projectsJSON?.projects?.rows", projectsJSON)
      setProjects(projectsJSON?.projects?.rows);
    }

    if (isConnected) {
      getProjects();
    }
  }, [isConnected, wallet])

  console.log("projects", projects)

  return (
    <Main
      meta={
        <Meta
          title={AppConfig.title}
          description={AppConfig.description}
        />
      }
    >
      <div className="min-h-screen text-4xl">
        <Link href="/app/create/" className="">
          <div className="relative mt-10 rounded-lg border px-2 md:px-10 border-gray-300 bg-white shadow-sm md:space-x-3 hover:shadow-lg transition duration-150">
            <div className="flex items-center justify-center text-3xl font-bold py-5 text-black">
              <div className="w-7 h-7 inline-flex flex-shrink-0 text-current mr-2">
                <svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="block overflow-hidden pointer-events-none w-full h-full">
                  <path d="m5.33337 1.33337-4 4 3.33334 3.33334-2.66667 2.66669v2.6666h2.66667l2.66666-2.6666 3.33333 3.3333 4-4-3.3333-3.33333 3.138-3.13802c.2607-.26066.2607-.68271 0-.94271l-1.724-1.72395c-.13-.13-.3006-.19532-.4713-.19532s-.3414.06532-.4714.19532l-3.13799 3.13802zm6.94273 1.60938.7812.78125-.8619.86198-.7813-.78125zm-6.94273.27604 2.39063 2.39063-2.11458 2.11458-2.39063-2.39063zm5.13803 1.52865.7812.78125-7.13798 7.13801h-.78125v-.7812zm-.0807 3.52864 2.3906 2.39062-2.1146 2.1146-2.39062-2.3906z" fill="currentColor"></path>
                </svg>
              </div>Create New Project
            </div>
          </div>
        </Link>
      </div>
    </Main>
  );
};

export default Index;
