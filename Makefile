SYSTEM=$(shell uname)

default: build

ci: type lint test

init:
	yarn install
	./node_modules/.bin/flow-typed install

node_modules:
	yarn install

flow-typed: node_modules
	./node_modules/.bin/flow-typed install

build: node_modules
	./node_modules/.bin/babel src --out-dir dist/src --source-maps inline
	cp ./package.json ./dist/.

test: node_modules
	./node_modules/.bin/jest

type: node_modules
	./node_modules/.bin/flow status

lint: node_modules
	./node_modules/.bin/eslint src test

docs: node_modules
	./node_modules/.bin/documentation build \
		src/** src/* -f html -o docs \
		--document-exported \
		--infer-private \
		--name jo-script

watch:
	@which watchman-make > /dev/null || ( echo 'install watchman' && exit 1 )
	watchman-make -p 'src/**/*.js' 'src/*.js' 'test/**/*.js' 'test/*.js' -t ci

reset:
	rm -rf flow-typed
	rm -rf node_modules
	rm -rf dist
	rm -rf docs
	make init

clean:
	rm -rf dist

publish-build:
	rm -rf dist
	./node_modules/.bin/babel src --out-dir dist
	rm -rf dist/test dist/fixtures dist/examples
	cp package.json dist/.
	cp README.md dist/.
	cp CHANGELOG.md dist/.

publish: publish-build
	npm version patch
	cp package.json dist/.
	cd dist && npm publish
	cd ..
	git push origin master --tags

.PHONY: default watch ci init build clean docs type lint test
