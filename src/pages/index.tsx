import Head from 'next/head';
import HomeLayout from '@/modules/home/HomeLayout';
import BuilderLayout from '@/modules/builder/BuilderLayout';

function HomePage() {
  return (
    <div>
      <Head>
        <title>Ai Resume Builder</title>
        <meta name="description" content="Single Page Resume Builder" />
        <link rel="icon" type="image/png" href="/icons/ai-logo.png" />
      </Head>

      {/* <HomeLayout /> */}
      <BuilderLayout />
    </div>
  );
}

export default HomePage;
