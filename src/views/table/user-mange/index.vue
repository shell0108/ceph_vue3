<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createUserDataApi, deleteUserDataApi, updateUserDataApi, getUserDataApi } from "@/api/user"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, RefreshRight } from "@element-plus/icons-vue"
import { usePagination, dateFormat } from "@/hooks/usePagination"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  username: "",
  nickname: "",
  phone: "",
  email: "",
  role: "admin"
})

const formRules: FormRules = reactive({
  username: [{ required: true, trigger: "blur", message: "请输入学号/职工号" }],
  nickname: [{ required: true, trigger: "blur", message: "请输入姓名" }]
})

const handleCreate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createUserDataApi({
          username: formData.username,
          nickname: formData.nickname,
          password: formData.username,
          phone: formData.phone,
          email: formData.email,
          role: formData.role
        }).then(() => {
          ElMessage.success("新增成功")
          dialogVisible.value = false
          getTableData()
        })
      } else {
        updateUserDataApi({
          id: currentUpdateId.value,
          phone: formData.phone,
          email: formData.email,
          role: formData.role
        }).then(() => {
          ElMessage.success("修改成功")
          dialogVisible.value = false
          getTableData()
        })
      }
    } else {
      return false
    }
  })
}
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.username = ""
  formData.nickname = ""
  formData.email = ""
  formData.phone = ""
  formData.role = "admin"
}
//#endregion

//#region 删
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteUserDataApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: any) => {
  currentUpdateId.value = row.id
  formData.username = row.username
  formData.nickname = row.nickname
  formData.email = row.email
  formData.phone = row.phone
  formData.role = row.role
  dialogVisible.value = true
}
//#endregion

//#region 查
const tableData = ref<any[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  username: "",
  nickname: "",
  phone: ""
})
const getTableData = () => {
  loading.value = true
  getUserDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    username: searchData.username || undefined,
    phone: searchData.phone || undefined,
    nickname: searchData.nickname || undefined
  })
    .then((res: any) => {
      paginationData.total = res.data.total
      tableData.value = res.data.records
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const handleSearch = () => {
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}
const handleRefresh = () => {
  getTableData()
}
//#endregion

// 禁用启用账号，决定用户是否可以登录
const changeUserStatus = (id: string, status: boolean) => {
  updateUserDataApi({ id: id, enable: status }).then(() => {
    ElMessage.success(status ? "启用成功" : "禁用成功")
  })
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="学号/职工号">
          <el-input v-model="searchData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="nickname" label="姓名">
          <el-input v-model="searchData.nickname" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="searchData.phone" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增用户</el-button>
          <el-button type="danger" :icon="Delete">批量删除</el-button>
        </div>
        <div>
          <el-tooltip content="刷新表格">
            <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="username" label="学号/职工号" align="center" />
          <el-table-column prop="nickname" label="姓名" align="center" />
          <el-table-column prop="role" label="角色" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.role === 'admin'" effect="plain">管理员</el-tag>
              <el-tag v-else type="warning" effect="plain">普通用户</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" align="center" />
          <el-table-column prop="email" label="邮箱" align="center" />
          <el-table-column prop="enable" label="状态" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.enable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="启用"
                inactive-text="禁用"
                @change="changeUserStatus(scope.row.id, scope.row.enable)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" :formatter="dateFormat" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增用户(初始密码为学号/职工号)' : '修改用户(学号/职工号 姓名不可更改)'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="username" label="学号/职工号">
          <el-input v-model="formData.username" placeholder="请输入" :disabled="currentUpdateId !== undefined" />
        </el-form-item>
        <el-form-item prop="nickname" label="姓名">
          <el-input v-model="formData.nickname" placeholder="请输入" :disabled="currentUpdateId !== undefined" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="role" label="角色">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
