import { request } from "@/utils/service"

export interface ILoginData {
  username: string
  password: string
  /** 验证码 */
  // code: string
}

/** 获取登录验证码 */
// export function getLoginCodeApi() {
//   return request({
//     url: "login/code",
//     method: "get"
//   })
// }
/** 登录并返回 Token */
export function loginApi(data: ILoginData) {
  return request({
    url: "/user/login",
    method: "post",
    data
  })
}
