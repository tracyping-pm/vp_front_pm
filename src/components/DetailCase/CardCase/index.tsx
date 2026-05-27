import { Spin } from 'antd';
import cls from 'classnames';
import React from 'react';
import styles from './index.less';

interface ICardCase {
  title?: string | React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  spinning?: boolean;
  extra?: React.ReactNode;
}

const CardCase: React.FC<ICardCase> = ({
  className,
  title,
  children,
  spinning = false,
  extra,
}) => {
  return (
    <>
      <div className={cls(styles.cardCaseWrap, 'cardCaseWrap', className)}>
        {title && (
          <div className="title-wrap">
            <span className="title">{title}</span>
            <span className="extra">{extra}</span>
          </div>
        )}
        <Spin spinning={spinning}>
          <div className="border-content">{children}</div>
        </Spin>
      </div>
    </>
  );
};

export default CardCase;
