cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 8,
    },

    start() {
        GD.sound.setTipsButton(true);
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(true);
        GD.root.setSeqIcon(true, this.maxLv);
        this.gameNode = this.node.getChildByName('game');
        this.folderName = 'qBank';
        this.registerEvent();
    },

    /**显示错题按钮 */
    initWrongQuestion() {
        //错题按钮
        this.wrongBtn = this.node.getChildByName('wrongBtn');
        this.wrongBtn.active = false;
        this.curMistakeId_arr = []
        this.lastMistakeId_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.curMistakeCount_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.mistakeRoundId = 0;
        //解析后端获取上次错题数据
        if (GD.lastMistakeId_arr.length > 0) {
            //显示错题按钮
            this.wrongBtn.active = true;
            var widget_wrong = this.wrongBtn.getComponent(cc.Widget);
            if (widget_wrong) {
                widget_wrong.target = cc.find('Canvas');
                widget_wrong.updateAlignment();
            }
            //错题轮数
            //本次错题数据
            //上次错题数据
            this.lastMistakeId_arr = GD.lastMistakeId_arr;

            //给错题按钮注册触摸
            let touch = this.wrongBtn.getChildByName('touch');
            cc.YL.tools.registerTouch(
                this.wrongBtn,
                (e) => {
                    touch.active = true;
                },
                null,
                (e) => {
                    touch.active = false;
                    this.wrongBtn.active = false;

                    //清除当前题
                    this.clearLayer();

                    this.mistakeRoundId = 1;
                    GD.isLastMistake = true;

                    //进入上一次错题
                    this.startGame();
                }
            );
        }
    },

    registerEvent() {
        cc.YL.emitter.on('startGame', (e, data) => {
            GD.sound.playBGM();
            this.initWrongQuestion();
            this.startLv = GD.iRoundID;
            this.startGame();
        })

        //添加错误关卡统计
        cc.YL.emitter.on('addWrongMes', (eCount) => {
            console.log('addWrongMes:', this.startLv);
            this.curMistakeCount_arr[this.startLv - 1] += eCount;
            eCount > 0 && this.curMistakeId_arr.indexOf(this.startLv) == -1 && this.curMistakeId_arr.push(this.startLv);
        })

        //进入当前错题
        cc.YL.emitter.on('enterCurWrong', () => {
            if (this.curMistakeId_arr.length <= 0) {
                cc.YL.lockTouch();
                cc.YL.emitter.emit('gameEnd');
            } else {
                this.mistakeRoundId = 1;
                GD.isCurMistake = true;
                this.startGame();
            }
        })

        cc.YL.emitter.on('PASSLV', (data) => {
            this.passLV();
        })
    },

    //清理节点
    clearLayer() {
        cc.YL.tools.clearNode(this.gameNode);
    },

    startGame() {
        this.clearLayer();
        GD.sound.playBGM();
        GD.sound.setTipsButton(true);
        GD.root.setStarBoard(false);
        var realRoundId = this.startLv;
        if (GD.isCurMistake) {
            console.log('CurMistake!!!!')
            realRoundId = this.curMistakeId_arr[this.mistakeRoundId - 1];
        } else if (GD.isLastMistake) {
            console.log('LastMistake!!!!')
            realRoundId = this.lastMistakeId_arr[this.mistakeRoundId - 1];
        }

        //this.startLv = realRoundId;
        cc.YL.emitter.emit('refreshSeqID', realRoundId);
        console.log('realRoundId:  ', realRoundId)
        let loadPrefab = () => {
            cc.loader.loadRes('prefab/' + this.folderName + '/round' + realRoundId, cc.Prefab, (err, _prefab) => {
                if (err) {
                    console.log(err);
                    loadPrefab();
                    return;
                }
                var round = cc.instantiate(_prefab);
                round.parent = this.gameNode;
                round.active = true;
                for (let i in round._components) {
                    round._components[i].init && round._components[i].init();
                }
            });
        }
        loadPrefab();
    },

    passLV() {
        if (GD.isCurMistake) {
            this.mistakeRoundId += 1;
            if (this.mistakeRoundId > this.curMistakeId_arr.length) {
                //游戏结束
                GD.isCurMistake = false;
                GD.sound.pauseBgm();
                cc.YL.emitter.emit('gameEnd');
            } else {
                this.startGame();
            }
        } else if (GD.isLastMistake) {
            this.mistakeRoundId += 1;
            if (this.mistakeRoundId > this.lastMistakeId_arr.length) {
                //恢复当前进度
                GD.isLastMistake = false;
                if (this.startLv >= this.maxLv) {
                    GD.sound.pauseBgm();
                    this.showSettle();
                } else {
                    //this.startLv++;
                    this.clearLayer();
                    this.startGame();
                }
            } else {
                //继续以前错题的下一轮
                this.startGame();
            }
        } else {
            if (this.startLv >= this.maxLv) {
                GD.sound.pauseBgm();
                this.showSettle();
            } else {
                this.startLv++;
                this.startGame();
            }
        }
    },

    //展示结算环节
    showSettle() {
        GD.sound.setTipsButton(false);
        cc.loader.loadRes('prefab/' + 'settle', cc.Prefab, (err, _prefab) => {
            if (err) {
                console.log(err);
                cc.YL.emitter.emit('gameEnd');
                return;
            }
            var round = cc.instantiate(_prefab);
            round.parent = this.gameNode;
            round.active = true;
            for (let i in round._components) {
                round._components[i].init && round._components[i].init(this.curMistakeId_arr, this.curMistakeCount_arr);
            }
        });
    },

    onDestroy() {
        cc.YL.emitter.off('PASSLV');
        cc.YL.emitter.off('addWrongMes');
        cc.YL.emitter.off('startGame');
    },

    // update (dt) {},
});
