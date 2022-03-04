<template>

    <div style="margin:0 auto;width: 400px">
        <uploader
            ref="uploader"
            :options="options"
            :autoStart="false"
            @file-added="onFileAdded"
            @files-added="onFilesAdded"
            @file-success="onFileSuccess"
            @upload-start="onUploadStart"
            @file-progress="onFileProgress"
            @file-error="onFileError">
            <div class="upload-group">
                <uploader-btn class="uploader_btn" ref="uploader-btn">
                    <i class="iconfont icon-cloud-upload" aria-hidden="true"></i>
                    上传
                </uploader-btn>
            </div>
        </uploader>
    </div>




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
    import {getUpFileUrl} from '@/api/getdata'
    import {getCookie,fileSize ,getuuid,fileMd5} from '@/config/utils'

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


                schoolid:'824ae086edbe45b6a844fcc9478c579a',
                serverErrMsg  :"", //服务器返回的上传失败原因
                uplStasO      :[], //上一次的进度和时间
                fileSucCount  : 0, //上传成功的个数
                fileCreatId:[],//已将创建的文件
                curUpIndex:'',
                upDialog:false,
                options: {
                    target: getUpFileUrl(), // 目标上传 URL
                    chunkSize: 1024 * 1024 * 2,   //分块大小
                    forceChunkSize:true,
                    maxChunkRetries: 3,  //最大自动失败重试上传次数
                    testChunks: false,     //是否开启服务器分片校验
                    simultaneousUploads:1,
                    withCredentials:true,
                    headers:{
                        Authorization:getCookie('head') + ' ' + getCookie('token'),
                        school_id:'824ae086edbe45b6a844fcc9478c579a',

                    },
                    // 服务器分片校验函数，秒传及断点续传基础
                    checkChunkUploadedByResponse: (chunk, retq) => {
                        let ret = JSON.parse(retq);
                        var fg = false
                        if (ret.code != 111111) {


                            chunk.file.pause()

                            _hide("[data-fupl-id='" + chunk.file.id + "'] .uploadevent")
                            _html("[data-fupl-id='" + chunk.file.id + "'] .uploadstatus",'<i style="color:red" class="el-icon-error"></i>&nbsp;'+ret.msg+'')
                            _attr("[data-fupl-id='" + chunk.file.id + "'] .uploadstatus",'title',ret.msg)
                            _css("[data-fupl-id='" + chunk.file.id + "'] .uploadstatus",{color:'red',cursor:'default'});


                        }

                        if(chunk.offset == 0){

                            return true

                        }


                        //s1 判断是否是秒传
                        if (("result" in ret) && ret.result && ("sec" in ret.result)) {
                            if (ret.result.sec == 1) { //可以秒传
                                fg = true
                                return fg

                            }
                        }
                        //s3 显示即将完成
                        if (("result" in ret) && ret.result && ("approachfinshed" in ret.result)) {
                            if (ret.result.approachfinshed == 1) {
                                this.$message.error("正在处理，请耐心等待完成")
                            }
                        }
                        return fg
                    },
                    processParams:function(params,file,chunks,istest){
                        //                        params.school_id = file.school_id;
                        var param = {
                            tmp_id:file.tmp_id,
                            school_id:file.school_id,
                            file_size:params.totalSize,

                        }
                        if(file.d_id){
                            param.d_id = file.d_id;
                        }

                        if(file.sg_id){
                            param.sg_id = file.sg_id
                        }
                        if(file.sr_id){
                            param.sr_id = file.sr_id
                        }
                        param.chunk = params.chunkNumber - 1;
                        param.chunks = params.totalChunks;
                        param.md5 = params.identifier
                        params.param = JSON.stringify(param)


                        delete params.chunkNumber;
                        delete params.totalChunks;
                        delete params.totalSize;
                        delete params.chunkSize;
                        delete params.currentChunkSize;
                        delete params.identifier;

                        return params



                    }
                },

            }
        },
        components: {},
        mounted(){

            this.uploader = this.$refs['uploader'].uploader

        },
        methods   : {
            resetData(){
                this.upDialogLoading = true;
                this.upDialogShow    = false;
                this.is_up_min       = false;
                this.uploadFiles     = [];
                this.upfinish        = false;
                this.uploadeStatus   = 3;

                this.fileSucCount = 0;

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




            startUploader(){
                this.$refs['uploader-btn'].$el.click()
            },

            //上传
            onFilesAdded(files, fileList, event){

                //先检测
                if(!this.checkUploadFiles(files)){
                    files.ignored = true
                    return
                }
                files.forEach((file) => {
                    file.tmp_id = getuuid()
                    file.filesize = fileSize(file.size)
                    file.title = file.name;
                    file.school_id = this.schoolid;
                })

                files.sort(function(num1,num2){
                    var temp1 = parseInt(num1.size);
                    var temp2 = parseInt(num2.size);
                    if (temp1 < temp2) {
                        return -1;
                    } else if(temp1 == temp2) {
                        return 0;
                    } else {
                        return 1;
                    }
                });

                var that = this;
                var init = 0;
                this.upDialogShow = true;
                if(this.upDialogLoading){
                    this.upDialogLoading = true;
                }
                this.uploadFiles =   this.uploadFiles.concat(files)

                this.is_up_min = false;
                this.upfinish = false;
                this.$nextTick(()=> {
                    _html('.dialog-header .uptotalnum',this.uploadFiles.length);
                    files.forEach(function(obj,i){
                        _html("[data-fupl-id='" + obj.id + "'] .uploadstatus",'等待上传');

                    })

                    loop2Mmd5()
                })

                function loop2Mmd5(){
                    if(init == files.length || !that.upDialogShow){

                        return;
                    }

                    fileMd5(files[init], function (val) {
                        that.upDialogLoading = false;
                        files[init].uniqueIdentifier = val;

                        if(that.upDialogShow){
                            var uplStaO       = [];
                            uplStaO["p"]      = 0;
                            that.uplStasO[files[init].id] = uplStaO;
                            files[init].resume()
                            init++;
                            loop2Mmd5()
                        }


                    });
                }

            },
            checkUploadFiles(files){
                var is_empty_file = files.some((file) => {
                    return file.size <= 0
                })

                var is_extend_single_file_size = files.some((file) => {
                    return file.size > 1024 * 1024 * 1024 * 50
                })

                var fileAllSize = files.reduce((cur,next) => {
                    return cur + next.size
                },0)
                var is_extend_all_size = fileAllSize > 1024 * 1024  * 1024 * 100;
                if(is_empty_file){
                    this.$message.error('文件不能为空')
                }else if(is_extend_single_file_size){
                    this.$message.error('文件大小不能超过 50G')
                }else if(is_extend_all_size){
                    this.$message.error('所有文件的总大小不能超过 100G')
                }
                return !is_extend_single_file_size && !is_extend_all_size && !is_empty_file

            },
            manuStartUpload(files){
                files.forEach((file) => {
                    var uplStaO       = [];
                    uplStaO["p"]      = 0;
                    this.uplStasO[file.id] = uplStaO;
                    file.resume()
                })

            },
            onUploadStart(){
                this.uploadeStatus = 2;

            },
            onFileProgress(rootFile, file, chunk) {

                this.curUpIndex = _getIndex("[data-fupl-id='" + file.id + "']") + 1
                _html('.dialog-header .upsuccessnum',this.curUpIndex);
                if(!file.paused){
                    this.uplPgr(file,file.progress())

                    _css("[data-fupl-id='" + file.id + "'] .processbar",{"width" : parseFloat(file.progress() * 100) + "%"});


                }


            },
            onFileSuccess(rootFile, file, response, chunk) {
                var objres = JSON.parse(response)
                if(objres.code == 111111){

                    var is_secpass = 2
                    if (("result" in objres) && ("sec" in objres.result) && objres.result.sec == 1){
                        is_secpass = 1
                    }
                    var finishStrType;
                    if(is_secpass == 1){
                        finishStrType = '秒传'
                    }else if(is_secpass == 2){
                        finishStrType = '完成'
                    }
                    _attr("[data-fupl-id='" + file.id + "']","data-upl-finish", "1");
                    _css("[data-fupl-id='" + file.id + "'] .processbar",{"width": "100%",background:'#fff'});
                    _addClass("[data-fupl-id='" + file.id + "'] .uplCancel","hk-cursor-default hk-default")
                    _html("[data-fupl-id='" + file.id + "'] .uplCancel",'');
                    _html("[data-fupl-id='" + file.id + "'] .uploadstatus",'<i style="color:green" class="el-icon-success"></i>&nbsp;'+finishStrType)
                    _attr("[data-fupl-id='" + file.id + "'] .uploadstatus",'data-upl-status','2');

                    this.setFileSucCount();
                }


            },
            setFileSucCount() {
                this.fileSucCount++;
                if(this.fileSucCount >= this.uploadFiles.length){
                    this.fileCreatId = [];
                    this.uploadeStatus = 3;
                    this.is_up_min = true;
                    this.upfinish = true

                }
            },
            onFileError(rootFile, file, response, chunk) {
                if(response){
                    var objres = JSON.parse(response)
                    var reason = objres.msg
                    _hide("[data-fupl-id='" + file.id + "'] .uploadevent")
                    _html("[data-fupl-id='" + file.id + "'] .uploadstatus",'<i style="color:red" class="el-icon-error"></i>&nbsp;'+reason+'')
                    _attr("[data-fupl-id='" + file.id + "'] .uploadstatus",'title',reason)
                    _css("[data-fupl-id='" + file.id + "'] .uploadstatus",{color:'red',cursor:'default'});
                }


            },
            uplCancel(file) {
                if( _attr("[data-fupl-id='" + file.id + "']","data-upl-finish") == 1){
                    return
                }
                var upstatus = _attr("[data-fupl-id='" + file.id + "'] .uploadstatus",'data-upl-status');
                if(upstatus == 1){
                    this.$message.error('正在创建文件，不能暂停')
                    return;
                }
                file.pause()
                _html("[data-fupl-id='" + file.id + "'] .uploadstatus",'<i style="color:red" class="el-icon-warning"></i>&nbsp;暂停')

                _hide("[data-fupl-id='" + file.id + "'] .uplCancel");
                _show("[data-fupl-id='" + file.id+ "'] .retry");

            },
            uplRetry(file) {
                file.resume()
                _html("[data-fupl-id='" + file.id + "'] .uploadstatus",'等待上传');
                _show("[data-fupl-id='" + file.id + "'] .uplCancel");
                _hide("[data-fupl-id='" + file.id + "'] .retry");
            },
            uplPgr(file, percentage) {



                if(percentage - this.uplStasO[file.id]["p"] >=0){
                    var ls  = (percentage - this.uplStasO[file.id]["p"]) * file.size / 1024; //KB
                    this.uplStasO[file.id]["p"] = percentage;
                    var v         = (ls / 0.5).toFixed(2);
                    var units     = "K/s";

                    if (v >= 1024) {
                        v         = (v / 1024).toFixed(2);
                        units     = "M/s";
                    } else if (v >= 1024 * 1024) {
                        v         = (v / 1024 / 1024).toFixed(2);
                        units     = "G/s";
                    }

                    var pst = (percentage * 100).toString().substr(0, 4);

                    if (pst == "100") {
                        pst == "99.9";
                    }
                    _html("[data-fupl-id='" + file.id + "'] .uploadstatus",pst + "% ("+(v + units).toString()+")");
                }
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
