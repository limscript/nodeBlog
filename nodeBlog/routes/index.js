var express = require('express')
var router = express.Router()
var crypto = require('crypto')
var mysql = require('./../database')
var formatDate = require('./../public/javascripts/untils')

/* GET home page. */
router.get('/', function(req, res, next) {
  const user = req.session.user
  const page = req.query.page || 1
  const start = (page - 1) * 8
  const end = page * 8
  const queryCount = 'SELECT COUNT(*) AS articleNum FROM article'
  const queryArticle = 'SELECT * FROM article ORDER BY articleID DESC LIMIT ' + start + ',' + end
  mysql.query(queryArticle, (err, rows, fields) => {
    let articles = rows
    if (Array.isArray(articles)) {
      articles.map(item => {
        item.articleTime = formatDate(item.articleTime)
      })
    }
    mysql.query(queryCount, (err, rows, fields) => {
      const articleNum = rows[0].articleNum
      const pageNum = Math.ceil(articleNum / 8)
      console.log(pageNum, page)
      res.render('index', { articles, user, pageNum, page })
    })
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

/* 文章新增页 */
router.get('/add', function(req, res, next) {
  const user = req.session.user
  if (!user) {
    return res.redirect('/login')
  }
  res.render('add', { user: req.session.user })
})

/* 友情链接页面 */
router.get('/friends', function(req, res, next) {
  res.render('friends', { user: req.session.user })
})

/* 关于博客页面 */
router.get('/about', function(req, res, next) {
  res.render('about', { user: req.session.user })
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

/* 新增文章 */
router.post('/add', function(req, res, next) {
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

/* 修改文章界面 */
router.get('/modify/:articleID', function(req, res, next) {
  var articleID = req.params.articleID
  var user = req.session.user
  const query = 'SELECT * FROM article WHERE articleID=' + mysql.escape(articleID)
  if (!user) {
    return res.redirect('/login')
  }
  mysql.query(query, (err, rows, fields) => {
    if (err) {
      return console.log(err)
    }
    const article = rows[0]
    const title = article.articleTitle
    const content = article.articleContent
    console.log(title, content)
    res.render('modify', { user, title, content, articleID })
  })
})

/* 修改文章 */
router.post('/modify/:articleID', function(req, res, next) {
  var articleID = req.params.articleID
  // var user = req.session.user
  var title = req.body.title
  var content = req.body.content
  var query = `UPDATE article SET articleTitle = ${mysql.escape(
    title
  )}, articleContent = ${mysql.escape(content)} WHERE articleID= ${mysql.escape(articleID)}`
  console.log(query)
  mysql.query(query, (err, rows, fields) => {
    if (err) {
      return console.log(err)
    }
    res.redirect('/')
  })
})

/* 删除文章 */
router.get('/delete/:articleID', function(req, res, next) {
  var articleID = req.params.articleID
  var user = req.session.user
  var query = `DELETE FROM article WHERE articleID= ${mysql.escape(articleID)}`
  if (!user) {
    return res.redirect('/login')
  }
  mysql.query(query, (err, rows, fields) => {
    res.redirect('/')
  })
})
module.exports = router
