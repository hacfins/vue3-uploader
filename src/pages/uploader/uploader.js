import { createApp } from 'vue'
import router from '@/router'
import App from './app.vue'
import '@/style/index.scss'
import ElementPlus from 'element-plus';
import locale from '@/script/zh-cn.js'
import uploader from '@/components/vue-simple-uploader/src'
createApp(App).use(router).use(ElementPlus, {locale}).use(uploader).mount('#app')

