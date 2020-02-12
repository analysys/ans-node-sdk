/**
 *nodeJS-SDK校验文件
 *王明佳、联系方式（wangmingjia@analysys.com.cn）
 *2019-07-08
 **/

/************************************* 属性校验 规则
 * 属性:以字母或`$`开头，包含字母、数字、下划线和`$`，字母不区分大小写，`$`开头为预置事件/属性，
 * 则取值长度 1 - 99 字符，不支持乱码和中文
 *
 * 属性值:支持部分类型：String/Number/boolean/JSON/内部元素为String的Array；若为字符串，则取值长度 1 - 255字符；
 * 若为 Array 子元素 string ,则最多包含 100条，且 key 约束条件与属性名称一致，value 取值长度 1 - 255字符
 *
 * aliasId：新的唯一用户 id。 取值长度 1 - 255字符,支持类型：String
 * originalId：待关联的设备ID，可以是现在使用也可以是历史使用的设备ID,不局限于本地正使用的设备ID。
 *            可以为空值，若为空时使用本地的设备ID。取值长度 1 - 255 字符（如无特殊需求，不建议设置），支持类型：String
 *
 * xcontextCommonRule": {
        "check": {
            "key": ["isString", "nimLength", "length99", "notSpecialCharacters", "keywords"],
            "value": ["notObject", "isArrayString", "length255"],
        }
    }
 */

import Util from './AnalysysCommon';
import baseConfig from './AnalysysBase';
import { errorLog } from './AnalysysLog';

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
        if (Util.paramType(val) == 'Number') return val;
        if (Util.paramType(val) == 'Boolean') return val;
        if (Util.paramType(val) == 'String') {
            if (!length255(val)) {
                if (val.length > 8192) {
                    val = Util.stringSlice(val, 8191) + '$';
                }
                errorLog();
            }
            return val;
        }
        if (Util.paramType(val) == 'Array') {
            if (!isArrayString(val)) {
                errorLog();
            } else {
                var A = [];
                for (var i = 0; i < val.length; i++) {
                    if (!length255(val[i])) {
                        if (val[i].length > 8192) {
                            val[i] = Util.stringSlice(val[i], 8191) + '$';
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
        if (Util.paramType(val) == 'Object' || Util.paramType(val) == 'Undefined' || Util.paramType(val) == 'Null') {
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
        if (Util.paramType(upLoadTime) == 'Undefined') {
            return true;
        }
        if (upLoadTime && Util.paramType(upLoadTime) == 'String') {
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
        if (!Util.checkURL(uploadURL)) {
            baseConfig.status.errorCode = '600023';
            baseConfig.status.key = 'uploadURL';
            errorLog();
            return false;
        }
        return true;
    }
    // 检查 基础配置 appid
    checkAppid (appid) {
        if (Util.paramType(appid) != 'String' || appid == '') {
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
        if (Util.paramType(platform) == 'String') {
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
        if (Util.paramType(gerFolder) != 'String' || gerFolder == '') {
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
    return Util.paramType(val) === 'String';
};

let isNumber = (val) => {
    baseConfig.status.errorCode = '60002';
    return Util.paramType(val) === 'Number';
};

let isBoolean = (val) => {
    baseConfig.status.errorCode = '60003';
    return Util.paramType(val) === 'Boolean';
};

let isObject = (val) => Util.paramType(val) === 'Object';

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
    if (Util.paramType(time) == 'Number') {
        time = time + '';
    }
    return time.length;
};

let nimLength = (val) => {
    var lengthStatus = lengthRule(val, 0);
    if (!lengthStatus) {
        baseConfig.status.errorCode = '60009';
    }
    return lengthStatus;
};

let length99 = (val) => {
    var lengthStatus = lengthRule(val, 0, 99);
    if (!lengthStatus) {
        baseConfig.status.errorCode = '600010';
    }
    return lengthStatus;
};

let length125 = (val) => {
    var lengthStatus = lengthRule(val, 0, 125);
    if (!lengthStatus) {
        baseConfig.status.errorCode = '60009';
    }
    return lengthStatus;
};

let length255 = (val) => {
    if (!val && !isString(val) && !isNumber(val) && !isBoolean(val)) {
        baseConfig.status.errorCode = '60005';
        return false;
    }
    if (Util.paramType(val) !== 'String') {
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

let notObject = (val) => {
    var status = !isObject(val);
    if (!status) {
        baseConfig.status.errorCode = '600021';
    }
    return status;
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
    if (Util.paramType(val) === 'Array') {
        for (var i = 0; i < val.length; i++) {
            if (Util.paramType(val[i]) !== 'String') {
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

export default new Check();