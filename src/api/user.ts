import { request } from "@/utils/service"

interface ICreateUserDataApi {
  username: string
  nickname: string
  password?: string
  phone?: string
  email?: string
  role: string
}

interface IUpdateUserDataApi {
  id: string
  phone?: string
  email?: string
  role?: string
  enable?: boolean
  password?: string
}

interface IGetUserDataApi {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数 */
  username?: string
  phone?: string
  nickname?: string
}

/** 增 */
export function createUserDataApi(data: ICreateUserDataApi) {
  return request({
    url: "user",
    method: "post",
    data
  })
}

/** 删 */
export function deleteUserDataApi(id: string) {
  return request({
    url: `user/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateUserDataApi(data: IUpdateUserDataApi) {
  return request({
    url: "user",
    method: "post",
    data
  })
}

/** 查 */
export function getUserDataApi(params: IGetUserDataApi) {
  return request({
    url: "user/page",
    method: "get",
    params
  })
}

/** 检查密码是否正确 */
export function checkPasswordApi(data: IUpdateUserDataApi) {
  return request({
    url: "user/checkPassword",
    method: "post",
    data
  })
}

/** 更改用户状态 */
export function updateUserEnableApi(data: IUpdateUserDataApi) {
  return request({
    url: "user",
    method: "post",
    data
  })
}
