import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { IPhoneSelectOptionsItem } from '@/enums';
import { request } from '@umijs/max';
import {
  CommonUploadOptions,
  ICommonMaterial,
  IFieldQueryHighlightParams,
  IFieldQueryHighlightRes,
  IMaterialFileParams,
  IMaterialImageParams,
  RequestPromise,
} from './types/common';

export const fieldQueryHighlight = (
  params: IFieldQueryHighlightParams,
  signal: AbortSignal,
): RequestPromise<IFieldQueryHighlightRes[]> => {
  return request(`/api/vendor-portal/es/fieldQueryHighlight`, {
    method: 'post',
    data: params,
    signal: signal,
  });
};

export const commonUpload = (options: CommonUploadOptions) => {
  const { url, method, formData, signal, progressCallback } = options;
  return request(url, {
    method,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: any) => {
      const percent = Math.floor(
        (progressEvent.loaded / progressEvent.total) * 100,
      );
      console.log(`文件上传进度:${percent}%`);
      progressCallback?.(percent);
    },
    data: formData,
    signal,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const materialImage = (
  params: IMaterialImageParams,
): RequestPromise<any> => {
  const { materialId, driveFileId } = params;

  return request(
    `/api/vendor-portal/materials/${materialId}/image/${driveFileId}`,
    {
      method: 'get',
    },
  );
};

export const materialFile = (
  params: IMaterialFileParams,
): RequestPromise<any> => {
  const { materialId, driveFileId, fileName } = params;

  return request(
    `/api/vendor-portal/materials/${materialId}/file/${driveFileId}?fileName=${fileName}`,
    {
      method: 'get',
      timeout: FILE_UPLOAD_TIMEOUT,
      // skipErrorHandler: true,
    },
  );
};

// 内部使用
// 地址转换
export const locationConvert = (params: {
  spreadsheetId: string;
  sheetName: string;
}): RequestPromise<null> => {
  return request(`/api/temp/location/locationConvert`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const materialPreview = (
  params: IMaterialImageParams,
): RequestPromise<string> => {
  const { materialId, driveFileId } = params;

  return request(
    `/api/vendor-portal/materials/${materialId}/preview/${driveFileId}`,
    {
      method: 'get',
    },
  );
};

export const getImageSource = async (material: ICommonMaterial) => {
  const payload = {
    materialId: material.fileMaterialId,
    driveFileId: material.fileDriveId,
  };
  const res = await materialImage(payload);

  return new Promise((resolve, reject) => {
    if (res.code === 200) {
      const src = `data:${material.fileMimeType};base64,${res.data}`;
      resolve({
        material,
        src,
      });
    } else {
      reject();
    }
  });
};

export const getCountryPhone = (): RequestPromise<
  IPhoneSelectOptionsItem[]
> => {
  return request('/api/vendor-portal/phone/list', {
    method: 'get',
  });
};
