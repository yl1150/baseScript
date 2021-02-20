var path = require('path');
var fs = require('fs');

function onBeforeBuildFinish(options, callback) {
    Editor.log('Building ' + options.platform + ' to ' + options.dest);

    //复制load文件
    var srcPath = path.join(options.project, 'packages', 'build-temple', 'loading');
    var destPath = path.join(options.dest);
    copyFolder(srcPath,destPath);
    //复制配置数据
    var srcPath_config=path.join(options.project, 'assets', 'Data', 'GameConfig.json');
    var destPath = path.join(options.dest,'GameConfig.json');
    copyFile(srcPath_config,destPath);

    callback();
}

module.exports = {
    load() {
        Editor.Builder.on('before-change-files', onBeforeBuildFinish);
    },

    unload() {
        Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
    }
};

//将srcPath路径的文件复制到tarPath路径的文件（tarPath也要指定到文件）
function copyFile(srcPath, tarPath, cb){
    var rs = fs.createReadStream(srcPath);
    rs.on('error', function(err) {
        if (err)console.log('read error', srcPath);
        cb && cb(err);
    })
    var ws = fs.createWriteStream(tarPath);
    ws.on('error', function(err) {
        if (err)console.log('write error', tarPath);
        cb && cb(err);
    })
    ws.on('close', function(ex) {cb && cb(ex);})
    
    rs.pipe(ws);
}

//将srcDir文件下的文件、文件夹递归的复制到tarDir下
function copyFolder(srcDir, tarDir, cb) {
    fs.readdir(srcDir, function (err, files) {
        var count = 0;
        var checkEnd = function () {
            ++count === files.length && cb && cb();
        }
        if (err) {
            checkEnd();
            return;
        }

        files.forEach(file => {
            var srcPath = path.join(srcDir, file);
            var tarPath = path.join(tarDir, file);
            fs.stat(srcPath, function (err, stats) {
                if (stats.isDirectory()) {
                    console.log('mkdir', tarPath);
                    fs.mkdir(tarPath, function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        copyFolder(srcPath, tarPath, checkEnd);
                    });
                } else {
                    copyFile(srcPath, tarPath, checkEnd);
                }
            });
        });
        //为空时直接回调
        files.length === 0 && cb && cb();
    });
}

/**
 * 设置canvas透明
 */
function setCanvasTransparent(options) {
    var mainJsPath = path.join(options.dest, 'main.js');
    var script_main = fs.readFileSync(mainJsPath, 'utf8');
    script_main = script_main.replace(/cc.game.run/g, 'cc.macro.ENABLE_TRANSPARENT_CANVAS = true;\n\tcc.game.run');
    fs.writeFileSync(mainJsPath, script_main);
}

/**
 * 更改标题
 */
function changeIndexTitle(options) {
    //改index.html中标题
    var indexHtmlPath = path.join(options.dest, 'index.html');
    var script_index = fs.readFileSync(indexHtmlPath, 'utf8');
    var index1 = script_index.search('<title>') + 7;
    var index2 = script_index.search('</title>');
    var str1 = script_index.substring(0, index1);
    var str2 = script_index.substring(index2);
    script_index = str1 + '何秋光学前数学' + str2;

    fs.writeFileSync(indexHtmlPath, script_index);
}