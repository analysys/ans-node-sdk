// es6 引入方法
// import AnalysysAgent from './sdk/AnalysysAgent_NodeJS_SDK.es6.js';
// import LogCollector from './sdk/AnalysysAgent_NodeJS_SDK_LogCollecter.es6';

// cjs 引入方法
let AnalysysAgent = require('./sdk/AnalysysAgent_NodeJS_SDK.cjs.js');
let LogCollector = require('./sdk/AnalysysAgent_NodeJS_SDK_LogCollecter.cjs.js');


// SDK 初始化。
var appId = 'sdktest201907';
var upLoadURL = 'https://arksdk.analysys.cn';
var analysys = new AnalysysAgent({
    appId: appId,          //项目唯一标示
    uploadURL: upLoadURL,  //数据上报的地址
    platform: 'Node',      //平台名称
    debugMode: 2,          //调试模式
    postNumber: 0,         //上传条数设置（批量上传）
    postTime: 0        //上传时间间隔（批量上传）
    // logCollector: new LogCollector({    // 是否落文件到本地,落文件到本地不再上报
    //     gerFolder: './a/b/c/',    // 落文件的目录
    //     gerRule: 'h'              // 落文件的格式
    // })
});


try {
    var distinctId = '12121212121212';
    var platform = 'Android';
    //浏览商品
    var trackPropertie = {
        $ip: '112.112.112.112' //IP地址
    };
    var bookList = ['Javascript权威指南'];
    trackPropertie.productName = bookList;  //商品列表
    trackPropertie.productType = 'Js书籍'; //商品类别
    trackPropertie.producePrice = 80;		  //商品价格
    trackPropertie.shop = '网上书城';     //店铺名称
    // 事件追踪
    var viewStatus = analysys.track(distinctId, true, 'ViewProduct', trackPropertie, platform);
    console.log("是否浏览商品", viewStatus)
    // 用户注册登录
    var registerId = 'ABCDEF123456789';
    analysys.alias(distinctId, registerId, platform);
    var superPropertie = {
        sex: 'male',    //性别
        age: 23         //年龄
    };
    var registerProStatus = analysys.registerSuperProperties(superPropertie);//用户信息
    console.log("是否注册用户属性", registerProStatus)
    var profiles = {
        $city: '北京',         //城市
        $province: '北京',     //省份
        nickName: '昵称123',   //昵称
        userLevel: 0,         //用户级别
        userPoint: 0          //用户积分
    };
    var interestList = ['户外活动', '足球赛事', '游戏'];
    profiles.interest = interestList;//用户兴趣爱好
    analysys.profileSet(registerId, true, profiles, platform);//用户注册时间
    var profile_age = {
        registerTime: '20180101101010'
    };
    analysys.profileSetOnce(registerId, true, profile_age, platform);//重新设置公共属性

    var clearStatus = analysys.clearSuperProperties();
    console.log("是否清除通用属性", clearStatus)
    superPropertie = {
        userLevel: 0,   //用户级别
        userPoint: 0    //用户积分
    };
    analysys.registerSuperProperties(superPropertie);//再次浏览商品

    var trackPropertie = {
        $ip: '112.112.112.112' //IP地址
    };
    var bookList = ['Javascript权威指南'];
    trackPropertie.productName = bookList;  //商品列表
    trackPropertie.productType = 'Js书籍';//商品类别
    trackPropertie.producePrice = 80;		  //商品价格
    trackPropertie.shop = 'xx网上书城';     //店铺名称
    analysys.track(registerId, true, 'ViewProduct', trackPropertie, platform);//订单信息

    trackPropertie.orderId = 'ORDER_12345';
    trackPropertie.price = 80;
    var orderStatus = analysys.track(registerId, true, 'Order', trackPropertie, platform);//支付信息
    console.log("是否下单成功", orderStatus)
    trackPropertie.orderId = 'ORDER_12345';
    trackPropertie.productName = 'Javascript权威指南';
    trackPropertie.productType = 'Js书籍';
    trackPropertie.producePrice = 8;
    trackPropertie.shop = 'xx网上书城';
    trackPropertie.productNumber = 1;
    trackPropertie.price = 80;
    trackPropertie.paymentMethod = 'AliPay';
    var payStatus = analysys.track(registerId, true, 'Payment', trackPropertie, platform);
    console.log("是否支付成功", payStatus);
} catch (err) {
    analysys.flush();
}




