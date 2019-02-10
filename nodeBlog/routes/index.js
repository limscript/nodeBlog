var express = require('express')
var router = express.Router()
var crypto = require('crypto')
var mysql = require('./../database')
var formatDate = require('./../public/javascripts/untils')

/* GET home page. */
router.get('/', function(req, res, next) {
  const query = 'SELECT * FROM article ORDER BY articleID DESC'
  mysql.query(query, (err, rows, fields) => {
    let articles = rows
    if (Array.isArray(articles)) {
      rows.map(item => {
        item.articleTime = formatDate(item.articleTime)
      })
    }
    res.render('index', { articles, user: req.session.user })
  })
})

/* 登录页 */
router.get('/login', function(req, res, next) {
  res.render('login', { message: '' })
})

/* 退出登录 */
router.get('/logout', function(req, res, next) {
  res.session.user = null
  res.redirect('/')
})

/* 登录信息验证 */
router.post('/login', function(req, res, next) {
  var name = req.body.name
  var password = req.body.password
  var hash = crypto.createHash('md5')
  hash.update(password)
  password = hash.digest('hex')
  var query =
    'SELECT * FROM author WHERE authorName=' +
    mysql.escape(name) +
    'AND authorPassword=' +
    mysql.escape(password)
  mysql.query(query, (err, rows, fields) => {
    if (err) {
      return console.log(err)
    }
    var user = rows[0]
    if (!user) {
      res.render('login', { message: '用户名或者密码错误' })
      return
    }
    req.session.user = user
    res.redirect('/')
  })
})

/* 文章内容页 */
router.get('/articles/:articleID', function(req, res, next) {
  const articleID = req.params.articleID
  const query = 'SELECT * FROM article WHERE articleID=' + mysql.escape(articleID)
  mysql.query(query, (err, rows, fields) => {
    if (err) {
      console.log(err)
      return
    }
    const queryForClick =
      'UPDATE article SET articleClick=articleClick + 1 WHERE articleID=' + mysql.escape(articleID)
    let article = rows[0]
    mysql.query(queryForClick, (err, rows, fields) => {
      if (err) {
        console.log(err)
        return
      }
      article.articleTime = formatDate(article.articleTime)
      res.render('article', { article, user: req.session.user })
    })
  })
})

/* 写文章界面页 */
router.get('/edit', function(req, res, next) {
  const user = req.session.user
  if (!user) {
    return res.redirect('/login')
  }
  res.render('edit', { user: req.session.user })
})

/* 新增文章 */
router.post('/edit', function(req, res, next) {
  var title = req.body.title
  var content = req.body.content
  var author = req.session.user.authorName
  var query = `INSERT article SET articleTitle = ${mysql.escape(
    title
  )}, articleAuthor = ${mysql.escape(author)}, articleContent = ${mysql.escape(
    content
  )}, articleTime = CURDATE()`
  mysql.query(query, (err, rows, fields) => {
    if (err) {
      return console.log(err)
    }
    res.redirect('/')
  })
})

/* 友情链接页面 */
router.get('/friends', function(req, res, next) {
  res.render('friends', { user: req.session.user })
})

/* 关于博客页面 */
router.get('/about', function(req, res, next) {
  res.render('about', { user: req.session.user })
})
module.exports = router
