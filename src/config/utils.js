
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