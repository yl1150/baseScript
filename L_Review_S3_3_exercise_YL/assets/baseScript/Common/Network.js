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
                    case 'bgMusicVolume':
                        GD.bgMusicVolume = parseInt(str2) / 100;
                        console.log('bgMusicVolume:', str2)
                        break;
                    default:
                        break;
                }
            }
        }
        //测试token
        if (!GD.userToken) {
            GD.userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXV0aDAiLCJ1c2VyaWQiOjUwfQ.JIagAjWHOEwuAG_7RmSUqj5jx4ehn1mJOzQ6tkfKqSU'
        }
    },

    getLearningProcess(cb, failCb) {
        cc.gameConfig.isWX ? this.getLearningProcess_WX(cb, failCb) : this.getLearningProcess_App(cb, failCb);
    },

    /**
       获取题库错题数据
        */
    getQuestionMistakeData(cb) {
        this.addTimeCount(cb);
        var data = {
            practiceId: GD.practiceId,
        }
        let urlHead = cc.gameConfig.isOfficial ? 'https://www.hxsup.com' : 'https://dev.hxsup.com'
        var url = urlHead + '/api/annual/phase/getTestResult'
        var header = {
            "Authorization": GD.userToken,
        }
        this.http_get(data, url, header, cb);
    },

    /**
    发送题库错题数据
     */
    sendQuestionMistakeData(mistakeIdArray, knowledgeDist) {
        var data = {
            practiceId: GD.practiceId,
            mistakes: mistakeIdArray.join(','),
            knowledgeDist: JSON.stringify(knowledgeDist),
        }
        data = JSON.stringify(data);
        let urlHead = cc.gameConfig.isOfficial ? 'https://www.hxsup.com' : 'https://dev.hxsup.com'
        var url = urlHead + '/api/annual/phase/addTestResult'
        var header = {
            "Authorization": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },

    /*
    获取学习进度接口
    */
    getLearningProcess_WX(cb, failCb) {
        this.addTimeCount(cb);
        var data = {
            practiceId: GD.practiceId,
        }
        let urlHead = cc.gameConfig.isOfficial ? 'https://www.hxsup.com' : 'https://dev.hxsup.com'

        var url = '/api/annual/mini/lesson/practice/process'
        var header = {
            "AnnualMiniToken": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_get(data, urlHead + url, header, cb, failCb);
    },

    getLearningProcess_App(cb, failCb) {
        this.addTimeCount(cb);
        var data = {
            practiceId: GD.practiceId,
        }
        let urlHead = cc.gameConfig.isOfficial ? 'http://www.hxsup.com' : 'http://dev.hxsup.com'

        var header = {
            "Authorization": GD.userToken,
            "Content-Type": "application/json",
        }
        var url = '/api/annual/lesson/practice/process'
        this.http_get(data, urlHead + url, header, cb, failCb);
    },

    //从服务端获取所需要的用户数据
    getPlayerMessage(cb) {
        this.addTimeCount(cb);
        //
        var data = {
            practiceId: GD.practiceId,
        }
        var url = 'http://dev.hxsup.com/api/annual/phase/getGameUserInfo'
        if (cc.gameConfig.isOfficial) {
            url = 'http://www.hxsup.com/api/annual/phase/getGameUserInfo'
        }
        var header = {
            "Authorization": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_get(data, url, header, cb);
    },

    addGameResult(gameResult, mistakesNum) {
        var data = {
            practiceId: GD.practiceId,
            gameResult: gameResult,
            mistakesNum: mistakesNum
        }
        data = JSON.stringify(data)

        var url = cc.gameConfig.isOfficial ? 'http://www.hxsup.com/api/annual/phase/addGameResult' : 'http://dev.hxsup.com/api/annual/phase/addGameResult';
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
     * | practiceId | int  | 是       | -      | 模块id，由App传递                                            |
     * | seq        | int  | 是       | -      | 练习的序号。比如：《阿布的菜园》中有8个练习，则序号一次为：1~8 |
     * | times      | int  | 是       | -      | 练习时长，单位：秒。单个练习所使用的时间。                   |
     * | integral   | int  | 是       | 0      | 获得的积分数。单个练习所获得的积分。                         |
     */
    sendTimeAndStar(roundID, time, starNum) {
        var data = {
            practiceId: GD.practiceId,
            seq: roundID,
            times: time,
            integral: starNum
        }
        console.log('sendTimeAndStar: ', data);
        data = JSON.stringify(data);
        var url = 'https://dev.hxsup.com/api/annual/mini/studyLog/add'
        if (cc.gameConfig.isOfficial) {
            url = 'https://www.hxsup.com/api/annual/mini/studyLog/add'
        }
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
        var url = 'http://dev.hxsup.com/api/annual/userRecord/addIntegral'
        if (cc.gameConfig.isOfficial) {
            url = 'http://www.hxsup.com/api/annual/userRecord/addIntegral'
        }
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
    sendSeqAndTime(roundID, time) {
        var data = {
            practiceId: GD.practiceId,
            seq: roundID,
            times: time
        }
        console.log(data);
        data = JSON.stringify(data);
        var url = 'http://dev.hxsup.com/api/annual/studyLog/add'
        if (cc.gameConfig.isOfficial) {
            url = 'http://www.hxsup.com/api/annual/studyLog/add'
        }
        var header = {
            "Authorization": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },

    //发送学习记录 仅发送时间
    sendTime(time) {
        var data = {
            practiceId: GD.practiceId,
            times: time
        }
        console.log(data);
        data = JSON.stringify(data);
        var url = 'http://dev.hxsup.com/api/annual/studyLog/add'
        if (cc.gameConfig.isOfficial) {
            url = 'http://www.hxsup.com/api/annual/studyLog/add'
        }
        var header = {
            "Authorization": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },


    http_get(params, url, header, cb, failCount = 0) {
        var self = this;
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("GET", url + '?practiceId=' + params.practiceId);
        for (let i in header) {
            if (!header[i]) {
                return;
            }
            xhr.setRequestHeader(i, header[i]);
        }
        xhr.send();
        xhr.onreadystatechange = function (data) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    if(self._isGeted){
                        return;
                    }
                    console.log('success', xhr)
                    self._isGeted = true;
                    if (cb) cb(JSON.parse(xhr.response));
                } else {
                    console.log("ErrorStatus:", xhr.status);
                    //失败重传，最多三次
                    if (++failCount < 3) {
                        self.http_post(params, url, header, cb, failCount)
                    } else {
                        cb && cb(xhr.status);
                    };
                }
            }
        };
    },

    http_post(params, url, header, cb, failCount = 0) {
        var self = this;
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST", url);
        for (let i in header) {
            if (!header[i]) {
                return;
            }
            xhr.setRequestHeader(i, header[i]);
        }
        xhr.send(params);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    if(self._isGeted){
                        return;
                    }
                    self._isGeted = true;
                    console.log('success', xhr)
                    if (cb) cb;
                } else {
                    console.log("ErrorStatus:", xhr.status);
                    //失败重传，最多三次
                    if (++failCount < 3) {
                        self.http_post(params, url, header, cb, failCount)
                    } else {
                        cb && cb(xhr.status);
                    };
                }
            }
        };
    },

    //添加超时处理
    addTimeCount(cb, maxTime = 3) {
        this._isGeted = false;
        cc.YL.timeOut(() => {
            if(this._isGeted){
                return;
            }
            this._isGeted = true;
            cb && cb();
        }, maxTime * 1000)
    },

    finish() {
        //this.sendScore(1);
        setTimeout(() => {
            console.log(1, GD.systemFlag)
            if (GD.systemFlag == 1) {
                try {
                    window.android.closeGame();
                } catch (e) {
                    console.log("出现错误, 如果在非android环境下访问, 出现该警告是正常的.");
                    console.log(e);
                }
            } else if (GD.systemFlag == 0) {
                if (cc.gameConfig.isWX) {
                    //微信专用结束
                    wx.miniProgram.redirectTo({
                        url: `/pages/finish/finish`,
                    })
                    console.log('wxFinish')
                } else {
                    window.webkit.messageHandlers.closeGame.postMessage(null);
                }
            }
        }, 4000);
    },
};