# vue3-uploader
一个基于 [simple-uploader.js](https://github.com/simple-uploader/Uploader) 的 Vue 上传组件

## Demo效果
###
![Image text](https://github.com/hacfins/vue3-uploader/raw/master/src/assets/demo.gif)

## uploader.vue

``` vue
<template>
    <custom-uploader> </custom-uploader>
</template>

<script>
    import customUploader from '@/components/uploader'
    export default {
        data(){
            return {


            }
        },
        components: {
            customUploader
        },
        mounted(){

        },
        methods   : {

        }
    }
</script>

```
## Development

``` bash
# install dependencies
npm install
# serve with hot reload at localhost:3001
npm run serve
# build for production with minification
npm run build
```




