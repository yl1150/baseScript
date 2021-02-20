/**
 * 着色器扩展组件
 */

/**
 * 渲染类型
 */
const kShaderType = cc.Enum({
    /**
     * 正常
     */
    Default: '2d-sprite',
    /**
     * 置灰
     */
    Gray: '2d-gray-sprite',
});

var ShaderBase = {
    /**
     * 渲染类型
     */
    ShaderType: kShaderType,
    /**
     * 调用creator内置的shader使sprite变化
     * @param {cc.Node} target 节点
     * @param {ShaderType} shaderType 渲染类型
     */
    setSpriteShader(target, shaderType) {
        var _sprite = target.getComponent(cc.Sprite);
        if (!_sprite) return;
        var matertial = cc.Material.getBuiltinMaterial(shaderType);
        _sprite.setMaterial(0, matertial);
    }
}

export default ShaderBase;