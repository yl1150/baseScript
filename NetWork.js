/**
 * 网络
 */
module.exports = {

    getUserToken() {
        let url = location.href;
        let params = url.split("&");
        if (params[1]) {
            let auth = params[0].split("=")[1];
            let getSystemFlag = params[1].split("=")[1];
            if (auth) {
                GD.systemFlag = getSystemFlag;
                GD.userToken = auth;
            }
        }
    },

    send(score) {
        var data = {
            result: score,
            gameId: GD.gameId
        };
        data = JSON.stringify(data)
        GD.postURL && this.httpHelper_post(GD.postURL, data);
    },

    httpHelper_post(url, params) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", GD.userToken);
        xhr.send(params);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                // err = false;  
            } else {
                // err = true;  
            }
            // var response = xhr.responseText;  
            // callback(err,response);  
        };
    },

    back() {
        history.go(-1)
    },

    setGameEndMessage() {
        this.send(1);
        setTimeout(() => {
            console.log(1)
            if (GD.systemFlag == 1) {
                try {
                    window.android.closeGame();
                } catch (e) {
                    console.log(
                        "出现错误, 如果在非android环境下访问, 出现该警告是正常的."
                    );
                    console.log(e);
                }
            } else if (GD.systemFlag == 0) {
                window.webkit.messageHandlers.closeGame.postMessage(null);
            }
        }, 4000);
    },

    /**
    * 发送指令码至服务器
    * @param {*} data 
    */
    sendData(data) {

    },

    /**
     * 获取对应gameID的数据 包括星星的数据
     */
    getGameData(gameID, callFunc) {
        let gameData = [];
        gameData['starNum'] = 0;
        gameData['videoGame'] = {
            //视频游戏
            lockState: 1//是否解锁 1:已经解锁 0:未解锁
        };

        gameData['questionBank'] = {
            //题库
            lockState: 0
        };

        gameData['videoTips'] = {
            //小贴士
            lockState: 0
        };
        gameData['punchCard'] = {
            //打卡
            lockState: 0
        };
        gameData['learningReport'] = {
            //学习报告
            lockState: 0
        };
        setTimeout(() => {
            callFunc && callFunc(gameData);
        }, 1000);
    },

    /**
     * 保存关卡内的数据 不包括星星的数据
     * 应当在关卡结束时调用 当等待时间结束时 服务器未反馈或者反馈发送失败 应调用对应提示
     */
    saveGameData(data) {

        //
    },

    addStarNum(num) {
        GD.gameData['starNum'] += num;
        //发送消息给服务器 {加星星} 服务器未反馈或者反馈发送失败时则消除所获得的的星星
    },
};