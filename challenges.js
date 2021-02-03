/*
YOUR 3 CHALLENGES
Change the game to follow these rules:

1. A player looses his ENTIRE score when he rolls two 6 in a row. After that, it's the next player's turn. (Hint: Always save the previous dice roll in a separate variable)
2. Add an input field to the HTML where players can set the winning score, so that they can change the predefined score of 100. (Hint: you can read that value with the .value property in JavaScript. This is a good oportunity to use google to figure this out :)
3. Add another dice to the game, so that there are two dices now. The player looses his current score when one of them is a 1. (Hint: you will need CSS to position the second dice, so take a look at the CSS code for the first one.)
*/

// state
let scores, roundScore, activePlayer, gamePlaying, rolledSix;

// controls
let rollButton, holdButton, resetButton, maxScoreInput;

// displayed elements
let dice0DOM, dice1DOM, ouchDOM, panelPl0DOM, panelPl1DOM;

init();

let rolls$ = Rx.Observable.fromEvent(rollButton, "click");

rolls$
  .map(() => {
    // Gen Random numbers
    let dice0 = Math.floor(Math.random() * 6) + 1;
    let dice1 = Math.floor(Math.random() * 6) + 1;
    return { dice0: dice0, dice1: dice1 };
  })
  .subscribe(({ dice0, dice1 }) => {
    if (gamePlaying) {
      // Display the result
      dice0DOM.style.display = "block";
      dice0DOM.src = "dice-" + dice0 + ".png";
      dice1DOM.style.display = "block";
      dice1DOM.src = "dice-" + dice1 + ".png";

      // Catastrophy check
      if (dice1 === 6 || dice0 === 6) {
        if (rolledSix) {
          ouchMessage(6).then(() => {
            scores[activePlayer] = 0;
            nextPlayer();
          });
        } else {
          rolledSix = true;
        }
      } else {
        rolledSix = false;
      }

      // Update the round score IF the rolled number was NOT a 1
      if (dice0 !== 1 && dice1 !== 1) {
        //Add score
        roundScore += dice0 + dice1;
        document.querySelector(
          "#current-" + activePlayer
        ).textContent = roundScore;
      } else {
        ouchMessage(1).then(() => nextPlayer());
      }
    }
  });

let holds$ = Rx.Observable.fromEvent(holdButton, "click");
holds$.subscribe(() => {
  if (gamePlaying) {
    // Add CURRENT score to GLOBAL score
    scores[activePlayer] += roundScore;

    // Update the UI
    document.querySelector("#score-" + activePlayer).textContent =
      scores[activePlayer];

    // Check if player won the game
    const customVal = document.querySelector(".max-score-input").value;
    const usedVal = customVal === "" ? 100 : Number(customVal);
    if (scores[activePlayer] >= usedVal) {
      document.querySelector("#name-" + activePlayer).textContent = "Winner!";
      document.querySelectorAll(".dice")[0].style.display = "none";
      document.querySelectorAll(".dice")[1].style.display = "none";
      document
        .querySelector(".player-" + activePlayer + "-panel")
        .classList.add("winner");
      document
        .querySelector(".player-" + activePlayer + "-panel")
        .classList.remove("active");
      gamePlaying = false;
    } else {
      //Next player
      nextPlayer();
    }
  }
});

function ouchMessage(number) {
  let text;
  if (number === 6) {
    text = "<strong>OUCH!<strong>\nThe 6-es";
  } else {
    text = "<strong>OUCH!<strong>\nRolled some 1";
  }

  return new Promise((success, fail) => {
    ouchDOM.firstElementChild.innerHTML = text;
    ouchDOM.style.display = "block";
    setTimeout(() => {
      ouchDOM.style.display = "none";
      success();
    }, 1200);
  });
}
function nextPlayer() {
  //Next player
  activePlayer === 0 ? (activePlayer = 1) : (activePlayer = 0);
  roundScore = 0;

  document.getElementById("current-0").textContent = "0";
  document.getElementById("current-1").textContent = "0";

  panelPl0DOM.classList.toggle("active");
  panelPl1DOM.classList.toggle("active");

  dice0DOM.style.display = "none";
  dice1DOM.style.display = "none";
}

let resets$ = Rx.Observable.fromEvent(resetButton, "click");
resets$.subscribe(init);

let maxScores$ = Rx.Observable.fromEvent(maxScoreInput, "keypress");
maxScores$
  .filter((ev) => ev.keyCode === 13)
  .subscribe((ev) => ev.target.blur());

function init() {
  // initial values for variables
  scores = [0, 0];
  activePlayer = 0;
  roundScore = 0;
  gamePlaying = true;
  rolledSix = false;

  rollButton = document.querySelector(".btn-roll");
  holdButton = document.querySelector(".btn-hold");
  resetButton = document.querySelector(".btn-new");
  maxScoreInput = document.querySelector(".max-score-input");

  dice0DOM = document.querySelectorAll(".dice")[0];
  dice1DOM = document.querySelectorAll(".dice")[1];
  ouchDOM = document.querySelector(".ouch");
  panelPl0DOM = document.querySelector(".player-0-panel");
  panelPl1DOM = document.querySelector(".player-1-panel");

  // initial values in content & styling
  dice0DOM.style.display = "none";
  dice1DOM.style.display = "none";
  ouchDOM.style.display = "none";

  document.getElementById("score-0").textContent = "0";
  document.getElementById("score-1").textContent = "0";
  document.getElementById("current-0").textContent = "0";
  document.getElementById("current-1").textContent = "0";
  document.getElementById("name-0").textContent = "Player 1";
  document.getElementById("name-1").textContent = "Player 2";
  panelPl0DOM.classList.remove("winner");
  panelPl1DOM.classList.remove("winner");
  panelPl0DOM.classList.remove("active");
  panelPl1DOM.classList.remove("active");

  panelPl0DOM.classList.add("active");
}
