import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

import { AppConfig } from '@/utils/AppConfig';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount, useNetwork } from 'wagmi';
import Tooltip from '@/components/Tooltip';
import { GetStaticProps, InferGetStaticPropsType } from 'next';

type Project = {
  wallet: string
  contractAddress: string
  projectName: string
  projectSlug: string
  projectSymbol: string
  projectDescription: string
  projectFee: string
  projectSize: string
  projectSettingPrimarySale: string
  projectSettingSecondarySale: string
  projectSettingStakingRewards: string
  projectSettingPenalty: string
  projectSettingDaysPenalty: string
  artworkURL: string
}


const Index = ({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { chain: activeChain } = useNetwork();
  const { address: wallet, isConnected } = useAccount();

  return (
    <Main
      meta={
        <Meta
          title={AppConfig.title}
          description={AppConfig.description}
        />
      }
    >
      <div>
        {project.projectName}
      </div>
    </Main>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;
  console.log("slug", slug)
  const res = await fetch(
    `http://localhost:3000/api/get-project-by-slug/`,
    {
      body: JSON.stringify({slug: slug}),
      method: 'POST'
    }
  );
  const project: Project = await res.json()
  console.log("project", project)

  return {
    props: {
      project,
    },
  }
}

export async function getStaticPaths() {
  return {
    paths: [
    ],
    fallback: "blocking"
  };
}

export default Index;
