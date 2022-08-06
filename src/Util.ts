import fs = require("fs");
import os = require("os");
import path = require("path");
import readline = require("readline");
import { once } from "events";
import { exec } from "child_process";
import * as vscode from "vscode";
import { AnyObj } from "./lib/const";
import { Uri, workspace } from "vscode";
import { MessageService } from "./lib/webSocket";
import { outputChannel, configUrl } from './lib/const';
import { Config } from './configurations/config';

export class Util {
  static HOME_DIR: string | null;
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
      document = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document
        : null;
    }
    if (!document) {
      // this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
      return "";
    }
    const currentFile = (document.uri ? document.uri : document).fsPath;
    let projectPath = null;

    let list = vscode.workspace.workspaceFolders;
    let workspaceFolders: any[] = [];
    if (list) {
      workspaceFolders = list.map((item) => item.uri.path);
    }
    // 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
    // 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
    if (
      workspaceFolders.length === 1 &&
      workspaceFolders[0] === vscode.workspace.rootPath
    ) {
      const rootPath = workspaceFolders[0];
      var files = fs.readdirSync(rootPath);
      workspaceFolders = files
        .filter((name) => !/^\./g.test(name))
        .map((name) => path.resolve(rootPath, name));
      // vscode.workspace.rootPath 会不准确，且已过时
      // return vscode.workspace.rootPath + '/' + this._getProjectName(vscode, document);
    }
    workspaceFolders.forEach((folder) => {
      if (currentFile.indexOf(folder) === 0) {
        projectPath = folder;
      }
    });
    if (!projectPath) {
      this.showError("获取工程根路径异常！");
      return "";
    }
    return projectPath;
  }

  static getProjectPath(document: vscode.TextDocument | any = null) {
    if (!document) {
      document = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document
        : null;
    }
    if (!document) {
      // this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
      return "";
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
      document = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document
        : null;
    }
    const projectPath = document.uri.fsPath;
    if (!projectPath) {
      this.showError("获取工程根路径异常！");
      return "";
    }
    return projectPath;
  }

  static getJsonData(
    document: vscode.TextDocument | null = null,
    content: string | null = null
  ) {
    let data: AnyObj = {};

    if (!document) {
      document = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document
        : null;
    }
    if (!content && document) {
      content = document.getText();
    }
    if (!content) {
      return data;
    }

    let regEx = /json:\{"[^\n]+/;
    let match = regEx.exec(content + "");

    if (match) {
      let tm = JSON.parse(match[0].substr(5));
      for (const key in tm) {
        data[key] = tm[key];
      }
      // Jsoncd.json.setJson(data);
    }


    if (Object.keys(data).length < 1 || !data.hasOwnProperty('ssh')) {

      let args = Util.getWorkspaceFolders();

      let names: string[] = ['.sublime_list.json', 'doc/.sublime_list.json'];

      for (let index = 0; index < args.length; index++) {
        let dir_path = args[index];

        if (dir_path.substr(-1) != '/') {
          dir_path += '/';
        }

        for (let i = 0; i < names.length; i++) {

          if (this.isfile(dir_path + names[i])) {
            let data_fig = Config.configJsonSublime_list(dir_path + names[i]);

            if (data_fig.hasOwnProperty('remote_ssh') && typeof data_fig['remote_ssh'] == 'object') {
              data = Util.merge(true, data, data_fig['remote_ssh']);
            }
          }
        }

      }
    }


    return data;
  }

  /**
   * 获取当前第一个选中内容，或当前第一个选区的整行内容
   * @param editor
   */
  static getSelecttextLineOne(
    editor: vscode.TextEditor | undefined = undefined
  ) {
    let files: string;
    // 获取当前编辑器对象
    if (!editor) {
      editor = vscode.window.activeTextEditor;
    }
    if (!editor) {
      return "";
    }

    if (
      editor.selections[0].start.character ===
      editor.selections[0].end.character &&
      editor.selections[0].start.line === editor.selections[0].end.line
    ) {
      files = "";
    } else {
      files = editor.document.getText(editor.selections[0]);
    }
    return files;
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
      return "";
    }

    if (
      editor.selections[0].start.character ===
      editor.selections[0].end.character &&
      editor.selections[0].start.line === editor.selections[0].end.line
    ) {
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
    if (data["pwd"]) {
      word_dir = data["pwd"];
    }

    if (word_dir.substr(-1) !== "/") {
      word_dir += "/";
    }

    if (file_str.substr(0, 1) !== "/") {
      if (file_str.substr(0, 2) === "./") {
        file_str = word_dir + file_str.substr(2);
      } else if (file_str.substr(0, 2) === "../") {
        file_str = word_dir + file_str;
      }
    }

    if (fs.existsSync(file_str)) {
      stat = fs.lstatSync(file_str);
      if (!stat.isFile()) {
      }
    } else {
      file_str = "";
    }
    return file_str;
  }

  static isfile(file: string) {
    if (fs.existsSync(file)) {
      let stat = fs.lstatSync(file);

      if (stat.isFile()) {
        return true;
      } else if (stat.isSymbolicLink()) {
        try {
          fs.readFileSync(file);
          return true;
        } catch (error) { }
      }
    }
    return false;
  }

  static createFileDir(files: string) {
    let create_file = false;

    let first: string = "/" + files.split("/")[0];
    if (!fs.existsSync(first) || first === "/") {
      return false;
    }

    if (files.substr(-1) !== "/") {
      let dirs = this.getDirname(files);
      if (dirs) {
        fs.mkdirSync(dirs, { recursive: true });
        fs.open(files, "w", (a) => { });
        create_file = true;
      }
    } else {
      fs.mkdirSync(files, { recursive: true });
    }

    return create_file;
  }
  static repeat(src: string, n: number) {
    return new Array(n + 1).join(src);
  }

  static getProjectName(projectPath: string) {
    return path.basename(projectPath);
  }

  static getDirname(projectPath: string) {
    return path.dirname(projectPath);
  }

  static getPluginPath() { }

  static async sublime_file_list(files: string) {
    let lm_strat: string = "sublime_list_start:";
    let lm_end: string = "sublime_list_end:";
    let data = Array();

    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(files),
        crlfDelay: Infinity,
      });

      //   let status = 'start';
      let tmp = {
        name: "",
        list: Array(),
        status: "",
        num: 0,
        val: ["", ""],
      };
      rl.on("line", (line) => {
        let strs = line.trim();
        if (tmp["status"] === "") {
          if (strs.startsWith(lm_strat)) {
            tmp["name"] = strs.substr(lm_strat.length);
            tmp["status"] = "start";
            tmp["num"] = 0;
          }
        } else if (tmp["status"] === "start") {
          if (strs.startsWith(lm_end)) {
            data.push([tmp["name"], tmp["list"]]);
            tmp["status"] = "";
            tmp["list"] = Array();
            tmp["num"] = 0;
          } else {
            if (tmp["num"] % 2 === 0) {
              tmp["val"][0] = strs;
            } else {
              tmp["val"][1] = strs;
              if (tmp["val"][0].length < 1) {
                tmp["val"][0] = path.basename(strs);
              }

              tmp["list"].push([tmp["val"][0], tmp["val"][1]]);
            }
            ++tmp["num"];
          }
        }
      });

      await once(rl, "close");
    } catch (err) {
      console.error(err);
    }
    return data;
  }


  static formatDate(format?: string, date?: Date): string {
    if (!date) date = new Date();
    var paddNum = function (num: any) {
      return num > 9 ? num : '0' + num;
    };
    //指定格式字符
    var cfg: any = {
      yyyy: date.getFullYear(), //年 : 4位
      yy: date.getFullYear().toString().substring(2),//年 : 2位
      M: date.getMonth() + 1,  //月 : 如果1位的时候不补0
      MM: paddNum(date.getMonth() + 1), //月 : 如果1位的时候补0
      d: date.getDate(),   //日 : 如果1位的时候不补0
      dd: paddNum(date.getDate()),//日 : 如果1位的时候补0
      hh: date.getHours(),  //时
      mm: date.getMinutes(), //分
      ss: date.getSeconds(), //秒
    };
    if (!format) format = "yyyy-MM-dd hh:mm:ss";
    return format.replace(/([a-z])(\1)*/ig,
      function (m) { return cfg[m]; }
    );
  }

  /**
   *  bash
   *
   */
  static exec(bash: string, data: any, func: any) {

    let new_env = process.env;
    new_env["MEGAVARIABLE"] = "MEGAVALUE";
    new_env["LC_CTYPE"] = "UTF-8";
    new_env["LANG"] = "en_US.UTF-8";
    data["env"] = new_env;
    const handle = exec(bash, data, func);

    if (data.outputChannel) {
      //####  计算运行的时间
      var start_t = (new Date()).getTime();

      let op: any = { show: 1, clear: 0, rest_focus: 1, show_msg: '', pid: handle.pid + '' };
      op = Util.merge(true, op, data.outputChannel);

      if (op.show) {
        let preserveFocus = op.rest_focus == 1 ? true : false;
        outputChannel.show(preserveFocus);
      }

      if (op.clear) {
        outputChannel.clear();
      }

      if (op.show_msg_start) {
        op.show_msg_start = op.show_msg_start.replace('{#id}', op.pid);
        outputChannel.appendLine(op.show_msg_start);
      }


      handle.stdout?.on('data', (data) => {
        outputChannel.appendLine(data);
      });

      handle.stderr?.on('data', (data) => {
        outputChannel.appendLine('stderr: ' + data);
      });

      handle.on('error', (code) => {
        outputChannel.appendLine('error: ' + code);
      });

      handle.on('close', (code) => {
        outputChannel.appendLine('close: ' + code);

        if (op.show_msg_end) {
          var runTime = ((new Date()).getTime() - start_t) / 1000;
          op.show_msg_end = op.show_msg_end.replace('{#id}', op.pid);
          op.show_msg_end = op.show_msg_end.replace('{#runTime}', runTime);
          outputChannel.appendLine(op.show_msg_end);
        }

      });

    }
  }

  /**
   *  文字到编辑器 terminal 运行
   *
   */
  static run_terminal(data: any) {
    let fig: any = {
      pwd: "", // 当前路径
      clear: 1, // 清除之前内容
      val: "", // 要执行的命令
      rest_focus: 0, // 焦点回到编辑器
    };
    fig = Util.merge(true, fig, data);

    let text = fig.val;

    vscode.commands
      .executeCommand("workbench.action.terminal.toggleTerminal")
      .then((sucess) => {

        vscode.commands.executeCommand("workbench.action.terminal.focus"); // 聚焦终端。这类似于切换，但如果终端可见，则聚焦终端而不是隐藏它。

        if (fig.scrollToBottom == 1) {
          vscode.commands.executeCommand("workbench.action.terminal.scrollToBottom"); // 滚动到底部
        }

        if (fig.clear == 1) {
          vscode.commands.executeCommand("workbench.action.terminal.clear"); // 清除控制台
        }

        vscode.commands
          .executeCommand("workbench.action.terminal.sendSequence", {
            text: text,
          })
          .then((sucess) => {
            // 回到焦点
            if (fig.rest_focus == 1 && vscode.window.activeTextEditor) {
              vscode.window.showTextDocument(
                vscode.window.activeTextEditor.document.uri
              );
            }
          });
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
    await vscode.commands.executeCommand("workbench.action.files.save");
    return Promise.resolve("运行结束");
  }

  static getBootDir() {
    let dirs = this.getWorkspaceFolders(0);
    let boot_dir = "";
    for (let index = 0; index < dirs.length; index++) {
      const path = dirs[index];
      if (
        fs.existsSync(path + "/.env") ||
        fs.existsSync(path + "/package.json") ||
        fs.existsSync(path + "/composer.json") ||
        fs.existsSync(path + "/node_modules")
      ) {
        boot_dir = path;
        break;
      }
    }
    return boot_dir;
  }
  static getWorkspaceFolders(source = 0) {
    let list = vscode.workspace.workspaceFolders;

    let workspaceFolders: string[] = [];
    if (source) {
      if (list) {
        list.forEach((folder) => {
          workspaceFolders.push(folder.uri.path);
        });
      }
    } else {
      if (list) {
        list.forEach((folder) => {
          const pathp: any = Util.getDirname(folder.uri.path);
          if (!workspaceFolders.find((v) => v === pathp)) {
            workspaceFolders.push(pathp);
          }
        });
        list.forEach((folder) => {
          workspaceFolders.push(folder.uri.path);
        });
      }
      let tm = this.getProjectPath();
      if (tm) {
        workspaceFolders.push(this.getDirname(tm));
      }
    }
    return workspaceFolders;
  }

  static getWordFile(word: string, line_tm: string, run_name: string) {
    function check(workDir: string, word: string) {
      let file = "";
      if (!file && Util.isfile(word)) {
        file = word;
      }
      if (!file && Util.isfile(workDir + "/" + word)) {
        file = workDir + "/" + word;
      }
      if (!file && Util.isfile(workDir + "/" + word + ".js")) {
        file = workDir + "/" + word + ".js";
      }
      if (!file && Util.isfile(workDir + "/" + word + ".ts")) {
        file = workDir + "/" + word + ".ts";
      }
      if (!file && Util.isfile(workDir + "/" + word + ".php")) {
        file = workDir + "/" + word + ".php";
      }
      return file;
    }
    let list = this.getWorkspaceFolders();
    let file: string[] = [];
    list.forEach((val) => {
      const tm = check(val.trim(), word.trim());
      if (tm && !file.find((v) => v[0] === tm)) {
        let item: any = [tm];
        if (
          run_name == "provideDefinition" &&
          line_tm.length === 4 &&
          line_tm[2] == "::KK"
        ) {

          let start_post = 0;
          for (let index = 0; index < 5; index++) {

            let content = fs.readFileSync(tm + "", "utf-8");
            let pos = content.indexOf(line_tm[3], start_post);

            if (pos !== -1) {
              start_post = pos + line_tm[3].length
              if (content.substr(pos - 6, 6) == ' ::KK ') continue;

              let list = content.substr(0, pos).split("\n");
              content = "";
              item.push(list.length - 1);
              item.push(list[list.length - 1].length);
              item.push(item[2] + line_tm[3].length);
            }
            break;
          }

          console.log(item);
        }
        file.push(item);
      }
    });
    return file;
  }

  static getFileLine(word: string) {
    let tm;
    let data: any = [word, 0];

    if ((tm = word.match(/(.*)::R(\d+)$/))) {
      data[0] = tm[1];
      data[1] = parseInt(tm[2]);
    } else if ((tm = word.match(/(.*) +::KK +(.+)$/))) {
      data[0] = tm[1];
      data.push("::KK", tm[2]);
    } else {
      tm = word.match(/(.*):(\d+)$/);
      if (tm) {
        data[0] = tm[1];
        data[1] = parseInt(tm[2]);
      }
    }

    if (data[1] > 0) {
      data[1]--;
    }

    return data;
  }

  static str_to_obj(data: any, strs: string, val: any) {
    let va = strs.split(".");
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
      let evals = "data";
      va.forEach((v: string) => {
        evals += '["' + v + '"]';
      });
      evals += "=val;";
      // evals += '="'+val+'"';
      eval(evals);
    }
    return data;
  }

  static to_v(data: any, search_data: any) {
    if (data.hasOwnProperty("to->v")) {
      let tm = data["to->v"].split("|");
      let source_val = search_data;
      tm[0].split(".").forEach((key: string) => {
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
    if (typeof args[0] === "number") {
      deel = args[0];
      args = args.slice(1);
    } else if (typeof args[0] === "boolean") {
      deel = -1;
      args = args.slice(1);
    }
    let tm = [];
    for (const key in args) {
      if (typeof args[key] === "object") {
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
        } else if (typeof data[k] === "string") {
          if (args[1][k].length !== 0) {
            data[k] = args[1][k];
          }
        } else if (typeof data[k] === "object") {
          if (deel > 1 || deel < 0) {
            data[k] = this.merge(--deel, data[k], args[1][k]);
          } else {
            data[k] = args[1][k];
          }
        } else {
          data[k] = args[1][k];
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

  static SELECT_LINES(max_len = 0) {
    let selec: any[] = [];
    let editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
      return selec;
    }
    let range;
    for (let index = editor.selections.length - 1; index >= 0; index--) {
      range = editor.selections[index];
      selec.push([
        range.start.line,
        range.start.character,
        editor.document.getText(range),
        editor.document.lineAt(range.start.line).text,
        range.end.line,
        range.end.character,
      ]);
    }

    selec = selec.sort((x: any, y: any) => {
      if (x[0] === y[0]) {
        return x[1] - y[1];
      } else {
        return x[0] - y[0];
      }
    });
    if (max_len > 0) {
      selec.slice(0, max_len);
    }
    return selec;
  }

  static getLanguageId() {
    let document: vscode.TextDocument | null = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.document
      : null;
    if (document) {
      return document.languageId + "";
    } else {
      return "";
    }
  }
  static getSelectedText() {
    let editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

    if (!editor) {
      return "";
    }

    const selection = editor.selection;
    let text = editor.document.getText(selection);

    if (!text) {
      const range = editor.document.getWordRangeAtPosition(selection.active);
      text = editor.document.getText(range);
    }
    return text;
  }

  public static async move(path: string, targetPath: string) {
    await workspace.fs.rename(Uri.file(path), Uri.file(targetPath), {
      overwrite: true,
    });
  }


  public static file_ar() {
    let ar = {
      file_path: this.getProjectPath(),
      file_dir: "",
      file_ext: "",
      file_ba_name: "",
      file_name: "",
    };

    if (ar.file_path === '') {
      Util.showError('获取不到文件路径！');
    } else {
      ar.file_dir = path.dirname(ar.file_path);
      ar.file_ext = path.extname(ar.file_path);
      ar.file_ba_name = path.basename(ar.file_path);
      ar.file_name = ar.file_ba_name.replace(ar.file_ba_name, ar.file_ext)
    }
    return ar;
  }

  static str_replace(strs: string) {
    if (!MessageService.SystemConst || !MessageService.SystemConst.StrReplace) {
      return strs;
    }

    let file_ar = this.file_ar();
    let replace_ar = [
      // { 'v1': "{#DbName}", 'v2': file_ar },
      { 'v1': "{#FiDir}", 'v2': file_ar.file_dir + "/" },
      { 'v1': "{#FiExt}", 'v2': file_ar.file_ext },
      { 'v1': "{#FiBaName}", 'v2': file_ar.file_ba_name },
      { 'v1': "{#FiName}", 'v2': file_ar.file_name },
    ];

    let obj = JSON.parse(JSON.stringify(MessageService.SystemConst.StrReplace));

    for (const key in obj) {
      for (let index = 0; index < replace_ar.length; index++) {
        const v = replace_ar[index];
        obj[key].value = obj[key].value.replace(v.v1, v.v2);
      }
    }

    for (const key in obj) {
      const element = obj[key];

      for (let index = 0; index < 5000; index++) {
        if (element.type == "ltrim") {
          if (strs.trim().substring(0, key.length) === key) {
            strs = element.value + strs.trim().substring(key.length);
          } else {
            break;
          }
        } else if (element.type == "rtrim") {

          if (strs.trim().substring(-key.length) === key) {
            strs = strs.trim().substring(0, strs.trim().length - key.length) + element.value;
          } else {
            break;
          }
        } else if (element.type == "replace") {
          const pos = strs.indexOf(key);
          if (pos != -1) {
            strs = strs.replace(key, element.value);
          } else {
            break;
          }

        } else {
          break;
        }

        if (!element.loop) {
          break;
        }
      }
    }

    return strs;
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
    return (word || "").replace(/^\w/, (m: string) => m.toUpperCase());
  }

  /**
   * 将一个单词首字母转小写并返回
   * @param {*} word 某个字符串
   */
  static lowerFirstLeter(word: any) {
    return (word || "").replace(/^\w/, (m: string) => m.toLowerCase());
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
  static showError(...args: any) {
    let text = "";
    for (const key in args) {
      if (args.hasOwnProperty(key)) {
        const element = args[key];
        if (typeof element === "object") {
          text += JSON.stringify(element);
        } else if (typeof element === "string") {
          text += element;
        } else {
          text += element.toString;
        }
      }
    }
    vscode.window.showErrorMessage(text);
  }

  /**
   * 弹出提示信息
   */
  static showInfo(...args: any) {
    let text = "";
    for (const key in args) {
      if (args.hasOwnProperty(key)) {
        const element = args[key];
        if (typeof element === "object") {
          text += JSON.stringify(element);
        } else if (typeof element === "string") {
          text += element;
        } else {
          text += element.toString;
        }
      }
    }
    vscode.window.showInformationMessage(text);
  }

  static findStrInFolder(folderPath: any, str: any) { }

  /**
   * 从某个文件里面查找某个字符串，返回第一个匹配处的行与列，未找到返回第一行第一列
   * @param filePath 要查找的文件
   * @param reg 正则对象，最好不要带g，也可以是字符串
   */
  static findStrInFile(filePath: any, reg: string | RegExp) {
    const content = fs.readFileSync(filePath, "utf-8");
    reg = typeof reg === "string" ? new RegExp(reg, "m") : reg;
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
      new vscode.Position(pos.row, pos.col + str.length)
    );
  }

  /**
   * 简单的检测版本大小
   */
  static checkVersion(version1: string, version2: string) {
    let val1 = parseInt(version1.replace(/\./g, ""));
    let val2 = parseInt(version2.replace(/\./g, ""));
    return val1 > val2;
  }

  /**
   * 获取某个扩展文件绝对路径
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
   */
  static getExtensionFileAbsolutePath(
    context: { extensionPath: any },
    relativePath: any
  ) {
    return path.join(context.extensionPath, relativePath);
  }

  /**
   * 获取某个扩展文件相对于webview需要的一种特殊路径格式
   * 形如：vscode-resource:/Users/toonces/projects/vscode-cat-coding/media/cat.gif
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
   */
  static getExtensionFileVscodeResource(
    context: { extensionPath: any },
    relativePath: any
  ) {
    const diskPath = vscode.Uri.file(
      path.join(context.extensionPath, relativePath)
    );
    return diskPath.with({ scheme: "vscode-resource" }).toString();
  }

  /**
   * 在Finder中打开某个文件或者路径
   */
  static openFileInFinder(filePath: string) {
    if (!fs.existsSync(filePath)) {
      this.showError("文件不存在：" + filePath);
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
    const jdGuiPath = vscode.workspace
      .getConfiguration()
      .get("eggHelper.jdGuiPath");
    if (!jdGuiPath) {
      this.showError("JD-GUI路径不能为空！");
      return;
    }
    if (!fs.existsSync(jdGuiPath + "")) {
      this.showError(
        "您还没有安装JD-GUI，请安装完后到vscode设置里面找到HSF助手并进行路径配置。"
      );
      return;
    }
    if (!fs.existsSync(jarPath)) {
      this.showError("jar包未找到：" + jarPath);
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
      root.children.forEach((item) => {
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
