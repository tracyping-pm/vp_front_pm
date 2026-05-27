export interface IChangePassword {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface IUserList {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  aliasName?: string;
  email?: string;
}

export interface IVendorId {
  id: number;
}
