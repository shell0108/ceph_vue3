import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { type RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from "vue-router"

const Layout = () => import("@/layout/index.vue")

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: {
      hidden: true
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layout,
    redirect: "/stroage/common",
    name: "Stroage",
    meta: {
      title: "存储池",
      elIcon: "Grid"
    },
    children: [
      {
        path: "/stroage/common",
        component: () => import("@/views/table/file-common/index.vue"),
        name: "CommonStroge",
        meta: {
          title: "公共存储"
        }
      },
      {
        path: "/stroage/my",
        component: () => import("@/views/table/file-my/index.vue"),
        name: "myStroge",
        meta: {
          title: "我的存储"
        }
      }
    ]
  },
  {
    path: "/userMange",
    component: Layout,
    name: "UserMange",
    children: [
      {
        path: "",
        component: () => import("@/views/dashboard/admin/index.vue"),
        name: "UserMange1",
        meta: {
          title: "用户管理",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  }
]

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>(constantRoutes)
  const setRoutes = () => {
    const new_routes = constantRoutes
    new_routes.pop()
    new_routes.push({
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
    routes.value = new_routes
  }

  return { routes, setRoutes }
})

/** 在 setup 外使用 */
export function usePermissionStoreHook() {
  return usePermissionStore(store)
}

const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === "hash"
      ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH)
      : createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch (error) {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
