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
    if (activeSessions[req.body.sessionID]) {
        let copy;
        let session =req.body.sessionID;
        let guess = req.body.guess.split('');
        let letter;
        let answer = activeSessions[session].wordToGuess.split('');
    
        activeSessions[session].remainingGuesses -= 1;
        
        for (let i = 0; i < 5; i++) {
            letter = guess[i];
            if (letter == answer[i]){
                guess[i] = {
                    result: "RIGHT",
                    value: letter
                }
                activeSessions[session].rightLetters.push(letter);
            } else {
                for (let j = 0; j < 5; j++) {
                    copy = 0;
                    if (letter == answer[j]){
                        for (let l = 0; l < activeSessions[session].closeLetters.length; l++) {
                            if (activeSessions[session].closeLetters[l] == letter) {
                                copy = 1;
                            }
                        }
                        
                        if (copy != 1){
                            guess[i] = {
                                result: "CLOSE",
                                value: letter
                            }
                            activeSessions[session].closeLetters.push(letter);
                        }
                    }
                }
            }
            if (letter == guess[i]) {
                guess[i] = {
                    result: "WRONG",
                    value: letter
                }
                activeSessions[session].wrongLetters.push(letter);
            }
        }
        
        activeSessions[session]['guesses'].push(guess);
        
        res.status(201);
        res.send({gameState: activeSessions[session]});
    } else if (req.body.sessionID){
        res.status(404);
        res.send({error: 'Session ID does not exist'});
    } else {
        res.status(400);
        res.send({error: 'Session ID not found'})
    }
})
//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;