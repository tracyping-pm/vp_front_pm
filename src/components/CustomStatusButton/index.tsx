import { Button } from 'antd';
import { BaseButtonProps } from 'antd/es/button/button';
import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

export enum ThemeEnum {
  ORANGE = 'orange',
  BLUE = 'blue',
  GREEN = 'green',
  RED = 'red',
  GRAY = 'gray',
  PRIMARY = 'primary',
}

export interface ICustomStatusButton extends BaseButtonProps {
  className?: string;
  theme?: ThemeEnum;
  noStyle?: boolean;
  onClick?: () => void;
}

const CustomStatusButton: FC<ICustomStatusButton> = ({
  theme = ThemeEnum.PRIMARY,
  className = '',
  noStyle,
  ...rest
}) => {
  return (
    <Button
      className={cls(
        styles.btnWrap,
        styles[theme],
        className,
        noStyle && styles.noStyle,
      )}
      type="link"
      {...rest}
    />
  );
};

export default CustomStatusButton;
