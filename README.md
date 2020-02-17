# Analysys Node SDK

This is the offical Node SDK for Analysys.

# Node SDK 目录说明：
+ SDK —— SDK文件
+ AnalysysNodeJsSdk.js —— SDK 源文件
+ lib —— SDK 源文件
+ demo.js —— API调用演示

# Node SDK 基础说明：
## 快速集成

如果您是第一次使用易观方舟产品，可以通过阅读本文快速了解此产品

集成 SDK 在执行文件的顶部引入SDK。

设置初始化接口 通过初始化代码的配置参数配置您的AppKey。

设置上传地址 通过初始化代码的配置参数uploadURL设置您上传数据的地址。

打开 Debug 模式查看日志 通过设置Ddebug模式，开/关 log 查看日志。

设置上传条数，满足条数后上报 通过初始化代码的配置参数postNumber设置上传条数

设置自动上传时间，到达时间间隔上报 通过初始化代码的配置参数postTime设置上传间隔时间

设置落日志功能，将把数据落到本地 通过初始化代码的配置参数logCollector 设置落日志的文档目录和日志格式
    
通过以上步骤您即可验证SDK是否已经集成成功。更多接口说明请您查看 API 文档。

更多Api使用方法参考：https://docs.analysys.cn/ark/integration/sdk/node-sdk

# 讨论

+ 微信号：nlfxwz
+ 钉钉群：30099866
+ 邮箱：nielifeng@analysys.com.cn

## License

[gpl-3.0](https://www.gnu.org/licenses/gpl-3.0.txt)