all: build

build:
	# Browserify the web worker thread main.js into main.bundled.js
	browserify -t uglifyify js/main.js | uglifyjs > js/main.bundled.js 
	# Browserify the main thread app.js into app.min.js
	browserify js/app.js | uglifyjs > js/app.min.js
	# Concatenate and minify all the CSS files
	cat css/bootstrap.css css/nyt-cheltenham.css css/style.css | cleancss > css/style.min.css

clean:
	rm -f js/main.bundled.js
	rm -f js/app.min.js
	rm -f css/style.min.css
