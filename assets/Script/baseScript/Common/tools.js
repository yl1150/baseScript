//通用方法
module.exports = {
    //生成从minNum到maxNum的随机数
    getDisTance(pos1, pos2) {
        return pos1 && pos2 ? pos1.sub(pos2).mag() : 0
    },

    getNodeDistance(node1, node2) {
        let pos = this.getRelativePos(node2, node1.parent)
        return this.getDisTance(node1.position, pos)
    },

    //隨機數
    randomNum(minNum, maxNum, isFushu = false) {
        let num = 1;
        if (isFushu) {
            this.randomNum(1, 2) == 2 && (num = -1);
        }
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10) * num;
    },

    //获得2点之间的夹角
    getAngle(px, py, mx, my) {
        let x = Math.abs(px - mx);
        let y = Math.abs(py - my);
        let z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let cos = y / z;
        let radina = Math.acos(cos);//用反三角函数求弧度
        let angle = Math.floor(180 / (Math.PI / radina));//将弧度转换成角度

        if (mx == px && my > py) {//鼠标在y轴负方向上
            angle = 180;
        }

        if (mx > px && my == py) {//鼠标在x轴正方向上
            angle = -90;
        }

        if (mx < px && my == py) {//鼠标在x轴负方向
            angle = 90;
        }

        if (px < mx && py < my) {//鼠标在第三象限
            angle = -180 + angle
        }

        if (px < mx && py > my) {//鼠标在第二象限
            angle = -angle;
        }

        if (px > mx && py < my) {//鼠标在第四象限
            angle = 180 - angle;
        }
        return angle;
    },

    //获得相对于目标节点的位置
    getRelativePos(other, self) {
        return self.convertToNodeSpaceAR(other.convertToWorldSpaceAR(cc.v2(0, 0)))
    },

    /**
* 添加按钮，代码添加和编辑器添加效果一样
* @param {cc.Node} pNode //按钮节点
* @param {String} funcName //回调函数名
* @param {String} codeName //回调函数所在组件名
* @param {cc.Node} codeNode 
*/
    addButtonEvent(pNode, funcName, codeName, codeNode) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = codeNode;
        clickEventHandler.component = codeName;
        clickEventHandler.handler = funcName;
        //clickEventHandler.customEventData="";
        pNode.removeComponent(cc.Button);
        let btn = pNode.addComponent(cc.Button)
        btn.clickEvents.push(clickEventHandler)
        return btn
    },

    /**
* 添加按钮，代码添加和编辑器添加效果一样
* @param {cc.Node} node //按钮节点
* @param {function} startFunc //触摸开始回调
* @param {function} moveFunc //触摸移动回调
* @param {function} endFunc //触摸结束回调
*/
    registerTouch(node, startFunc, moveFunc, endFunc) {
        if (!node) {
            return
        }
        startFunc && node.on('touchstart', (event) => {
            if (!GD.canTouch) {
                event.target._isTouch = false;
                return
            }
            event.target._isTouch = true;
            cc.YL.emitter.emit('tips_touchStart')
            if (GD.isShowClickAni && GD._clickAni) {
                GD._clickAni.active = false
                GD.isShowClickAni = false
            }
            startFunc(event)
            GD.sound && GD.sound.playSound('click', 1)
        }, this)

        moveFunc && node.on('touchmove', (event) => {
            if (!GD.canTouch || !event.target._isTouch) {
                return
            }
            moveFunc(event)
        }, this)

        endFunc && node.on('touchend', (event) => {
            if (!GD.canTouch || !event.target._isTouch) {
                return
            }
            endFunc(event)
        }, this)

        endFunc && node.on('touchcancel', (event) => {
            if (!GD.canTouch || !event.target._isTouch) {
                return
            }
            endFunc(event)
        }, this)
    },

    unRegisterTouch(node) {
        node.off('touchstart')
        node.off('touchmove')
        node.off('touchend')
        node.off('touchcancel')
    },

    //ios 返回true  安卓 false
    checkPlatform() {
        return false;
        //return cc.sys.os === cc.sys.OS_IOS;
    },

    checkIsphone() {
        let num = (cc.winSize.width / cc.winSize.height)
        console.log("屏幕比例为:", num)
        return num > 1.6 ? true : false
    },

    arrCopy(arr) {
        let _arr = []
        for (let i in arr) {
            _arr.push(arr[i])
        }
        return _arr
    },

    getArrIsHaveCell(arr, _cell) {
        for (let i in arr) {
            if (arr[i] == _cell) {
                return true
            }
        }
        return false
    },

    //仅判断元素不判断顺序
    checkArrIsSame(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false
        }
        for (let i in arr1) {
            if (!this.getArrIsHaveCell(arr2, arr1[i])) {
                return false
            }
        }

        for (let i in arr2) {
            if (!this.getArrIsHaveCell(arr1, arr2[i])) {
                return false
            }
        }
        return true
    },

    //判断元素 判断顺序
    checkArrIsSameStrict(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false
        }
        for (let i in arr1) {
            if (arr1[i] != arr2[i]) {
                return false
            }
        }
        return true
    },

    //随机获取一个数组的元素
    getRandomCell(arr) {
        return arr[this.randomNum(0, arr.length - 1)]
    },

    //随机获取一个数组的元素
    popRandomCell(arr) {
        return arr.splice(this.randomNum(0, arr.length - 1), 1).pop()
    },

    randomOrder(arr) {
        let new_arr = []
        while (arr.length > 0) {
            new_arr.push(this.popRandomCell(arr))
        }
        return new_arr;
    },

    createWithContinueNumber(start, end) {
        var tmp = null;
        if (start > end) {
            tmp = start;
            start = end;
            end = tmp;
        }
        var result = Array.from(new Array(end + 1).keys()).slice(start);
        if (tmp) result.reverse();
        return result;
    },

    //冒泡排序
    bubbleSort(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    let tem = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = tem;
                }
            }
        }
    },

    onCollision(_pNode, _target) {
        !_pNode._pPool && (_pNode._pPool = [])
        let _pPool = _pNode._pPool
        !this.getArrIsHaveCell(_pPool, _target) && _pPool.push(_target)
        let min = 11000
        let min_node = null
        for (let i in _pPool) {
            if (!_pPool[i].isValid) {
                _pPool.splice(i, 1)
                i--
            } else {
                let dis = this.getNodeDistance(_pPool[i], _pNode)
                if (dis < min) {
                    min = dis
                    min_node = _pPool[i]
                }
            }

        }
        return min_node
    },

    onCollisionExit(_pNode, _target) {
        !_pNode._pPool && (_pNode._pPool = [])
        let _pPool = _pNode._pPool
        for (let i in _pPool) {
            if (_pPool[i] == _target) {
                if (!_pPool[i].isValid) {
                    _pPool.splice(i, 1)
                    i--
                } else {
                    _pPool.splice(i, 1)
                }
                return
            }
        }
    },

    //数组去重
    uniqueArr(arr) {
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] == arr[j]) {         //第一个等同于第二个，splice方法删除第二个
                    arr.splice(j, 1);
                    j--;
                }
            }
        }
        return arr;
    },

    setSpineSkin(_spine, _slotName, _skinName) {
        let attachment = _spine.getAttachment(_slotName, _skinName)
        if (!attachment) {
            console.log('not found this skin!!!!!')
            return
        }
        _spine.setAttachment(_slotName, _skinName)
    },

    hideSpineSkin(_spine, _slotName) {
        _spine.setAttachment(_slotName, null)
    },

    setTime(s = 0, m = 0, h = 0) {
        return (s + m * 60 + h * 3600)
    },

    isTime(_currentTime, targetTime) {
        _currentTime = parseInt(_currentTime * 10) / 10
        if (_currentTime < targetTime) {
            return false
        }
        return (_currentTime.toString() == targetTime.toString())
    },

    //调用creator内置的shader使sprite变化 暂时只支持灰度
    setSpriteShader(materialType, target) {
        var _sprite = target.getComponent(cc.Sprite)
        if (!_sprite) {
            return
        }
        switch (materialType) {
            case 'normal':
                materialType = '2d-sprite'
                break;
            case 'gray':
                materialType = '2d-gray-sprite'
                break;
            default:
                break;
        }
        _sprite.setMaterial(0, cc.Material.getBuiltinMaterial(materialType))
    },

    touchTransition(target, scaleX, scaleY) {
        !scaleY && (scaleY = scaleX);
        scaleX = target.scaleX / Math.abs(target.scaleX) * scaleX;
        scaleY = target.scaleY / Math.abs(target.scaleY) * scaleY;
        target.setScale(scaleX, scaleY);
    },
}
