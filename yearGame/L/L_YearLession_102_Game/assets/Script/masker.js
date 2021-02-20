cc.Class({
    extends: cc.Component,

    properties: {
        cr: {
            default: 10,
            tooltip: '涂抹圆的半径'
        },
        mask: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.count = 0;
        this.btns = this.node.getChildByName('btns');
        this.btns.zIndex = 999;
        this._maskPool = [];
        this._graphicsPool = [];
        this.init();

        let arr = this.btns.children;
        this.selectBtn = 'drawBtn';
        this.setTouch('drawBtn', true);
        arr.forEach((btn) => {
            cc.YL.tools.registerTouch(
                btn,
                (e) => {
                    // e.target.setScale(1.2);
                    arr.forEach((kid) => {
                        this.setTouch(kid.name, false);
                    })
                    this.setTouch(e.target.name, true);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    switch (e.target.name) {
                        case 'clearBtn': {
                            //清理所有绘制 然后默认选择绘制按钮
                            this._graphicsPool.forEach((pG) => {
                                pG.clear();
                            });
                            this.setTouch(e.target.name, false);
                            this.selectBtn = 'drawBtn';
                            this.init();
                        }; break;
                        case 'drawBtn': {
                            this.selectBtn == 'eraserBtn' && this.init();
                            this.selectBtn = 'drawBtn';
                        }; break;
                        case 'eraserBtn': {
                            this.selectBtn = 'eraserBtn';
                        }; break;
                    }
                    this.setTouch(this.selectBtn, true);
                },
            );
        });



        let self = this;
        let touchPoint = null;
        cc.YL.tools.registerTouch(
            this.node,
            (event) => {

                let point = event.touch.getLocation();
                if (this.selectBtn == 'drawBtn') {
                    point = self.graphics.node.parent.convertToNodeSpaceAR(point);
                    touchPoint = point;
                    this.graphics.moveTo(point.x, point.y)
                    //self.drawTo(point);
                    //self.graphics.fill();
                }


                if (this.selectBtn == 'eraserBtn') {
                    point = self.mask.convertToNodeSpaceAR(point);
                    self._addCircle(point);
                }

            },
            (event) => {
                let point = event.touch.getLocation();
                if (this.selectBtn == 'drawBtn') {
                    point = self.graphics.node.parent.convertToNodeSpaceAR(point);
                    self.drawTo(point);
                }


                if (this.selectBtn == 'eraserBtn') {
                    point = self.mask.convertToNodeSpaceAR(point);
                    self._addCircle(point);
                }
            },
            null);

    },

    clear(){
        this._maskPool.forEach((mask) => {
            mask.node.destroy();
        });
        this._graphicsPool.forEach((gr) => {
            gr.node.destroy();
        });

        this._maskPool = [];
        this._graphicsPool = [];

        this.btns.children.forEach((kid) => {
            this.setTouch(kid.name, false);
        })
        this.selectBtn = 'drawBtn';
        this.setTouch(this.selectBtn, true);
        this.init();
    },

    init() {
        let new_mask = cc.instantiate(this.mask);
        new_mask.setParent(this.node);
        new_mask.zIndex = this.count++;
        new_mask.active = true;
        this._maskPool.push(new_mask.getComponent(cc.Mask));
        this.graphics = new_mask.getChildByName('graphics').getComponent(cc.Graphics);
        this._graphicsPool.push(this.graphics);
    },

    drawTo(point) {
        // 从起始位置一直画到目标位置
        this.graphics.lineTo(point.x, point.y);
        this.graphics.stroke();
        this.graphics.moveTo(point.x, point.y)
    },

    setTouch(target, isShow) {
        let touchImg = this.btns.getChildByName(target).getChildByName('touchImg');
        if (touchImg) {
            touchImg.active = isShow;
        }
    },

    _addCircle(pos) {
        this._maskPool.forEach((mask) => {
            mask._graphics.lineWidth = 1;
            mask._graphics.strokeColor = cc.color(255, 0, 0);
            mask._graphics.fillColor = cc.color(0, 255, 0);
            mask._graphics.circle(pos.x, pos.y, this.cr);
            mask._graphics.fill();
            mask._graphics.stroke();
        });

    }

    // update (dt) {},
});