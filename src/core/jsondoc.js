import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import utils from './utils.js'

const load = (yamlFile) => {
	const docu = {
		settings: {
			rootPath: '',
			templates: 'templates',
			doc: 'doc',
			html: 'html',
			style: '',
			server: {
				port: 3000,
				bind: '127.0.0.1',
			},
		},
		root: {
			name: '',
			title: '',
			toc: false,
			book:false,
			url: '/',
			templates: {
				node: '@node',
				items: '@item',
			},
			parent: null,
			nodes: [],
			items: [],
		},
	}
	
	if(! fs.existsSync(yamlFile)) return docu

	const yamlDocu = YAML.parse(fs.readFileSync(yamlFile, 'utf8'))
	docu.settings.rootPath = path.resolve(path.dirname(yamlFile))
	if(yamlDocu) {
		if(yamlDocu.templates) docu.settings.templates = yamlDocu.templates
		if(yamlDocu.doc) docu.settings.doc = yamlDocu.doc
		if(yamlDocu.html) docu.settings.html = yamlDocu.html
		if(yamlDocu.style) {
			if(fs.existsSync(path.join(docu.settings.rootPath, docu.settings.html, yamlDocu.style))){
				docu.settings.style = yamlDocu.style
			}
		}
		if(yamlDocu?.server?.port) docu.settings.server.port = yamlDocu.server.port
		if(yamlDocu?.server?.bind) docu.settings.server.bind = yamlDocu.server.bind
	}

	const loadNode = (nodePath, parentNode) => {
		if(! fs.existsSync(path.join(nodePath, '_index.yaml'))) return null

		const nodePathParts = nodePath.split(path.sep)
		const nodeName = (parentNode)?nodePathParts[nodePathParts.length - 1]:'root'
		const node = {
			index: 100,
			name: nodeName,
			title: nodeName,
			toc: true,
			book: true,
			url: (!parentNode)?'/':nodePath.substring(path.join(docu.settings.rootPath, docu.settings.doc).length).replaceAll('\\', '/'),
			templates: {
				node: '@node',
				items: '@item',
			},
			parent: parentNode,
			nodes: [],
			items: [],
		}
		node.getNode = (name) => {
			return getNode(node, name)
		}
		node.getItem = (name) => {
			return getItem(node, name)
		}

		const yamlNode = YAML.parse(fs.readFileSync(path.join(nodePath, '_index.yaml'), 'utf8'))
		if(yamlNode) {
			if(yamlNode.index) node.index = yamlNode.index
			if(yamlNode.title) node.title = yamlNode.title
			if(yamlNode.toc == false) node.toc = yamlNode.toc
			if(yamlNode.book == false) node.book = yamlNode.book
			if(yamlNode?.templates?.node) node.templates.node = yamlNode.templates.node
			if(yamlNode?.templates?.items) node.templates.items = yamlNode.templates.items
			if(yamlNode.headfiles) node.headfiles = yamlNode.headfiles
			if(yamlNode.files) node.files = yamlNode.files
			if(yamlNode.footfiles) node.footfiles = yamlNode.footfiles
		}

		utils.getDirs(nodePath).forEach((directory) => {
			loadNode(path.join(nodePath, directory), node)
		})
		utils.getFiles(nodePath, 'yaml').forEach((file) => {
			if(file !== '_index.yaml') loadItem(path.join(nodePath, file), node)
		})
		
		node.nodes = node.nodes.sort((a, b) => {
			return a.index - b.index
		})

		if(parentNode) parentNode.nodes.push(node)
		else docu.root = node

		return node
	}
	
	const loadItem = (itemPath, parentNode) => {
		const itemPathParts = itemPath.split(path.sep)
		const itemFileName = itemPathParts[itemPathParts.length - 1]
		const itemName = itemFileName.substring(0, itemFileName.length - 5)
		const item = {
			name: itemName,
			title: itemName,
			toc: false,
			book: true,
			url: parentNode.url + '?itm=' + itemName,
			data: {}
		}
		const yamlItem = YAML.parse(fs.readFileSync(itemPath, 'utf8'))
		if(yamlItem) item.data = yamlItem
		if(item.data.name) item.title = item.data.name
		else item.data.name = item.name
		if(!item.data.title) item.data.title = item.title
		if(item.data.toc) item.toc = item.data.toc
		if(item.data.book) item.book = item.data.book
		
		parentNode.items.push(item)
		
		return item
	}

	loadNode(path.join(docu.settings.rootPath, docu.settings.doc))

	return docu
}

const getNode = (node, nodeName) => {
	return node.nodes.find(itm => itm.name === nodeName)
}
const getItem = (node, itemName) => {
	return node.items.find(itm => itm.name === itemName)
}

export default {
	load,
	// getItem,
}
