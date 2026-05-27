import { Link } from '@umijs/max';
import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

export interface IBreadcrumbCase {
  indent?: boolean;
  className?: string;
  items: Array<{ name: string; path: string }>;
}

const BreadcrumbCase: FC<IBreadcrumbCase> = ({
  indent = true,
  className,
  items,
}) => {
  return (
    <>
      <div
        className={cls(
          'breadcrumbWrap',
          styles.breadcrumbWrap,
          indent && styles.indent,
          className,
        )}
      >
        {items.map((item, index) => {
          const { name, path } = item;
          return (
            <span key={index}>
              {index === items.length - 1 ? (
                <span className={styles.itemLast}>{name}</span>
              ) : (
                <Link to={path}>
                  <span className={styles.breadcrumbItem}>{name}</span>
                </Link>
              )}
              {index !== items.length - 1 && (
                <span className={styles.breadcrumbArrow}>/</span>
              )}
            </span>
          );
        })}
      </div>
    </>
  );
};

export default BreadcrumbCase;
