// 打包生成两份 cjs 和 es6
export default [
    {
        input: './AnalysysNodeJsSdk.js',
        output: {
            file: './sdk/AnalysysAgent_NodeJS_SDK.cjs.js',
            format: 'cjs',
            name: 'Ans'
        }
    }, {
        input: './AnalysysNodeJsSdk.js',
        output: {
            file: './sdk/AnalysysAgent_NodeJS_SDK.es6.js',
            format: 'es',
            name: 'Ans'
        }
    }, {
        input: './lib/LogCollecter.js',
        output: {
            file: './sdk/AnalysysAgent_NodeJS_SDK_LogCollecter.es6.js',
            format: 'es',
            name: 'Ans'
        }
    }, {
        input: './lib/LogCollecter.js',
        output: {
            file: './sdk/AnalysysAgent_NodeJS_SDK_LogCollecter.cjs.js',
            format: 'cjs',
            name: 'Ans'
        }

    }
];
