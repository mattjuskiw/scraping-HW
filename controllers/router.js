
module.exports = app => {
	const axios = require('axios');
	const cheerio = require('cheerio');
	
	const db = require('../models');

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

				db.Article.create(result).then(article => {
					return res.status(100);
				}).catch(err => {
					return console.log(err);
				});
			});
			res.send("Scrape complete");
		});
	});

	app.get('/articles', (req,res) => {
		db.Article.find({}).then(article => res.json(article)).catch(err => res.json(err));
	});

	app.get('/articles/:id', (req,res) => {
		db.Article.find({_id:req.params.id}).populate({
			path: 'note'
		}).then(article => res.json(article)).catch(err => res.json(err));
	});

	app.post("/articles/:id", (req,res) => {
		db.Note.create(req.body).then(note => {
			db.Article.update({_id: req.params.id}, {$push: {note: note._id}}, done);
		}).then(article => res.json(article)).catch(err => res.json(err));
	});
};