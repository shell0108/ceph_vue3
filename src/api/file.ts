import { request } from "@/utils/service"

interface ICreateFileDataApi {
  username: string
  password: string
}

interface IGetFileDataApi {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数 */
  name?: string
  owner?: string
}

/** 上传文件 */
export function createFileDataApi(data: ICreateFileDataApi) {
  return request({
    url: "file/upload",
    method: "post",
    data
  })
}

/** 删除文件 */
export function changeFileEnableApi(id: string) {
  return request({
    url: `file/changeEnable/${id}`,
    method: "get"
  })
}

/** 删除文件 */
export function deleteFileDataApi(id: string) {
  return request({
    url: `file/${id}`,
    method: "delete"
  })
}

/** 批量删除文件 */
export function deleteFileBatchApi(data: number[]) {
  return request({
    url: "file/del/batch",
    method: "delete",
    data
  })
}

/** 查找公共文件 */
export function getFileDataApi(params: IGetFileDataApi) {
  return request({
    url: "file/page",
    method: "get",
    params
  })
}

/** 查找个人文件 */
export function getMyFileDataApi(params: IGetFileDataApi) {
  return request({
    url: "file/my_page",
    method: "get",
    params
  })
}
