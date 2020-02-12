import request from 'request';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

var baseConfig = {
    "base": {
        "appid": "",
        "$debug": 0
    },
    "status": {
        "code": 200,
        "FnName": "",
        "key": "",
        "value": "",
        "errorCode": "",
        "successCode": ""
    }
};

/**
 *nodeJS-SDK校验文件
 *王明佳、联系方式（wangmingjia@analysys.com.cn）
 *2019-07-08
 **/
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

var Util$1 = new Util();

/**
 * 日志打印
 * @param logModule 日志等级 从低到高  ALL TRACE DEBUG INFO WARN ERROR FATAL MARK OFF
 * @throws 日志输出
 */
let errorMessage = {
    'common': '{FN}:Property key invalid, nonsupport value: $lib/$lib_version/$platform/$first_visit_time/$debug/$is_login \n' +
        'current KEY:{KEY}',
    '60001': '{FN}:Property key invalid, support type: String \n' +
        'current key:{KEY}\n' +
        'current type:{KEYTYPE}',
    '60002': '{FN}:Property value invalid of key[{KEY}], support type: Number \n' +
        'current value:{VALUE}\n' +
        'current type: {VALUETYPE}',
    '60003': '{FN}:Property value invalid of key[{KEY}], support type: Boolean \n' +
        'current value:{VALUE}\n' +
        'current type: {VALUETYPE}',
    '60004': '{FN}:Property value invalid of key[{KEY}], support type: Array \n' +
        'current value:{VALUE}\n' +
        'current type: {VALUETYPE}',
    '60005': '{FN}:The length of the property[{KEY}] value (string[{VALUE}]) needs to be 1-255 !',
    '60006': 'Please set appkey first.',
    '60007': 'Please set uploadURL first.',
    '60008': 'Send message failed.',
    '60009': '{FN}:The length of the property key (string[{KEY}]) needs to be 1-125 !',
    '600010': '{FN}:The length of the property key (string[{KEY}]) needs to be 1-99 !',
    '600011': '{FN}:[{KEY}] does not conform to naming rules!',
    '600012': '{FN}:Property key invalid, nonsupport value: $lib/$lib_version/$platform/$first_visit_time/$debug/$is_login \n' +
        'current KEY:{KEY}',
    '600013': '{FN}:Property value invalid of key[{KEY}], support type: Array with String as its internal element \n' +
        'current value:{VALUE}\n' +
        'current type: {VALUETYPE}',
    '600016': '{FN}:Property value invalid of key[{KEY}], support type: Object \n' +
        'current value:{VALUE}\n' +
        'current type: {VALUETYPE}',
    '600017': '{FN}:The length of the property key (string[{KEY}]) needs to be 1-255 !',
    '600018': '{FN}:Property value invalid of key[{KEY}] invalid, support type: String \n' +
        'current value:{VALUE}\n' +
        'current type: {VALUETYPE}',
    '600019': '{FN}:The length of the property[{KEY}] value (string[{VALUE}]) needs to be 1-255 !',
    '600021': '{FN}:Property value invalid of key[{KEY}],  support type: String \n' +
        'current value:{VALUE}\n' +
        'current type: {VALUETYPE}',
    '600022': '{FN}:The length of the property key (string[{FN}]) needs to be 1-99 !',
    '600023': '{FN}:{KEY} do not macth {KEY} rules!',
    '600024': '{FN}:{KEY} do not macth {KEY} rules!, length needs 13!',
    '600025': '{FN}:Property value invalid of key[{KEY}], support type:Number、Boolean、String、Array with String as its internal element \n' +
        'current value:{VALUE}\n' +
        'current type: {VALUETYPE}',
    '600026': '{FN}:Current key ([{KEY}]) is an empty Object \n' +
        'current value:{VALUE}',
    '600027': 'Save message failed'
};

let successMessage = {
    'common': '',
    '20001': 'Send message success',
    '20002': '{FN}: set success ({VALUE})',
    '20003': '{FN}:({VALUE}) delete success',
    '20004': '{FN}:clear success',
    '20005': '{FN}:reset success',
    '20006': 'set appkey success. current appkey : {VALUE}',
    '20007': 'Init Analysys JS sdk success, version : {VALUE}',
    '20008': 'set uploadURL success. current uploadURL : {VALUE}',
    '20009': '{FN}:[{KEY}] : get failed',
    '20010': '{FN}:[{KEY}] : get success. ({VALUE})',
    '20011': '{FN}:({VALUE}) delete failed',
    '20012': 'Send message to server : {KEY} \n' +
        'data:{VALUE}',
    '20013': 'Shutdown success',
    '20014': 'Save message to file: {KEY} \n' +
        'data:{VALUE}',
    '20015': 'Save message success'
};

let successLog = (msg) => {
    if (baseConfig.base.$debug === 1 || baseConfig.base.$debug === 2) {
        var status = baseConfig.status;
        var successCode = status.successCode;
        var fn = status.FnName;
        var key = status.key;
        var value = status.value;
        var msgTemp = successMessage[successCode] || successMessage.common;
        var showMsg = msgTemp.replace(/{FN}/, fn)
            .replace(/{KEY}/g, key)
            .replace(/{VALUE}/g, value);
        if (msg) {
            showMsg = msg;
        }
        if (!showMsg) return;
        if (Util$1.paramType(console) === 'Object' && console.log) {
            try {
                return console.log.apply(console, showMsg);
            } catch (e) {
                console.log(showMsg);
            }
        }
    }
};

let errorLog = () => {
    var status = baseConfig.status;
    var errorCode = status.errorCode;
    var fn = status.FnName;
    var key = status.key;
    var value = status.value;
    var valueType = Util$1.paramType(value);
    var keyType = Util$1.paramType(key);
    if (errorCode === '600018' && !key) {
        errorCode = '600011';
    }
    if (errorCode === '60005' && !key) {
        errorCode = '600017';
    }
    if (errorCode === '600019' && value.length && value.length > 30) {
        value = Util$1.stringSlice(value, 30) + '...';
    }
    var msgTemp = errorMessage[errorCode] || errorMessage.common;
    var showMsg = msgTemp.replace(/{FN}/g, fn)
        .replace(/{KEY}/g, JSON.stringify(key))
        .replace(/{VALUE}/g, JSON.stringify(value))
        .replace(/{VALUETYPE}/g, valueType)
        .replace(/{KEYTYPE}/g, keyType);

    if (baseConfig.base.$debug === 1 || baseConfig.base.$debug === 2) {
        console.warn(showMsg);
    }

};

/**
 *nodeJS-SDK校验文件
 *王明佳、联系方式（wangmingjia@analysys.com.cn）
 *2019-07-08
 **/

class Check {
    constructor() { }
    /**
     * 属性 key 格式校验
     * @param key 属性
     * @throws Boolean
     * 逻辑：
     */
    checkKey (key) {
        baseConfig.status.key = key;
        if (!isString(key) || !length99(key) || !notSpecialCharacters(key) || !keywords(key)) {
            errorLog();
            return false;
        }
        return true;
    }
    /**
     * 属性值 val 格式校验
     * @param val 属性值
     * @throws Boolean
     * 逻辑：判断是number 返回 true
     *      判断是boolean 返回 true
     *      判断是string 符合 length255 返回true  ，不符合返回false
     *      判断是 Array 是 isArrayString 返回 true ，否则 返回 false
     *      判断是 Obj ，是undefined 和 null 返回false，其他返回 true
     */
    checkValue (val) {
        baseConfig.status.value = val;
        if (Util$1.paramType(val) == 'Number') return val;
        if (Util$1.paramType(val) == 'Boolean') return val;
        if (Util$1.paramType(val) == 'String') {
            if (!length255(val)) {
                if (val.length > 8192) {
                    val = Util$1.stringSlice(val, 8191) + '$';
                }
                errorLog();
            }
            return val;
        }
        if (Util$1.paramType(val) == 'Array') {
            if (!isArrayString(val)) {
                errorLog();
            } else {
                var A = [];
                for (var i = 0; i < val.length; i++) {
                    if (!length255(val[i])) {
                        if (val[i].length > 8192) {
                            val[i] = Util$1.stringSlice(val[i], 8191) + '$';
                        }
                        baseConfig.status.value = val[i];
                        errorLog();
                    }
                    A.push(val[i]);
                }
                val = A;
            }
            return val;
        }
        if (Util$1.paramType(val) == 'Object' || Util$1.paramType(val) == 'Undefined' || Util$1.paramType(val) == 'Null') {
            baseConfig.status.errorCode = '600025';
            errorLog();
        }
        return val;
        // if (!notObject(val) || !isArrayString(val) || !length255(val)) {
        //     errorLog();
        //     return false;
        // }
        // return true;
    }
    /**
     * 属性 格式校验
     * @param property Object
     * @throws Boolean
     */
    checkProperty (property) {
        if (isObject(property)) {
            if (Object.keys(property).length > 0) {
                for (var key in property) {
                    this.checkKey(key);
                    property[key] = this.checkValue(property[key]);
                    // if (!this.checkKey(key)) {
                    //     return false
                    // };
                    // if (!this.checkValue(property[key])) {
                    //     return false;
                    // }
                }
            } else {
                baseConfig.status.errorCode = '600026';
                baseConfig.status.key = 'properties';
                baseConfig.status.value = property;
                errorLog();
            }
            return property;
        }
        baseConfig.status.key = property;
        baseConfig.status.value = property;
        baseConfig.status.errorCode = '600016';
        return false;
    }
    /**
     * 布尔校验
     * @param boolean
     * @throws Boolean
     */
    checkBoolean (bool) {
        baseConfig.status.key = bool;
        baseConfig.status.value = bool;
        if (!isBoolean(bool)) {
            return false;
        }
        return true;
    }

    /**
     * 校验时间戳
     * @param time
     * @throws Boolean
     */
    checkTime (time) {
        baseConfig.status.value = time;
        if (!isNumber(time) || lengthTime(time) != 13 || (time + '').indexOf('.') > - 1) {
            return false;
        }
        return true;
    }
    /**
     * id 格式校验
     * @param id 用户标识  包括distinctId aliasId：唯一身份标识，取值长度 1 - 255字符,支持类型：String
     * @throws Boolean
     *
     * "$alias": {
        "check": {
            "key": ["isString", "nimLength", "keyLength255"]
        }
    },
     */
    checkDistinctId (id) {
        baseConfig.status.key = 'distinctId';
        if (this.checkId(id)) return true;
        return false;
    }
    checkAliasId (id) {
        baseConfig.status.key = 'aliasId';
        if (this.checkId(id)) return true;
        return false;
    }
    checkId (id) {
        baseConfig.status.val = id;
        if (!isString(id) || !keyLength255(id)) {
            baseConfig.status.errorCode = '600011';
            return false;
        }
        return true;
    }
    /**
     * 事件名称校验
     * @param 取值长度 1 - 99字符,支持类型：String
     * @throws Boolean
     */
    checkEventName (eventName) {
        baseConfig.status.key = eventName;
        if (!isString(eventName) || !length99(eventName) || !notSpecialCharacters(eventName)) {
            errorLog();
            return false;
        }
        return true;
    }
    /**
     * 特殊事件(profileIncrement)的参数key校验，与普通key的区别是 不包含 关键字的校验
     * @param 取值长度 1 - 125字符,支持类型：String
     * @throws Boolean
     */
    checkIncrementKey (key) {
        baseConfig.status.key = key;
        if (!isString(key) || !length99(key) || !notSpecialCharacters(key)) {
            errorLog();
            return false;
        }
        return true;
    }
    /**
     * 特殊事件(profileIncrement)的参数value校验
     * @param 支持类型：Number
     * @throws Boolean
     */
    checkIncrementValue (value) {
        baseConfig.status.value = value;
        if (!isNumber(value)) {
            errorLog();
            return false;
        }
        return true;
    }
    /**
     * 特殊事件(profileUnSet)的参数key的校验，
     * @param 取值长度 1 - 125字符,支持类型：String
     * @throws Boolean
     */
    checkUnsetKey (key) {
        baseConfig.status.key = key;
        if (!isString(key) || !length99(key) || !notSpecialCharacters(key)) {
            errorLog();
            return false;
        }
        return true;
    }
    //校验上传，假如存在uploadTime 的校验，没有uploadTime 直接return ture
    //校验规则，允许string number ，string转成number 和number 必须符合时间戳要求，不能有点之类的
    checkUploadTime (upLoadTime) {
        if (Util$1.paramType(upLoadTime) == 'Undefined') {
            return true;
        }
        if (upLoadTime && Util$1.paramType(upLoadTime) == 'String') {
            upLoadTime = Number(upLoadTime);
        }
        if (upLoadTime && this.checkTime(upLoadTime)) {
            return true;
        } else {
            baseConfig.status.key = 'upLoadTime';
            baseConfig.status.value = upLoadTime;
            baseConfig.status.errorCode = '600024';
            errorLog();
            return false;
        }
    }

    // 检查 基础配置 appid uploadUrl platform
    checkBase (appId, uploadURL) {
        if (!appId || !uploadURL) {
            var option = '';
            if (!appId) option = 'appId ';
            if (!uploadURL) option += 'uploadURL ';
            baseConfig.status.FnName = 'Init SDK';
            baseConfig.status.errorCode = '600023';
            baseConfig.status.key = option;
            errorLog();
            return false;
        }
        if (!Util$1.checkURL(uploadURL)) {
            baseConfig.status.errorCode = '600023';
            baseConfig.status.key = 'uploadURL';
            errorLog();
            return false;
        }
        return true;
    }
    // 检查 基础配置 appid
    checkAppid (appid) {
        if (Util$1.paramType(appid) != 'String' || appid == '') {
            baseConfig.status.errorCode = '600021';
            baseConfig.status.FnName = 'Init SDK';
            baseConfig.status.key = 'appid';
            baseConfig.status.value = appid;
            errorLog();
            return false;
        }
        return true;
    }
    // 对 平台名称 进行校验
    checkPlatform (platform) {
        if (Util$1.paramType(platform) == 'String') {
            if (platform.toUpperCase() == 'NODE' || platform == '') {
                platform = 'Node';
            }
            if (platform.toUpperCase() == 'ANDROID') {
                platform = 'Android';
            }
            if (platform.toUpperCase() == 'IOS') {
                platform = 'iOS';
            }
            if (platform.toUpperCase() == 'JS') {
                platform = 'JS';
            }
            if (platform.toUpperCase() == 'WECHAT') {
                platform = 'WeChat';
            }
            return platform;
        }
        baseConfig.status.errorCode = '600018';
        baseConfig.status.key = 'platform';
        baseConfig.status.value = platform;
        errorLog();
        return 'Node';
    }
    // 落文件路径
    checkGerFolder (gerFolder) {
        if (Util$1.paramType(gerFolder) != 'String' || gerFolder == '') {
            baseConfig.status.errorCode = '600021';
            baseConfig.status.FnName = 'Init logCollector';
            baseConfig.status.key = 'gerFolder';
            baseConfig.status.value = gerFolder;
            errorLog();
            return false;
        }
        return true;
    }
}

/**
 * 格式校验 用到的规则
 */

let isString = (val) => {
    baseConfig.status.errorCode = '60001';
    return Util$1.paramType(val) === 'String';
};

let isNumber = (val) => {
    baseConfig.status.errorCode = '60002';
    return Util$1.paramType(val) === 'Number';
};

let isBoolean = (val) => {
    baseConfig.status.errorCode = '60003';
    return Util$1.paramType(val) === 'Boolean';
};

let isObject = (val) => Util$1.paramType(val) === 'Object';

let lengthRule = (val, min, max) => {
    if (!isNumber(max)) {
        max = Infinity;
    }
    var status = true;
    if (!(isNumber(min) && val.length && val.length > min && val.length < max + 1)) {
        baseConfig.status.errorCode = '60005';
        status = false;
    }
    return status;
};

let lengthTime = (time) => {
    if (Util$1.paramType(time) == 'Number') {
        time = time + '';
    }
    return time.length;
};

let length99 = (val) => {
    var lengthStatus = lengthRule(val, 0, 99);
    if (!lengthStatus) {
        baseConfig.status.errorCode = '600010';
    }
    return lengthStatus;
};

let length255 = (val) => {
    if (!val && !isString(val) && !isNumber(val) && !isBoolean(val)) {
        baseConfig.status.errorCode = '60005';
        return false;
    }
    if (Util$1.paramType(val) !== 'String') {
        val = val.toString();
    }
    var lengthStatus = lengthRule(val, 0, 255);
    if (!lengthStatus) {
        baseConfig.status.errorCode = '600019';
    }
    return lengthStatus;
};

let keyLength255 = (val) => {
    var lengthStatus = length255(val);
    if (!lengthStatus) {
        baseConfig.status.errorCode = '600017';
    }
    return lengthStatus;
};

let notSpecialCharacters = (val) => {
    var patrn = new RegExp('[\\u4E00-\\u9FA5]|[\\uFE30-\\uFFA0]', 'gi');
    var reg = /^[$a-zA-Z][a-zA-Z0-9_$]{0,}$/;
    if (patrn.test(val) || !reg.test(val)) {
        baseConfig.status.errorCode = '600011';
        return false;
    }
    return true;
};

let isArrayString = (val) => {
    if (Util$1.paramType(val) === 'Array') {
        for (var i = 0; i < val.length; i++) {
            if (Util$1.paramType(val[i]) !== 'String') {
                baseConfig.status.errorCode = '600013';
                return false;
            }
            // if (!length255(val[i])) {
            //     if (val[i].length > 8192) {
            //         val[i] = Util.stringSlice(val[i], 8191) + '$'
            //     }
            //     baseConfig.status.value = val[i]
            //     return false;
            // }
        }
    }
    return true;
};

let keywords = (val) => {
    var key = ['$lib', '$lib_version', '$platform', '$debug', '$is_login', '$original_id'];
    var status = key.indexOf(val) > -1 ? false : true;
    if (!status) {
        baseConfig.status.errorCode = '600012';
    }
    return status;
};

var check = new Check();

class AnalysysAgent {
    constructor({ appId, uploadURL, debugMode = 0, postNumber = 0, postTime = 0, logCollector = null }) {
        baseConfig.base.$debug = debugMode;
        this.appId = appId;
        if (Util$1.paramType(logCollector) == 'Null' || Util$1.paramType(logCollector) != 'Object') {
            var status = check.checkBase(appId, uploadURL);
            if (status) {
                this.uploadURL = Util$1.checkUrlLast(uploadURL) + 'up?appid=' + appId;
            }
        }
        this.baseProperties = {
            '$lib': 'Node',
            '$lib_version': '4.0.3',
            '$debug': debugMode
        };
        this.superProperty = {};
        this.postData = [];
        this.postNumber = postNumber;
        this.upPostDataTime = postTime;
        this.postFun = null;
        this.timer = null;
        this.code = 400;
        this.logCollector = logCollector;
    }
    /**
     * 重置状态,每次打印前的重置
     */
    resetCode () {
        this.code = 400;
        baseConfig.status = {
            'code': 200,
            'FnName': baseConfig.status.FnName || '',
            'key': '',
            'value': '',
            'errorCode': '',
            'successCode': ''
        };
    }
    /**
     * 注册超级属性
     * @param params key
     */
    registerSuperProperty (key, value) {
        this.resetCode();
        baseConfig.status.FnName = '$registerSuperProperty';
        var obj = Util$1.toObj(key, value);
        obj = check.checkProperty(obj);
        var superProperty = this.superProperty;
        baseConfig.status.value = JSON.stringify(obj);
        // if (check.checkKey(key) && check.checkValue(value)) {
        this.superProperty = Util$1.objMerge(superProperty, obj);
        baseConfig.status.successCode = 20002;
        this.code = 200;
        successLog();
        return this.superProperty;
        // }
    }
    /**
     * 注册超级属性,注册后每次发送的消息体中都包含该属性值
     * @param params 属性
     */
    registerSuperProperties (property) {
        this.resetCode();
        var superProperty = this.superProperty;
        baseConfig.status.FnName = '$registerSuperProperties';
        if (check.checkProperty(property)) {
            this.superProperty = Util$1.objMerge(superProperty, property);
            baseConfig.status.value = JSON.stringify(property);
            baseConfig.status.successCode = 20002;
            this.code = 200;
            successLog();
            return this.superProperty;
        }
        errorLog();
        return;
    }
    /**
     * 获取超级属性
     * @param key 属性KEY
     * @return 该KEY的超级属性值
     */
    getSuperProperty (key) {
        this.resetCode();
        baseConfig.status.FnName = '$getSuperProperty';
        baseConfig.status.key = key;
        check.checkKey(key);
        if (this.superProperty.hasOwnProperty(key)) {
            var value = this.superProperty[key];
            baseConfig.status.successCode = 20010;
            baseConfig.status.value = value;
            this.code = 200;
            successLog();
            return value;
        }
        baseConfig.status.successCode = 20009;
        successLog();
        return null;
    }
    /**
     * 获取超级属性
     * @return 所有超级属性
     */

    getSuperProperties () {
        this.resetCode();
        baseConfig.status.FnName = '$getSuperProperties';
        baseConfig.status.successCode = '20010';
        baseConfig.status.value = JSON.stringify(this.superProperty);
        this.code = 200;
        successLog();
        return this.superProperty;
    }

    /**
     * 移除超级属性
     * @param key 属性key
     */
    unRegisterSuperProperty (key) {
        this.resetCode();
        baseConfig.status.value = key;
        baseConfig.status.FnName = '$unRegisterSuperProperty';
        //删除 空值 键     空  0
        check.checkKey(key);
        if (this.superProperty.hasOwnProperty(key)) {
            delete this.superProperty[key];
            baseConfig.status.successCode = '20003';
            this.code = 200;
            successLog();
            return this.superProperty;
        }
        baseConfig.status.successCode = '20011';
        successLog();
        return;
    }

    /**
     * 清除超级属性
     */
    clearSuperProperties () {
        this.resetCode();
        baseConfig.status.FnName = '$clearSuperProperties';
        baseConfig.status.successCode = '20004';
        this.code = 200;
        successLog();
        this.superProperty = {};
        return this.superProperty;
    }

    /**
     * 立即发送所有收集的信息到服务器
     */
    flush () {
        if (this.postData.length > 0) {
            this.send();
        }
    }

    /**
     * 立即终止发送的请求
     */
    shutdown () {
        if (this.postFun) {
            this.postFun.abort();
            baseConfig.status.successCode = '20013';
            successLog();
        }
    }
    /**
     * 设置用户的属性
     * @param distinctId 用户ID
     * @param isLogin 用户ID是否是登录 ID
     * @param properties 用户属性
     */
    profileSet (distinctId, isLogin, properties, platform, upLoadTime) {
        this.resetCode();
        baseConfig.status.FnName = '$profile_set';
        if (!check.checkUploadTime(upLoadTime)) {
            return;
        }
        // properties = check.checkProperty(properties);
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && check.checkProperty(properties)) {
            this.upLoad(distinctId, isLogin, '$profile_set', properties, platform, upLoadTime);
            return;
        }
        errorLog();
    }
    /**
     * 首次设置用户的属性,该属性只在首次设置时有效
     * @param distinctId 用户ID
     * @param isLogin 用户ID是否是登录 ID
     * @param properties 用户属性
     */
    profileSetOnce (distinctId, isLogin, properties, platform, upLoadTime) {
        this.resetCode();
        baseConfig.status.FnName = '$profile_set_once';
        if (!check.checkUploadTime(upLoadTime)) {
            return;
        }
        // properties = check.checkProperty(properties);
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && check.checkProperty(properties)) {
            this.upLoad(distinctId, isLogin, '$profile_set_once', properties, platform, upLoadTime);
            return;
        }
        errorLog();
    }
    /**
     * 为用户的一个或多个数值类型的属性累加一个数值
     * @param distinctId 用户ID
     * @param isLogin 用户ID是否是登录 ID
     * @param properties 用户属性
     */
    profileIncrement (distinctId, isLogin, properties, platform, upLoadTime) {
        this.resetCode();
        baseConfig.status.FnName = '$profile_increment';
        if (!check.checkUploadTime(upLoadTime)) {
            return;
        }
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && Util$1.paramType(properties) === 'Object') {
            if (Object.keys(properties).length > 0) {
                for (var i in properties) {
                    check.checkKey(i);
                    check.checkIncrementValue(properties[i]);
                    // if (check.checkIncrementKey(i) && check.checkIncrementValue(properties[i])) {
                    // return;
                    // }
                }
            } else {
                baseConfig.status.errorCode = '600026';
                baseConfig.status.key = 'properties';
                errorLog();
            }
            this.upLoad(distinctId, isLogin, '$profile_increment', properties, platform, upLoadTime);
            return;
        }
        if (!Util$1.paramType(properties) !== 'Object') {
            baseConfig.status.key = properties;
            baseConfig.status.value = properties;
            baseConfig.status.errorCode = '600016';
        }
        errorLog();
    }
    /**
     * 追加用户列表类型的属性
     * @param distinctId 用户ID
     * @param isLogin 用户ID是否是登录 ID
     * @param properties 用户属性
     */
    profileAppend (distinctId, isLogin, properties, platform, upLoadTime) {
        this.resetCode();
        baseConfig.status.FnName = '$profile_append';
        if (!check.checkUploadTime(upLoadTime)) {
            return;
        }
        // properties = check.checkProperty(properties);
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && check.checkProperty(properties)) {
            this.upLoad(distinctId, isLogin, '$profile_append', properties, platform, upLoadTime);
            return;
        }
        errorLog();
    }
    /**
     * 删除用户某一个属性
     * @param distinctId 用户ID
     * @param isLogin 用户ID是否是登录 ID
     * @param property 用户属性名称
     * @throws AnalysysException
     */
    profileUnSet (distinctId, isLogin, property, platform, upLoadTime) {
        this.resetCode();
        baseConfig.status.FnName = '$profile_unset';
        if (!check.checkUploadTime(upLoadTime)) {
            return;
        }
        check.checkUnsetKey(property);
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin)) {
            var properties = {};
            properties[property] = '';
            this.upLoad(distinctId, isLogin, '$profile_unset', properties, platform, upLoadTime);
            return;
        }
        errorLog();
    }
    /**
     * 删除用户所有属性
     * @param distinctId 用户ID
     * @param isLogin 用户ID是否是登录 ID
     * @throws AnalysysException
     */
    profileDelete (distinctId, isLogin, platform, upLoadTime) {
        this.resetCode();
        baseConfig.status.FnName = '$profile_delete';
        if (!check.checkUploadTime(upLoadTime)) {
            return;
        }
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin)) {
            this.upLoad(distinctId, isLogin, '$profile_delete', {}, platform, upLoadTime);
            return;
        }
        errorLog();
    }
    /**
     * 关联用户匿名ID和登录ID
     * @param aliasId 用户登录ID
     * @param distinctId 用户匿名ID
     * @throws AnalysysException
     */

    alias (aliasId, distinctId, platform, upLoadTime) {
        this.resetCode();
        baseConfig.status.FnName = '$alias';
        if (!check.checkUploadTime(upLoadTime)) {
            return;
        }
        if (check.checkAliasId(aliasId) && check.checkDistinctId(distinctId)) {
            var param = {};
            param.$original_id = distinctId;
            this.upLoad(aliasId, true, '$alias', param, platform, upLoadTime);
            return;
        }
        errorLog();
    }
    /**
     * 追踪用户多个属性的事件
     * @param distinctId 用户ID
     * @param isLogin 用户ID是否是登录 ID
     * @param eventName 事件名称
     * @param properties 事件属性
     * @throws AnalysysException
     */
    track (distinctId, isLogin, eventName, properties, platform, upLoadTime) {
        this.resetCode();
        baseConfig.status.FnName = eventName;
        // baseConfig.status.FnName = eventName || "$track";
        if (!check.checkUploadTime(upLoadTime)) {
            return;
        }
        upLoadTime = upLoadTime || +new Date();
        check.checkEventName(eventName);
        // track 没有 properties 也要上报
        if (properties == undefined) {
            properties = {};
            if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin)) {
                this.upLoad(distinctId, isLogin, eventName, properties, platform, upLoadTime, true);
                return;
            }
        } else {
            // properties = check.checkProperty(properties);
            if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && check.checkProperty(properties)) {
                this.upLoad(distinctId, isLogin, eventName, properties, platform, upLoadTime, true);
                return;
            }
        }
        errorLog();
    }
    /**
     * 上传数据,首先校验相关KEY和VALUE,符合规则才可以上传
     * @param distinctId 用户标识
     * @param eventName 事件名称
     * @param properties 属性
     * @throws AnalysysException
     */
    upLoad (distinctId, isLogin, eventName, properties, platform, upLoadTime, merFlag) {
        //API 方法校验了参数，上传就不校验了
        var eventMap = {};
        eventMap.appid = this.appId;
        eventMap.xwho = distinctId;
        eventMap.xwhen = upLoadTime || +new Date();
        eventMap.xwhat = eventName;
        // 平台校验放在upload 里面公共
        if (platform == undefined) {
            check.checkPlatform(platform);
            return;
        }
        platform = check.checkPlatform(platform);
        this.baseProperties.$is_login = isLogin;
        this.baseProperties.$platform = platform;
        //属性合并
        properties = Util$1.objMerge(properties, this.baseProperties);  //合并基本属性
        if (merFlag == true) {   // 只有 track 需要合并超级属性
            properties = Util$1.objMerge(this.superProperty, properties);   //合并超级属性
        }
        eventMap.xcontext = properties;
        this.postData.push(eventMap);
        //数据上传 满足 一定的条数上传( 数据可设置 )，立即上传;
        if (this.postData.length >= this.postNumber) {
            this.send();
            return false;
        }
        //没有设置上传条数，上传间隔时间，立即上传。
        if (!this.postNumber && !this.upPostDataTime) {
            this.send();
        }
        //设置了上传间隔时间（可以为0。设置0 或者 不设置 默认为 0）, 上传条数大于 0 的情况下，会进入到时间条件的上传，到达时间就上传。
        if (this.upPostDataTime >= 0 && this.postData.length > 0) {
            var _this = this;
            if (this.timer) {
                return false;
            } else {
                this.timer = setTimeout(function () {
                    _this.send();
                }, this.upPostDataTime);
                return false;
            }
        }
    }

    /**
     * 上传方式
     */
    send () {
        var _this = this;
        this.resetCode();
        // 对appid 进行校验
        if (!check.checkAppid(this.appId)) return;
        // 没有 落文件 是 会对上报数据进项校验的。有落文件 就忽略这一步
        if (Util$1.paramType(this.logCollector) == 'Null' || Util$1.paramType(this.logCollector) != 'Object') {
            var flag = check.checkBase(this.appId, this.uploadURL);
            if (!flag) return;
        } 
        var postData = this.postData;
        if (this.checkBack && Util$1.paramType(this.checkBack) == 'Function') {
            var newBack = this.checkBack;
        }
        // 来到这里 说明满足条件 写入文件
        if (Util$1.paramType(this.logCollector) == 'Object') {
            var logC = this.logCollector;
            logC.LogCol(_this.postData, function (err) {
                if (!err) {
                    _this.postData = [];
                }
            }, this.baseProperties.$debug);
            return;
        }
        baseConfig.status.key = this.uploadURL;
        baseConfig.status.value = JSON.stringify(postData);
        baseConfig.status.successCode = '20012';
        successLog();
        //发送请求时间 内产生的数据操作。
        this.postData = [];   //此时清空缓存 ，下次进入到 send的 是一个 可发送的新数据。
        clearTimeout(this.timer);
        this.timer = null;
        this.postFun = request({
            url: this.uploadURL,
            method: 'POST',
            json: true,
            body: postData
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                //返回结果可能是 json 也可能是 压缩 之后转 64。所以判断，非json，64转一下之后 zip 解压缩。
                if (Util$1.paramType(body) === 'Object') {
                    //成功 打印成功日志 清空定时器 失败 打印失败日志 数据存储下来，下次上报
                    if (body.code == 200) {
                        baseConfig.status.successCode = '20001';
                        this.code = 200;
                        successLog();
                    } else {
                        baseConfig.status.errorCode = '60008';
                        errorLog();
                    }
                    if (this.checkBack && Util$1.paramType(this.checkBack) == 'Function') {
                        newBack();
                    }
                } else {
                    //先 base64 解密 之后 gzip 解压。
                    var buffer = Buffer.from(body, 'base64');
                    zlib.unzip(buffer, (err, buffer) => {
                        if (!err) {
                            var result = JSON.parse(buffer.toString());
                            if (result.code == 200) {
                                baseConfig.status.successCode = '20001';
                                this.code = 200;
                                successLog();
                            } else {
                                baseConfig.status.errorCode = '60008';
                                errorLog();
                            }
                        }
                        if (this.checkBack && Util$1.paramType(this.checkBack) == 'Function') {
                            newBack();
                        }
                    });
                }
            } else {
                baseConfig.status.errorCode = '60008';
                errorLog();
            }
        });
    }
}

export default AnalysysAgent;
