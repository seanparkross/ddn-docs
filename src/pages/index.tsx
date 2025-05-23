import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div
          style={{
            display: `flex`,
            flexDirection: `column`,
            placeItems: `center`,
          }}
        >
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
        <div className='flex justify-center flex-w'>
          <Link className="button button--primary button--lg m-2" to="/index">
            Hasura Docs
          </Link>
          <Link className="button button--secondary button--lg m-2" to="/wiki/">
            Docs Wiki
          </Link>
        </div>
        <div className={"flex justify-center"}>
          <img src={useBaseUrl('/img/hasuras.png')} alt="Hasuras Image"/>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Hasura gives you instant GraphQL APIs on your data sources. Point Hasura to your preferred internal and external data sources, setup relationships and security rules on your data models across sources and get a managed unified GraphQL API to build modern applications, instantly."
    >
      <HomepageHeader />
      <main></main>
    </Layout>
  );
}
