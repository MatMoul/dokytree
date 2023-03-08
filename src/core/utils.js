import fs from 'fs'
import path from "path"
import util from "util"

const deeplog = (obj) => {
	console.log(util.inspect(obj, {showHidden: false, depth: null}))
}

const getDirs = (dir) => {
	if (! fs.existsSync(dir)) return []
	return fs.readdirSync(dir, {
			withFileTypes: true
	}).reduce((a, b) => {
			b.isDirectory() && a.push(b.name)
			return a
	}, [])
}
const getFiles = (dir, ext) => {
	if (! fs.existsSync(dir)) return []
	return fs.readdirSync(dir, {
			withFileTypes: true
	}).reduce((a, b) => {
			if(b.isFile()) {
				if(!ext) a.push(b.name)
				else if(path.extname(b.name) === "." + ext) a.push(b.name)
			}
			return a
	}, [])
}

const compareIP = (ip1, ip2) => {
	const ip_1 = ip1.split(".")
	const ip_2 = ip2.split(".")
	if(ip_1.length < 4) return -1
	if(ip_2.length < 4) return 1
	if (parseInt(ip_1[0]) > parseInt(ip_2[0])) return 1
	else if (parseInt(ip_1[0]) < parseInt(ip_2[0])) return -1
	if (parseInt(ip_1[1]) > parseInt(ip_2[1])) return 1
	else if (parseInt(ip_1[1]) < parseInt(ip_2[1])) return -1
	if (parseInt(ip_1[2]) > parseInt(ip_2[2])) return 1
	else if (parseInt(ip_1[2]) < parseInt(ip_2[2])) return -1
	if (parseInt(ip_1[3]) > parseInt(ip_2[3])) return 1
	else if (parseInt(ip_1[3]) < parseInt(ip_2[3])) return -1
	return 0
}

const module = {}
module.deeplog = deeplog
module.getDirs = getDirs
module.getFiles = getFiles
module.compareIP = compareIP
export default module
