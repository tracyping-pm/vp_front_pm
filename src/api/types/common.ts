import { IFile_2 } from '@/components/CustomUpload/genAI';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';

export type RequestPromise<T> = Promise<APIJSON<T>>;

export interface IDynamicFuzzyParams {
  projectId?: number;
  approved?: number;
  uniqueLogic?: FieldQueryHighlightUniqueLogicEnum;
  uniqueLogicParams?: { [key: string]: any };
}

export interface IFieldQueryHighlightParams extends IDynamicFuzzyParams {
  field: string;
  value: string;
  esDtoClass: string;
  type: FieldQueryHighlightTypeEnum;
  [key: string]: any;
}

export interface IFieldQueryHighlightRes {
  id?: number;
  name: string;
  nameHighlight: string;
  [key: string]: any;
}

export interface CommonUploadOptions {
  url: string;
  method: 'post' | 'put';
  formData: FormData;
  signal: AbortSignal;
  progressCallback?: (v: number) => void;
}

export interface IMaterialImageParams {
  materialId: number | string;
  driveFileId: number | string;
}

export interface IMaterialFileParams {
  materialId: number | string;
  driveFileId: number | string;
  fileName: string;
}

export interface ICommonListItem {
  label: string | number;
  value: string | number;
}

export interface ICommonMaterial {
  fileMaterialId: number;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailUrl: string;
  file_2?: IFile_2;
}

export interface ISourceImage {
  material: any;
  src: string;
}

export interface IImageState {
  pending: boolean;
  visible: boolean;
  index: number;
  sourceImages: ISourceImage[];
}
