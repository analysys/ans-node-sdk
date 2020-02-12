/**
 *nodeJS-SDK校验文件
 *王明佳、联系方式（wangmingjia@analysys.com.cn）
 *2019-07-08
 **/
import fs from 'fs';
import path from 'path';
class Util {
    constructor() { }
    /*****************************************私有属性*****************************
     * 数据类型校验
     * @param param 被校验的对象
     * @throws 数据类型
     */
    paramType (param) {
        return Object.prototype.toString.call(param).replace('[object ', '').replace(']', '');
    }
    /**
     * 参数合并生成对象
     * @throws 生成的对象
     */
    keyValueToObj (key, value) {
        let obj = {};
        // obj[key] = value || ""
        obj[key] = value;
        return obj;
    }
    /**
     * 参数 数组 合并生成对象
     * @throws 生成的对象
     */
    ArrayToObj (arr) {
        var obj = {};
        for (var i = 0; i < arr.length; i++) {
            obj[arr[i]] = '';
        }
        return obj;
    }
    /**
     * 参数合并生成对象
     * @param param1 生成对象的 key
     * @param param2 生成对象的 value
     * @throws 合并之后的对象
     */
    toObj (param1, param2) {
        var obj = {};
        // if (this.paramType(param1) === 'String' || this.paramType(param1) === 'Number' || this.paramType(param1) === 'Null' || this.paramType(param1) === 'Boolean' || this.paramType(param1) === 'Undefined') {

        //     return obj
        // }
        if (this.paramType(param1) === 'Array') {
            obj = this.ArrayToObj(param1);
            return obj;
        }
        if (this.paramType(param1) === 'Object') {
            return param1;
        }
        obj = this.keyValueToObj(param1, param2);
        return obj;
    }
    /**
     * 对象的合并
     * @param  被校验的对象
     * @throws 合并之后的对象
     */
    objMerge (parentObj, part) {
        if (this.paramType(parentObj) !== 'Object' || this.paramType(part) !== 'Object') {
            return parentObj;
        }
        var obj = {};
        for (var key in parentObj) {
            obj[key] = parentObj[key];
        }
        for (var key in part) {
            if (obj[key] && this.paramType(obj[key]) === 'Object' && this.paramType(part[key]) === 'Object') {
                obj[key] = this.objMerge(obj[key], part[key]);
            } else if (this.paramType(obj[key]) === 'Array' && this.paramType(part[key]) === 'Array') {
                obj[key] = this.arrayMergeUnique(obj[key], part[key]);
            } else {
                obj[key] = part[key];
            }
        }
        return obj;
    }
    /**
     * 数组合并之后的去重
     */
    arrayMergeUnique (arr1, arr2) {
        arr1.push.apply(arr1, arr2);
        return this.arrayUnique(arr1);
    }
    /**
     * 数组去重
     */
    arrayUnique (arr) {
        var tmpArr = [],
            hash = {}; //hash为hash表
        for (var i = 0; i < arr.length; i++) {
            if (!hash[arr[i]]) { //如果hash表中没有当前项
                hash[arr[i]] = true; //存入hash表
                tmpArr.push(arr[i]); //存入临时数组
            }
        }
        return tmpArr;
    }
    /**
     * 对象删除 值为 空的 键
     */
    delEmpty (obj) {
        var newObj = {};
        for (var key in obj) {
            var inType = true;
            var valueType = _this.paramType(obj[key]);
            if (valueType !== 'Object') {
                if (!obj[key] &&
                    (valueType !== 'Number' || isNaN(obj[key])) &&
                    valueType !== 'Boolean') {
                    inType = false;
                }
                if (inType === true) {
                    newObj[key] = obj[key];
                }
            } else {
                newObj[key] = _this.delEmpty(obj[key]);
            }
        }
        for (var key in newObj) {
            var values = [];
            for (var key1 in newObj[key]) {
                values.push(newObj[key][key1]);
            }
            if (values.length === 0 && newObj[key].constructor === Object) {
                delete newObj[key];
            }
        }
        return newObj;
    }
    /**
     * 字符串的截取
     * @param str 被截取的字符串
     * @param length 截取的长度
     * @throws 截取之后的字符串
     */
    stringSlice (str, length) {
        return str.slice(0, length);
    }
    checkURL (URL) {
        let str = URL;
        //判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
        //下面的代码中应用了转义字符"\"输出一个字符"/"
        let Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        let objExp = new RegExp(Expression);
        if (objExp.test(str) == true) {
            return true;
        } else {
            return false;
        }
    }
    // 检查url
    checkUrlLast (ServerUrl) {
        if (ServerUrl.charAt(ServerUrl.length - 1) !== '/') {
            ServerUrl += '/';
        }
        return ServerUrl;
    }
    // 时间方法
    timeObj () {
        var Time = new Date();
        var Year = Time.getFullYear();
        var Month = Time.getMonth() + 1;
        if (Month < 10) Month = '0' + Month;
        var Day = Time.getDate();
        if (Day < 10) Day = '0' + Day;
        var Hour = Time.getHours();
        return {
            'Year': Year,
            'Month': Month,
            'Day': Day,
            'Hour': Hour
        };
    }
    // 循环创建目录 同步方法
    mkdirs (filepath) {
        if (fs.existsSync(filepath)) {
            return true;
        } else {
            if (this.mkdirs(path.dirname(filepath))) {
                try {   // 增加try 是因为防止多进程 两个进程都检测不到文件夹，都进行创建，第二个不应该创建了
                    fs.mkdirSync(filepath);
                } catch{

                }
                return true;
            }
        }
    }
}

export default new Util();