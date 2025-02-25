clean:
	rm -rf ./build \
	rm tsconfig.tsbuildinfo

test:
	clear \
	&& npm run test:e2e \
	&& npm run test:unit \
	&& npm run test:db

buildDocker:
	docker build -t monsters/monsters-gateway .

buildTestDocker:
	docker build --build-arg NODE_ENV=development -t monsters/monsters-gateway-test .

integrationTestsMessages:
	npx cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --config  __tests__/jest.config.integration.ts

integrationTestsUsers:
	npx cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --config  __tests__/jest.config.integration.ts

integrationTests:
	make integrationTestsUsers \
	&& make integrationTestsMessages
