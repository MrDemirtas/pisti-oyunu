const cardValue = document.querySelector(".card-value");
const cardColor = document.querySelector(".card-color");
const playerArea = document.querySelector(".player-area");
const computerArea = document.querySelector(".computer-area");
const gameArea = document.querySelector(".middle-area");
const computerScore = document.querySelector(".computerScore");
const playerScore = document.querySelector(".playerScore");
const statusMsg = document.querySelector(".statusMsg");
const cardNumber = document.querySelector(".cardNumber");

let cards = [];
let userCards = [];
let computerCards = [];
let gameAreaCards = [];
let queue = "computer";
let scores = {
  computer: 0,
  player: 0,
};

const getCards = async () => {
  await getRequest("./assets/json/cards.json").then((response) => {
    cards = response;
  });
};

const randomGetCards = async () => {
  let randomCards = [];
  if (cards.length >= 0) {
    for (let index = 0; index < 4; index++) {
      let cardsIndex = Math.floor(Math.random() * cards.length);
      let card = cards[cardsIndex];
      cards.splice(cardsIndex, 1);
      randomCards.push(card);
    }
  }
  return randomCards;
};

const userGetCards = async () => {
  userCards = await randomGetCards();
};

const computerGetCards = async () => {
  computerCards = await randomGetCards();
};

const onTableCardAdd = async () => {
  gameAreaCards = await randomGetCards();
  gameArea.innerHTML = `
    <div class="iskambil-card-fg ${gameAreaCards[gameAreaCards.length - 1].color == "Karo" || gameAreaCards[gameAreaCards.length - 1].color == "Kupa" ? "red-card" : ""}">
      <div class="card-fg">
        <span class="card-value">${gameAreaCards[gameAreaCards.length - 1].value}</span>
        <span class="card-color">${convertColor(gameAreaCards[gameAreaCards.length - 1].color)}</span>
      </div>
    </div>
  `;
};

const cardReset = async () => {
  await userGetCards().then(() => {
    computerGetCards().then(() => {
      for (let index = 0; index < userCards.length; index++) {
        playerArea.innerHTML += `
        <button value='{"color": "${userCards[index].color}", "value": "${userCards[index].value}"}' onclick='queue == "player" ? this.remove() : ""; playerCardClick(JSON.parse(this.value))'>
          <div class="iskambil-card-fg ${userCards[index].color == "Karo" || userCards[index].color == "Kupa" ? "red-card" : ""}">
            <div class="card-fg">
              <span class="card-value">${userCards[index].value}</span>
              <span class="card-color">${convertColor(userCards[index].color)}</span>
            </div>
          </div>
        </button>
      `;
      }

      computerCards.forEach((element) => {
        computerArea.innerHTML += `
          <div class="iskambil-card-bg">
            <div class="card-bg"></div>
          </div>`;
      });
    });
  });

  cardNumber.innerHTML = `Kalan Kart: ${cards.length}`;
};

const cardController = () => {
  if (userCards.length == 0 && computerCards == 0) {
    if (cards.length != 0) {
      setTimeout(() => {
        cardReset().then(() => {
          setTimeout(() => {
            computerPlayed();
          }, 1000);
        });
      }, 1000);
    } else {
      let gameStatus;
      if (scores.player == scores.computer) {
        gameStatus = "Berabere";
      } else if (scores.player > scores.computer) {
        gameStatus = "Sen Kazandın!";
      } else {
        gameStatus = "Bilgisayar Kazandı!";
      }
      statusMsg.innerHTML = `Oyun Bitti<br>${gameStatus}`;
    }
  } else {
    setTimeout(() => {
      computerPlayed();
    }, 1000);
  }
};

const playerCardClick = (params) => {
  if (queue === "player") {
    gameArea.innerHTML = `
    <div class="iskambil-card-fg ${params.color == "Karo" || params.color == "Kupa" ? "red-card" : ""}">
      <div class="card-fg">
        <span class="card-value">${params.value}</span>
        <span class="card-color">${convertColor(params.color)}</span>
      </div>
    </div>
  `;

    userCards.splice(
      userCards.findIndex((x) => x.value === params.value && x.color === params.color),
      1
    );

    gameController(params, (status) => {
      gameAreaCards.push(params);
      if (status) {
        if (gameAreaCards.length - 1 == 1 && params.value == gameAreaCards[0].value) {
          calcScore(true, "player", params);
        } else {
          calcScore(false, "player", params);
        }
        setTimeout(() => {
          gameArea.innerHTML = "";
          cardController();
        }, 1000);
      } else {
        cardController();
      }
    });
    queue = "computer";
  }
};

const computerPlayed = () => {
  if (queue == "computer") {
    let computerSelectCardIndex = Math.floor(Math.random() * computerCards.length);
    let computerSelectCard = computerCards[computerSelectCardIndex];
    gameArea.innerHTML = `
      <div class="iskambil-card-fg computer-card ${computerSelectCard.color == "Karo" || computerSelectCard.color == "Kupa" ? "red-card" : ""}">
        <div class="card-fg">
          <span class="card-value">${computerSelectCard.value}</span>
          <span class="card-color">${convertColor(computerSelectCard.color)}</span>
        </div>
      </div>
    `;

    let computerCardDiv = document.querySelectorAll(".computer-area .iskambil-card-bg");
    computerCardDiv.length != 0 ? computerCardDiv[0].remove() : "";
    computerCards.splice(computerSelectCardIndex, 1);
    gameController(computerSelectCard, (status) => {
      gameAreaCards.push(computerSelectCard);
      if (status) {
        if (gameAreaCards.length - 1 == 1 && computerSelectCard.value == gameAreaCards[0].value) {
          calcScore(true, "computer", computerSelectCard);
        } else {
          calcScore(false, "computer", computerSelectCard);
        }

        setTimeout(() => {
          gameArea.innerHTML = "";
          queue = "player";
        }, 1000);
      } else {
        queue = "player";
      }
    });
  }
};

const gameController = (card, callback) => {
  let status = false;
  if (gameAreaCards.length != 0) {
    if (card.value == gameAreaCards[gameAreaCards.length - 1].value || card.value == "J") {
      status = true;
    }
  }

  if (queue == "computer") {
    statusMsg.innerHTML = "Sıra Sende";
  } else {
    statusMsg.innerHTML = "Sıra Bilgisayarda";
  }
  callback(status);
};

const cardScores = {
  "Maça A": 1,
  "Kupa A": 1,
  "Karo A": 1,
  "Sinek A": 1,
  "Maça J": 1,
  "Kupa J": 1,
  "Karo J": 1,
  "Sinek J": 1,
  "Sinek 2": 2,
  "Karo 10": 3,
  Pişti: 10,
  "Pişti J": 20,
};

const calcScore = (isPisti, playerName, card) => {
  if (isPisti) {
    if (card.value == "J") {
      scores[playerName] += cardScores["Pişti J"];
      statusMsg.innerHTML = `PİŞTİ<br>${playerName == "player" ? "Oyuncu" : "Bilgisayar"}} ${cardScores["Pişti J"]} Puan Kazandı! `;
    } else {
      scores[playerName] += cardScores["Pişti"];
      statusMsg.innerHTML = `PİŞTİ<br>${playerName == "player" ? "Oyuncu" : "Bilgisayar"} ${cardScores["Pişti"]} Puan Kazandı! `;
    }
  } else {
    let totalScore = 0;
    gameAreaCards.forEach((element) => {
      if (typeof cardScores[element.color + " " + element.value] != "undefined") {
        scores[playerName] += cardScores[element.color + " " + element.value];
        totalScore += cardScores[element.color + " " + element.value];
      }
    });
    statusMsg.innerHTML = `${playerName == "player" ? "Oyuncu" : "Bilgisayar"} ${totalScore} Puan Kazandı! `;
  }
  gameAreaCards = [];
  playerScore.innerHTML = scores.player;
  computerScore.innerHTML = scores.computer;
};

const convertColor = (param) => {
  const colorData = {
    Kupa: "&#9829",
    Karo: "&#9830",
    Maça: "&#9824",
    Sinek: "&#9827",
  };
  return colorData[param];
};

const getRequest = async (uri) => {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error("Request error");
  }
  return response.json();
};

getCards().then(() => {
  onTableCardAdd().then(() => {
    cardReset().then(() => {
      statusMsg.innerHTML = "Sıra bilgisayarda";
      setTimeout(() => {
        computerPlayed();
      }, 1500);
    });
  });
});
