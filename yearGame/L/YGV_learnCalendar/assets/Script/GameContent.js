/**
 * 游戏编号
 */
const kGameIndex = cc.Enum({
    All: 0,
    VideoAction: 1
})
cc.Class({
    extends: cc.Component,

    properties: {
        gameIndex: { default: kGameIndex.All, type: kGameIndex },
    },

    onLoad() {
        cc.origin.Note.script_gameContent = this;
        //注册开始事件
        cc.origin.EventManager.once(cc.origin.EventDefine.COMMON.GAME_START, function () {
            this.addGameNode();
        }, this);
    },

    start() { },

    onDestroy() {
        cc.origin.Note.script_gameContent = null;
    },

    checkGameIndex() {
        if (!this.gameIndex) this.gameIndex = cc.gameConfig.columnId;
        // //根据链接自动选择栏目包
        // var url = location.href;
        // var index1 = url.indexOf('/build/web-mobile');
        // if (index1 >= 0) {
        //     var str1 = url.substring(0, index1);
        //     var index2 = str1.lastIndexOf('/');
        //     var str2 = str1.substr(index2 + 1);
        //     var columnId = parseInt(str2);
        //     if (columnId > 0) {
        //         this.gameIndex = columnId;
        //     } else {
        //         this.gameIndex = 0;
        //     }
        // } else {
        //     //根据游戏配置选择栏目包
        //     if (cc.gameConfig.columnId >= 0) this.gameIndex = parseInt(cc.gameConfig.columnId);
        // }
    },

    addGameNode(event) {
        //校准gameIndex
        this.checkGameIndex();
        //创建游戏节点
        var gamePrefab = cc.origin.Note.script_home.levelPrefab[this.gameIndex - 1];
        if (gamePrefab) {
            var gameNode = cc.instantiate(gamePrefab);
            gameNode.setParent(this.node);
        }
    },
});