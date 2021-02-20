const kTitle = 'S2 阶段复习4';
const kData = {
    1: { id_arr: [1, 2, 7], type: '重叠与共用' },
    2: { id_arr: [3, 4, 8], type: '立体图形及展开图' },
    3: { id_arr: [5, 6, 9], type: '七巧板' },
}
cc.Class({
    extends: cc.Component,

    properties: {
        num_yes: cc.Node,
        num_no: cc.Node
    },

    onLoad() {
        //初始化

        this.bg = this.node.getChildByName('bg');
        var widget_bg = this.bg.getComponent(cc.Widget);
        if (widget_bg) {
            widget_bg.target = cc.find('Canvas');
            widget_bg.updateAlignment();
        }

        this.title = this.node.getChildByName('title');
        var widget_title = this.title.getComponent(cc.Widget);
        if (widget_title) {
            widget_title.target = cc.find('Canvas');
            widget_title.updateAlignment();
        }

        this.results = this.node.getChildByName('results');

        this.graph = this.node.getChildByName('graph');

        this.qts = this.node.getChildByName('qts');
        this.qt_arr = this.qts.children.map(x => { return x });

        this.btns = this.node.getChildByName('btns');
        var widget_btns = this.btns.getComponent(cc.Widget);
        if (widget_btns) {
            widget_btns.target = cc.find('Canvas');
            widget_btns.updateAlignment();
        }
    },

    start() {
        //this.init([1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 0, 3, 0, 0, 0, 0, 0, 9])
    },

    init(mistakeIdArray, curMistakeCount_arr) {
        //显示结算
        //隐藏喇叭
        //初始化
        this.initData(mistakeIdArray, curMistakeCount_arr);
        //this.initTitle();
        this.initResult();
        this.initGraph();
        this.initQt();
        this.initBtn();
    },

    initData(mistakeIdArray, curMistakeCount_arr) {
        //题库错误数据
        this.mistakeCount_arr = curMistakeCount_arr;
        let arr = [];
        for(let i in mistakeIdArray){
            if(mistakeIdArray[i] != 0){
                arr.push(mistakeIdArray[i])
            }
        }
    
        //发送题库错题数据
        var knowledgeDist = [];
        var starNum_arr = this.mistakeCount_arr.map(x => { return GD.root.getStarNum(x) });
        for (let i in kData) {
            let data = kData[i];
            let type = data.type;
            let score = 0;
            let id_arr = data.id_arr;
            id_arr.forEach(id => {
                let starNum = starNum_arr[id - 1];
                score += starNum;
            })
            let knowledge = { name: type, score: score };
            knowledgeDist.push(knowledge);
        }
        cc.YL.net.sendQuestionMistakeData(arr, knowledgeDist);
    },

    initTitle() {
        /* var label_title = this.title.getComponent(cc.Label);
        label_title.string = kTitle; */
    },

    initResult() {
        var totalTime = 1;
        var deltaY = 50;

        var allCount = this.mistakeCount_arr.length;
        var correctCount = this.mistakeCount_arr.filter(x => { return x === 0 }).length;
        var wrongCount = allCount - correctCount;
        if (wrongCount === 0) return;

        var yes_result = this.results.getChildByName('yes');
        var num_yes = this.num_yes;

        var no_result = this.results.getChildByName('no');
        var num_no = this.num_no;

        var num_arr = [num_yes, num_no];
        var value_arr = [allCount, 0];
        var dir_arr = [1, -1];
        var interval = totalTime / wrongCount;
        for (let i in num_arr) {
            let num = num_arr[i];
            let label_num = num.getComponent(cc.Label);
            let value = value_arr[i];
            let dir = dir_arr[i];
            this.schedule(function () {
                label_num.string = value;
                value = value - dir;
                num.stopAllActions();
                num.y = 0;
                let tempNum = cc.instantiate(num);
                tempNum.setParent(num.parent);
                tempNum.getComponent(cc.Label).string = value;
                tempNum.y -= dir * deltaY;
                cc.tween(num)
                    .by(interval, { y: dir * deltaY })
                    .call(() => {
                        num.y = 0;
                        label_num.string = value;
                    })
                    .start();
                cc.tween(tempNum)
                    .by(interval, { y: dir * deltaY })
                    .call(() => {
                        tempNum.destroy();
                    })
                    .start();
            }, interval, wrongCount - 1);
        }
    },

    initGraph() {
        var totalTime = 1;
        //线，指出知识点
        var lines = this.graph.getChildByName('lines');
        for (let i = 1, len = lines.childrenCount; i <= len; i++) {
            let line = lines.getChildByName('' + i)
            let word = line.getChildByName('word');
            word.getComponent(cc.Label).string = kData[i].type;
        }
        //圆环百分比
        var rollTime = totalTime;
        var circles = this.graph.getChildByName('circles');
        for (let i = 1, len = circles.childrenCount; i <= len; i++) {
            let circle = circles.getChildByName('' + i)
            let grey = circle.getChildByName('grey');
            grey.angle = 0;
            let id_arr = kData[i].id_arr;
            let correctCount = 0;
            for (let j in id_arr) {
                let id = id_arr[j];
                let mistakeCount = this.mistakeCount_arr[id - 1];
                if (mistakeCount === 0) correctCount++;
            }
            let angle1 = -120 * (correctCount / id_arr.length);
            cc.tween(grey).to(rollTime, { angle: angle1 }).start();
        }
    },

    initQt() {
        for (let i in this.qt_arr) {
            let qt = this.qt_arr[i];
            let mistakeCount = this.mistakeCount_arr[i];
            let isCorrect = (mistakeCount === 0);
            qt.getChildByName('chosen_yes').active = isCorrect;
            qt.getChildByName('chosen_no').active = !isCorrect;
        }
    },

    initBtn() {
        cc.YL.unLockTouch();
        let nextBtn = this.btns.getChildByName('next');
        let wrongBtn = this.btns.getChildByName('wrong');
        this.btns.children.forEach((btn) => {
            btn.touchImg = btn.getChildByName('chosen');
            cc.YL.tools.registerTouch(
                btn,
                (e) => {
                    btn.touchImg.active = true;
                },
                null,
                (e) => {
                    btn.touchImg.active = false;
                    if (e.target.name == 'next') {
                        cc.YL.emitter.emit('gameEnd');
                        cc.YL.lockTouch();
                    } else if (e.target.name == 'wrong') {
                        //进入错题集
                        cc.YL.emitter.emit('enterCurWrong');
                        this.node.active = false;
                        this.node.destroy();
                    }

                }
            );
        })

        if (this.mistakeCount_arr.filter(x => { return x }).length <= 0) {
            //错题不可点
            wrongBtn.active = false;
        }
    },
});