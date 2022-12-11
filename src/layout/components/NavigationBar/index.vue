<script lang="ts" setup>
import { computed, ref, reactive } from "vue"
import { updateUserDataApi, checkPasswordApi } from "@/api/user"
import { useRouter } from "vue-router"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import { useUserStore } from "@/store/modules/user"
import { UserFilled } from "@element-plus/icons-vue"
import Breadcrumb from "../Breadcrumb/index.vue"
import Hamburger from "../Hamburger/index.vue"
import ThemeSwitch from "@/components/ThemeSwitch/index.vue"
import Screenfull from "@/components/Screenfull/index.vue"
import Notify from "@/components/Notify/index.vue"
import { type FormInstance, type FormRules, ElMessage } from "element-plus"

const router = useRouter()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const sidebar = computed(() => {
  return appStore.sidebar
})
const showNotify = computed(() => {
  return settingsStore.showNotify
})
const showThemeSwitch = computed(() => {
  return settingsStore.showThemeSwitch
})
const showScreenfull = computed(() => {
  return settingsStore.showScreenfull
})

const toggleSidebar = () => {
  appStore.toggleSidebar(false)
}
const logout = () => {
  userStore.logout()
  router.push("/login")
}

const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  password: "",
  newPassword: "",
  repeatPassword: ""
})

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("Please input the password again"))
  } else if (value !== formData.newPassword) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}

const formRules: FormRules = reactive({
  password: [{ required: true, trigger: "blur", message: "请输入原密码" }],
  newPassword: [{ required: true, trigger: "blur", message: "请输入新密码" }],
  repeatPassword: [{ validator: validatePass, trigger: "blur" }]
})

const handleEdit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      checkPasswordApi({
        id: userStore.user_id,
        password: formData.password
      })
        .then(() => {
          updateUserDataApi({
            id: userStore.user_id,
            password: formData.newPassword
          }).then(() => {
            ElMessage.success("修改成功")
            dialogVisible.value = false
            logout()
          })
        })
        .catch()
    }
  })
}

const resetForm = () => {
  formData.password = ""
  formData.newPassword = ""
  formData.repeatPassword = ""
}
</script>

<template>
  <div class="navigation-bar">
    <Hamburger :is-active="sidebar.opened" class="hamburger" @toggle-click="toggleSidebar" />
    <Breadcrumb class="breadcrumb" />
    <div class="right-menu">
      <Screenfull v-if="showScreenfull" class="right-menu-item" />
      <ThemeSwitch v-if="showThemeSwitch" class="right-menu-item" />
      <Notify v-if="showNotify" class="right-menu-item" />
      <el-dropdown class="right-menu-item">
        <div class="right-menu-avatar">
          <el-avatar :icon="UserFilled" :size="30" />
          <span>{{ userStore.username }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <a target="_blank" href="https://juejin.cn/post/7089377403717287972">
              <el-dropdown-item>中文文档</el-dropdown-item>
            </a>
            <a target="_blank" href="https://github.com/un-pany/v3-admin-vite">
              <el-dropdown-item>GitHub</el-dropdown-item>
            </a>
            <a target="_blank" href="https://gitee.com/un-pany/v3-admin-vite">
              <el-dropdown-item>Gitee</el-dropdown-item>
            </a>
            <el-dropdown-item divided @click="dialogVisible = true">
              <span style="display: block">修改密码</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <span style="display: block">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <!-- 修改密码 -->
  <el-dialog v-model="dialogVisible" title="修改密码" @close="resetForm" width="30%">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
      <el-form-item prop="username" label="原密码">
        <el-input v-model="formData.password" placeholder="请输入之前密码" show-password />
      </el-form-item>
      <el-form-item prop="nickname" label="设置新密码">
        <el-input v-model="formData.newPassword" placeholder="请输入新密码" show-password />
      </el-form-item>
      <el-form-item prop="phone" label="确认新密码">
        <el-input v-model="formData.repeatPassword" placeholder="请输入新密码" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleEdit">确认</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.navigation-bar {
  height: var(--v3-navigationbar-height);
  overflow: hidden;
  background: #fff;
  .hamburger {
    display: flex;
    align-items: center;
    height: 100%;
    float: left;
    padding: 0 15px;
    cursor: pointer;
  }
  .breadcrumb {
    float: left;
    // 参考 Bootstrap 的响应式设计 WIDTH = 576
    @media screen and (max-width: 576px) {
      display: none;
    }
  }
  .right-menu {
    float: right;
    margin-right: 10px;
    height: 100%;
    display: flex;
    align-items: center;
    color: #606266;
    .right-menu-item {
      padding: 0 10px;
      cursor: pointer;
      .right-menu-avatar {
        display: flex;
        align-items: center;
        .el-avatar {
          margin-right: 10px;
        }
        span {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
