import PageHeader from '@/components/PageLayout/components/Header';
import React from 'react';
import styles from './styles.less';

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <PageHeader />
      <div className={styles.page_content}>{props.children}</div>
    </div>
  );
}
