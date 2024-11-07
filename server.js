const express = require("express");
const { pipeline } = require("supertest/lib/test");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))


//All your code goes here
let activeSessions={}
async function getWord() {
    let response= await fetch ("https://random-word-api.herokuapp.com/word?length=5");
    return await response.json();
}

server.get('/newgame', (req, res)=>{
    console.log(getWord());
    let newID = uuid.v4();
    if(req.query.answer) {
        activeSessions[newID + 'answer'] = req.query.answer;
        let newGame = {
            wordToGuess: undefined,
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
        activeSessions[newID + 'answer'] = 'apple';
        let newGame = {
            wordToGuess: undefined,
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
    let session = activeSessions[id.sessionID];
    if (session){
        res.status(200);
        res.send({gameState: session});
    } else if (id.sessionID){
        res.status(404);
        res.send({error: 'Session ID does not exist'});
    } else {
        res.status(400);
        res.send({error: 'Session ID not found'})
    }
})

server.post('/guess', (req, res)=>{
    let guessed = req.body.guess.split('');
    let session = req.body.sessionID;
    let correct = true;
    let alpha = true;
    let answer;
    if (activeSessions[session]){
        answer = activeSessions[session + 'answer'].split('');
        for (let i = 0; i < guessed.length; i++) {
            if(answer[i] != 'a' && answer[i] != 'b' && answer[i] != 'c' && answer[i] != 'd' && answer[i] != 'e' && answer[i] != 'f' && answer[i] != 'g' && answer[i] != 'h'  && answer[i] != 'i' && answer[i] != 'j' && answer[i] != 'k' && answer[i] != 'l' && answer[i] != 'm' && answer[i] != 'n' && answer[i] != 'o' && answer[i] != 'p' && answer[i] != 'q' && answer[i] != 'r' && answer[i] != 's' && answer[i] != 't' && answer[i] != 'u' && answer[i] != 'v' && answer[i] != 'w' && answer[i] != 'x' && answer[i] != 'y' && answer[i] != 'z'){
                alpha = false;
            }
        }
    }

    if (activeSessions[session] && guessed.length == 5 && alpha == true) {
        let copy;
        let letter;
    
        activeSessions[session].remainingGuesses -= 1;
        
        for (let i = 0; i < guessed.length; i++) {
            copy = 0;
            letter = guessed[i];
            if (letter == answer[i]){
                for (let l = 0; l < activeSessions[session].rightLetters.length; l++) {
                    if (activeSessions[session].rightLetters[l] == letter) {
                        copy = 1;
                    }
                }
                
                guessed[i] = {
                    result: "RIGHT",
                    value: letter
                }
                if (copy != 1){
                    activeSessions[session].rightLetters.push(letter);
                }
            } else {
                for (let j = 0; j < 5; j++) {
                    if (letter == answer[j]){
                        for (let l = 0; l < activeSessions[session].closeLetters.length; l++) {
                            if (activeSessions[session].closeLetters[l] == letter) {
                                copy = 1;
                            }
                        }
                        
                        guessed[i] = {
                            result: "CLOSE",
                            value: letter
                        }
                        if (copy != 1){
                            activeSessions[session].closeLetters.push(letter);
                        }
                    }
                }
            }
            if (letter == guessed[i]) {
                for (let l = 0; l < activeSessions[session].wrongLetters.length; l++) {
                    if (activeSessions[session].wrongLetters[l] == letter) {
                        copy = 1;
                    }
                }
                
                guessed[i] = {
                    result: "WRONG",
                    value: letter
                }
                if (copy != 1){
                    activeSessions[session].wrongLetters.push(letter);
                }
            }
        }
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (activeSessions[session].closeLetters[i] == activeSessions[session].rightLetters[j]){
                    activeSessions[session].closeLetters.splice(i, 1);
                }
            }
        }
        
        activeSessions[session]['guesses'].push(guessed);
        for (let i = 0; i < 5; i++) {
            if (guessed[i].value != answer[i]) {
                correct = false;
            }
        }
        if (correct == true || activeSessions[session].remainingGuesses == 0){
            activeSessions[session].gameOver = true;
        }
        if(activeSessions[session].gameOver == true){
            activeSessions[session].wordToGuess = activeSessions[session + 'answer'];
        }
        
        res.status(201);
        res.send({gameState: activeSessions[session]});
    } else if(guessed.length != 5 || alpha == false) {
        res.status(400);
        res.send({error: 'Invalid guess'})
    } else if(session) {
        res.status(404);
        res.send({error: 'Invalid Session ID'})
    } else {
        res.status(400);
        res.send({error: 'Session ID not found'})
    }
})

server.delete('/reset', (req, res)=>{
    let session =req.query.sessionID;
    if(activeSessions[session]){
        let newGame = {
            wordToGuess: undefined,
            guesses:[],
            wrongLetters: [],
            closeLetters: [],
            rightLetters: [],
            remainingGuesses: 6,
            gameOver: false
        }
        activeSessions[session] = newGame;
        console.log(newGame);
        res.status(200);
        res.send({gameState: newGame});
    } else if (session){
        res.status(404);
        res.send({error: 'Session ID does not exist'});
    } else {
        res.status(400);
        res.send({error: 'Session ID not found'})
    }
})

server.delete('/delete', (req, res)=>{
    let session =req.query.sessionID;
    if(activeSessions[session]){
        delete activeSessions[session + 'answer']
        delete activeSessions[session];
        res.send(204);
    } else if (session){
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