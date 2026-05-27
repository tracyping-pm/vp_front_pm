import styles from '@/components/PageLayout/styles.less';
import logoImg from '../../../../../public/img/logo.png';

export default function MenuHeader() {
  return (
    <div className={styles.menu}>
      <img src={logoImg} className={styles.menu_logo} />
      {/*<div className={styles.menu_title}>{title?.props?.children}</div>*/}
    </div>
  );
}
