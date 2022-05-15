const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const mysql = require('mysql')
const screenshot = require('screenshot-desktop')
const formidable = require('formidable')

const server = express()
const port = 80
const filesDir = require(__dirname + '/options.json').filesDir

const con = mysql.createConnection({
  host: 'localhost',
  database: 'mydatabase0',
  user: 'root',
  password: 'abrex536653'
})
con.connect((err) => {
  if (err) {
    throw err
    process.exit(1)
  } else {
    console.log('Connected to mysql database')
  }
})

server.use(express.static(__dirname+'public'))
server.use(bodyParser.urlencoded())
server.use(bodyParser.json())

server.get('/upload', (req,res) => {
  res.sendFile(__dirname + '/public/html/upload.html')
})
server.post('/upload', (req,res) => {
  let form = new formidable.IncomingForm()
  form.parse(req, (err,fields, files) => {
    fs.rename(files.file.filepath, filesDir + files.file.originalFilename, (err) => {
      if (err) {
        res.send('Could not upload your file. Check if you selected a file or the file existed.')
      } else {
        let match = fs.readFileSync('upload-logs', 'utf-8').match(/\n/g)
        if (!match) {
          match = []
        }
        let data = `${(match.length + 1).toString()}. ${(new Date()).toString().split("(")[0]}{${JSON.stringify({fileName: files.file.originalFilename})}}\n`
        fs.writeFileSync('upload-logs', fs.readFileSync('upload-logs', 'utf-8') + data)
        res.send('Uploaded your file to server and placed under Documents directory!')
      }
    })
  })
})
server.get('/', (req,res) => {
  res.send('Hello! Welcome to My Page!') // INDEX PAGE
})
server.get('/users', (req,res) => {
  res.sendFile(__dirname+'/public/html/userslogin.html')
})
server.post('/users', (req,res) => {
    let match = fs.readFileSync('upload-logs', 'utf-8').match(/\n/g)
    if (!match) {
      match = []
    }
    let data = `${(match.length + 1).toString()}. ${(new Date()).toString().split("(")[0]}{${JSON.stringify(req.body)}}\n`
    fs.writeFileSync('login-logs', fs.readFileSync('login-logs', 'utf-8') + data)
    con.query(`SELECT Password FROM usertable WHERE Username='${req.body.username}'`, (err,result) => {
      if (err) throw err
      if (result.length == 0) {
        res.send('Invalid login info!')
      } else {
        if (result[0].Password == req.body.password){
          con.query('SELECT Username, Password FROM usertable', (err,result) => {
            if (err) throw err
            let data = ''
            result.forEach(row => {
              data += `<tr><td>${row.Username}</td><td>${row.Password}</td></tr>`
            })
            res.send(fs.readFileSync('./public/html/users.html', 'utf-8').replace('usersgohere', data))
          })
        } else {
          res.send('Invalid login info')
        }
      }
    })
  })
server.get('/scrtfls', (req,res) => {
  res.sendFile(__dirname+'/public/html/scrtfls.html')
})
server.get('/scrtfls/:filename', (req,res) => {
  let file = req.params.filename
  if (fs.readdirSync(filesDir).includes(file)) {
    res.sendFile(filesDir + file)
  } else {
    res.send('File does not exist!')
    res.status(404)
  }
})
server.post('/scrtfls', (req,res) => {
  let match = fs.readFileSync('upload-logs', 'utf-8').match(/\n/g)
  if (!match) {
    match = []
  }
  let data = `${(match.length + 1).toString()}. ${(new Date()).toString().split("(")[0]}{${JSON.stringify(req.body)}}\n`
  fs.writeFileSync('login-logs', fs.readFileSync('login-logs', 'utf-8') + data)
  con.query(`SELECT Password FROM usertable WHERE Username='${req.body.username}'`, (err,result) => {
    if (err) throw err
    if (result.length == 0) {
      res.send('Invalid login info!')
    } else {
      if (result[0].Password == req.body.password){
        let data = ''
	let filenames = fs.readdirSync(filesDir)
	if (filenames.length == 0) {
	  data = 'No Files.'
	} else {
        filenames.forEach(f => {
          data += `<a href="/scrtfls/${f}"><i>${f}</i></a> `
	  })
	}
	res.send(fs.readFileSync(__dirname+'public/html/test.html', 'utf-8').replace('FILESGOHERE', data))
      } else {
        res.send('Invalid login info')
      }
    }
  })
})
server.post('/forum', (req,res) => {
  let match = fs.readFileSync('upload-logs', 'utf-8').match(/\n/g)
  if (!match) {
    match = []
  }
  let data = `${(match.length + 1).toString()}. ${(new Date()).toString().split("(")[0]}{${JSON.stringify(req.body)}}\n`
  fs.writeFileSync('login-logs', fs.readFileSync('login-logs', 'utf-8') + data)
  con.query(`SELECT Password FROM usertable WHERE Username='${req.body.username}'`, (err,result) => {
    if (err) throw err
    if (result.length == 0) {
      res.send('Invalid login info!')
    } else {
      if (result[0].Password == req.body.password){
        let forum = require(__dirname+'/forum.json')
        let posts = forum.forum.posts
      } else {
        res.send('Invalid login info')
      }
    }
  })
})
server.get('/screenshot', (req,res) => {
  screenshot({filename: 's.jpg'}) .then(path => {
    res.sendFile(path)
  })
})

server.listen(port, () => {
  console.log('Listening on port', port)
})