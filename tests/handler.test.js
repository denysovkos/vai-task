const words = require('../src/words.json').words;

const DB = require('../src/db');
jest.mock('../src/db', () => {
    return {
        init: () => true,
        getInstance: () => ({
            find: () => ({
                toArray: () => [{word: 'to'}, {word: 'the'}]
            })
        })
    }
});

const {handler, calculateLexicalDensity, calculateVerbose} = require('../src/handlers');


describe('Calculate lexical density', () => {
    it('Should calculate lexical density', () => {
        const result = calculateLexicalDensity('Kim loves going to the cinema', words);
        expect(result).toBe(0.67);
    });

    it('Should return 1 if no nonLexicalWords', () => {
        const result = calculateLexicalDensity('Kim loves going to the cinema', []);
        expect(result).toBe(1);
    });
});

describe('Calculate verbose', () => {
    it('Should calculate lexical density', () => {
        const result = calculateVerbose('Kim loves going to the cinema. And loves go to the zoo.', words);
        expect(result).toEqual({"overall_ld": 0.585, "sentence_ld": [0.67, 0.5]});
    });
});

describe('Handler', () => {
    it('Should handle request without verbose', async () => {
        const sender = jest.fn();
        const reqMock = {
            body: {
                data: 'Kim loves going to the cinema'
            },
            query: {
                mode: null
            }
        };

        const resMock = {
            status: jest.fn().mockReturnValue({
                send: (data) => sender(data)
            }),
            send: jest.fn()
        };

        await handler(reqMock, resMock);
        expect(resMock.send).toBeCalled();
        expect(resMock.send).toBeCalledWith({
            data: { overall_ld: 0.67 }
        });
    });

    it('Should respond with 500 if no sentence', async () => {
        const sender = jest.fn();
        const reqMock = {
            body: {
                data: ''
            },
            query: {
                mode: null
            }
        };

        const resMock = {
            status: jest.fn().mockReturnValue({
                send: sender
            }),
            send: jest.fn()
        };

        await handler(reqMock, resMock);
        expect(resMock.status).toBeCalledWith(500);
        expect(sender).toBeCalledWith({"error": "Sentence should be provided or it should be a string"});
    });

    it('Should respond with 500 if sentence not a string', async () => {
        const sender = jest.fn();
        const reqMock = {
            body: {
                data: ['not', 'a', 'string']
            },
            query: {
                mode: null
            }
        };

        const resMock = {
            status: jest.fn().mockReturnValue({
                send: sender
            }),
            send: jest.fn()
        };

        await handler(reqMock, resMock);
        expect(resMock.status).toBeCalledWith(500);
        expect(sender).toBeCalledWith({"error": "Sentence should be provided or it should be a string"});
    });

    it('Should respond with 500 if length of word more 1000 chars', async () => {
        const generate1001Chars = Array(1001).fill('n').join('');
        const sender = jest.fn();
        const reqMock = {
            body: {
                data: generate1001Chars
            },
            query: {
                mode: null
            }
        };

        const resMock = {
            status: jest.fn().mockReturnValue({
                send: sender
            }),
            send: jest.fn()
        };

        await handler(reqMock, resMock);
        expect(resMock.status).toBeCalledWith(500);
        expect(sender).toBeCalledWith({"error": "No more 1000 characters are allowed"});
    });

    it('Should respond with 500 if length of word more 100 words', async () => {
        const generate101Words = Array(101).fill('n').join(' ');
        const sender = jest.fn();
        const reqMock = {
            body: {
                data: generate101Words
            },
            query: {
                mode: null
            }
        };

        const resMock = {
            status: jest.fn().mockReturnValue({
                send: sender
            }),
            send: jest.fn()
        };

        await handler(reqMock, resMock);
        expect(resMock.status).toBeCalledWith(500);
        expect(sender).toBeCalledWith({"error": "No more 100 words are allowed"});
    });
});
