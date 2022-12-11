import router from "@/router"
import { usePermissionStoreHook } from "@/router"
import { useUserStoreHook } from "@/store/modules/user"
import { whiteList } from "@/config/white-list"
import { getToken } from "@/utils/cache/cookies"
import NProgress from "nprogress"
const Layout = () => import("@/layout/index.vue")
import "nprogress/nprogress.css"

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const userStore = useUserStoreHook()
  const permissionStore = usePermissionStoreHook()
  userStore.status++
  // 判断该用户是否登录
  if (getToken()) {
    if (to.path === "/login") {
      // 如果已经登录，并准备进入 Login 页面，则重定向到主页
      next({ path: "/" })
      NProgress.done()
    } else {
      //已经登录, 且第一次设置动态路由
      if (userStore.roles === "admin" && userStore.status === 1) {
        router.addRoute({
          path: "/userMange",
          component: Layout,
          name: "UserMange",
          children: [
            {
              path: "",
              component: () => import("@/views/table/user-mange/index.vue"),
              name: "UserMange1",
              meta: {
                title: "用户管理",
                svgIcon: "lock",
                affix: true
              }
            }
          ]
        })
        permissionStore.setRoutes()
        next({ ...to, replace: true })
      } else {
        next()
      }
    }
  } else {
    // 如果没有 Token
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果在免登录的白名单中，则直接进入
      next()
    } else {
      // 其他没有访问权限的页面将被重定向到登录页面
      next("/login")
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
