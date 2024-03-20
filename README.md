


#### 注意
1. 插件分为客户端和服务端（服务端是window子系统用php、mysql、redis有时间在整理）
2. 单独安装无法工作


### 功能

1. 打开常用文件
    'ctrl+1'
1. 剪贴板，先记录命令再执行，之后可以直接重复执行    不用手动输入
    'ctrl+9'
1. 和上边的差水多， 但对curl做了一些特别处理
    'ctrl+-'
1. 打开本地的 程序手册
    'ctrl+h'
1. 常用的编辑测试文件
    'alt+f3'
1. 打开ide当前光标字符对应的文件
    'alt+f alt+p'
1. 查询文档目录下的文件    
    'alt+f alt+f'
1. 打开文件夹， 子系统或windows
    'alt+f alt+o'
1. 保存，根据配置刷新页面
    'ctrl+s'
1. 在浏览器中访问当前文件
    'alt+f6'
1. 运行当前文件
    'f7'
1. 翻译光标单词或选区单词，句子
    'alt+f alt+a'
1. 打印内容
    'ctrl+shift+g'
1. 打印内容， 停止
    'ctrl+shift+h'
1. 将当前内容在终端执行
    'alt+shift+t'
1. 将当前内容在终端执行， 清空
    'alt+shift+r'
1. 打开项目
    "ctrl+shift+s"
1. 快速连接到远程服务器
    'ctrl+r ctrl+j'
1. 通过sftp打开服务器文件
    'ctrl+r ctrl+u'
1. 上传当前的服务器文件
    'ctrl+r ctrl+p'
1. 复制方法名完整的路径
    'alt+f alt+q'
1. window路径
    'alt+f alt+w'
1. 文件路径+行号
    'alt+f alt+g'
1. 文件路径+搜索字符
    'alt+f alt+t'
1. 终端CD到文件目录
    'alt+f alt+b'
1. 复制-完整文件路径
    'alt+f alt+c'
1. markdown 跳转
    'alt+shift+z'
1. 递增字符
    "ctrl+shift+a"
1. 常用链接2
    'ctrl+shift+r'
1. 项目快速打开 说明
    "shift+alt+1"
1. 项目快速打开 数据库
    "shift+alt+2"
1. 项目快速打开 任务
    "shift+alt+3"
1. 创建文件, 或目录
    'alt+f alt+n'
1. 使用 rsync 上传或下载,文件目录
    'ctrl+r ctrl+y'
1. 当前文件目录
    'alt+f alt+l'
1. 当前项目根目录
    'alt+f alt+j'
1. mysql-查询
    'ctrl+e ctrl+e'
1. mysql-查询-生成创建
    'ctrl+e ctrl+i'
1. mysql-查询-生成修改
    'ctrl+e ctrl+u'
1. 字符--大驼峰
    'ctrl+k ctrl+i'
1. 字符--小驼峰
    'ctrl+k ctrl+o'
1. 字符--下画线
    'ctrl+k ctrl+p'
1. ide 访问记录
    'ctrl+k ctrl+q'
1. 本网站访问记录
    'ctrl+k ctrl+w'
1. 一些小方法
    'ctrl+shift+t'
1. 对应语言的相关文件
    'ctrl+shift+y'
1. 相关语言总列表
    'ctrl+shift+j'
1. 常用命令小方法
    'ctrl+shift+w'
1. 快速代码片段
    'ctrl+shift+q'
    'ctrl+shift+d'
1. 自己的代码库
    "shift+alt+g"
1. 更新文件里的类路径等到命名空间（文件开头）
    "shift+alt+d"
1. 一些文件的快捷打开
    "shift+alt+q"
1. 复制-相对文件路径
    'alt+f alt+d'
1. 复制-只有文件名
    'alt+f alt+r'
1. 复制-文件目录路径
    'alt+f alt+e'
1. 根据文件路径, 打开服务器文件夹
    'ctrl+r ctrl+w'
1. 根据配置相对路径打开, 服务器文件
    'ctrl+r ctrl+o'
1. 根据配置相对路径打开, 服务器文件 上传
    'ctrl+r ctrl+l'




#### 打包  
npm install @vscode/vsce
1. 修改版本  ~+/package.json:5 ::KK "version"
1. ./src/extension.ts ::KK let version
1. 打包      vsce package
1. 安装      /Users/webS/IDE/vscode/vscode-flyskycode/

##### 注意  
1. 打包失败时，可以是 /Users/node_modules 里的文件影响了
`npm install -g cnpm --registry=https://registry.npm.taobao.org`


##### 离线为远程的开发机安装vscode插件
code  --install-extension  /Users/webS/IDE/vscode/vscode-flyskycode/vscode-plugin-flyskycode-0.7.25.vsix




#### 参考文档：
[Microsoft-vscode](https://github.com/Microsoft/vscode/blob/1.12.1/src/vs/workbench/api/node/extHostApiCommands.ts#L207
)

[VS Code 插件开发文档](https://www.bookstack.cn/read/VS-Code-Extension-Doc-ZH/Progress.m)


[语言与亮参考1](https://github.com/microsoft/vscode-extension-samples/blob/main/lsp-embedded-language-service/syntaxes/html1.tmLanguage.json)


[语言与亮参考2]( https://github.com/microsoft/vscode/blob/main/extensions/bat/syntaxes/batchfile.tmLanguage.json)





