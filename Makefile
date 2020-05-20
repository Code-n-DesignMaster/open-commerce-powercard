CMD := nodemon --watch '**/*' nodemon --exec
BITBUCKET_PSQL_CMD := psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}"

start:
	npm run-script start

start-nodemon:
	$(CMD) 'npm run-script start'

start-nodemon-debug:
	$(CMD) 'npm run-script start:debug'

test: jest

test-nodemon:
	$(CMD) 'make test'

jest:
	jest

e2e:
	node --nolazy node_modules/jest/bin/jest.js --colors --config=./test/jest-e2e.json --runInBand --forceExit --detectOpenHandles

e2e-nodemon:
	$(CMD) 'node --nolazy node_modules/jest/bin/jest.js --colors --config=./test/jest-e2e.json --runInBand --forceExit --detectOpenHandles'

build:
	npm run-script build

push:
	npm run-script lint
	npm run-script build
	npm run-script test
