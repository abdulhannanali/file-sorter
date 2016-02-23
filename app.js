const fs = require("fs")
const readline = require("readline-sync")
const path = require("path")
const colors = require("colors")
const asciify = require("asciify")

const lookup = require("mime-types").lookup

function getDirectory() {
	var directory = path.normalize(readline.question("Enter the directory you want to sort\nThe directory should be normalizable using path.normalize in nodejs\n" .america	))

	if (!directory || directory == "./" || directory == "/" || directory == ".") {
		throw new Error("Sorry! Can't Run in the given directory" .red)
	}

	return directory
}


function init() {
	welcome(function (error) {
		if (!error) {
			var directory = getDirectory()
			sortFiles(directory)
		}
	})

}

function welcome(cb) {
	var welcomeText = "SORT IT"

	asciify(welcomeText, {font: 'univers'}, function (error, res) {
		if (error) {
			cb(error)
		}
		else {
			console.log(`${res}` .rainbow)
			console.log("Visit https://github.com/abdulhannanali/file-sorter for the code's repo and details\n\n\n" .magenta)
			cb()
		}
	})

}

function sortFiles(directory) {
	if (fs.existsSync(directory)) {
		var stats = fs.statSync(directory)
		if (stats.isDirectory()) {
			arrangeFiles(directory)
			sortFilesByMime(directory)
		}
		else {
			console.error("The given path should be of a directory")
		}
	}
	else {
		console.error("No such directory exists")
	}
}

function arrangeFiles(directory) {
	var files = fs.readdirSync(directory)

	// sorting each file accordig to format in it's directory
	// if it's a subdirectory sorting it in a folder called subdirectories
	files.forEach(function (file, index, array) {
		var fileStat = fs.statSync(path.join(directory, file))
		if (fileStat.isDirectory()) {
			transferDirectory(directory, file, fileStat)
		}
		else if(fileStat.isFile()) {
			transferFile(directory, file, fileStat)
		}
	})
}

function sortFilesByMime(directory) {
	var files = fs.readdirSync(directory)
	files.forEach(function (file) {
		var type = lookup(file)	
		if (type) {
			var typeDir = path.join(directory, type.split("/")[0] + "s")
			subDirectory(typeDir)

			fs.renameSync(path.join(directory, file), path.join(typeDir, file))
		}
	})

}

function transferFile(dir, file, stats) {
	var parsedFile = path.parse(file)
	var ext = parsedFile.ext.split(".")[1]

	if (ext) {
		ext = ext.toLowerCase()
	}
	else {
		ext = "misc"
	}

	subDirectory(path.join(dir, ext))
	fs.renameSync(path.join(dir, file), path.join(dir, ext, file))

	console.log("sorting ./" + file .blue + " -> ./" + path.join(ext, file) .green)

	return ext
}

// transfer all the directories to a folder for subdirectories
function transferDirectory(dir, file, stats) {
	var subdirectory = path.join(dir, "subdirectories")
	if (file == "subdirectories" ||
		file == "misc" || 
		lookup(file)) {
		return
	}



	try {
		subDirectory(subdirectory)
		fs.renameSync(path.join(dir, file), path.join(subdirectory, file))	
		console.log(`sorting ${file} -> ${path.join(subdirectory, file)}` .cyan)
	}
	catch (error) {
		console.error(error)
	}

}

function subDirectory(directory) {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory)
		return true
	}

	return false
}

init()

module.exports = init