/**
 * 录音
 */

/**
 * 控制码
 */
const kControlCode = cc.Enum({
    START_RECORD: "{\"code\":\"1\"}",
    PLAY_RECORD: "{\"code\":\"2\"}",
    STOP_RECORD: "{\"code\":\"3\"}",
    STOP_PLAY: "{\"code\":\"4\"}"
})
/**
 * 状态码
 */
const kStatusCode = cc.Enum({
    /**无状态 */
    STATUS_NONE: 0,
    /**正在播放 */
    STATUS_PLAYING: 1,
    /**停止播放 */
    STATUS_STOPPLAY: 2,
    /**正在录音 */
    STATUS_RECORDING: 3,
    /**停止录音 */
    STATUS_STOPRECORD: 4
})

var Recorder = {
    /**
     * 状态码
     */
    StatusType: kStatusCode,

    /**
     * 录音机状态
     */
    status: kStatusCode.STATUS_NONE,

    closeWindow() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            window.webkit.messageHandlers.closeGame.postMessage(null);
        } else {
            window.android.closeGame();
        }
    },
    /**
     * 发送指令码
     * @param {*} contrlStr 
     */
    sendMediaContrl(contrlStr) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            window.webkit.messageHandlers.sendMediaContrl.postMessage(contrlStr);
        } else {
            window.android.sendMediaContrl(contrlStr);
        }
    },

    /**
     * 获取状态码
     */
    getMediaStatus() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            window.webkit.messageHandlers.sendMediaContrl.postMessage(null);
        } else {
            window.android.sendMediaContrl(null);
        }
    },

    /**
     * 回调（返回状态码）
     * @param {*} codeStr 
     */
    changeValueMediaStatus(codeStr) {
        var resultObj = JSON.parse(codeStr);
        var statusCode = resultObj.code;
        console.log(statusCode, this.getStatusName(statusCode));
        this.status = parseInt(statusCode);//刷新录音机状态
        cc.origin.EventManager.emit(cc.origin.EventDefine.RECORD.SERVER_RESPONSE_RECORD, parseInt(statusCode));
    },

    /**
     * 检测权限（向后端发消息）
     */
    checkPermissionSupported() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            window.webkit.messageHandlers.getPermissionSupported.postMessage(null);
        } else {
            window.android.getPermissionSupported();
        }
    },

    /**
     * 检测是否支持麦克风录音
     * @param {Function} successCb 允许录音后回调
     * @param {Function} failCb 不允许录音回调
     */
    checkRecordPermission(successCb, failCb) {
        var isWebkit = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.getPermissionSupported;
        if (isWebkit || window.android) {
            cc.origin.EventManager.once(cc.origin.EventDefine.RECORD.SERVER_RESPONSE_PERMISSION, (data) => {
                if (data) {
                    console.log('可以录音');
                    if (successCb) successCb();
                } else {
                    console.log('用户不允许录音');
                    if (failCb) failCb();
                }
            })
            this.checkPermissionSupported();
        } else {
            console.log('设备不允许录音');
            if (failCb) failCb();
        }
    },

    /**
     * 录音权限回调
     * @param {*} jsonStr 
     */
    supportedPermissionsListeners(jsonStr) {
        var resultObj = JSON.parse(jsonStr);
        //{"1":"true","2":"false"}  1:录音权限  2:播放权限
        var isAllowed = (resultObj && resultObj[1] === 'true');
        cc.origin.EventManager.emit(cc.origin.EventDefine.RECORD.SERVER_RESPONSE_PERMISSION, isAllowed);
    },

    /**
     * 获取状态名
     * @param {*} codeStr 
     */
    getStatusName(codeStr) {
        if (codeStr && codeStr.length > 0) {
            var codeInt = parseInt(codeStr);
            switch (codeInt) {
                case 0: return "无状态";
                case 1: return "正在播放";
                case 2: return "停止播放";
                case 3: return "正在录制";
                case 4: return "停止录制";
                default: return "不支持的状态";
            }
        }

    },

    /**
     * 开始录制
     */
    startRecord() {
        this.sendMediaContrl(kControlCode.START_RECORD);
    },

    /**
     * 停止录制
     */
    stopRecord() {
        this.sendMediaContrl(kControlCode.STOP_RECORD);
    },

    /**
     * 播放录制
     */
    playRecord() {
        this.sendMediaContrl(kControlCode.PLAY_RECORD);
    },

    /**
     * 停止播放
     */
    stopPlay() {
        this.sendMediaContrl(kControlCode.STOP_PLAY);
    },
}
window.testRecorder = Recorder;

export default Recorder;