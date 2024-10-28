const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))


//All your code goes here
let activeSessions={}

server.get('/newgame', (req, res)=>{
    let newID = uuid.v4();
    if(req.query.answer) {
        let newGame = {
            wordToGuess: req.query.answer,
            guesses:[],
            wrongLetters: [],
            closeLetters: [],
            rightLetters: [],
            remainingGuesses: 6,
            gameOver: false
        }
            activeSessions[newID] = newGame;
            res.status(201);
            res.send({sessionID: newID});
    } else {
        let newGame = {
            wordToGuess: 'apple',
            guesses:[],
            wrongLetters: [],
            closeLetters: [],
            rightLetters: [],
            remainingGuesses: 6,
            gameOver: false
        }
        activeSessions[newID] = newGame;
        res.status(201);
        res.send({sessionID: newID});
    }
})

server.get('/gamestate', (req, res)=>{
    let id = req.query;
    let state = activeSessions[id.sessionID];
    res.status(200);
    res.send({gameState: state});
})

server.post('/guess', (req, res)=>{
    let session =req.body.sessionID;
    let guess = req.body.guess.split('');
    let letter;

    guess[0] = {
        result: "CLOSE",
        value: letter
    }
    for (let i = 0; i < 5; i++) {
        letter = guess[0];
    }

    activeSessions[session]['guesses'].push(guess);
    

    res.status(201);
    res.send({gameState: activeSessions[session]});
})
//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;