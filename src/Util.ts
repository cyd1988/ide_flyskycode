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
   * ��ȡ��ǰ���ڹ��̸�Ŀ¼����3��ʹ�÷�����<br>
   * getProjectPath(uri) uri ��ʾ������ĳ���ļ���·��<br>
   * getProjectPath(document) document ��ʾ��ǰ���򿪵��ļ�document����<br>
   * getProjectPath() ���Զ��� activeTextEditor ��document�������û���õ��򱨴�
   * @param {*} document
   */
  static getProjectPathP(document: any) {
    if (!document) {
      document = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document
        : null;
    }
    if (!document) {
      // this.showError('��ǰ����ı༭�������ļ�����û���ļ����򿪣�');
      return "";
    }
    const currentFile = (document.uri ? document.uri : document).fsPath;
    let projectPath = null;

    let list = vscode.workspace.workspaceFolders;
    let workspaceFolders: any[] = [];
    if (list) {
      workspaceFolders = list.map((item) => item.uri.path);
    }
    // ���ڴ���Multi-root����������ʱû���ر�õ��жϷ������������ֱ��ж�
    // �������ֻ��һ�����ļ��У���ȡ�����ļ�����Ϊ workspaceFolders
    if (
      workspaceFolders.length === 1 &&
      workspaceFolders[0] === vscode.workspace.rootPath
    ) {
      const rootPath = workspaceFolders[0];
      var files = fs.readdirSync(rootPath);
      workspaceFolders = files
        .filter((name) => !/^\./g.test(name))
        .map((name) => path.resolve(rootPath, name));
      // vscode.workspace.rootPath �᲻׼ȷ�����ѹ�ʱ
      // return vscode.workspace.rootPath + '/' + this._getProjectName(vscode, document);
    }
    workspaceFolders.forEach((folder) => {
      if (currentFile.indexOf(folder) === 0) {
        projectPath = folder;
      }
    });
    if (!projectPath) {
      this.showError("��ȡ���̸�·���쳣��");
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
      // this.showError('��ǰ����ı༭�������ļ�����û���ļ����򿪣�');
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
      this.showError("��ȡ���̸�·���쳣��");
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
   * ��ȡ��ǰ��һ��ѡ�����ݣ���ǰ��һ��ѡ������������
   * @param editor
   */
  static getSelecttextLineOne(
    editor: vscode.TextEditor | undefined = undefined
  ) {
    let files: string;
    // ��ȡ��ǰ�༭������
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
   * ��ȡ��ǰ��һ��ѡ�����ݣ���ǰ��һ��ѡ������������
   * @param editor
   */
  static getSelecttextLine(editor: vscode.TextEditor | undefined = undefined) {
    let files: string;
    // ��ȡ��ǰ�༭������
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
    //ָ����ʽ�ַ�
    var cfg: any = {
      yyyy: date.getFullYear(), //�� : 4λ
      yy: date.getFullYear().toString().substring(2),//�� : 2λ
      M: date.getMonth() + 1,  //�� : ���1λ��ʱ�򲻲�0
      MM: paddNum(date.getMonth() + 1), //�� : ���1λ��ʱ��0
      d: date.getDate(),   //�� : ���1λ��ʱ�򲻲�0
      dd: paddNum(date.getDate()),//�� : ���1λ��ʱ��0
      hh: date.getHours(),  //ʱ
      mm: date.getMinutes(), //��
      ss: date.getSeconds(), //��
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
      //####  �������е�ʱ��
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
   *  ���ֵ��༭�� terminal ����
   *
   */
  static run_terminal(data: any) {
    let fig: any = {
      pwd: "", // ��ǰ·��
      clear: 1, // ���֮ǰ����
      val: "", // Ҫִ�е�����
      rest_focus: 0, // ����ص��༭��
    };
    fig = Util.merge(true, fig, data);

    let text = fig.val;

    vscode.commands
      .executeCommand("workbench.action.terminal.toggleTerminal")
      .then((sucess) => {

        vscode.commands.executeCommand("workbench.action.terminal.focus"); // �۽��նˡ����������л���������ն˿ɼ�����۽��ն˶�������������

        if (fig.scrollToBottom == 1) {
          vscode.commands.executeCommand("workbench.action.terminal.scrollToBottom"); // �������ײ�
        }

        if (fig.clear == 1) {
          vscode.commands.executeCommand("workbench.action.terminal.clear"); // �������̨
        }

        vscode.commands
          .executeCommand("workbench.action.terminal.sendSequence", {
            text: text,
          })
          .then((sucess) => {
            // �ص�����
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
    return Promise.resolve("���н���");
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

  static getWorkspaceName() {
    let name = 'runIde';
    let tm = Util.getWorkspaceFolders(1);
    if (tm.length > 0) {
      name = tm[0].substring(tm[0].length - 8);
      name = name.replace(/\\/g, "-").replace(/\//g, "-");
    }
    return name;
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

      let strval = tm[1] + '';

      // co nsole.log('start: ', strval);


      let tt = strval.match(/^#+ ?[^ ]+ +([^ ]*)$/i);

      // co nsole.log('^#+ ?[^', tt);
      if (tt) strval = tt[1].trim();

      // co nsole.log('1. ', strval.substring(0, 3), strval.substring(0, 3) == '1. ');

      if (strval.substring(0, 3) == '1. ') {
        tt = strval.substring(3).match(/[^ ]+ +(.*)/i);
        if (tt) {
          strval = tt[1].trim();
        } else {
          strval = strval.substring(3).trim();

        }
      }

      // co nsole.log('$ ', strval.substring(0, 2), strval.substring(0, 2) == '$ ');

      if (strval.substring(0, 2) == '$ ') {
        tt = strval.substring(2).match(/[^ ]+ +(.*)/i);
        if (tt) strval = tt[1].trim();
      }


      // co nsole.log('end: ', strval);


      data[0] = strval;

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
   * �Զ�����ȵ�����ϲ�
   * @param args ����
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
      Util.showError('��ȡ�����ļ�·����');
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
          if (key == '#' && strs.indexOf(' ::KK ') != -1) break;
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
   * ��һ����������ĸ��д������
   * @param {*} word ĳ���ַ���
   */
  static upperFirstLetter(word: any) {
    return (word || "").replace(/^\w/, (m: string) => m.toUpperCase());
  }

  /**
   * ��һ����������ĸתСд������
   * @param {*} word ĳ���ַ���
   */
  static lowerFirstLeter(word: any) {
    return (word || "").replace(/^\w/, (m: string) => m.toLowerCase());
  }

  /**
   * ȫ����־���أ�����ʱ����ע�͵���־���
   */
  static log(...args: any) {
    console.log(...args);
  }

  /**
   * ȫ����־���أ�����ʱ����ע�͵���־���
   */
  static error(...args: any) {
    console.error(...args);
  }

  /**
   * ����������Ϣ
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
   * ������ʾ��Ϣ
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
   * ��ĳ���ļ��������ĳ���ַ��������ص�һ��ƥ�䴦�������У�δ�ҵ����ص�һ�е�һ��
   * @param filePath Ҫ���ҵ��ļ�
   * @param reg ���������ò�Ҫ��g��Ҳ�������ַ���
   */
  static findStrInFile(filePath: any, reg: string | RegExp) {
    const content = fs.readFileSync(filePath, "utf-8");
    reg = typeof reg === "string" ? new RegExp(reg, "m") : reg;
    // û�ҵ�ֱ�ӷ���
    if (content.search(reg) < 0) {
      return { row: 0, col: 0 };
    }
    const rows = content.split(os.EOL);
    // ���в���ֻΪ���õ���
    for (let i = 0; i < rows.length; i++) {
      let col = rows[i].search(reg);
      if (col >= 0) {
        return { row: i, col };
      }
    }
    return { row: 0, col: 0 };
  }

  /**
   * ��ȡĳ���ַ������ļ����һ�γ���λ�õķ�Χ��
   */
  static getStrRangeInFile(filePath: any, str: string) {
    var pos = this.findStrInFile(filePath, str);
    return new vscode.Range(
      new vscode.Position(pos.row, pos.col),
      new vscode.Position(pos.row, pos.col + str.length)
    );
  }

  /**
   * �򵥵ļ��汾��С
   */
  static checkVersion(version1: string, version2: string) {
    let val1 = parseInt(version1.replace(/\./g, ""));
    let val2 = parseInt(version2.replace(/\./g, ""));
    return val1 > val2;
  }

  /**
   * ��ȡĳ����չ�ļ�����·��
   * @param context ������
   * @param relativePath ��չ��ĳ���ļ�����ڸ�Ŀ¼��·������ images/test.jpg
   */
  static getExtensionFileAbsolutePath(
    context: { extensionPath: any },
    relativePath: any
  ) {
    return path.join(context.extensionPath, relativePath);
  }

  /**
   * ��ȡĳ����չ�ļ������webview��Ҫ��һ������·����ʽ
   * ���磺vscode-resource:/Users/toonces/projects/vscode-cat-coding/media/cat.gif
   * @param context ������
   * @param relativePath ��չ��ĳ���ļ�����ڸ�Ŀ¼��·������ images/test.jpg
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
   * ��Finder�д�ĳ���ļ�����·��
   */
  static openFileInFinder(filePath: string) {
    if (!fs.existsSync(filePath)) {
      this.showError("�ļ������ڣ�" + filePath);
    }
    // �����Ŀ¼��ֱ�Ӵ򿪾ͺ�
    if (fs.statSync(filePath).isDirectory()) {
      exec(`open ${filePath}`);
    } else {
      // ������ļ���Ҫ�ֿ�����
      const fileName = path.basename(filePath);
      filePath = path.dirname(filePath);
      // �����д����ƣ�����֪�����finder�����ѡ���ļ�
      exec(`open ${filePath}`);
    }
  }

  /**
   * ��vscode�д�ĳ���ļ�
   * @param {*} path �ļ�����·��
   * @param {*} text ��ѡ�������Ϊ�գ���ѡ�е�һ��ƥ��Ķ�Ӧ����
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
   * ��JD-GUI��jar��
   */
  static openJarByJdGui(jarPath: string) {
    // ���ѡ���ļ��д�����
    const jdGuiPath = vscode.workspace
      .getConfiguration()
      .get("eggHelper.jdGuiPath");
    if (!jdGuiPath) {
      this.showError("JD-GUI·������Ϊ�գ�");
      return;
    }
    if (!fs.existsSync(jdGuiPath + "")) {
      this.showError(
        "����û�а�װJD-GUI���밲װ���vscode���������ҵ�HSF���ֲ�����·�����á�"
      );
      return;
    }
    if (!fs.existsSync(jarPath)) {
      this.showError("jar��δ�ҵ���" + jarPath);
      return;
    }
    exec(`open ${jarPath} -a ${jdGuiPath}`);
  }

  /**
   * ʹ��Ĭ��������д�ĳ��URL
   */
  static openUrlInBrowser(url: any) {
    exec(`open '${url}'`);
  }

  /**
   * �ݹ�������ĳ����Դ��require����
   * @param {*} absolutePath
   */
  static clearRequireCache(absolutePath: string) {
    const root = require.cache[absolutePath];
    if (!root) {
      return;
    }
    if (root.children) {
      // �����������������������Ļ���
      root.children.forEach((item) => {
        this.clearRequireCache(item.id);
      });
    }
    delete require.cache[absolutePath];
  }

  /**
   * ��̬require������ͨrequire��ͬ���ǣ�����֮ǰ���ȳ���ɾ������
   * @param {*} modulePath
   */
  static dynamicRequire(modulePath: string) {
    this.clearRequireCache(modulePath);
    return require(modulePath);
  }




  static is_window() {
    let back = true;
    if (os.platform() == 'linux') {
      back = false;
    }
    return back;
  }







  // /**
  //  * ��ȡproperties�ļ�
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
  //  * �Ƚ�2������תJSON�ַ������Ƿ���ȫһ��
  //  * �ر�ע�⣬����JS��������������ԣ�����������ǰ������˳������ģ�����ͬ���Ķ���
  //  * ת��JSON��֮�󷴶���һ���������������������ʽʵ�֡�
  //  * @param {*} obj1
  //  * @param {*} obj2
  //  */
  // jsonEquals(obj1: any, obj2: any) {
  //     let s1 = this.formatToSpecialJSON(obj1, '', true);
  //     let s2 = this.formatToSpecialJSON(obj2, '', true);
  //     return s1 === s2;
  // }
}
