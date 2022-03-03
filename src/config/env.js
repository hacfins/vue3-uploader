/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseUrl: 域名地址
 * routerMode: 路由模式
 *
 */
/**
 * Created by hacfin005 on 2018/11/22.
 */
/**
 * Created by hacfin005 on 2018/11/22.
 */
var web_admin = $_cloud_config.$clouds_parse('admin');

var baseUrl = web_admin.api_url;

export {
    baseUrl
}