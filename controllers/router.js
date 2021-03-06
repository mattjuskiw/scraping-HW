
module.exports = app => {
	const axios = require('axios');
	const cheerio = require('cheerio');
	
	const articles = require('../models/Article').article;

	// Fix Favicon.ico routing issue
	app.get('/favicon.ico', (req,res) => {
		res.status(204);
	})

	app.get('/', (req,res) => {
		res.render('index');
	});

	app.get('/scrape', (req,res) => {
		axios.get("https://loudwire.com/").then(function(response) {
			var $ = cheerio.load(response.data);
			$('body').find('.blogroll-inner').children('article').each(function(i,element) {
				let link = $(this).find('.content').children('a');
				let result = {
					title: link.text(),
					link: "https:"+link.attr('href'),
					subtitle: $(this).find('.excerpt').text(),
					image: "https:"+$(this).find('a.theframe').attr('data-image')
				};

				articles.create(result).then(article => {
					return res.status(100);
				}).catch(err => {
					return console.log(err);
				});
			});
			res.send("Scrape complete");
		});
	});

	app.get('/articles', (req,res) => {
		articles.find().then(article => res.json(article)).catch(err => res.json(err));
	});

	app.get('/articles/:id', (req,res) => {
		articles.findOne({_id:req.params.id}).then(article => res.json(article)).catch(err => res.json(err));
	});

	app.post('/notes', (req,res) => {
		articles.updateOne({_id: req.body.article}, {$push: {note: req.body}}).then(note => res.json(note)).catch(err => res.json(err));
	});

	// app.post("/articles/:id", (req,res) => {
	// 	db.Note.create(req.body).then(note => {
	// 		db.Article.findOne({_id: req.params.id}).populate('Note');
	// 	}).then(note => res.json(note)).catch(err => res.json(err));
	// });
};