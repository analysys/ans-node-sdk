# [易观方舟](https://www.analysys.cn/) ans-node-sdk [![NPM version][npm-image]][npm-url] [![License](https://img.shields.io/github/license/analysys/ans-node-sdk.svg)](https://github.com/analysys/ans-nodes-sdk/blob/master/LICENSE) [![GitHub release](https://img.shields.io/github/release/analysys/ans-node-sdk.svg)](https://github.com/analysys/ans-node-sdk/releases)



## 安装

    $ npm install ans-node-sdk --save


## Node SDK 基础说明
+ 快速集成

      // 非es6 
      var AnalysysAgent = require("ans-node-sdk");
      var LogCollector = require('ans-node-sdk/sdk/AnalysysAgent_NodeJS_SDK_LogCollecter.cjs');

      // es6 
      import AnalysysAgent from "ans-node-sdk"
      import LogCollector  from 'ans-node-sdk/sdk/AnalysysAgent_NodeJS_SDK_LogCollecter.cjs';

      // SDK 初始化
      var AgentConfig ={
          appId : appId,
          uploadURL:uploadURL,
          debugMode:debug, 
          postNumber:postNumber,
          postTime:postTime,
          logCollector:new LogCollector({   
              gerFold:gerFold,
              gerRule:gerRule
          })
      }

      var analysys = new AnalysysAgent(AgentConfig);

    
+ appId: 网站获取的 Key。
+ uploadURL: 数据接收地址。
+ debug: debug模式，有 0、1、2 三种枚举值。
    + 0 表示关闭 Debug 模式 （默认状态）
    + 1 表示打开 Debug 模式，但该模式下发送的数据仅用于调试，不计入平台数据统计
    + 2 表示打开 Debug 模式，该模式下发送的数据可计入平台数据统计
注意：发布版本时debug模式设置为`0`。
+ postNumber: 批量保存数量，默认值：0条，实时上传。
+ postTime: 批量保存等待时间(秒)，默认值:0。
+ logCollector: 落日志到本地。默认不开启，开启需要配置 gerFold和gerRule。
+ gerFold: 落日志存放的路径。
+ gerRule: 落日志存放的格式，有 "H"小时 和 "D"天 两种枚举值，默认"H"，按小时切割文件。

注:假如启用了落地文件收集器，配置中的uploadURL将不再生效。

> 通过以上步骤您即可验证SDK是否已经集成成功，更多Api使用方法参考：[易观方舟 Node SDK 文档](https://docs.analysys.cn/ark/integration/sdk/node-sdk)

> 注意 SDK 可能不完全向前兼容，请查看版本更新说明 [Release及版本升级记录](https://github.com/analysys/ans-node-sdk/releases)。如果有说明不兼容的话，需要升级易观方舟对应的版本。 请根据需要前往 [Release](https://github.com/analysys/ans-node-sdk/releases) 里下载对应的文件

## 版本升级记录
请参见 [Release及版本升级记录](https://github.com/analysys/ans-node-sdk/releases)

         

## 讨论
+ 微信号：nlfxwz
+ 钉钉群：30099866
+ 邮箱：nielifeng@analysys.com.cn


**禁止一切基于易观方舟 Node 开源 SDK 的所有商业活动！**

---

[![NPM downloads][npm-downloads]][npm-url]




[homepage]: https://github.com/analysys/ans-node-sdk
[npm-url]: https://www.npmjs.com/package/ans-node-sdk
[npm-image]: https://img.shields.io/npm/v/ans-node-sdk.svg?style=flat
[npm-downloads]: https://img.shields.io/npm/dm/ans-node-sdk.svg?style=flat


