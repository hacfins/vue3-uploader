import {baseUrl} from '@/config/env'

/**
 * 文件上传Url
 */
export const getUpFileUrl = () => {
    var getPath = baseUrl + '/admin/pms/file/upload'
    return getPath
};