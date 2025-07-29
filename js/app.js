const iconsType1 = [
    './images/Herbalia/antioxidant.webp',
    './images/Herbalia/antirid.webp',
    './images/Herbalia/nocna krema.webp',
    './images/Herbalia/piling za telo.webp',
    './images/Herbalia/piskavica.webp',
    './images/Herbalia/repair.webp',
    './images/Herbalia/ulje za kosu.webp',
    './images/Herbalia/vitamin c piling.webp',
];

const board = document.querySelector('.game-board');
const reset = document.getElementById('reset');
const replay = document.getElementById('replay');
const form = document.getElementById('form');
const difficulties = document.querySelectorAll("input[name='difficulty']");
const difficultyLabels = document.querySelectorAll("#form label");
const timer = document.getElementById('timer');
const ratingPerfect = document.getElementById('rating-perfect');
const ratingAverage = document.getElementById('rating-average');
const modal = document.querySelector('.modal');
const startHint = document.getElementById('startHint'); // Get the start hint element

let clickCount = 0;
let selectedCards = [];
let iconClasses, sec, moves, wrongMoves, correctMoves, difficulty, difficultyClass, setTimer, selectedIcons;

//shuffle function from https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    var m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
}

// go over the radio buttons and check the difficulty selection
function checkDifficulty() {
    difficultyLabels.forEach(label => {
        label.classList.remove('checked', 'active-difficulty');
    });
    [].forEach.call(difficulties, function (input) {
        if (input.value === 'type1' && input.checked === true) {
            difficulty = 16; // Adjust as needed
            difficultyClass = 'normal'; // You can keep it 'normal' or change it
            input.nextElementSibling.classList.add('checked', 'active-difficulty');
            selectedIcons = iconsType1;
        } else if (input.value === 'type2' && input.checked === true) {
            difficulty = 16; // Adjust as needed
            difficultyClass = 'normal'; // You can keep it 'normal' or change it
            input.nextElementSibling.classList.add('checked', 'active-difficulty');
            selectedIcons = iconsType2;
        } else if (input.value === 'type3' && input.checked === true) {
            difficulty = 16; // Adjust as needed
            difficultyClass = 'normal'; // You can set a different class for the third difficulty
            input.nextElementSibling.classList.add('checked', 'active-difficulty');
            selectedIcons = iconsType3;
        }
    });
}

function populate(num) {
    iconClasses = [];
    clickCount = 0;
    board.innerHTML = '';

    // Ensure unique image pairs
    shuffle(selectedIcons);
    let uniqueImages = [...new Set(selectedIcons)]; // Remove duplicates from the array
    let boardIcons = uniqueImages.slice(0, num / 2); // Take only enough unique images

    // Duplicate to create pairs
    boardIcons = boardIcons.flatMap(image => [image, image]);

    // Shuffle the boardIcons array after duplication
    shuffle(boardIcons);

    // Populate the board
    const fragment = document.createDocumentFragment();
    for (let x = 0; x < num; x++) {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container', difficultyClass);
        const front = document.createElement('div');
        const back = document.createElement('div');
        front.classList.add('card', 'front');
        back.classList.add('card', 'back');
        const icon = document.createElement('img');
        icon.src = boardIcons[x]; // Use the image path from the shuffled array
        icon.classList.add('icon'); // Add a class for styling if needed
        back.appendChild(icon);

        cardContainer.appendChild(front);
        cardContainer.appendChild(back);
        fragment.appendChild(cardContainer);
    }
    board.appendChild(fragment);
}

function stopwatch() {
    sec += 1;
    if (sec < 60) {
        timer.innerText = sec;
    } else if (sec < 3600) {
        let minutes = Math.floor(sec / 60);
        let seconds = sec % 60;
        timer.innerText = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
}

function updateRatingStars() {
    // Star rating logic based on total moves
    switch (difficultyClass) {
        case 'normal':
            if (moves >= 15 && !ratingPerfect.classList.contains('hide')) {
                ratingPerfect.classList.add('hide');
            }
            if (moves >= 20 && !ratingAverage.classList.contains('hide')) {
                ratingAverage.classList.add('hide');
            }
            break;
    }
}

function checkwin(num) {
    //easy won with 2 correct moves, normal with 8 and hard with 18
    let won;
    switch (difficultyClass) {
        case 'normal':
            if (num === 8) {
                won = true;
            };
            break;
    };
    if (won === true) {
        //wait 1 sec for the cards to flip right side up
        setTimeout(function () {
            //fill in and display modal
            document.getElementById('final-time').innerText = timer.innerText;
            document.getElementById('final-moves').innerText = moves;
            document.getElementById('final-rating').innerHTML = document.getElementById('stars').innerHTML;
            modal.classList.remove('hide');
            //stop the stopwatch
            clearInterval(setTimer);

            // **Call updateShareLinks after values are set**
            updateShareLinks();
        }, 1000);
    }
}

function matchChecker(e) {
    // LOGIC IS: make sure the click target is a card and prevent doubleclicking
    if (e.target.classList.contains('card') && !e.target.classList.contains('front-open')) {

        // Hide the hint on the first card click
        if (startHint && startHint.classList.contains('show')) {
            startHint.classList.remove('show');
            // Store in localStorage that the game has started for the first time
            localStorage.setItem('memoryGameStarted', 'true');
        }

        // Flip the card on click
        e.target.classList.add('front-open');
        e.target.nextElementSibling.classList.add('back-open');

        // Keep track of the src (image) of the clicked cards
        selectedCards.push(e.target);
        clickCount += 1;

        // Allow only two clicks and then verify the match
        if (clickCount === 2) {
            clickCount = 0;
            // 2 clicks make 1 move
            moves += 1;
            document.getElementById('moves').innerHTML = moves;
            updateRatingStars(); // Call updateRatingStars here after moves are incremented

            // Remove the ability to click extra cards for 1 second while the 2 already clicked cards are checked
            board.removeEventListener('click', matchChecker);
            setTimeout(function () {
                board.addEventListener('click', matchChecker);
            }, 1000);

            // Compare the image src (not class)
            if (selectedCards[0].nextElementSibling.firstChild.src === selectedCards[1].nextElementSibling.firstChild.src) {
                console.log('match');
                correctMoves += 1;
                // Check if the game is won
                checkwin(correctMoves);

                // Reset selected cards and keep them open
                selectedCards.forEach(card => {
                    card.classList.add('front-correct');
                    card.nextElementSibling.classList.add('back-correct');
                });
                selectedCards = []; // Clear the selected cards array
            } else {
                console.log('not match');
                // Handle wrong moves - you might still want to track these separately if needed for other stats
                wrongMoves += 1;

                // Wait 1 second before closing mismatching cards so the player can see what they were
                setTimeout(function () {
                    selectedCards.forEach(card => {
                        card.classList.remove('front-open');
                        card.nextElementSibling.classList.remove('back-open');
                    });
                    selectedCards = []; // Reset the selected cards array
                }, 1000);
            }
        }
    }
}




function updateShareLinks() {
    const time = document.getElementById('final-time').innerText;
    const moves = document.getElementById('final-moves').innerText;
    const gameUrl = window.location.href;
    
    const message = `Razbio/la sam Herbalia memorijsku igru za ${time} sekundi i ${moves} poteza! Memoriši. Poveži. Osvoji i ti 10% ovde: ${gameUrl}`;
    const encodedMessage = encodeURIComponent(message);

    

    document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`;
    document.getElementById('shareWhatsApp').href = `https://wa.me/?text=${encodedMessage}`;
    document.getElementById('shareViber').href = `viber://forward?text=${encodedMessage}`;
    document.getElementById('shareTelegram').href = `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodedMessage}`;
}

window.addEventListener('load', updateShareLinks);


function startGame() {
    // Reset values
    sec = 0;
    moves = 0;
    wrongMoves = 0;
    correctMoves = 0;
    timer.innerText = '0';
    document.getElementById('moves').innerHTML = '0';
    modal.classList.add('hide');
    ratingPerfect.classList.remove('hide');
    ratingAverage.classList.remove('hide');
    clearInterval(setTimer);

    // Reset game state
    checkDifficulty();
    populate(difficulty);

    // Show hint ONLY if localStorage key 'memoryGameStarted' is NOT set
    if (!localStorage.getItem('memoryGameStarted')) {
        startHint.classList.add('show');
    } else {
        startHint.classList.remove('show');
    }

    // Timer on first click (existing)
    board.addEventListener('click', function clickOnce() {
        clearInterval(setTimer);
        setTimer = setInterval(stopwatch, 1000);
        board.removeEventListener('click', clickOnce);
    });
}

reset.addEventListener('click', startGame);
replay.addEventListener('click', startGame);
form.addEventListener('change', function (event) {
    if (event.target.name === 'difficulty') {
        startGame();
    }
});

// Use this event listener for restarting the game when clicking the replay button
replay.addEventListener('click', startGame);

// Add the click listener for the modal's "Oš igrat opet?" button (replay)
document.getElementById('replay').addEventListener('click', startGame);

// Ensure the modal doesn't reset the game if the user clicks outside of it
modal.addEventListener('click', function (e) {
    // Stop the modal click from propagating, so it doesn't trigger the window listener
    e.stopPropagation();
});

board.addEventListener('click', matchChecker);

// Initial game start on page load
window.addEventListener('load', () => {
    startGame();
});



const openBtn = document.getElementById('openGameButton');
  const overlay = document.getElementById('memoryGameOverlay');
  const panel = document.getElementById('memoryGamePanel');
  const closeBtn = panel.querySelector('.close-btn');

 // Open the panel
openBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    panel.classList.add('open');
    // Remove the inert attribute when the panel is opened
    overlay.removeAttribute('inert');
    // Important: Focus an element inside the newly opened panel for accessibility
    // For example, focus the close button within the panel
    closeBtn.focus();
    // You can remove this line entirely, as inert handles accessibility hiding
    // overlay.setAttribute('aria-hidden', 'false'); // <-- REMOVE THIS LINE
});

  // Close when clicking close button
  closeBtn.addEventListener('click', closePanel);

  // Close when clicking outside panel
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePanel();
  });

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    // Add the inert attribute back when the panel is closed
    overlay.setAttribute('inert', ''); // Setting it to an empty string is sufficient for a boolean attribute
    // Important: Move focus back to the element that opened the panel, or a logical next focusable element
    openBtn.focus();
    // You can remove this line entirely, as inert handles accessibility hiding
    // overlay.setAttribute('aria-hidden', 'true'); // <-- REMOVE THIS LINE
}






  const copyBtn = document.getElementById('copyCodeBtn');
	const copyToast = document.getElementById('copyToast');

	copyBtn.addEventListener('click', () => {
	const code = document.getElementById('discountCode').textContent;
	navigator.clipboard.writeText(code).then(() => {
		// Show the toast
		copyToast.classList.add('show');

		// Hide after 2 seconds
		setTimeout(() => {
		copyToast.classList.remove('show');
		}, 2000);
	}).catch(() => {
		console.error('Greška pri kopiranju koda.');
	});
	});
