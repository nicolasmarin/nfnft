import type { ReactNode } from 'react';

type IMintingPageProps = {
  meta: ReactNode;
  children: ReactNode;
};

const MintingPage = (props: IMintingPageProps) => (
  <div className="w-full text-gray-700 antialiased">
    {props.meta}

    <div className="w-full min-h-screen">
        {props.children}
    </div>
  </div>
);

export { MintingPage };
