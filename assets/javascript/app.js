var config = {
    apiKey: "AIzaSyB4F97cr7wRfNH0O86Z_eFq04Uy9jRqoIs",
    authDomain: "rps-two-player-game.firebaseapp.com",
    databaseURL: "https://rps-two-player-game.firebaseio.com",
    projectId: "rps-two-player-game",
    storageBucket: "rps-two-player-game.appspot.com",
    messagingSenderId: "879567465944"
};
//connects to firebase   
firebase.initializeApp(config);

var database = firebase.database();
var chat = "";
var playerOne = false;
var playerTwo = false;
var playerOneName = "";
var playerTwoName = "";
var player = "";
var chatName = "";
//when entering the players name...
$("#startButton").on("click", function() {
    event.preventDefault();
    //check to makes sure there isn't a blank value.
    if ($("#playerName").val().trim() !== "") {
        //if there isn't a player one already, set the name information, push the win and loss information to firebase, assign the name to the Div and set the turn to 1
        if (playerOne === false) {
            playerOneName = $("#playerName").val().trim();
            player = 1;
            chatName = playerOneName;
            database.ref("/players/p1").set({
                name: playerOneName,
                win: 0,
                loss: 0,
            });
            $(".form-inline").detach();
            $("#startHeader").html("<p>Hi " + playerOneName + "! You are Player 1")
            $("#startHeader").append("<p class='playerOneTurn'>")
            database.ref("/players/p1").onDisconnect().remove();
            database.ref().child("/turn").set(1);
        //if there is already a player one, add a player two like above
        } else if ( (playerOne === true) && (playerTwo === false) ) {
            playerTwoName = $("#playerName").val().trim();
            player = 2;
            chatName = playerTwoName;
            database.ref("/players/p2").set({
                name: playerTwoName,
                win: 0,
                loss: 0,
            });
            $(".form-inline").detach();
            $("#startHeader").html("<p>Hi " + playerTwoName + "! You are Player 2")
            $("#startHeader").append("<p class='playerTwoTurn'> Waiting for " + playerOneName + " to choose.")
            database.ref("/players/p2").onDisconnect().remove();
            database.ref().child("/turn").set(1);
        };
    };
});
//checks if any information in changed or added in the players section of the database
database.ref("/players").on("value", function(playerSnap){
    //add player one information and set varabiles for DOM manipulation
    if (playerSnap.child("p1").exists()){
        playerOne = true;
        var p1 = playerSnap.val().p1;
        playerOneName = p1.name;
        playerOneChoice = p1.choice;
        playerOneWins = p1.win;
        playerOneLoss = p1.loss;
        $("#playerOneStatus").html("<p>" + p1.name);
        $("#playerOneScore").text("Wins: " + p1.win + " Losses: " + p1.loss);
    //if no player one, keep screen ready for player one
    } else {
        playerOne = false;
        $("#playerOneStatus").html("<p> Waiting for Player 1");
        database.ref().child("/turn").set(0);
    };
    //same as above for player two
    if (playerSnap.child("p2").exists()){
        playerTwo = true;
        var p2 = playerSnap.val().p2;
        playerTwoName = p2.name;
        playerTwoChoice = p2.choice;
        playerTwoWins = p2.win;
        playerTwoLoss = p2.loss;
        $("#playerTwoStatus").html("<p>" + p2.name);
        $("#playerTwoScore").text("Wins: " + p2.win + " Losses: " + p2.loss);
     //if no player two, keep screen ready for player two
    } else {
        playerTwo = false;
        $("#playerTwoStatus").html("<p> Waiting for Player 2");
        database.ref().child("/turn").set(0);
    };
    //if there are no players, clear the chat
    if (!playerSnap.child("p2").exists() && !playerSnap.child("p2").exists()){
        database.ref("chat").remove();
    };
});
//if someone leaves, notify the other player in chat
database.ref("/players/").on("child_removed", function(removal) {
    chat = removal.val().name + " has disconnected!";
    database.ref("/chat").push({
        chat: chat
    });
});
//check to see what turn is active
database.ref("/turn").on("value", function(turnSnap){
    if (turnSnap.val() === 1) {
        //if players are both set, its player's one turn.
        if (playerOne && playerTwo){
            $(".playerOneTurn").text("It's Your Turn!");
            $("#playerOne").css({"border": "5px solid yellow"});
            $(".playerTwoTurn").text("Waiting for " + playerOneName + " to choose.");
            //only allows player one to see the choices.
            if (player === 1) {
                $("#playerOne").append("<p class='playerChoices1' data-choice='Rock'> Rock");
                $("#playerOne").append("<p class='playerChoices1' data-choice='Paper'> Paper");
                $("#playerOne").append("<p class='playerChoices1' data-choice='Scissors'> Scissors");
            };
        };
    };
    if (turnSnap.val() === 2) {
        //once player one goes, it goes to turn two and player two gets the same options as above.
        if (playerOne && playerTwo){
            $("#playerOne").css({"border": "5px solid #007bff"});
            $("#playerTwo").css({"border": "5px solid yellow"});
            $(".playerTwoTurn").text("It's Your Turn!");
            $(".playerOneTurn").text("Waiting for " + playerTwoName + " to choose.");
            if (player === 2) {
                $("#playerTwo").append("<p class='playerChoices2' data-choice='Rock'> Rock");
                $("#playerTwo").append("<p class='playerChoices2' data-choice='Paper'> Paper");
                $("#playerTwo").append("<p class='playerChoices2' data-choice='Scissors'> Scissors");
            };
        };
    };
    if (turnSnap.val() === 3) {
        //once both have chosen the choices are compared and the winner is decided.
        $("#playerTwo").css({"border": "5px solid #007bff"});
        $("#playerOne").append("<p class='" + playerOneChoice + "'>" + playerOneChoice);
        $("#playerTwo").append("<p class='" + playerTwoChoice + "'>" + playerTwoChoice);
        if ((playerOneChoice === "Rock") || (playerOneChoice === "Paper") || (playerOneChoice === "Scissors")) {
            if ((playerOneChoice === "Rock") && (playerTwoChoice === "Scissors")) {
                firstPlayerWins();
            } else if ((playerOneChoice === "Rock") && (playerTwoChoice === "Paper")) {
                secondPlayerWins();
            } else if ((playerOneChoice === "Scissors") && (playerTwoChoice === "Rock")) {
                secondPlayerWins();
            } else if ((playerOneChoice === "Scissors") && (playerTwoChoice === "Paper")) {
                firstPlayerWins();
            } else if ((playerOneChoice === "Paper") && (playerTwoChoice === "Rock")) {
                firstPlayerWins();
            } else if ((playerOneChoice === "Paper") && (playerTwoChoice === "Scissors")) {
                secondPlayerWins();
            } else if (playerOneChoice === playerTwoChoice) {
                tieGame();
            };;
        };
        
    };
});
//once player one chooses a choice that choice is shown to only player one and player two gets to choose.
$(document).on('click', ".playerChoices1", function() {
    var playerChoice = $(this).attr('data-choice');
    database.ref().child("/players/p1/choice").set(playerChoice);
    $(".playerChoices1").detach()
    $("#playerOne").append("<p class='firstPlayerChoice " + playerChoice + "'>" + playerChoice);
    database.ref().child("/turn").set(2);
});
//player two gets to choose their choice in secret.
$(document).on('click', ".playerChoices2", function() {
    var playerChoice = $(this).attr('data-choice');
    database.ref().child("/players/p2/choice").set(playerChoice);
    $(".playerChoices2").detach()
    $("#playerTwo").append("<p class='secondPlayerChoice " + playerChoice + "'>" + playerChoice);
    database.ref().child("/turn").set(3);
});
//clears the board after the results are shown after a 6 second delay
function clearBoard(){
    $(".firstPlayerChoice").detach();
    $("." + playerOneChoice + "").detach();
    $(".secondPlayerChoice").detach();
    $("." + playerTwoChoice + "").detach();
    $(".gameResults").detach();
    database.ref().child("/turn").set(1);
};
//if player one wins, increment player one's win, increment player two's loss and reset the game allowing another choice.
function firstPlayerWins(){
    playerOneWins++;
    database.ref("/players/p1/win").set(playerOneWins);
    playerTwoLoss++;
    database.ref("/players/p2/loss").set(playerTwoLoss);
    $("#gameResults").append("<p class='gameResults'>" + playerOneName);
    $("#gameResults").append("<p class='gameResults'> Wins!");
    var resultsCount = 6;
    var resultsCounter = setInterval(resultsTimer, 1000); 
    function resultsTimer(){
        resultsCount -= 1;
        if (resultsCount <= 0){
            clearInterval(resultsCounter);
            clearBoard();
        };
    };
};
//if player two wins, increment player twi's win, increment player one's loss and reset the game allowing another choice.
function secondPlayerWins(){
    playerTwoWins++;
    database.ref("/players/p2/win").set(playerTwoWins);
    playerOneLoss++;
    database.ref("/players/p1/loss").set(playerOneLoss);
    $("#gameResults").append("<p class='gameResults'>" + playerTwoName);
    $("#gameResults").append("<p class='gameResults'> Wins!");
    var resultsCount = 6;
    var resultsCounter = setInterval(resultsTimer, 1000); 
    function resultsTimer(){
        resultsCount -= 1;
        if (resultsCount <= 0){
            clearInterval(resultsCounter);
            clearBoard();
        };
    };
};
//if the players tie they are notified of the tie, no scores change.
function tieGame(){
    $("#gameResults").append("<p class='gameResults'> Tie");
    $("#gameResults").append("<p class='gameResults'> Game!");
    var resultsCount = 6;
    var resultsCounter = setInterval(resultsTimer, 1000); 
    function resultsTimer(){
        resultsCount -= 1;
        if (resultsCount <= 0){
            clearInterval(resultsCounter);
            clearBoard();
        };
    };
};
//this section is for the chat box, once a message is set it labels it with the players name and pushes it to the chat database.
$("#chatSend").on("click", function() {
    event.preventDefault();
    chat = chatName + ": " + $(".chatMessage").val().trim();
    database.ref("/chat").push({
        chat: chat
    });
    $(".chatMessage").val("");
});
//displays the chat messages
database.ref("/chat").on("child_added", function(snapshot){
    $(".chatbox").append("<p class='ml-1'>" + snapshot.val().chat + "</p>")
});