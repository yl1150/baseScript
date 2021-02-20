/**
 * 网络
 */
var Network = {
    userToken: null,
    systemFlag: 0,
    practiceId: 1,
    integral: 0,//积分

    getUserToken() {
        var url = location.href;
        var params = url.split("?");
        if (params[1]) {
            var arr = params[1].split("&");
            for (var i = 0; i < arr.length; i++) {
                var str1 = arr[i].split("=")[0];
                var str2 = arr[i].split("=")[1];
                if (!str2) continue;
                switch (str1) {
                    case 'userToken':
                        this.userToken = str2;
                        break;
                    case 'practiceId':
                        this.practiceId = parseInt(str2);
                        break;
                    case 'integral':
                        this.integral = parseInt(str2);
                        break;
                    case 'systemFlag':
                        this.systemFlag = str2;
                        break;

                    default:
                        break;
                }
            }
        }
    },

    http_post(params, url, header, cb, failCount = 0) {
        if (!this.userToken) return;
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        for (let i in header) {
            xhr.setRequestHeader(i, header[i]);
        }
        xhr.send(params);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    if (cb) cb;
                } else {
                    console.log("ErrorStatus:", xhr.status);
                    //失败重传，最多三次
                    if (++failCount < 3) self.http_post(params, url, header, cb, failCount);
                }
            }
        };
    },

    http_get(params, url, header, cb, failCount = 0) {
        if (!this.userToken) return;
        var self = this;
        var xhr = new XMLHttpRequest();
        var newUrl = url;
        if (params) {
            newUrl += '?';
            var count = 0;
            for (let i in params) {
                if (++count > 1) newUrl += '&';
                newUrl += (i + '=' + params[i]);
            }
        }
        xhr.open("GET", newUrl);
        for (let i in header) {
            xhr.setRequestHeader(i, header[i]);
        }
        xhr.send();
        xhr.onreadystatechange = function (data) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    if (cb) cb(JSON.parse(xhr.response));
                } else {
                    console.log("ErrorStatus:", xhr.status);
                    //失败重传，最多三次
                    if (++failCount < 3) self.http_get(params, url, header, cb, failCount);
                }
            }
        };
    },

    finish() {
        // this.sendScore(1);
        setTimeout(() => {
            if (this.systemFlag == 1) {
                try {
                    window.android.closeGame();
                } catch (error) {
                    console.log(error);
                }
            } else if (this.systemFlag == 0) {
                if (cc.gameConfig.isWechatMini) {
                    //微信专用结束
                    wx.miniProgram.redirectTo({ url: `/pages/finish/finish` })
                    return;
                }
                try {
                    window.webkit.messageHandlers.closeGame.postMessage(null);
                } catch (error) {
                    console.log(error);
                }
            }
        }, 4000);
    },

    /**
     * 发送分数
     * @param {Integer} score 最后分数
     */
    sendScore(score) {
        var data = {
            result: score,
            gameId: cc.gameConfig.gameId
        };
        data = JSON.stringify(data)
        var url
        if (cc.gameConfig.isDev) {
            url = cc.gameConfig.devUrl + '/api/game/addGameLog'
        } else {
            url = cc.gameConfig.officialUrl + '/api/game/addGameLog'
        }
        var header = {
            "Authorization": this.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },

    /**
     * 发送积分数/星星数
     * @param {Integer} starNum 积分数
     */
    sendStarNum(starNum) {
        var data = {
            quantity: starNum
        }
        data = JSON.stringify(data);
        var url
        if (cc.gameConfig.isDev) {
            url = cc.gameConfig.devUrl + ':8115/api/annual/userRecord/addIntegral'
        } else {
            url = cc.gameConfig.officialUrl + '/api/annual/userRecord/addIntegral'
        }
        var header = {
            "Authorization": this.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },

    /**
     * 发送游戏时长
     * @param {Integer} t 游戏时长，单位：秒
     */
    sendTime(time) {
        var data = {
            practiceId: this.practiceId,
            times: Math.floor(time)
        }
        data = JSON.stringify(data);
        var url
        if (cc.gameConfig.isDev) {
            url = cc.gameConfig.devUrl + ':8115/api/annual/studyLog/add'
        } else {
            url = cc.gameConfig.officialUrl + '/api/annual/studyLog/add'
        }
        var header = {
            "Authorization": this.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },

    //-------------------------------------------------------------------------------------------------------------

    /**
     * 发送游戏时长和积分数（微信专用）
     * @param {Integer} roundId 轮数
     * @param {Integer} time 游戏时长，单位：秒
     * @param {Integer} starNum 积分数
     */
    sendTimeAndStar(roundId, time, starNum) {
        var data = {
            practiceId: this.practiceId,
            seq: roundId,
            times: Math.floor(time),
            integral: starNum
        }
        data = JSON.stringify(data);
        var url
        if (cc.gameConfig.isDev) {
            url = cc.gameConfig.devUrl + '/api/annual/mini/studyLog/add'
        } else {
            url = cc.gameConfig.officialUrl + '/api/annual/mini/studyLog/add'
        }
        var header = {
            "AnnualMiniToken": this.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },

    /*
    获取学习进度接口（微信专用）
    */
    getLearningProcess(cb) {
        var data = {
            practiceId: this.practiceId,
        }
        var url
        if (cc.gameConfig.isDev) {
            url = cc.gameConfig.devUrl + '/api/annual/mini/lesson/practice/process'
        } else {
            url = cc.gameConfig.officialUrl + '/api/annual/mini/lesson/practice/process'
        }
        var header = {
            "AnnualMiniToken": this.userToken,
            "Content-Type": "application/json",
        }
        this.http_get(data, url, header, cb);
    },
};

export default Network;