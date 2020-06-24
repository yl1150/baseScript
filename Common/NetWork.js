/**
 * 网络
 */
module.exports = {
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
                        GD.userToken = str2;
                        console.log('userToken:', str2)
                        break;
                    case 'practiceId':
                        GD.practiceId = parseInt(str2);
                        console.log('practiceId:', str2)
                        break;
                    case 'integral':
                        GD.integral = parseInt(str2);
                        console.log('integral:', str2)
                        break;
                    case 'systemFlag':
                        GD.systemFlag = str2;
                        console.log('systemFlag:', str2)
                        break;

                    default:
                        break;
                }
            }
        }
    },

    http_post(params, url, header, cb, failCount = 0) {
        var self = this;
        var xhr = cc.loader.getXMLHttpRequest();
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

    finish() {
        this.sendScore(1);
        setTimeout(() => {
            console.log(1)
            if (GD.systemFlag == 1) {
                try {
                    window.android.closeGame();
                } catch (e) {
                    console.log("出现错误, 如果在非android环境下访问, 出现该警告是正常的.");
                    console.log(e);
                }
            } else if (GD.systemFlag == 0) {
                window.webkit.messageHandlers.closeGame.postMessage(null);
                /* //微信专用结束
                wx.miniProgram.redirectTo({
                    url: `/pages/finish/finish`,
                }) */
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
            gameId: GD.gameId
        };
        data = JSON.stringify(data)
        var url = 'https://www.hxsup.com/api/game/addGameLog'
        var header = {
            "Authorization": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },

    /**
     * 发送游戏时长和积分数（微信专用）
     * @param {Integer} time 游戏时长，单位：秒
     * @param {Integer} starNum 积分数
     */
    sendTimeAndStar(time, starNum) {
        var data = {
            practiceId: GD.practiceId,
            times: time,
            integral: starNum
        }
        data = JSON.stringify(data);
        //var url = 'http://dev.hxsup.com:8116/api/annual/mini/studyLog/add'
        var url = 'https://dev.hxsup.com/api/annual/mini/studyLog/add'
        var header = {
            "AnnualMiniToken": GD.userToken,
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
        var url = GD.isTest? 'http://dev.hxsup.com:8115/api/annual/userRecord/addIntegral':'http://www.hxsup.com:8115/api/annual/userRecord/addIntegral'
        var header = {
            "Authorization": GD.userToken,
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
            practiceId: GD.practiceId,
            times: time
        }
        data = JSON.stringify(data);
        var url = GD.isTest? 'http://dev.hxsup.com:8115/api/annual/studyLog/add':'http://dev.hxsup.com:8115/api/annual/studyLog/add'

        var header = {
            "Authorization": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },
};