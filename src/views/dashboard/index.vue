<script lang="ts" setup>
import { h, ref } from "vue"
import { useUserStore } from "@/store/modules/user"
import AdminDashboard from "./admin/index.vue"
import EditorDashboard from "./editor/index.vue"
import { ElNotification } from "element-plus"

type CurrentRoleType = "admin" | "editor"

const userStore = useUserStore()
const currentRole = ref<CurrentRoleType>("admin")
if (!userStore.roles.includes("admin")) {
  currentRole.value = "editor"
}

ElNotification({
  title: "Hello",
  message: h("a", "欢迎使用安全ceph云存储系统，祝您身体健康、生活愉快"),
  duration: 0,
  position: "bottom-right"
})
</script>

<template>
  <component :is="currentRole === 'admin' ? AdminDashboard : EditorDashboard" />
</template>
