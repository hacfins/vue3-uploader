/**
 *
 * @param name
 * @param value
 * @param min
 */
export const setCookie = function (name, value, min) {
    if (min) {
        var date = new Date();
        date.setTime(date.getTime() + (min * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";

}
/**
 *
 * @param name
 */
export const getCookie = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    } else {
        return "";
    }

}

/**
 *
 * @param name
 */
export const removeCookie = function (name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 16000);
    var cval = getCookie(name);
    if (cval != null) {
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/";
    }

}
export const fileMd5 = function(file,fn){

    //判断是否支持File对象
    if (typeof File == "undefined") {
        return;
    }

    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        chunkSize = 1024 * 1024,
        chunks    = 0,
        currentChunk  = 0,
        blob          = (file instanceof Blob) ? file : file.file,
        spark         = new SparkMD5(),
        fileReader    = new FileReader();

    //异步函数
    fileReader.onload  = function (e) {
        // append array buffer
        if (e && e.target.result)
            spark.appendBinary(e.target.result);
        else if (fileReader.content)//extend FileReader >=IE10 依赖FileReader.prototype.readAsBinaryString
            spark.appendBinary(fileReader.content);
        else {
            //Error
        }

        currentChunk++;
        if (currentChunk < chunks) {
            loadNext();
        }
        else {
            loadEnd();
        }
    };
    fileReader.onerror = function () {

    };

    if (file.size > 2 * chunkSize) {//>2M的文件
        chunks = 3;
    }
    else {
        chunks = 1;
    }

    function loadNext() {
        if (3 == chunks) {
            var fstart = 0,
                fend   = chunkSize,
                lstart = file.size - chunkSize,
                lend   = file.size;

            if (0 == currentChunk)
                fileReader.readAsBinaryString(blobSlice.call(blob, fstart, fend),fn);
            else if (1 == currentChunk)
                fileReader.readAsBinaryString(blobSlice.call(blob, lstart, lend));
            else if (2 == currentChunk) {
                //此时直接追加文件大小的文本 结束md5的计算
                spark.appendBinary(file.size.toString());
                loadEnd();
            }
        } else {
            fileReader.readAsBinaryString(blobSlice.call(blob, 0, file.size));
        }
    }

    function loadEnd() {
        var fileMd5 = spark.end();
        if (typeof fn != 'undefined') {
            fn(fileMd5);
        }
    }

    loadNext();

}

export const getuuid = function(){
    var UUID = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    return UUID;
}
export const fileSize = function(fileSize,isnotdit) {
    if (typeof(fileSize) == "undefined") {
        return "-"
    }
    if (!_isNumeric(fileSize)) {
        return "-"
    }
    // var kb = 1024;
    // var mb = kb * 1024;
    // var gb = mb * 1024;
    // var tb = gb * 1024;
    // if (fileSize >= tb) {
    //     return parseFloat((fileSize / tb).toFixed(2)) + "T"
    // } else if (fileSize >= gb) {
    //     return parseFloat((fileSize / gb).toFixed(2)) + "G"
    // } else if (fileSize >= mb) {
    //     return parseFloat((fileSize / mb).toFixed(2)) + "M"
    // } else if (fileSize >= kb) {
    //     return parseFloat((fileSize / kb).toFixed(2)) + "KB"
    // } else {
    //     return fileSize + "B"
    // }


    var kb = 1024;
    var mb = kb * 1024;
    var gb = mb * 1024;
    var tb = gb * 1024;
    if (fileSize >= tb) {
        return  fixed2((fileSize / tb).toString())+ "T"
    } else if (fileSize >= gb) {
        return fixed2((fileSize / gb).toString()) + "G"
    } else if (fileSize >= mb) {
        return fixed2((fileSize / mb).toString()) + "M"
    } else if (fileSize >= kb) {
        return fixed2((fileSize / kb).toString()) + "KB"
    } else {
        return fileSize + "B"
    }
    function fixed2(str){
        var result;
        var dianIndex = str.indexOf('.');
        if(dianIndex != -1){
            var zs = str.substr(0,dianIndex)
            var xs = str.substring(dianIndex,dianIndex+3)
            if(isnotdit){
                result = Math.ceil(zs + xs);
            }else{
                result = zs + xs;
            }


        }else{
            result = str;
        }

        return result;
    }

}

//------------------------------------------------- Extend ------------------------------------------------------------//
//extend FileReader support >= IE10
if (typeof FileReader != "undefined" && !FileReader.prototype.readAsBinaryString) {
    FileReader.prototype.readAsBinaryString = function (fileData,fn) {
        var binary = "";
        var pt     = this;

        var reader    = new FileReader();
        reader.onload = function (e) {
            var bytes  = new Uint8Array(e.target.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            //pt.result  - readonly so assign binary
            pt.content = binary;
            pt.onload()
        };
        try {
            reader.readAsArrayBuffer(fileData);
        } catch (e) {
            fn(false)
        }
    }
}