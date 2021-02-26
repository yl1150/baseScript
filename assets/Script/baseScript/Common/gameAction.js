module.exports = {
    showGameAction(actionData, cb) {
        let showAction = (arr) => {
            if (arr.length < 1) {
                cb && cb();
                return;
            }
            let data = arr.shift();
            cc.YL.timeOut(() => {
                this.takeAction();
                cc.YL.timeOut(() => { showAction(arr) }, data.aTime * 1000)
            }, data.delayT * 1000)
        }
        showAction(actionData);
    },

    takeAction(data) {
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
            case 'run':
                this.showRunAction(data);
                break;
            default:
                break;
        }
    },
    /*
     properties: {
        message: '',
        spineAni: '',
        actionType: '',
        sound:'',
        delayT: 0.0,
        aTime: 1,
        targetPoint: cc.Node,
        skeArr: [sp.Skeleton]
    }
    */

    showRunAction(data) {
        data.nArr.forEach(tNode => {
            let ske = tNode.getComponent(sp.Skeleton);
            cc.tween(tNode)
                .then(cc.YL.aMgr.zoomAction(2))
                .start()
        });
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
