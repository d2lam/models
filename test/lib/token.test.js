'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const mockery = require('mockery');
const schema = require('screwdriver-data-schema');

sinon.assert.expose(assert, { prefix: '' });

describe('Token Model', () => {
    let datastore;
    let generateTokenMock;
    let BaseModel;
    let TokenModel;
    let createConfig;
    let token;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        datastore = {
            update: sinon.stub()
        };
        generateTokenMock = {
            generateValue: sinon.stub(),
            hashValue: sinon.stub()
        };
        mockery.registerMock('./generateToken', generateTokenMock);

        // Lazy load Token Model so it registers the mocks
        /* eslint-disable global-require */
        BaseModel = require('../../lib/base');
        TokenModel = require('../../lib/token');
        /* eslint-enable global-require */
    });

    beforeEach(() => {
        datastore.update.resolves({});

        createConfig = {
            datastore,
            userId: 12345,
            hash: '1a2b3c',
            id: 6789,
            name: 'Mobile client auth token',
            description: 'For the mobile app',
            lastUsed: '2017-05-10T01:49:59.327Z'
        };
        token = new TokenModel(createConfig);
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('is constructed properly', () => {
        assert.instanceOf(token, TokenModel);
        assert.instanceOf(token, BaseModel);
        schema.models.token.allKeys.forEach((key) => {
            assert.strictEqual(token[key], createConfig[key]);
        });
    });

    describe('update', () => {
        it('promises to update a token', () => {
            const newTimestamp = '2017-05-13T02:01:17.588Z';

            token.lastUsed = newTimestamp;

            return token.update()
            .then(() => {
                assert.calledWith(datastore.update, {
                    table: 'tokens',
                    params: {
                        id: 6789,
                        lastUsed: newTimestamp
                    }
                });
            });
        });
    });

    describe('refresh', () => {
        it('generates a new token value and returns it once', () => {
            const newValue = 'a new value';
            const newHash = 'a new hash';

            generateTokenMock.generateValue.resolves(newValue);
            generateTokenMock.hashValue.returns(newHash);

            return token.refresh()
                .then((model) => {
                    assert.calledOnce(generateTokenMock.generateValue);
                    assert.calledWith(generateTokenMock.hashValue, newValue);
                    assert.strictEqual(model.value, newValue);
                    assert.strictEqual(model.hash, newHash);
                });
        });
    });

    describe('toJson', () => {
        const expected = {
            userId: 12345,
            id: 6789,
            name: 'Mobile client auth token',
            description: 'For the mobile app',
            lastUsed: '2017-05-10T01:49:59.327Z'
        };
        const value = 'tokenValue';

        it('functions normally if no value is present', () => {
            const output = token.toJson();

            assert.deepEqual(output, expected);
        });

        it('adds the value field if present', () => {
            token.value = value;

            assert.deepEqual(token.toJson(), Object.assign({}, expected, { value }));
        });
    });
});
