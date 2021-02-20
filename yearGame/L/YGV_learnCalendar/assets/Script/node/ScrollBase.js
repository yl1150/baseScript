/**
 * ScrollView滚动组件扩展
 * 节点树如下：
 *      scroll（在此添加此脚本组件，并编辑器拖拽设置content为滚动内容）
 *          bg
 *          view（用于遮罩，一般添加cc.Mask组件）
 *              content
 *                  item1
 *                  item2
 */
cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        //executeInEditMode: true,
        requireComponent: cc.ScrollView,//依赖组件
    },

    properties: {
        generate: { default: true, tooltip: '从容器中拖走一个还会生成一个，即容器内容不变' },
        dragTime: { default: 80, tooltip: '拖拽时间（单位：ms），按住不松手80ms才会触发拖动事件' },
    },

    onLoad() {
        this.scrollCom = this.node.getComponent(cc.ScrollView);
        this.content = this.scrollCom.content;
        this.layoutCom = this.content.getComponent(cc.Layout);
        //添加一个节点，用于放置拖拽出来的东西
        this.panel = new cc.Node();
        this.panel.name = 'panel';
        this.panel.setParent(this.node);
        this.panel.setPosition(cc.v2(0, 0));
        //拖拽结束回调
        this.dragEndCallback;
    },

    start() {
        //滚动到顶
        if (this.scrollCom.vertical) {
            this.content.setAnchorPoint(cc.v2(0.5, 1));
            this.scrollCom.scrollToTop(0);
        }
        if (this.scrollCom.horizontal) {
            this.content.setAnchorPoint(cc.v2(0, 0.5));
            this.scrollCom.scrollToLeft(0);
        }
        this.content.$initPosition = this.content.getPosition();
        //添加回调函数
        if (this.scrollCom.scrollEvents.length === 0) {
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = 'ScrollBase';
            clickEventHandler.handler = 'onScrollCallback';
            //clickEventHandler.customEventData = "foobar";
            this.scrollCom.scrollEvents.push(clickEventHandler);
        }
        //给content中的子节点注册触摸
        if (this.layoutCom) {
            this.registerTouch();
        } else {
            console.log('滚动内容必须包含layout组件，否则内容的 子节点 不予拖拽');
        }
    },

    afterDrag() {
        //拖拽结束后
        if (this.dragEndCallback) {
            this.dragEndCallback();
        } else {
            if (this.generate) {
                this.panel.destroyAllChildren();
            } else {
                var dragItem = this.getDragItem();
                if (dragItem) {
                    dragItem.setParent(this.content);
                    dragItem.setSiblingIndex(dragItem.$initIndex);
                }
            }
        }
    },

    /**
     * 获取拖拽项
     */
    getDragItem() {
        var index = this.panel.children.length - 1;
        return (index > -1) ? this.panel.children[index] : null;
    },

    /**
     * 设置拖拽结束回调
     */
    setDragEndCallback(dragEndCallback) {
        if (dragEndCallback) {
            this.dragEndCallback = dragEndCallback;
        }
    },

    registerTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.content.children;
        }
        temp_arr.forEach(pItem => {
            pItem.on(cc.Node.EventType.TOUCH_START, function (event) {
                if (this.touchTarget) return
                //延时触摸（避免滑动时触发拖拽）
                this.tag_timeout = setTimeout(() => {
                    //关闭滚动组件
                    this.scrollCom.enabled = false;
                    //关闭排列组件
                    this.layoutCom.enabled = false;
                    //确定触摸对象
                    var touchItem = event.target;
                    if (this.generate) {
                        //生成一个
                        touchItem = cc.instantiate(touchItem);
                    } else {
                        touchItem.$initIndex = touchItem.getSiblingIndex();
                    }
                    touchItem.setParent(this.panel);
                    this.touchTarget = touchItem;
                    //设置位置
                    var pos = this.touchTarget.parent.convertToNodeSpaceAR(event.getLocation());
                    this.touchTarget.setPosition(pos);
                }, this.dragTime);
            }, this)
            pItem.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                if (!this.touchTarget) return
                var pos = this.touchTarget.parent.convertToNodeSpaceAR(event.getLocation());
                this.touchTarget.setPosition(pos);
            }, this)
            pItem.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pItem.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                clearTimeout(this.tag_timeout);
                if (!this.touchTarget) return
                //开启滚动组件
                this.scrollCom.enabled = true;
                //开启排列组件
                this.layoutCom.enabled = true;
                //拖拽结束
                this.afterDrag();
                //重置触摸对象
                this.touchTarget = null;
            }
        })
    },

    unregisterTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.content.children;
        }
        temp_arr.forEach(pItem => {
            pItem.off(cc.Node.EventType.TOUCH_START)
            pItem.off(cc.Node.EventType.TOUCH_MOVE)
            pItem.off(cc.Node.EventType.TOUCH_END)
            pItem.off(cc.Node.EventType.TOUCH_CANCEL)
        })
    },

    onScrollCallback(scrollview, eventType, customEventData) {
        if (eventType === cc.ScrollView.EventType.SCROLL_BEGAN) {
            //
        }
        if (eventType === cc.ScrollView.EventType.SCROLLING) {
            //
        }
        if (eventType === cc.ScrollView.EventType.SCROLL_ENDED) {
            //校准位置
            if (this.scrollCom.vertical) {
                var deltaY = this.content.y - this.content.$initPosition.y;
                var intervalY = this.content.children[0].height + this.layoutCom.spacingY;
                var leftY = deltaY % intervalY;
                if (Math.abs(leftY) < intervalY * 0.5) {
                    cc.tween(this.content).to(0.1, { position: cc.v2(0, -leftY) }).start();
                } else {
                    cc.tween(this.content).to(0.1, { position: cc.v2(0, (leftY > 0 ? 1 : -1) * intervalY - leftY) }).start();
                }
            }
            if (this.scrollCom.horizontal) {
                var deltaX = this.content.x - this.content.$initPosition.x;
                var intervalX = this.content.children[0].width + this.layoutCom.spacingX;
                var leftX = deltaX % intervalX;
                if (Math.abs(leftX) < intervalX * 0.5) {
                    cc.tween(this.content).to(0.1, { position: cc.v2(-leftX, 0) }).start();
                } else {
                    cc.tween(this.content).to(0.1, { position: cc.v2((leftX > 0 ? 1 : -1) * intervalX - leftX, 0) }).start();
                }
            }
        }
    },
});
