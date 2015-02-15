all: build

browserify: install
	# Browserify the web worker thread main.js into main.bundled.js
	browserify -t uglifyify js/main.js | uglifyjs > js/main.bundled.js 
	# Browserify the main thread app.js into app.min.js
	browserify js/app.js | uglifyjs > js/app.min.js
	# Concatenate and minify all the CSS files
	cat css/bootstrap.css css/nyt-cheltenham.css css/style.css | cleancss > css/style.min.css
	cp -f source.html index.html

build: clean browserify inject-version-number

install:
	npm install

clean:
	rm -f js/main.bundled.js
	rm -f js/main.min.js
	rm -f js/app.min.js
	rm -f css/style.min.css
	rm -f index.html
	rm -rf node_modules

bump-version-patch:
	mversion patch

bump-version-minor:
	mversion minor

bump-version-major:
	mversion major

copy-assets:
	$(eval VERSION = $(shell mversion | egrep -o "\d+\.\d+\.\d+"))
	mkdir -p v/$(VERSION)/css
	mkdir -p v/$(VERSION)/js
	cp css/style.min.css v/$(VERSION)/css
	cp js/app.min.js v/$(VERSION)/js
	cp js/main.bundled.js v/$(VERSION)/js
	cp index.html v/$(VERSION)

	@echo "$(VERSION)"

inject-version-number:
	$(eval VERSION = $(shell mversion | egrep -o "\d+\.\d+\.\d+"))
	sed -i .backup 's/LITERAL_TREES_VERSION/$(VERSION)/g' index.html
	sed -i .backup 's/LITERAL_TREES_VERSION/$(VERSION)/g' css/style.min.css
	sed -i .backup 's/LITERAL_TREES_VERSION/$(VERSION)/g' js/app.min.js
	sed -i .backup 's/LITERAL_TREES_VERSION/$(VERSION)/g' js/main.bundled.js

deploy-local: clean bump-version-patch build copy-assets

help:
	@echo "Targets include:"
	@echo "    clean: Remove built files"
	@echo ""
	@echo "    build: Build all CSS/JS assets (style.min.css, app.min.js, main.bundled.js)"
	@echo ""
	@echo "    deploy-local:"
	@echo "     1. clean"
	@echo "     2. bump npm patch version"
	@echo "     3. build"
	@echo "     5. copy the assets to a version directory under v/"
	@echo ""
	@echo "Note: deploy-local always increases the patch version. If you want to"
	@echo "increase the major or minor version you must do so manually first via"
	@echo "\"npm version [major|minor]\" on the command line."
