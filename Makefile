all: deploy-local

browserify: install
	# Browserify the web worker thread main.js into main.bundled.js
	browserify -t uglifyify js/main.js | uglifyjs -c -m > js/main.bundled.js 
	# Browserify the main thread app.js into app.min.js
	browserify js/app.js | uglifyjs -c -m > js/app.min.js
	# Concatenate and minify all the CSS files
	cd css && /usr/local/bin/scss style.scss | /usr/local/bin/cleancss > style.min.css
	cp -f source.html index.html

build: clean bump-version-minor browserify inject-version-number

install:
	# npm install
	@echo "Warning: NOT re-installing node_modules. If this is a new system"
	@echo "please uncomment this line."

clean:
	rm -f js/main.bundled.js
	rm -f js/main.min.js
	rm -f js/app.min.js
	rm -f css/style.min.css
	rm -f index.html
	@echo "Warning: NOT removing node_modules (for speed)"
	# rm -rf node_modules

bump-version-patch:
	mversion patch

bump-version-minor:
	mversion minor

bump-version-major:
	mversion major

copy-assets:
	$(eval VERSION = $(shell mversion | grep package.json | egrep -o "\d+\.\d+\.\d+"))
	mkdir -p v/$(VERSION)/css
	mkdir -p v/$(VERSION)/js
	cp css/style.min.css v/$(VERSION)/css
	cp js/app.min.js v/$(VERSION)/js
	cp js/main.bundled.js v/$(VERSION)/js
	cp -r bower_components v/$(VERSION)
	cp index.html v/$(VERSION)

	@echo ""
	@echo "Finished building/deploying v$(VERSION)"

inject-version-number:
	$(eval VERSION = $(shell mversion | grep package.json | egrep -o "\d+\.\d+\.\d+"))
	sed -i .backup 's/LITERAL_TREES_VERSION/$(VERSION)/g' index.html
	sed -i .backup 's/LITERAL_TREES_VERSION/$(VERSION)/g' css/style.min.css
	sed -i .backup 's/LITERAL_TREES_VERSION/$(VERSION)/g' js/app.min.js
	sed -i .backup 's/LITERAL_TREES_VERSION/$(VERSION)/g' js/main.bundled.js

git-commit:
	$(eval VERSION = $(shell mversion | grep package.json | egrep -o "\d+\.\d+\.\d+"))
	git add -u
	git add v/
	git commit -m "Build version $(VERSION)"

deploy-local: build copy-assets git-commit

deploy-s3: deploy-local sync-s3

sync-s3:
	aws --profile s3access s3 sync . s3://literal-trees.co --recursive --acl public-read --cache-control no-cache --delete --exclude ".git/*" --exclude "node_modules/*"

help:
	@echo "Targets include:"
	@echo "    deploy-local (default):"
	@echo "     1. clean"
	@echo "     2. bump npm minor version"
	@echo "     3. build"
	@echo "     5. copy the assets to a version directory under v/"
	@echo "     6. automatic git add -u and git add v/ and commit"
	@echo ""
	@echo "    deploy-s3:"
	@echo "     1-6. same as above"
	@echo "     7. synchronize files with literal-trees.co S3 bucket"
	@echo ""
	@echo "    clean: Remove built files"
	@echo ""
	@echo "    build: Build all CSS/JS assets (style.min.css, app.min.js, main.bundled.js)"
	@echo ""
	@echo "Note: deploy-local always increases the minor version. If you want to"
	@echo "increase a different version value you must do so manually first via"
	@echo "\"npm version [major|minor|patch]\" on the command line."
