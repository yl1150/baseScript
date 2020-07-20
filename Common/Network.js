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
        //测试token
        //GD.userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXV0aDAiLCJleHAiOjE1OTU3NzU5NjAsInVzZXJpZCI6Mzl9.7Y7V92fsqmCnOqkC_vfIElrggwuRVD9a5waHpKlyIRA'
        //根据链接自动选择栏目包
        /*    var index1 = url.indexOf('/build/web-mobile');
           if (index1 >= 0) {
               var str1 = url.substring(0, index1);
               var index2 = str1.lastIndexOf('/');
               var str2 = str1.substr(index2 + 1);
               var columnId = parseInt(str2);
               if (columnId > 0) {
                   this.gameIndex = columnId;
               } else {
                   this.gameIndex = 0;
               }
               console.log(index1,'=======')
               console.log(str1,'=============')
               console.log(index2,'==========')
               console.log(str2,'===========')
   
           } else {
               //根据游戏配置选择栏目包
               if (cc.gameConfig.columnId >= 0) this.gameIndex = parseInt(cc.gameConfig.columnId);
           }  */
        console.log('此为', cc.gameConfig.isOfficial ? '正式' : '测试');
    },

    /*
    微信端专用
    获取学习进度接口
    */
   getLearningProcess(cb) {
        var data = {
            practiceId: GD.practiceId,
        }
        var url = 'http://dev.hxsup.com:8116/api/annual/mini/lesson/practice/process'
        if (cc.gameConfig.isOfficial) {
            url = 'https://www.hxsup.com/api/annual/mini/lesson/practice/process'
        }
        var header = {
            "AnnualMiniToken": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_get(data, url, header,cb);
    },

    http_get(params, url, header, cb, failCount = 0) {
        var self = this;
        var xhr = cc.loader.getXMLHttpRequest();
        url+=('?practiceId='+params.practiceId)
        xhr.open("GET", url);
        for (let i in header) {
            if (!header[i]) {
                return;
            }
            xhr.setRequestHeader(i, header[i]);
        }
        console.log('params:===',params);
        console.log('url:====',url);
        console.log('header:====',header);
        xhr.send();
        xhr.onreadystatechange = function (data) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    console.log(xhr)
                    if (cb) cb(JSON.parse(xhr.response));
                } else {
                    console.log("ErrorStatus:", xhr.status);
                    //失败重传，最多三次
                    if (++failCount < 3) self.http_get(params, url, header, cb, failCount);
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
                    console.log('success')
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
     * @param {Integer} score 最后分数  废弃
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
        console.log('sendTimeAndStar: ',data);
        data = JSON.stringify(data);
        var url = 'http://dev.hxsup.com:8116/api/annual/mini/studyLog/add'
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
        var url = 'http://dev.hxsup.com:8115/api/annual/userRecord/addIntegral'
        if (cc.gameConfig.isOfficial) {
            url = 'https://www.hxsup.com/api/annual/userRecord/addIntegral'
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
    sendTime(time) {
        var data = {
            practiceId: GD.practiceId,
            times: time
        }
        data = JSON.stringify(data);
        var url = 'http://dev.hxsup.com:8115/api/annual/studyLog/add'
        if (cc.gameConfig.isOfficial) {
            url = 'https://www.hxsup.com/api/annual/studyLog/add'
        }
        var header = {
            "Authorization": GD.userToken,
            "Content-Type": "application/json",
        }
        this.http_post(data, url, header);
    },
};