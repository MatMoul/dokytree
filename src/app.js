const startDate = new Date()

import chokidar from 'chokidar'
import jsondoc from './core/jsondoc.js'
import server from './core/server.js'

const args = process.argv.slice(2)
if(args.length == 0) args.push('./doc.yaml')

const srvConfig = {
	bind: '127.0.0.1',
	port: 3000,
	editMode: true,
}

for(let i = 0; i < args.length; i++) {
	switch(args[i]) {
		case '--help':
			console.log('Usage :')
			console.log('node app.js [args] filename')
			console.log('-p | --port     Set listen port (default : 3000)')
			console.log('-b | --bind     Set listen ip (default : 127.0.0.1)')
			// console.log('-e | --edit     Enable autorefresh on change')
			// i = args.length
			process.exit()
		case '-p':
		case '--port':
			i++
			srvConfig.port = args[i]
			break
		case '-b':
		case '--bind':
			i++
			srvConfig.bind = args[i]
			break
		/*
		case '-e':
		case '--edit':
			srvConfig.editMode = true
			break
		*/
	}
}

let runningServer
let doc
const loadAndRun = () => {
	const docFilename = args[args.length - 1]
	console.log(docFilename)
	doc = jsondoc.load(docFilename)
	if(doc) {
		runningServer = server.create(doc, srvConfig)
	}
}
loadAndRun()

if(runningServer) {
	const watcher = chokidar.watch(doc.settings.rootPath, {
		ignored: /(^|[\/\\])\../, // ignore dotfiles
		persistent: true,
	})
	watcher.on('change', (path) => {
		console.log(`File ${path} has been changed`)
		runningServer.closeAllConnections() // NodeJS 18+ :
		runningServer.close(() => {
			loadAndRun()
		})
	})
}

const endDate = new Date()
console.log('Load time : ' + (endDate - startDate) + ' ms')

console.log('')
console.log('For drawing graph, you can use :')
console.log('https://new.draw.io/')
console.log('')
console.log('For exporting as static site :')
console.log('wget -r -nc -p -k -np http://127.0.0.1:3000/')
console.log('')
