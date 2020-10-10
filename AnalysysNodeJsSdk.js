// import request from 'request';            //请求的公共模块
import request from 'sync-request';       //请求的公共模块 同步
import baseConfig from './lib/AnalysysBase';    //基本配置文件 包括事件名称，成功码、错误码等
import { successLog, errorLog } from './lib/AnalysysLog'; //成功日志 和 错误日志
import check from './lib/AnalysysCheck';  // 校验模块
import Util from './lib/AnalysysCommon';  // 公共方法模块
import zlib from 'zlib';                  // 数据压缩的公共模块
import fs from 'fs';
import LogCollector from './lib/LogCollecter';




class AnalysysAgent {
    constructor({ appId, uploadURL, debugMode = 0, postNumber = 0, postTime = 0, logCollector = null }) {
        baseConfig.base.$debug = debugMode;
        this.appId = appId;
        if (Util.paramType(logCollector) == 'Null' || Util.paramType(logCollector) != 'Object') {
            var status = check.checkBase(appId, uploadURL);
            if (status) {
                this.uploadURL = Util.checkUrlLast(uploadURL) + 'up?appid=' + appId;
            }
        }
        this.baseProperties = {
            '$lib': 'Node',
            '$lib_version': '4.0.5',
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
        var obj = Util.toObj(key, value);
        obj = check.checkProperty(obj);
        var superProperty = this.superProperty;
        baseConfig.status.value = JSON.stringify(obj);
        // if (check.checkKey(key) && check.checkValue(value)) {
        this.superProperty = Util.objMerge(superProperty, obj);
        baseConfig.status.successCode = 20002;
        this.code = 200;
        successLog();
        return true;
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
            this.superProperty = Util.objMerge(superProperty, property);
            baseConfig.status.value = JSON.stringify(property);
            baseConfig.status.successCode = 20002;
            this.code = 200;
            successLog();
            return true;
        }
        errorLog();
        return false;
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
            return true;
        }
        baseConfig.status.successCode = '20011';
        successLog();
        return false;
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
        return true;
    }

    /**
     * 立即发送所有收集的信息到服务器
     */
    flush () {
        if (this.postData.length > 0) {
            return this.send();
        }
        return false;
    }

    /**
     * 立即终止发送的请求
     */
    // shutdown () {
    //     if (this.postFun) {
    //         this.postFun.abort();
    //         baseConfig.status.successCode = '20013';
    //         successLog();
    //         return true;
    //     }
    //     return false
    // }
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
            return false;
        }
        // properties = check.checkProperty(properties);
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && check.checkProperty(properties)) {
            return this.upLoad(distinctId, isLogin, '$profile_set', properties, platform, upLoadTime);
        }
        errorLog();
        return false;
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
            return false;
        }
        // properties = check.checkProperty(properties);
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && check.checkProperty(properties)) {
            return this.upLoad(distinctId, isLogin, '$profile_set_once', properties, platform, upLoadTime);
        }
        errorLog();
        return false;
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
            return false;
        }
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && Util.paramType(properties) === 'Object') {
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
            return this.upLoad(distinctId, isLogin, '$profile_increment', properties, platform, upLoadTime);
        }
        if (!Util.paramType(properties) !== 'Object') {
            baseConfig.status.key = properties;
            baseConfig.status.value = properties;
            baseConfig.status.errorCode = '600016';
        }
        errorLog();
        return false;
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
            return false;
        }
        // properties = check.checkProperty(properties);
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && check.checkProperty(properties)) {
            return this.upLoad(distinctId, isLogin, '$profile_append', properties, platform, upLoadTime);
        }
        errorLog();
        return false;
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
            return false;
        }
        check.checkUnsetKey(property);
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin)) {
            var properties = {};
            properties[property] = '';
            return this.upLoad(distinctId, isLogin, '$profile_unset', properties, platform, upLoadTime);
        }
        errorLog();
        return false;
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
            return false;
        }
        if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin)) {
            return this.upLoad(distinctId, isLogin, '$profile_delete', {}, platform, upLoadTime);
        }
        errorLog();
        return false;
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
            return false;
        }
        if (check.checkAliasId(aliasId) && check.checkDistinctId(distinctId)) {
            var param = {};
            param.$original_id = distinctId;
            return this.upLoad(aliasId, true, '$alias', param, platform, upLoadTime);
        }
        errorLog();
        return false;
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
            return false;
        }
        upLoadTime = upLoadTime || +new Date();
        check.checkEventName(eventName);
        // track 没有 properties 也要上报
        if (properties == undefined) {
            properties = {};
            if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin)) {
                return this.upLoad(distinctId, isLogin, eventName, properties, platform, upLoadTime, true);
            }
        } else {
            // properties = check.checkProperty(properties);
            if (check.checkDistinctId(distinctId) && check.checkBoolean(isLogin) && check.checkProperty(properties)) {
                return this.upLoad(distinctId, isLogin, eventName, properties, platform, upLoadTime, true);
            }
        }
        errorLog();
        return false;
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
        eventMap.xwhen = +upLoadTime || +new Date();
        eventMap.xwhat = eventName;
        // 平台校验放在upload 里面公共
        if (platform == undefined) {
            check.checkPlatform(platform);
            return false;
        }
        platform = check.checkPlatform(platform);
        this.baseProperties.$is_login = isLogin;
        this.baseProperties.$platform = platform;
        //属性合并
        properties = Util.objMerge(properties, this.baseProperties);  //合并基本属性
        if (merFlag == true) {   // 只有 track 需要合并超级属性
            properties = Util.objMerge(this.superProperty, properties);   //合并超级属性
        }
        eventMap.xcontext = properties;
        this.postData.push(eventMap);
        //数据上传 满足 一定的条数上传( 数据可设置 )，立即上传;
        if (this.postData.length >= this.postNumber) {
            return this.send();
        }
        //没有设置上传条数，上传间隔时间，立即上传。
        if (!this.postNumber && !this.upPostDataTime) {
            return this.send();
        }
        //设置了上传间隔时间（可以为0。设置0 或者 不设置 默认为 0）, 上传条数大于 0 的情况下，会进入到时间条件的上传，到达时间就上传。
        if (this.upPostDataTime >= 0 && this.postData.length > 0) {
            var _this = this;
            if (this.timer) {
                return true;
            } else {
                this.timer = setTimeout(function () {
                    _this.send();
                }, this.upPostDataTime);
                return true;
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
        if (!check.checkAppid(this.appId)) return false;
        // 没有 落文件 是 会对上报数据进项校验的。有落文件 就忽略这一步
        if (Util.paramType(this.logCollector) == 'Null' || Util.paramType(this.logCollector) != 'Object') {
            var flag = check.checkBase(this.appId, this.uploadURL);
            if (!flag) return false;
        }
        var postData = this.postData;
        // 来到这里 说明满足条件 写入文件
        if (Util.paramType(this.logCollector) == 'Object') {
            var logC = this.logCollector;
            return logC.LogCol(_this.postData, function (err) {
                if (!err) {
                    _this.postData = [];
                }
            }, this.baseProperties.$debug);
        }
        baseConfig.status.key = this.uploadURL;
        baseConfig.status.value = JSON.stringify(postData);
        baseConfig.status.successCode = '20012';
        successLog();
        //发送请求时间 内产生的数据操作。
        this.postData = [];   //此时清空缓存 ，下次进入到 send的 是一个 可发送的新数据。
        clearTimeout(this.timer);
        this.timer = null;
        let resRequest = request("POST", this.uploadURL, {
            json: true,
            json: postData
        });
        if (resRequest.statusCode == 200) {
            if (Util.paramType(resRequest.body) === 'Object') {
                //成功 打印成功日志 清空定时器 失败 打印失败日志 数据存储下来，下次上报
                if (body.code == 200) {
                    baseConfig.status.successCode = '20001';
                    this.code = 200;
                    successLog();
                    return true;
                }
                baseConfig.status.errorCode = '60008';
                errorLog();
                return false;
            } else {
                //先 base64 解密 之后 gzip 解压。
                var buffer = resRequest.body.toString();
                if (buffer == "H4sIAAAAAAAAAKtWSs5PSVWyMjIwqAUAVAOW6gwAAAA=" || "{\"code\":200}") {
                    baseConfig.status.successCode = '20001';
                    this.code = 200;
                    successLog();
                    return true;
                }
                baseConfig.status.errorCode = '60008';
                errorLog();
                return false;
            }
        } else {
            baseConfig.status.errorCode = '60008';
            errorLog();
            return false;
        }
    }
}

// 之前版本直接抛出
export default AnalysysAgent;
