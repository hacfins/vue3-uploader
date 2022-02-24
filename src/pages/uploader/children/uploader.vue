<template>

    <div class="dialog-web-uploader" v-show="upDialogShow">
        <div class="dialog-header hk-pd-l-20 hk-border-bottom">
            <h4 class="pull-left">
					<span v-if="!upfinish" class="select-text">
						正在上传(<em class="upsuccessnum">0</em>/<em class="uptotalnum"></em>)
					</span>
                <span v-if="upfinish" class="select-text">
						上传完成
					</span>
            </h4>
            <div class="dialog-control pull-right">
                      <span class="close dialog_minus" @click="is_up_min = !is_up_min">
					    <i v-if="!is_up_min" class="iconfont icon-minus1" aria-hidden="true"></i>
                        <i v-else class="iconfont icon-window-maximize" aria-hidden="true"></i>
				      </span>
                <span class="close dialog_close" @click="closeUpDialog">
                        <i class="iconfont icon-close" aria-hidden="true"></i>
                    </span>

            </div>
        </div>
        <div class="dialog-body" v-show="!is_up_min">
            <div class="uploader-list-wrapper" v-loading="upDialogLoading">
                <el-row class="uploader-list-hd">
                    <el-col :span="14">文件名</el-col>
                    <el-col :span="3">大小</el-col>
                    <el-col :span="5">状态</el-col>
                    <el-col :span="2">操作</el-col>
                </el-row>
                <div class="uploader-list-Con">
                    <el-row v-for="(item,index) in uploadFiles" :key="item.id"
                            class="uploader-list-item" :data-fupl-id="item.id" :data-fid="item.f_id"
                            data-upl-finish="0">
                        <el-col class="process" :span="22">
                            <div class="processbar">
                            </div>
                        </el-col>
                        <el-col class="hk-text-ellipsis hk-pd-r-15 uploadname" :span="14">
                            {{item.title}}
                        </el-col>
                        <el-col :span="3" class="uploadfilesize"> {{item.filesize}}</el-col>
                        <el-col :span="5" class="uploadstatus hk-text-ellipsis"></el-col>
                        <el-col class="uploadevent" :span="2">
                            <a style="cursor:pointer;color:#2697eb" class="uplCancel"
                               @click="uplCancel(item)">
                                取消
                            </a>
                            <a style="cursor:pointer;color:#2697eb" class="retry"
                               @click="uplRetry(item)">
                                重传
                            </a>
                        </el-col>
                    </el-row>
                </div>

            </div>
        </div>
    </div>
</template>

<script>

    export default {
        data(){
            return {
                upDialogShow   : false,
                upDialogLoading: true,
                is_up_min      : false,
                uploadFiles    : [],
                upfinish       : false,
                uploadeStatus  : 1,//1,未上传;2,正在上传;3,上传成功;4上传失败
                uploader       : '',

            }
        },
        components: {},
        mounted(){

        },
        methods   : {
            resetData(){
                this.upDialogLoading = true;
                this.upDialogShow    = false;
                this.is_up_min       = false;
                this.uploadFiles     = [];
                this.upfinish        = false;
                this.uploadeStatus   = 3;

                if (_dom('.dialog-header .upsuccessnum').length > 0)
                    _dom('.dialog-header .upsuccessnum')[0].innerText = ''; //修改上传成功数
            },
            closeUpDialog(){
                if (this.uploadeStatus == 2) {
                    this.$confirm('列表中有未上传完成的文件，确认要放弃上传吗?', '提示', {
                        customClass      : 'right-pos-poper',
                        confirmButtonText: '确定',
                        cancelButtonText : '取消',
                        type             : 'warning'
                    }).then(() => {

                        var hasupload = this.uploader.isUploading();

                        if (hasupload) {
                            this.uploader.cancel()
                        }

                        this.resetData();

                    }).catch(() => {

                    });
                } else {
                    this.resetData();
                }


            },
            uplCancel(file){
                if (_attr("[data-fupl-id='" + file.id + "']", "data-upl-finish") == 1) {
                    return
                }
                var upstatus = _attr("[data-fupl-id='" + file.id + "'] .uploadstatus", 'data-upl-status');
                if (upstatus == 1) {
                    this.$message.error('正在创建文件，不能暂停')
                    return;
                }
                file.pause()
                _html("[data-fupl-id='" + file.id + "'] .uploadstatus", '<i style="color:red" class="el-icon-warning"></i>&nbsp;暂停')

                _hide("[data-fupl-id='" + file.id + "'] .uplCancel");
                _show("[data-fupl-id='" + file.id + "'] .retry");

            },
            uplRetry(file){
                file.resume()
                _html("[data-fupl-id='" + file.id + "'] .uploadstatus", '等待上传');
                _show("[data-fupl-id='" + file.id + "'] .uplCancel");
                _hide("[data-fupl-id='" + file.id + "'] .retry");

            },
        }
    }
</script>

<style lang="scss" rel="stylesheet/scss">

    .dialog-web-uploader {
        position   : fixed;
        bottom     : 0;
        width      : 633px;
        top        : auto;
        left       : auto;
        right      : 10px;
        visibility : visible;
        z-index    : 1000;
        box-shadow : 0 0 10px #ccc;
        background : #fff;

        .dialog-header {
            overflow    : hidden;
            background  : #2697eb;
            height      : 50px;
            line-height : 50px;
            font-size   : 18px;
            h4 {
                margin      : 0;
                line-height : 50px;
            }
            color       : #fff;
            .close {
                float      : left;
                text-align : center;
                font-size  : 20px;
                cursor     : pointer;
                .icon-window-maximize {
                    font-size : 16px;
                }
            }
            .dialog_close {
                padding-right : 20px;
                padding-left  : 8px;

            }
            .dialog_minus {
                padding-left  : 20px;
                padding-right : 8px;
            }
        }

        .uploader-list-wrapper {
            overflow-x : hidden;
            overflow-y : auto;
            height     : 349px;
            .uploader-list-hd {
                background    : #eee;
                line-height   : 50px;
                height        : 50px;
                border-bottom : 1px solid #ccc;
                padding-left  : 20px;
            }
            .uploader-list-item {
                line-height  : 45px;
                position     : relative;
                height       : 45px;
                border-top   : 1px solid #eceeef;
                font-size    : 14px;
                padding-left : 20px;

                .process {
                    height   : 45px;
                    position : absolute;
                    left     : 0;
                    z-index  : -1;
                    width    : 91.6666666667%;
                    .processbar {
                        height     : 100%;
                        background : #d1ecf9;
                        width      : 0%
                    }
                }
            }
            .uploader-list-item:first-child {
                border-top : none;
            }

            .retry {
                display : none;
            }

        }

    }


</style>
