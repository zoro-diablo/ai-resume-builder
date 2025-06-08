import Head from 'next/head';
import HomeLayout from '@/modules/home/HomeLayout';
import BuilderLayout from '@/modules/builder/BuilderLayout';

function HomePage() {
  return (
    <div>
      <Head>
        <title>E-Resume: Home</title>
        <meta name="description" content="Single Page Resume Builder" />
        <link rel="icon" type="image/png" href="/icons/resume-icon.png" />
      </Head>

      {/* <HomeLayout /> */}
      <BuilderLayout />
    </div>
  );
}

export default HomePage;
