var config = {
    apiKey: "AIzaSyB4F97cr7wRfNH0O86Z_eFq04Uy9jRqoIs",
    authDomain: "rps-two-player-game.firebaseapp.com",
    databaseURL: "https://rps-two-player-game.firebaseio.com",
    projectId: "rps-two-player-game",
    storageBucket: "rps-two-player-game.appspot.com",
    messagingSenderId: "879567465944"
};
    
firebase.initializeApp(config);

var database = firebase.database();
var chat = "";
var playerOne = false;
var playerTwo = false;
var playerOneName = "";
var playerTwoName = "";
var turn = 0;

$("#chatSend").on("click", function() {
    chat = $(".chatMessage").val().trim();
    database.ref("/chat").push({
        chat: chat
    });
    $(".chatMessage").val("");
});

database.ref("/chat").on("child_added", function(snapshot){
    $(".chatbox").append("<p class='ml-1'>" + snapshot.val().chat + "</p>")
});

$("#startButton").on("click", function() {
    event.preventDefault();
    if ($("#playerName").val().trim() !== "") {
        if (playerOne === false) {
            playerOneName = $("#playerName").val().trim();
            database.ref("/players/p1").set({
                name: playerOneName,
                win: 0,
                loss: 0,
            });
            $(".form-inline").detach();
            $("#startHeader").html("<p>Hi " + playerOneName + "! You are Player 1")
            $("#startHeader").append("<p class='playerOneTurn'>")
            database.ref("/players/p1").onDisconnect().remove();
        } else if ( (playerOne === true) && (playerTwo === false) ) {
            playerTwoName = $("#playerName").val().trim();
            database.ref("/players/p2").set({
                name: playerTwoName,
                win: 0,
                loss: 0,
            });
            $(".form-inline").detach();
            $("#startHeader").html("<p>Hi " + playerTwoName + "! You are Player 2")
            $("#startHeader").append("<p class='playerTwoTurn'>")
            database.ref("/players/p2").onDisconnect().remove();
        };
    };
});

database.ref("/players").on("value", function(playerSnap){
    if (playerSnap.child("p1").exists()){
        playerOne = true;
        var p1 = playerSnap.val().p1;
        $("#playerOneStatus").html("<p>" + p1.name);
        $("#playerOneScore").text("Wins: " + p1.win + " Losses: " + p1.loss);
    } else {
        playerOne = false;
        $("#playerOneStatus").html("<p> Waiting for Player 1");
        database.ref().child("/turn").set(0);
    };
    if (playerSnap.child("p2").exists()){
        playerTwo = true;
        var p2 = playerSnap.val().p2;
        $("#playerTwoStatus").html("<p>" + p2.name);
        $("#playerTwoScore").text("Wins: " + p2.win + " Losses: " + p2.loss);
    } else {
        playerTwo = false;
        $("#playerTwoStatus").html("<p> Waiting for Player 2");
        database.ref().child("/turn").set(0);
    };
    if ((playerSnap.child("p1").exists()) && (playerSnap.child("p2").exists())){
        database.ref().child("/turn").set(1);
    };
    if (!playerOne && !playerTwo){
        database.ref("chat").remove();
        database.ref().child("/turn").set(0);
    };
});

database.ref("/turn").on("value", function(turnSnap){
    if (turnSnap.val() === 1) {
        if (playerOne && playerTwo){
            $(".playerOneTurn").text("It's Your Turn!")
            $(".playerTwoTurn").text("Waiting for " +  + " to choose.")
        };
    };
});