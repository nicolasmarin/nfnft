import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

import { AppConfig } from '@/utils/AppConfig';

const Index = () => {

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
        LANDING
      </div>
    </Main>
  );
};

export default Index;
