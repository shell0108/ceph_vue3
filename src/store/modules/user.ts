import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { getToken, removeToken, setToken } from "@/utils/cache/cookies"
import { resetRouter } from "@/router"
import { type ILoginData, loginApi } from "@/api/login"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")
  const roles = ref<string>("")
  const status = ref<number>(0)
  const username = ref<string>("")
  const user_id = ref<string>("")

  /** 登录 */
  const login = (loginData: ILoginData) => {
    return new Promise((resolve, reject) => {
      loginApi({
        username: loginData.username,
        password: loginData.password
        // code: loginData.code
      })
        .then((res: any) => {
          setToken(res.data.token)
          roles.value = res.data.role
          username.value = res.data.nickname
          status.value = 0
          user_id.value = String(res.data.id)
          token.value = res.data.token
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  /** 登出 */
  const logout = () => {
    removeToken()
    token.value = ""
    roles.value = ""
    user_id.value = ""
    resetRouter()
  }
  /** 重置 Token */
  const resetToken = () => {
    removeToken()
    token.value = ""
    roles.value = ""
    user_id.value = ""
  }

  return { token, roles, username, user_id, status, login, logout, resetToken }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
