import fs from 'fs'
import path from 'path'
import pug from 'pug'
import mdit from 'markdown-it'
import { JSDOM } from 'jsdom'
import utils from './utils.js'

const appPath = path.dirname(process.argv[1])
const mainFileName = path.join(appPath, 'pug', 'main.pug')
const mainFile = fs.readFileSync(mainFileName)
const defaultEmptyFileName = path.join(appPath, 'pug', 'empty.pug')
const defaultEmptyFile = fs.readFileSync(defaultEmptyFileName)
const defaultIndexFileName = path.join(appPath, 'pug', 'index.pug')
const defaultIndexFile = fs.readFileSync(defaultIndexFileName)
const defaultOverviewFileName = path.join(appPath, 'pug', 'overview.pug')
const defaultOverviewFile = fs.readFileSync(defaultOverviewFileName)
const defaultNodeFileName = path.join(appPath, 'pug', 'node.pug')
const defaultNodeFile = fs.readFileSync(defaultNodeFileName)
const defaultItemFileName = path.join(appPath, 'pug', 'item.pug')
const defaultItemFile = fs.readFileSync(defaultItemFileName)

const renderFiles = (doc, node, files, item) => {
	let html = ''
	const prefix = (item)?item.name + '.':'_index.'
	files?.forEach(file => {
		const filePath = path.join(doc.settings.rootPath, doc.settings.doc, node.url, prefix + file)
		switch(path.extname(file)) {
			case '.pug':
				const data = {
					filename: filePath,
					path: path,
					doc: doc.root,
					node: node,
				}
				if(item) {
					data.item = item
					html += pug.render(fs.readFileSync(filePath, 'utf8'), data)
				} else {
					html += pug.render(fs.readFileSync(filePath, 'utf8'), data)
				}
				break
			case '.html':
				html += fs.readFileSync(filePath, 'utf8')
				break
			case '.txt':
			case '.adoc':
				html += '<div class="itemvmargin monospace">' + fs.readFileSync(filePath, 'utf8').replaceAll('\n', '<br>') + '</div>'
				break
			case '.md':
				html += new mdit().render(fs.readFileSync(filePath, 'utf8'))
				break
			case '.svg':
			case '.png':
			case '.jpg':
			case '.jpeg':
			case '.gif':
			case '.bmp':
				if(item) {
					html += '<img class="itemvmargin largeimage" src="' + node.url + '?itm=' + item.name + '&res=' + file + '">'
				} else {
					html += '<img class="itemvmargin largeimage" src="' + node.url + '?res=' + file + '">'
				}
				break
		}
	})
	return html
}

const renderMain = (doc, node, content, item) => {
	const data = {
		filename: mainFileName,
		path: path,
		settings: doc.settings,
		doc: doc.root,
		node: node,
	}
	if(item) data.item = item
	const mainHtml = pug.render(mainFile, data)
	return mainHtml.replace('<div id="CONTENT"></div>', content)
}

const renderNodePart = (doc, node) => {
	let nodeFile = defaultNodeFile
	let views = ''
	switch(node.templates.node) {
		case '@empty':
			nodeFile = defaultEmptyFile
			break
		case '@index':
			nodeFile = defaultIndexFile
			break
		// case '@item':
		//	 nodeFile = defaultItemFile
		//	 break
		case '@overview':
			node.nodes.forEach((childNode) => {
				views += '<div class="section">'
				views += '<h2>' + childNode.title + '</h2>'
				views += renderNodePart(doc, childNode)
				views += '</div>'
			})
			nodeFile = defaultOverviewFile
			break
		case '@node':
			break
		default:
			const nodeFileName = path.join(doc.settings.rootPath, doc.settings.templates, node.templates.node + '.pug')
			nodeFile = fs.readFileSync(nodeFileName)
	}
	let nodeHtml = pug.render(nodeFile, {
		filename: defaultNodeFileName,
		path: path,
		compareIP: utils.compareIP,
		doc: doc.root,
		node: node,
	})
	nodeHtml = nodeHtml.replace('<div id="VIEWS"></div>', views)
	nodeHtml = nodeHtml.replace('<div id="HEADFILES"></div>', renderFiles(doc, node, node.headfiles))
	nodeHtml = nodeHtml.replace('<div id="FILES"></div>', renderFiles(doc, node, node.files))
	nodeHtml = nodeHtml.replace('<div id="FOOTFILES"></div>', renderFiles(doc, node, node.footfiles))
	return nodeHtml
}
const renderNode = (doc, node) => {
	return renderMain(doc, node, renderNodePart(doc, node))
}

const renderItemPart = (doc, node, item) => {
	let itemFile = defaultItemFile
	switch(node.templates.items) {
		case '@none':
			return ''
		case '@empty':
			itemFile = defaultEmptyFile
			break
		case '@index':
			itemFile = defaultIndexFile
			break
		case '@item':
			// itemFile = defaultItemFile
			break
		default:
			const itemFileName = path.join(doc.settings.rootPath, doc.settings.templates, node.templates.items + '.pug')
			itemFile = fs.readFileSync(itemFileName)
	}
	let itemHtml = pug.render(itemFile, {
		filename: defaultItemFileName,
		path: path,
		compareIP: utils.compareIP,
		doc: doc.root,
		node: node,
		item: item.data,
	})
	itemHtml = itemHtml.replace('<div id="HEADFILES"></div>', renderFiles(doc, node, item.data.headfiles, item))
	itemHtml = itemHtml.replace('<div id="FILES"></div>', renderFiles(doc, node, item.data.files, item))
	itemHtml = itemHtml.replace('<div id="FOOTFILES"></div>', renderFiles(doc, node, item.data.footfiles, item))
	return itemHtml
}
const renderItem = (doc, node, item) => {
	return renderMain(doc, node, renderItemPart(doc, node, item), item)
}

const renderBook = (doc, node) => {
	let htmlBook = ''

	const readPage = (curNode, curItem) => {
		if(curItem) {
			// Item
			if(curNode.templates.items !== '@none') {
				htmlBook += '<div class="section">'
				htmlBook += '<h1 id="' + (curNode.url + '_' + curItem.name).replace('/', '').replaceAll('/', '_') + '">' + curItem.title + '</h1>'
				htmlBook += renderItemPart(doc, curNode, curItem)
				htmlBook += '</div>'
			}
		} else {
			// Node
			if(curNode.book === true) {
				if(htmlBook) {
					htmlBook += '<div class="pagebreakbefore pagebreak">'
					htmlBook += '<div class="section">'
					htmlBook += '<h1 id="' + (curNode.url).replace('/', '').replaceAll('/', '_') + '">' + curNode.title + '</h1>'
				} else {
					htmlBook += '<div>'
					htmlBook += '<div class="section">'
				}
				// if(htmlBook) htmlBook += '<div class="pagebreakbefore"></div>'
				// if(htmlBook) htmlBook += '<h1 id="' + (curNode.url).replace('/', '').replaceAll('/', '_') + '">' + curNode.title + '</h1>'
				htmlBook += renderNodePart(doc, curNode)
				htmlBook += '</div>'
				htmlBook += '</div>'
				curNode.nodes.forEach((childNode) => {
					readPage(childNode)
				})
				curNode.items.forEach((item) => {
					readPage(curNode, item)
				})
			}
		}
	}
	readPage(node)
	
	htmlBook = htmlBook.replaceAll('h5>', 'h6>')
	htmlBook = htmlBook.replaceAll('h4>', 'h5>')
	htmlBook = htmlBook.replaceAll('h3>', 'h4>')
	htmlBook = htmlBook.replaceAll('h2>', 'h3>')
	htmlBook = htmlBook.replaceAll('h1>', 'h2>')
	
	htmlBook = renderMain(doc, node, htmlBook)
	
	const htmlDom = new JSDOM(htmlBook)
	htmlDom.window.document.querySelectorAll('a').forEach((lnk) => {
		if(lnk.href.startsWith('/')) {
			lnk.href = lnk.href.replace('/', '.?book=true#').replaceAll('/', '_').replaceAll('?itm=', '_')
		}
	})
	
	return htmlDom.serialize()
}

export default {
	renderMain,
	renderNode,
	renderItem,
	renderBook,
}
