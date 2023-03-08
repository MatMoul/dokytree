import express from 'express'
import http from 'http'
import os from 'os'
import path from 'path'
import fs from 'fs'
import pug from './pug.js'

const createRouter = (doc, autorefresh) => {
	const router = express.Router()
	const appPath = path.dirname(process.argv[1])
	
	let needrefresh = true
	router.get('/_base.css', (req, res) => {
		res.sendFile(path.join(appPath, 'html', '_base.css'))
	})
	router.get('/autorefresh.json', (req, res) => {
		res.send({
			autorefresh: autorefresh,
			needrefresh: needrefresh,
		})
		needrefresh = false
	})

	const loadRoute = (node) => {
		router.get(node.url, (req, res) => {
			if(req.query.itm) {
				if(req.query.res) {
					// Render Item Resource
					res.sendFile(path.join(doc.settings.rootPath, doc.settings.doc, node.url, req.query.itm + '.' + req.query.res))
				} else {
					// Render Item
					res.send(pug.renderItem(doc, node, node.getItem(req.query.itm)))
				}
			} else if(req.query.book) {
				// Render Book
				res.send(pug.renderBook(doc, node))
			} else {
				if(req.query.res) {
					// Render Node Resource
					res.sendFile(path.join(doc.settings.rootPath, doc.settings.doc, node.url, '_index.' + req.query.res))
				} else {
					// Render Node
					res.send(pug.renderNode(doc, node))
				}
			}
		})
		node.nodes.forEach((childNode) => {
			loadRoute(childNode)
		})
	}
	loadRoute(doc.root)

	if(fs.existsSync(path.join(doc.settings.rootPath, doc.settings.html))) {
		router.use(express.static(path.join(doc.settings.rootPath, doc.settings.html), {maxAge: 1000}))
	}

	return router
}

const create = (doc, srvConfig = {}) => {
	if(!srvConfig.port) srvConfig.port = 3000
	if(!srvConfig.bind) srvConfig.bind = '127.0.0.1'
	const app = express()
	const srv = http.createServer({}, app)
	app.use(createRouter(doc, srvConfig.editMode))
	srv.listen(srvConfig.port, srvConfig.bind, () => {
		const netint = os.networkInterfaces()
		const ipaddress = netint[Object.keys(netint)[1]][0].address
		console.log('Read the doc : http://' + srvConfig.bind.replace('0.0.0.0', ipaddress) + ':' + srvConfig.port)
	})
	return srv
}

export default {
	create,
}
