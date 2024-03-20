  
  
  
  
https://github.com/Microsoft/vscode/blob/1.12.1/src/vs/workbench/api/node/extHostApiCommands.ts#L207
  
1. 文档
https://www.bookstack.cn/read/VS-Code-Extension-Doc-ZH/Progress.md
  
  
https://github.com/microsoft/vscode-extension-samples/blob/main/lsp-embedded-language-service/syntaxes/html1.tmLanguage.json
https://github.com/microsoft/vscode/blob/main/extensions/bat/syntaxes/batchfile.tmLanguage.json
  
  
  
  
# vscode-markdown-preview-enhanced
code /Users/webS/IDE/vscode/vscode-markdown-preview-enhanced-master
/Users/webS/IDE/vscode/vscode-markdown-preview-enhanced-master/markdown-preview-enhanced-1.0.0.vsix
  
  
  
  
  
  
  
remote.origin.url=www@42.194.212.191:/sy/git/ide_flyskycode.git
  
  
  
https://github.com/cyd1988/ide_flyskycode.git
  
git remote add origin https://github.com/cyd1988/ide_flyskycode.git
git branch -M main
git push -u origin main
  
  
  
  
  
  
npm install @vscode/vsce
## 修改版本  ~+/package.json:5 ::KK "version"
## ./src/extension.ts ::KK let version
## 打包      vsce package
## 安装      /Users/webS/IDE/vscode/vscode-flyskycode/
  
# 注意  
1. 打包失败时，可以是 /Users/node_modules 里的文件影响了
  
  
npm install -g cnpm --registry=https://registry.npm.taobao.org
  
  
离线为远程的开发机安装vscode插件
code --extensions-dir ~/.vscode-server/extensions/ --install-extension  /Users/webS/IDE/vscode/vscode-flyskycode/vscode-plugin-flyskycode-0.7.22.vsix
  
code  --install-extension  /Users/webS/IDE/vscode/vscode-flyskycode/vscode-plugin-flyskycode-0.7.25.vsix
  
  
  
  
  
  