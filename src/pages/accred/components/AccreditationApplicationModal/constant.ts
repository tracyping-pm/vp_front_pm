import dayjs from 'dayjs';
import { IValue } from '../AccreditationUpload';
import { SUB_FILE_CATEGORY_ID } from '../AccreditationUpload/constants';
export const accreditationValidator = async (
  value: IValue,
  required: boolean,
  fileCategory: string,
  id?: string,
) => {
  const {
    subFileCategory,
    validDateStart,
    validDateEnd,
    validIndefinitely,
    materialIdList = [],
  } = value ?? {};
  const showSubFileCategory = id === SUB_FILE_CATEGORY_ID;
  if (validIndefinitely || (validDateStart && validDateEnd)) {
    if (validDateStart && validDateEnd) {
      const today = dayjs().startOf('day');
      const startDate = dayjs(validDateStart).startOf('day');
      const endDate = dayjs(validDateEnd).startOf('day');
      if (startDate.isAfter(today) || endDate.isBefore(today)) {
        // 认证文件若填写有效期，其有效期需包含当天。否则失焦后该框标红并提示“The validity period  must include today.”
        return Promise.reject(
          new Error('The validity period must include today.'),
        );
      }
    }

    if (materialIdList?.length > 0) {
      if (showSubFileCategory) {
        if (subFileCategory) {
          return Promise.resolve(true);
        } else {
          return Promise.reject(new Error(`Please select the Type`));
        }
      } else {
        // 有日期有文件
        return Promise.resolve(true);
      }
    } else {
      if (showSubFileCategory) {
        if (subFileCategory) {
          // 有日期没文件
          return Promise.reject(
            new Error(
              `The validity period and the type is set, the file must be uploaded`,
            ),
          );
        } else {
          return Promise.reject(
            new Error(
              `The validity period is set, the file must be uploaded and the type must be selected`,
            ),
          );
        }
      } else {
        // 有日期没文件
        return Promise.reject(
          new Error(`The validity period is set and the file must be uploaded`),
        );
      }
    }
  } else {
    if (materialIdList?.length > 0) {
      if (showSubFileCategory) {
        if (subFileCategory) {
          // 没日期有文件有子类
          return Promise.reject(
            new Error(
              `Uploaded file and selected the type, the validity period must fill`,
            ),
          );
        } else {
          // 没日期有文件无子类
          return Promise.reject(
            new Error(
              `Upload file must fill in the validity period and select the type`,
            ),
          );
        }
      } else {
        // 没日期有文件
        return Promise.reject(
          new Error(`Upload file must fill in the validity period`),
        );
      }
    } else {
      if (showSubFileCategory) {
        if (subFileCategory) {
          return Promise.reject(
            new Error(
              `The type set and must fill in the validity period and upload file`,
            ),
          );
        } else {
          // 没日期没文件没子类
          if (required) {
            return Promise.reject(new Error(`${fileCategory} is required`));
          } else {
            return Promise.resolve(true);
          }
        }
      } else {
        // 没日期没文件
        if (required) {
          return Promise.reject(new Error(`${fileCategory} is required`));
        } else {
          return Promise.resolve(true);
        }
      }
    }
  }
};
