import fs from 'fs';
import Util from './AnalysysCommon';
import baseConfig from './AnalysysBase';
import check from './AnalysysCheck';
import { successLog } from './AnalysysLog';

class LogCollector {
    constructor({ gerFolder, gerRule = 'H' }) {
        this.gerFolder = gerFolder;
        this.gerRule = gerRule;
        this.openStream = false;
    }
    LogCol (gerData, callback, debugMode) {
        var dataString = '';
        var TimeStr = Util.timeObj();
        var GerFolder = this.gerFolder;
        baseConfig.base.$debug = debugMode;
        if (!check.checkGerFolder(this.gerFolder)) return;
        // 查找最后一位 gerFolder 是不是包含 “/”,没有的话加上。
        if (Util.paramType(GerFolder) == 'String' && GerFolder.charAt(GerFolder.length - 1) != '/') {
            GerFolder = GerFolder + '/';
        }
        for (var i = 0; i < gerData.length; i++) {
            dataString += JSON.stringify(gerData[i]) + ' \n';
        }
        var dataName = '';
        if (Util.paramType(this.gerRule) == 'String' && this.gerRule.toUpperCase() == 'D') {
            dataName = 'datas_' + TimeStr.Year + TimeStr.Month + TimeStr.Day + '.log';
        } else {
            dataName = 'datas_' + TimeStr.Year + TimeStr.Month + TimeStr.Day + TimeStr.Hour + '.log';
        }
        if (fs.existsSync(GerFolder)) {
            fs.appendFileSync(GerFolder + dataName, dataString);
            callback();
        } else {
            Util.mkdirs(GerFolder);
            fs.appendFileSync(this.gerFolder + '/' + dataName, dataString);
            callback();
        }
        baseConfig.status.key = this.gerFolder + dataName;
        baseConfig.status.value = dataString;
        baseConfig.status.successCode = '20014';
        successLog();

        baseConfig.status.successCode = '20015';
        successLog();
    }
}

export default LogCollector;