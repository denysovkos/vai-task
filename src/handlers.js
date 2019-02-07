const DB = require('./db');

const handler = async (req, res) => {
    const sentence = req.body.data || null;
    const isVerbose = req.query && req.query.mode === 'verbose';

    const nonLexicalWords = (await DB.getInstance().find({}).toArray()).map(x => x.word);

    if (!sentence || typeof sentence !== 'string') {
        res.status(500).send({
            error: 'Sentence should be provided or it should be a string'
        });
        return;
    } else if (sentence.length > 1000) {
        res.status(500).send({
            error: 'No more 1000 characters are allowed'
        });
        return;
    } else if (sentence.split(' ').length > 100) {
        res.status(500).send({
            error: 'No more 100 words are allowed'
        });
        return;
    }

    const data = isVerbose 
                    ? calculateVerbose(sentence, nonLexicalWords)
                    : {overall_ld: calculateLexicalDensity(sentence, nonLexicalWords)};

    res.send({data});
}

const calculateLexicalDensity = (sentence, nonLexicalWords) => {
    const processInput = sentence
      .trim()
      .toLowerCase()
      .replace(/[~`!@#$%^&*(){}\[\];:''<,.>?\/\\|_+=-]/g, '')
      .split(' ')
      .filter(Boolean);

    const wordCount = processInput.length;
    const result = processInput.filter(word => !nonLexicalWords.includes(word));
    return Number((result.length / wordCount).toFixed(2));
};

const calculateVerbose = (sentence, nonLexicalWords) => {
    const sentence_ld = [];
    const separatedSentences = sentence.match(/[^\.!\?]+[\.!\?]+/g);

    separatedSentences.forEach(element => {
        sentence_ld.push(calculateLexicalDensity(element, nonLexicalWords));
    });
    
    return {
        sentence_ld, 
        overall_ld: sentence_ld.reduce((a,b) => a + b, 0) / sentence_ld.length
    }
}

module.exports = {
    handler,
    calculateLexicalDensity,
    calculateVerbose
}