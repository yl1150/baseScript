module.exports = {
    showGameTips(gameTipsData,cb) {
        let showTeach = (arr) => {
            if (arr.length < 1) {
                cb && cb();
                return;
            }
            let data = arr.shift();
            cc.YL.timeOut(() => {
                switch (data.aType) {
                    case 'scale':
                        this.showScaleAction(data);
                        break;
                    case 'changeFrame':
                        this.showChangeFrameAction(data);
                        break;
                    case 'spine':
                        this.showSpineAction(data);
                        break;
                    case 'show':
                        this.showShowAction(data);
                        break;
                    case 'hide':
                        this.showHideAction(data);
                        break;
                    case 'fall':
                        this.showFallAction(data);
                        break;
                    default:
                        break;
                }
                cc.YL.timeOut(() => { showTeach(arr) }, data.aTime * 1000)
            }, data.delayT * 1000)
        }
        showTeach(gameTipsData);
    },

    showScaleAction(data) {
        data.nArr.forEach(tNode => {
            cc.tween(tNode)
                .then(cc.YL.aMgr.zoomAction(2))
                .start()
        });
    },

    showChangeFrameAction(data) {
        data.nArr.forEach(tNode => {
            let frame = tNode.getChildByName('frame');
            frame.active = true;
            cc.tween(frame)
                .delay(1)
                .to(0.1, { opacity: 0 })
                .start()
        });
    },

    showSpineAction(data) {
        data.nArr.forEach(tNode => {
            let ske = tNode.getComponent(sp.Skeleton);
            ske.setAnimation(0, data.spineAni, false);
        });
    },

    showHideAction(data) {
        data.nArr.forEach(tNode => {
            tNode.active = false;
        });
    },

    showShowAction(data) {
        data.nArr.forEach(tNode => {
            tNode.active = true;
        });
    },

    showFallAction(data) {
        data.nArr.forEach(tNode => {
            cc.tween(tNode)
                .by(0.5, { y: -150 })
                .start()
        });

    },
}
