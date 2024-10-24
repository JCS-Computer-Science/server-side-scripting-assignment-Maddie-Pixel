const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))


//All your code goes here
let activeSessions={}

server.get('/newgame', (req, res)=>{
    let newID = uuid.v4();
    let word = req.query;
    word = word.answer;
    let newGame = {
        wordToGuess: word,
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
})

server.get('/gamestate', (req, res)=>{
    let id = req.query;
    let state = activeSessions[id.sessionID];
    res.status(200);
    res.send({gameState: state});
})

server.post('/guess', (req, res)=>{
    let state =activeSessions[req.body.sessionID];
    console.log(state['guesses']);
    state['guesses'].push(req.body);

    res.status(201);
})
//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;