import { ProTokenType } from '@ant-design/pro-components';
import { ThemeConfig } from 'antd';
import { ComponentStyleConfig } from 'antd/es/config-provider/context';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#009688',
    borderRadius: 6,
    borderRadiusLG: 6,
    borderRadiusSM: 6,
    colorLink: '#009688',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
  },
  components: {
    Table: {
      headerColor: '#818181',
      headerSplitColor: '#D9D9D9',
      headerBg: '#fff',
      cellPaddingBlock: 8,
      cellPaddingInline: 8,
      borderColor: '#eee',
      cellFontSize: 14,
      selectionColumnWidth: 36,
    },
    Button: {
      contentFontSize: 14,
    },
  },
};

export const proLayoutToken: ProTokenType['layout'] = {
  colorPrimary: '#009688',
  header: {
    colorBgHeader: '#FFFFFF',
    colorHeaderTitle: '#000000',
    heightLayoutHeader: 50,
  },
  sider: {
    menuHeight: 38,
    colorMenuBackground: '#F8F9FB',
    colorTextMenu: '#061237',
    colorBgMenuItemSelected: '#009688',
    colorTextMenuSelected: '#FFFFFF',

    // colorTextMenuItemHover: '#009688',
    // colorTextSubMenuSelected: '#009688',
    // colorTextMenuTitle: '#009688',
  },
  pageContainer: {
    colorBgPageContainer: '#FFFFFF',
    paddingBlockPageContainerContent: 12,
    paddingInlinePageContainerContent: 12,
  },
};

export const tableStyleConfig: ComponentStyleConfig = {
  className: 'inteluck-wms-table',
};
