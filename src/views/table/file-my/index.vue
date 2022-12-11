<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { changeFileEnableApi, deleteFileDataApi, deleteFileBatchApi, getMyFileDataApi } from "@/api/file"
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, Delete, Download, RefreshRight, UploadFilled } from "@element-plus/icons-vue"
import { usePagination, dateFormat } from "@/hooks/usePagination"
import { getToken } from "@/utils/cache/cookies"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const multipleSelection = ref<any>([])
const handleSelectionChange = (val: any) => {
  multipleSelection.value = val
}
const headers = reactive({
  token: getToken()
})
const encrypt = ref<boolean>(true)
// 禁用启用文件，决定公共存储对其是否可见
const changeFileStatus = (id: string, stauts: boolean) => {
  changeFileEnableApi(id).then(() => {
    ElMessage.success(stauts ? "启用成功" : "禁用成功")
  })
}

// 下载文件
const handleDownload = (row: any) => {
  window.open(row.url)
}

// 批量下载文件
const handleDownloadBatch = () => {
  multipleSelection.value.map((v: { url: string }) => window.open(v.url))
}

// 删除文件
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`正在删除文件：${row.name}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteFileDataApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}

// 批量删除文件
const handleDeleteBatch = () => {
  ElMessageBox.confirm(`正在批量删除文件，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteFileBatchApi(multipleSelection.value.map((v: { id: number }) => v.id)).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}

// 查
const tableData = ref<any[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  name: "",
  owner: ""
})
const getTableData = () => {
  loading.value = true
  getMyFileDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    name: searchData.name || undefined
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

const handleUploadSucess = () => {
  ElMessage.success("上传成功")
  getTableData()
}

const handleUploadError = () => {
  ElMessage.error("上传失败")
}
/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="文件名">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div class="upload-demo">
          <el-upload
            class="upload"
            action="http://localhost:9091/file/upload"
            :headers="headers"
            :show-file-list="false"
            :on-success="handleUploadSucess"
            :on-error="handleUploadError"
          >
            <el-button type="primary" :icon="UploadFilled">上传文件</el-button>
          </el-upload>
          <el-switch v-model="encrypt" active-text="文件加密" />
        </div>
        <div>
          <el-button
            type="primary"
            :icon="Download"
            @click="handleDownloadBatch()"
            :disabled="!multipleSelection.length"
            >批量下载</el-button
          ><el-button type="danger" :icon="Delete" @click="handleDeleteBatch()" :disabled="!multipleSelection.length"
            >批量删除</el-button
          >
          <el-tooltip content="刷新表格">
            <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="name" label="文件名" align="center" />
          <el-table-column prop="type" label="文件类型" align="center" />
          <el-table-column prop="size" label="文件大小(kb)" align="center" />
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.enable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="启用"
                inactive-text="禁用"
                @change="changeFileStatus(scope.row.id, scope.row.enable)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" :formatter="dateFormat" />
          <el-table-column prop="owner" label="所有者" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleDownload(scope.row)">下载</el-button>
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

.upload-demo {
  display: flex;
  .upload {
    margin-right: 20px;
  }
}
</style>
