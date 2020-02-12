import fs = require('fs');
import os = require('os');
import path = require('path');
import readline = require('readline');
import { once } from 'events';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import { outputChannel, AnyObj, JsonData } from './lib/const';

export class Util {
  static ROOT_DIR: string | null;
  static DIR() {
    if (!this.ROOT_DIR) {
      this.ROOT_DIR = path.dirname(__dirname);
    }
    return this.ROOT_DIR;
  }


  /**
   * 获取当前所在工程根目录，有3种使用方法：<br>
   * getProjectPath(uri) uri 表示工程内某个文件的路径<br>
   * getProjectPath(document) document 表示当前被打开的文件document对象<br>
   * getProjectPath() 会自动从 activeTextEditor 拿document对象，如果没有拿到则报错
   * @param {*} document 
   */
  static getProjectPathP(document: any) {
    if (!document) {
      document = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
    }
    if (!document) {
      this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
      return '';
    }
    const currentFile = (document.uri ? document.uri : document).fsPath;
    let projectPath = null;

    let list = vscode.workspace.workspaceFolders;
    let workspaceFolders: any[] = [];
    if (list) {
      workspaceFolders = list.map(item => item.uri.path);
    }
    // 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
    // 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
    if (workspaceFolders.length === 1 && workspaceFolders[0] === vscode.workspace.rootPath) {
      const rootPath = workspaceFolders[0];
      var files = fs.readdirSync(rootPath);
      workspaceFolders = files.filter(name => !/^\./g.test(name)).map(name => path.resolve(rootPath, name));
      // vscode.workspace.rootPath 会不准确，且已过时
      // return vscode.workspace.rootPath + '/' + this._getProjectName(vscode, document);
    }
    // console.log( workspaceFolders );
    workspaceFolders.forEach(folder => {
      if (currentFile.indexOf(folder) === 0) {
        projectPath = folder;
      }
    });
    if (!projectPath) {
      this.showError('获取工程根路径异常！');
      return '';
    }
    return projectPath;
  }

  static getProjectPath(document: vscode.TextDocument | any = null) {
    if (!document) {
      document = vscode.window.activeTextEditor ?
        vscode.window.activeTextEditor.document :
        null;
    }
    if (!document) {
      this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
      return '';
    }
    const currentFile = document.uri.fsPath;
    return currentFile;
  }

  static _getShallowDirectorySizeSync(directory: string) {
    var files = fs.readdirSync(directory);
    var totalSize = 0;
    for (var i = 0; i < files.length; i++) {
      totalSize += fs.statSync(path.join(directory, files[i])).size;
    }
    return totalSize;
  }


  static getFilePath(document: vscode.TextDocument | any = null) {
    if (!document) {
      document = vscode.window.activeTextEditor ?
        vscode.window.activeTextEditor.document :
        null;
    }
    const projectPath = document.uri.fsPath;
    if (!projectPath) {
      this.showError('获取工程根路径异常！');
      return '';
    }
    return projectPath;
  }

  static getJsonData(
    document: vscode.TextDocument | null = null, content: string | null = null) {

    let data: AnyObj = JsonData.v;

    if (!document) {
      document = vscode.window.activeTextEditor ?
        vscode.window.activeTextEditor.document :
        null;
    }
    if (!content && document) {
      content = document.getText();
    }
    if (!content) {
      return data;
    }

    let regEx = /json:\{"[^\n]+/;
    let match = regEx.exec(content + '');

    if (match) {
      let tm = JSON.parse(match[0].substr(5));
      for (const key in tm) {
        data[key] = tm[key];
      }
    }

    return data;
  }

  /**
   * 获取当前第一个选中内容，或当前第一个选区的整行内容
   * @param editor
   */
  static getSelecttextLine(editor: vscode.TextEditor | undefined = undefined) {
    let files: string;
    // 获取当前编辑器对象
    if (!editor) {
      editor = vscode.window.activeTextEditor;
    }
    if (!editor) {
      return '';
    }

    if (editor.selections[0].start.character ===
      editor.selections[0].end.character &&
      editor.selections[0].start.line === editor.selections[0].end.line) {
      files = editor.document.lineAt(editor.selections[0].start.line).text;
    } else {
      files = editor.document.getText(editor.selections[0]);
    }
    return files;
  }


  static getStringPath(files: string, word_dir: string, data: any) {
    let file_str = files;
    var stat = fs.lstatSync(word_dir);
    if (stat.isFile()) {
      word_dir = this.getDirname(word_dir);
    }
    if (data['pwd']) {
      word_dir = data['pwd'];
    }

    if (word_dir.substr(-1) !== '/') {
      word_dir += '/';
    }

    if (file_str.substr(0, 1) !== '/') {
      if (file_str.substr(0, 2) === './') {
        file_str = word_dir + file_str.substr(2);
      } else if (file_str.substr(0, 2) === '../') {
        file_str = word_dir + file_str;
      }
    }

    if (fs.existsSync(file_str)) {
      stat = fs.lstatSync(file_str);
      if (!stat.isFile()) {
      }
    } else {
      file_str = '';
    }
    return file_str;
  }

  static isfile(file: string) {
    if (fs.existsSync(file)) {
      let stat = fs.lstatSync(file);
      if (stat.isFile()) {
        return true;
      }
    }
    return false;
  }


  static createFileDir(files: string) {
    let create_file = false;

    let first: string = '/' + files.split('/')[0];
    if (!fs.existsSync(first) || first === '/') {
      return false;
    }

    if (files.substr(-1) !== '/') {

      let dirs = this.getDirname(files);
      if (dirs) {
        fs.mkdirSync(dirs, { recursive: true });
        fs.open(files, 'w', a => { });
        create_file = true;
      }

    } else {
      fs.mkdirSync(files, { recursive: true });
    }

    return create_file;
  }
  static repeat(src: string, n: number) {
    return (new Array(n + 1)).join(src);
  }



  static getProjectName(projectPath: string) {
    return path.basename(projectPath);
  }

  static getDirname(projectPath: string) {
    return path.dirname(projectPath);
  }

  static getPluginPath() { }

  /**
   *  查看温度
   *
   */
  static getSystemInfo(func: Function) {
    let bash = '/Volumes/webS/www/frame/git/mac/osx-cpu-temp/a.out -a';
    let new_env = process.env;
    new_env['MEGAVARIABLE'] = 'MEGAVALUE';
    new_env['LC_CTYPE'] = 'UTF-8';
    new_env['LANG'] = 'en_US.UTF-8';

    let data = { 'cwd': '/tmp', 'env': new_env };

    exec(bash, data, function (error: any, stdout: string, stderr: string) {
      if (error !== null) {
        console.log('exec error: ' + error);
      } else {
        let show_text = stdout;
        show_text = show_text.replace(/\n/g, ' ');
        show_text =
          show_text.replace('Num fans: 2 Fan 0 - Left side   at ', ', ');
        show_text = show_text.replace('Fan 1 - Right side  at ', ', ');
        func(show_text);

        // view.erase_status('prefixr_cpu_fan')
        // view.set_status('prefixr_cpu_fan', stdout)
        // sublime.set_timeout(lambda: view.erase_status('prefixr_cpu_fan'),
        // 9000)

        // console.log('复制完成 ', show_text);
      }
    });
  }



  static async sublime_file_list(files: string) {
    let lm_strat: string = 'sublime_list_start:';
    let lm_end: string = 'sublime_list_end:';
    let data = Array();

    try {
      const rl = readline.createInterface(
        { input: fs.createReadStream(files), crlfDelay: Infinity });

      //   let status = 'start';
      let tmp = {
        'name': '',
        'list': Array(),
        'status': '',
        'num': 0,
        'val': ['', '']
      };
      rl.on('line', (line) => {
        let strs = line.trim();
        if (tmp['status'] === '') {
          if (strs.startsWith(lm_strat)) {
            tmp['name'] = strs.substr(lm_strat.length);
            tmp['status'] = 'start';
            tmp['num'] = 0;
          }
        } else if (tmp['status'] === 'start') {
          if (strs.startsWith(lm_end)) {
            data.push([tmp['name'], tmp['list']]);
            tmp['status'] = '';
            tmp['list'] = Array();
            tmp['num'] = 0;

          } else {
            if (tmp['num'] % 2 === 0) {
              tmp['val'][0] = strs;
            } else {
              tmp['val'][1] = strs;
              if (tmp['val'][0].length < 1) {
                tmp['val'][0] = path.basename(strs);
              }

              tmp['list'].push([tmp['val'][0], tmp['val'][1]]);
            }
            ++tmp['num'];
          }
        }
      });

      await once(rl, 'close');
    } catch (err) {
      console.error(err);
    }
    return data;
  }


  /**
   *  bash
   *
   */
  static exec(bash: string, data: any, func: any) {
    let new_env = process.env;
    new_env['MEGAVARIABLE'] = 'MEGAVALUE';
    new_env['LC_CTYPE'] = 'UTF-8';
    new_env['LANG'] = 'en_US.UTF-8';
    data['env'] = new_env;
    exec(bash, data, func);
  }


  /**
   *  文字到编辑器 terminal 运行
   *
   */
  static run_terminal(bashs: string, pwd: string = '') {
    let text = '';
    if (pwd.startsWith('/Users/chenyudong/Library/')) {
      pwd = '';
    }

    if (pwd) {
      text += 'cd "' + pwd + '"' + '\n';
    }
    text += '\n\n\n';
    text += 'clear' + '\n';
    text += bashs + '\n';

    vscode.commands
      .executeCommand('workbench.action.terminal.toggleTerminal')
      .then(sucess => {
        vscode.commands.executeCommand(
          'workbench.action.terminal.clear');  // 清除控制台
        vscode.commands.executeCommand(
          'workbench.action.terminal.sendSequence', { 'text': text });
      });
  }
  static async ctrls(document: vscode.TextDocument, is_await = 1) {
    if (is_await) {
      await document.save();
    } else {
      document.save();
    }
  }

  static async docSave(is_await = 1) {
    let document: vscode.TextDocument | null = vscode.window.activeTextEditor ?
      vscode.window.activeTextEditor.document :
      null;
    if (document && document.isDirty) {
      await this.ctrls(document, is_await);
    }
    
    return Promise.resolve('运行结束');
  }

  static getWorkspaceFolders() {
    let list = vscode.workspace.workspaceFolders;
    let workspaceFolders: string[] = [];
    if (list) {
      list.forEach(folder => {
        const pathp: any = Util.getDirname(folder.uri.path);
        if (!workspaceFolders.find(v => v === pathp)) {
          workspaceFolders.push(pathp);
        }
      });
      list.forEach(folder => {
        workspaceFolders.push(folder.uri.path);
      });
    }
    let tm = this.getProjectPath();
    if (tm) {
      workspaceFolders.push(this.getDirname(tm));
    }
    return workspaceFolders;
  }

  static getWordFile(word: string) {
    function check(workDir: string, word: string) {
      let file = '';
      if (!file && Util.isfile(word)) {
        file = word;
      }
      if (!file && Util.isfile(workDir + '/' + word)) {
        file = workDir + '/' + word;
      }
      if (!file && Util.isfile(workDir + '/' + word + ".js")) {
        file = workDir + '/' + word + ".js";
      }
      if (!file && Util.isfile(workDir + '/' + word + ".ts")) {
        file = workDir + '/' + word + ".ts";
      }
      if (!file && Util.isfile(workDir + '/' + word + ".php")) {
        file = workDir + '/' + word + ".php";
      }
      return file;
    }
    let list = this.getWorkspaceFolders();
    let file: string[] = [];
    list.forEach(val => {
      const tm = check(val, word);
      if (tm && !file.find(v => v === tm)) {
        file.push(tm);
      }
    });
    return file;
  }

  static getFileLine(word: string) {
    let line = 0;
    let tm = word.match(/(.*)::R(\d+)$/);
    if (tm) {
      word = tm[1];
      line = parseInt(tm[2]);
    } else {
      tm = word.match(/(.*):(\d+)$/);
      if (tm) {
        word = tm[1];
        line = parseInt(tm[2]);
      }
    }
    if (line > 0) {
      line--;
    }
    return [word, line];
  }

  static str_to_obj(data: any, strs: string, val: any) {
    let va = strs.split('.');
    let tm: any = data;
    let is_right = 1;
    va.forEach((v1: any) => {
      if (tm.hasOwnProperty(v1)) {
        tm = tm[v1];
      } else {
        is_right = 0;
      }
    });
    if (is_right === 1) {
      let evals = 'data';
      va.forEach((v: string) => {
        evals += '["' + v + '"]';
      });
      evals += '=val;';
      // evals += '="'+val+'"';
      eval(evals);
    }
    return data;
  }

  static to_v(data: any, search_data: any) {
    if (data.hasOwnProperty('to->v')) {
      let tm = data['to->v'].split('|');
      let source_val = search_data;
      tm[0].split('.').forEach((key: string) => {
        if (source_val[key]) {
          // if (source_val.hasOwnProperty(key)) {
          source_val = source_val[key];
        }
      });
      data = this.str_to_obj(data, tm[1], source_val);
    }
    return data;
  }



  /**
   * 自定义深度的数组合并
   * @param args 数组
   */
  static merge(...args: any[]): any {
    let deel = 2;
    if (typeof args[0] === 'number') {
      deel = args[0];
      args = args.slice(1);
    } else if (typeof args[0] === 'boolean') {
      deel = -1;
      args = args.slice(1);
    }
    let tm = [];
    for (const key in args) {
      if (typeof args[key] === 'object') {
        tm.push(args[key]);
      }
    }
    args = tm;
    if (tm.length === 0) {
      return {};
    } else if (tm.length === 1) {
      return tm[0];
    }
    let data = args[0];

    for (const k in args[1]) {
      if (data.hasOwnProperty(k)) {
        if (typeof data[k] !== typeof args[1][k]) {
          data[k] = args[1][k];
        } else if (typeof data[k] === 'string') {
          if (data[k].length === 0) {
            data[k] = args[1][k];
          }
        } else if (typeof data[k] === 'object') {
          if (deel > 1 || deel < 0) {
            data[k] = this.merge(--deel, data[k], args[1][k]);
          } else {
            data[k] = args[1][k];
          }
        }
      } else {
        data[k] = args[1][k];
      }
    }
    if (args.length > 2) {
      args = args.slice(2);
      args.unshift(data);
      args.unshift(deel);
      return this.merge.apply(null, args);
    } else {
      return data;
    }
  }









  /**
   *
   * @param src
   * @param n
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   */


  /**
   * 将一个单词首字母大写并返回
   * @param {*} word 某个字符串
   */
  static upperFirstLetter(word: any) {
    return (word || '').replace(/^\w/, (m: string) => m.toUpperCase());
  }

  /**
   * 将一个单词首字母转小写并返回
   * @param {*} word 某个字符串
   */
  static lowerFirstLeter(word: any) {
    return (word || '').replace(/^\w/, (m: string) => m.toLowerCase());
  }

  /**
   * 全局日志开关，发布时可以注释掉日志输出
   */
  static log(...args: any) {
    console.log(...args);
  }

  /**
   * 全局日志开关，发布时可以注释掉日志输出
   */
  static error(...args: any) {
    console.error(...args);
  }

  /**
   * 弹出错误信息
   */
  static showError(info: string) {
    vscode.window.showErrorMessage(info);
  }

  /**
   * 弹出提示信息
   */
  static showInfo(info: string) {
    vscode.window.showInformationMessage(info);
  }

  static findStrInFolder(folderPath: any, str: any) { }

  /**
   * 从某个文件里面查找某个字符串，返回第一个匹配处的行与列，未找到返回第一行第一列
   * @param filePath 要查找的文件
   * @param reg 正则对象，最好不要带g，也可以是字符串
   */
  static findStrInFile(filePath: any, reg: string | RegExp) {
    const content = fs.readFileSync(filePath, 'utf-8');
    reg = typeof reg === 'string' ? new RegExp(reg, 'm') : reg;
    // 没找到直接返回
    if (content.search(reg) < 0) {
      return { row: 0, col: 0 };
    }
    const rows = content.split(os.EOL);
    // 分行查找只为了拿到行
    for (let i = 0; i < rows.length; i++) {
      let col = rows[i].search(reg);
      if (col >= 0) {
        return { row: i, col };
      }
    }
    return { row: 0, col: 0 };
  }

  /**
   * 获取某个字符串在文件里第一次出现位置的范围，
   */
  static getStrRangeInFile(filePath: any, str: string) {
    var pos = this.findStrInFile(filePath, str);
    return new vscode.Range(
      new vscode.Position(pos.row, pos.col),
      new vscode.Position(pos.row, pos.col + str.length));
  }

  /**
   * 简单的检测版本大小
   */
  static checkVersion(version1: string, version2: string) {
    let val1 = parseInt(version1.replace(/\./g, ''));
    let val2 = parseInt(version2.replace(/\./g, ''));
    return val1 > val2;
  }

  /**
   * 获取某个扩展文件绝对路径
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
   */
  static getExtensionFileAbsolutePath(
    context: { extensionPath: any; }, relativePath: any) {
    return path.join(context.extensionPath, relativePath);
  }

  /**
   * 获取某个扩展文件相对于webview需要的一种特殊路径格式
   * 形如：vscode-resource:/Users/toonces/projects/vscode-cat-coding/media/cat.gif
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
   */
  static getExtensionFileVscodeResource(
    context: { extensionPath: any; }, relativePath: any) {
    const diskPath =
      vscode.Uri.file(path.join(context.extensionPath, relativePath));
    return diskPath.with({ scheme: 'vscode-resource' }).toString();
  }

  /**
   * 在Finder中打开某个文件或者路径
   */
  static openFileInFinder(filePath: string) {
    if (!fs.existsSync(filePath)) {
      this.showError('文件不存在：' + filePath);
    }
    // 如果是目录，直接打开就好
    if (fs.statSync(filePath).isDirectory()) {
      exec(`open ${filePath}`);
    } else {
      // 如果是文件，要分开处理
      const fileName = path.basename(filePath);
      filePath = path.dirname(filePath);
      // 这里有待完善，还不知道如何finder中如何选中文件
      exec(`open ${filePath}`);
    }
  }

  /**
   * 在vscode中打开某个文件
   * @param {*} path 文件绝对路径
   * @param {*} text 可选，如果不为空，则选中第一处匹配的对应文字
   */
  static openFileInVscode(path: string, text: any) {
    let options = undefined;
    if (text) {
      const selection = this.getStrRangeInFile(path, text);
      options = { selection };
    }
    vscode.window.showTextDocument(vscode.Uri.file(path), options);
  }

  /**
   * 用JD-GUI打开jar包
   */
  static openJarByJdGui(jarPath: string) {
    // 如何选中文件有待完善
    const jdGuiPath =
      vscode.workspace.getConfiguration().get('eggHelper.jdGuiPath');
    if (!jdGuiPath) {
      this.showError('JD-GUI路径不能为空！');
      return;
    }
    if (!fs.existsSync(jdGuiPath + '')) {
      this.showError(
        '您还没有安装JD-GUI，请安装完后到vscode设置里面找到HSF助手并进行路径配置。');
      return;
    }
    if (!fs.existsSync(jarPath)) {
      this.showError('jar包未找到：' + jarPath);
      return;
    }
    exec(`open ${jarPath} -a ${jdGuiPath}`);
  }

  /**
   * 使用默认浏览器中打开某个URL
   */
  static openUrlInBrowser(url: any) {
    exec(`open '${url}'`);
  }

  /**
   * 递归遍历清空某个资源的require缓存
   * @param {*} absolutePath
   */
  static clearRequireCache(absolutePath: string) {
    const root = require.cache[absolutePath];
    if (!root) {
      return;
    }
    if (root.children) {
      // 如果有子依赖项，先清空依赖项的缓存
      root.children.forEach(item => {
        this.clearRequireCache(item.id);
      });
    }
    delete require.cache[absolutePath];
  }

  /**
   * 动态require，和普通require不同的是，加载之前会先尝试删除缓存
   * @param {*} modulePath
   */
  static dynamicRequire(modulePath: string) {
    this.clearRequireCache(modulePath);
    return require(modulePath);
  }

  // /**
  //  * 读取properties文件
  //  * @param {*} filePath
  //  */
  // readProperties(filePath: any) {
  //     const content = fs.readFileSync(filePath, 'utf-8');
  //     let rows = content.split(os.EOL);
  //     rows = rows.filter((row: string) => row && row.trim() &&
  //     !/^#/.test(row)); const result = {}; rows.forEach((row: string) => {
  //         let temp = row.split('=');
  //         result[temp[0].trim()] = temp[1].trim();
  //     });
  //     return result;
  // }
  // /**
  //  * 比较2个对象转JSON字符串后是否完全一样
  //  * 特别注意，由于JS遍历对象的无序性（部分浏览器是按照添加顺序遍历的）导致同样的对象，
  //  * 转成JSON串之后反而不一样，所以这里采用其它方式实现。
  //  * @param {*} obj1
  //  * @param {*} obj2
  //  */
  // jsonEquals(obj1: any, obj2: any) {
  //     let s1 = this.formatToSpecialJSON(obj1, '', true);
  //     let s2 = this.formatToSpecialJSON(obj2, '', true);
  //     return s1 === s2;
  // }
}
