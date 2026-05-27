import { Popover, PopoverProps } from 'antd';
import { TooltipPlacement } from 'antd/es/tooltip';
import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

export interface ICustomPopover extends PopoverProps {
  rootClassName?: string;
  className?: string;
  placement?: TooltipPlacement;
  children?: React.ReactNode;
}

const CustomPopover: FC<ICustomPopover> = ({
  rootClassName,
  className,
  placement = 'topLeft',
  children,
  ...rest
}) => {
  return (
    <>
      <Popover
        rootClassName={cls(styles.customPopoverRoot, rootClassName)}
        className={cls(className)}
        placement={placement}
        {...rest}
      >
        {children}
      </Popover>
    </>
  );
};

export default CustomPopover;
