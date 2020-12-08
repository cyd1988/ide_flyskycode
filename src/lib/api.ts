import { Util } from '../Util';
import { apiModel } from './../lib/apiModel';
import { Config } from './../configurations/config';


export class Api {
	static ROOT_DIR: string | null;
	// static resa(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, res: any, args: any) {
	//     let position_ins: vscode.Position = new vscode.Position(1, 0);
	//     edit.insert(position_ins, 'text');  //代替文本,插入文本
	// }
	static res(res: any, args?: any) {
		let that = this;
		function ruPost() {
			res.data = Api.argsRun(res.data);
			if (res.data.hasOwnProperty('run')) {
				that.run(res.data);
			}
		}
		if (res.data.hasOwnProperty('save')) {
			Util.docSave().then(ruPost);
		} else {
			ruPost();
		}
	}

	static argsRun(args: any) {
		for (const key in args) {
			if (args.hasOwnProperty(key)) {
				let val = args[key] + '';
				if (val === 'VS-LINE') {
					args[key] = Util.getSelecttextLine().trim();

				} else if (val === 'VS-SELECT-LINE-ONE') {
					args[key] = Util.getSelecttextLineOne().trim();

				} else if (val === 'VS-FILE_DIR') {
					args[key] = Util.getDirname(Util.getProjectPath()) + '/';
					if (args[key] === '/') {
						Util.showError('获取不到文件目录！');
					}

				} else if (val === 'VS-FILE_PATH') {
					args[key] = Util.getProjectPath();
					if (args[key] === '') {
						Util.showError('获取不到文件路径！');
					}

				} else if (val === 'VS-DIRS') {
					args[key] = Util.getWorkspaceFolders();
					if (args[key] === '') {
						Util.showError('获取不到文件路径！');
					}

				} else if (val === 'VS-DIRS-SOURCE') {
					args[key] = Util.getWorkspaceFolders(1);
					if (args[key] === '') {
						Util.showError('获取不到文件路径！');
					}

				} else if (val.substr(0, 15) === 'VS-SELECT-LINE-') {  // VS-SELECT-LINE-5
					let len = parseInt(val.replace('VS-SELECT-LINE-', ''));
					args[key] = Util.SELECT_LINES(len);

				} else if (val === 'VS-SELECT-LINES') {
					args[key] = Util.SELECT_LINES();

				} else if (val === 'VS-LANGUAGE_ID') {
					args[key] = Util.getLanguageId();

				} else if (val === 'VS-SELECTED_TEXT') {
					args[key] = Util.getSelectedText();
				}
			}
		}
		return args;
	}




	static run(data: any, old_data: any = {}) {

		if (!data.hasOwnProperty('run') || !data.hasOwnProperty(data['run'])) {
			console.log('data', data);
			Util.showError('属性不存在-' + data.string);
			return;
		}

		if (data.hasOwnProperty('run_sleep') && data['run_sleep'] > 0) {
			let tm = data['run_sleep'];
			data['run_sleep'] = 0;
			setTimeout(function () {
				data = Api.argsRun(data);
				Api.run(data);
			}, tm);
			return;
		}


		if (data['run'] === 'api') {
			apiModel.r_api(data[data['run']]);

		} else if (data.run === 'lists' || data.run === 'ecs_lists') {
			apiModel.r_list(data[data['run']], data['run']);

		} else if (data.run === 'input') {
			apiModel.r_input(data[data['run']]);

		} else if (data.run === 'open_file') {
			apiModel.r_open_file(data[data['run']]);

		} else if (data.run === 'run_shell') {
			apiModel.r_run_shell(data[data['run']]);

		} else if (data.run === 'outputChannel') {
			apiModel.r_outputChannel(data[data['run']]);

		} else if (data.run === 'setJson') {
			apiModel.r_setJson(data[data['run']]);

		} else if (data.run === 'insert') {
			apiModel.r_insert(data[data['run']]);

		} else if (data.run === 'set_selections') {
			apiModel.r_set_selections(data[data['run']]);

		} else if (data.run === 'demo_edit') {
			apiModel.r_demo_edit(data[data['run']]);

		} else if (data.run === 'diff') {
			apiModel.r_diff(data[data['run']]);

		} else if (data.run === 'editSnippet') {
			apiModel.r_editSnippet(data[data['run']]);

		} else if (data.run === 'move_file') {
			apiModel.r_move_file(data[data['run']]);

		} else if (data.run === 'getText') {
			apiModel.r_getText(data[data['run']], data);

		} else if (data.run === 'saveText') {
			apiModel.r_saveText(data[data['run']], data);

		} else if (data.run === 'get_clipboard') {
			apiModel.r_get_clipboard(data[data['run']], data);

		} else if (data.run === 'set_clipboard') {
			apiModel.r_set_clipboard(data[data['run']], data);

		} else if (data.run === 'run_exec') {
			apiModel.r_run_ide_exec(data[data['run']], data);

		} else {
			console.log('没找到方法：api.run.data', data);
		}

		// 执行子 run 方法
		if (data.run !== 'input') {
			let new_data = data[data['run']];
			if (new_data.hasOwnProperty('run')) {
				this.run(new_data);
			}
		}
	}



}






export function ApiRun(args: any) {

	if (!args.u) {
		let tm = args;
		args = { 'p': tm, 'u': '/init' };
	}

	// 测试
	if (args.p.hasOwnProperty('key') && args.p.key == 'ctrl+shift+alt+p') {


		// let execution = new vscode.CustomExecution((terminalRenderer, cancellationToken, args): Thenable<number> => {
		//         return new Promise<number>(resolve => {
		//             // This is the custom task callback!
		//             resolve(0);
		//         });
		//     });
		// const taskName = "First custom task";
		// let task = new vscode.Task2(kind, vscode.TaskScope.Workspace, taskName, taskType, 
		// execution);


		// function getTask() {
		//     const taskDef = {
		//         type: 'shell'
		//     };
		//     const execution = new vscode.ShellExecution('chdir', {
		//         cwd: 'C:\\Windows\\System32'
		//     }); 
		//     return new vscode.Task(taskDef, 'print_cwd', 'myext', execution);
		// }


		// export function activate(context) {
		//     context.subscriptions.push(vscode.tasks.registerTaskProvider('myext', {
		//         provideTasks: () => [getTask()],
		//         resolveTask(_task: vscode.Task): vsocde.Task | undefined => undefined,
		//     });
		// }

		// Util.exec('ps -ef',{},function(error :any, stdout: Buffer, stderr: Buffer){
		//   console.log( '----' );
		//   console.log( stdout );
		//   console.log( error );
		// });

		console.log(434343);


		let data_tm = {
			'run': 'run_exec',
			'run_exec': {
				// 'bash': 'pwd',
				'bash': 'zeal "dash-plugin://query=getenv&keys=php,wordpress,drupal,zend,laravel,yii,joomla,ee,codeigniter,cakephp,phpunit,symfony,typo3,twig,smarty,craft,phpp,html,statamic,mysql,sqlite,mongodb,psql,redis"',
				'opts': {
					'cwd': '/Users/'
				}
				// 'p': args.p
			}
		};
		Api.run(data_tm);

		return;


		// console.log( 434343 );

		// apiModel.r_getText([
		//   {
		//     line: 2,
		//     char: 0,
		//     end_line: 8,
		//     end_char: 0,
		//   },
		// ]
		//   , {});

		// return;


		apiModel.r_open_file({
			file: '/Users/webS/www/mynotes/web/test/test.md',
			line: 0,
			KK: '陈斌',
		});
	}

	if (args.p.hasOwnProperty('key')) {
		args.p.run_keyboard = args.p.key;
	}

	if (args.p.hasOwnProperty('key') && Config.sGet(args.p.key, false)) {
		const keys = args.p.key;
		args = JSON.parse(JSON.stringify(Config.sGet(args.p.key)));

		if (args.run && args[args.run].p) {
			args[args.run].p.run_keyboard = keys;
			args[args.run].p.keys = keys;
		}
	}

	function ruPost() {
		args.p = Api.argsRun(args.p);
		if (args.run) {
			Api.run(args);
		} else {
			let data_tm = {
				'run': 'api',
				'api': {
					'u': args.u,
					'p': args.p
				}
			};
			Api.run(data_tm);
		}
	}

	if (args.save) {
		Util.docSave().then(ruPost);
	} else {
		ruPost();
	}
}
