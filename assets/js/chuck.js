//global variables
var maxTries = 10;
var answers = ['walker texas ranger','fighter','roundhouse kick','the hitman','the delta force','flying kick','punch','hellbound','missing in action','christian','conservative','republican','veteran','patriot','greatest person ever','american','oklahoma','awesome','firewalker','karate master','code of silence'];
var winnerText = 'You guessed all the letters! Chuck is pleased. He wants to keep playing, though, so he picked a new word/phrase for you. Guess away!';
var loserText = 'You ran out of tries, and have therefore been kicked in the face. However, Chuck just thought up a new word (or phrase)! Do not disappoint him again.';
var instructions = 'Press any letter key to get started!';

//global math functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPctWidthOfOverlay() {
	return parseFloat($('#overlay').width() / $('#chuckHolder').width()) * 100;
}

//initialize game object
var game = { 
	currentAnswer: '',
	lastAnswer: '',
	triesLeft: maxTries,
	lettersGotten: [],
	triedLetters: [],
	winner: false,
	gameOver: false,
	wins: 0,
	faceKicks: 0,
	isReset: false,
	init: function() {
		$('#triesLeft').text(maxTries + ' tries remaining');
		$('#wins').text(this.wins);
		$('#faceKicks').text(this.faceKicks);
		$('#maxTries').text(maxTries + ' times');
		$('#tries').text('').hide();
		$('#triesHeader').hide();
		$('.results').hide();
		$('#overlay').text(instructions);
		$('.letters-only').hide();
	},
	chooseWord: function(wordArray) {
		this.lettersGotten = [];
		var randomIndex = getRandomInt(0, wordArray.length - 1);
		var selectedWord = wordArray[randomIndex];
		$('#word').html('');
		var letterBox = document.createElement('span');
		letterBox.setAttribute('class', 'letterbox');
		letterBox.id = 'letter0';
		$('#word').append(letterBox);

		for(var i=0; i < selectedWord.length - 1; i++) {
			var nextLetter = $('#letter' + i).clone();
			nextLetter.attr('id', 'letter' + (i+1));
			nextLetter.appendTo('#word');
			if(selectedWord.charAt(i) == ' ') {
				$('#letter' + i).css('border-bottom', 'none');
			}
		}
		this.currentAnswer = selectedWord;
		for(var i=0; i <= this.currentAnswer.length - 1; i++) {
			if(this.currentAnswer.charAt(i) == ' ') {
				$('#letter' + i).append(' ');
				this.lettersGotten.push(' ');
			}
		}
	},
	updateTriesLeftDisplay: function () {
		var triesSuffix = this.triesLeft > 1 ? ' tries remaining' : ' try remaining';
		$('#triesLeft').text(this.triesLeft + triesSuffix);
		if (this.triesLeft <= maxTries/2) {
			$('#triesLeft').css('color', '#be1c1c').prepend('only ');
		}	
	},
	updateTriedLetters: function(guess) {
		if (!this.winner) { 
			$('#tries').append(guess.toUpperCase() + ' ');
			this.triedLetters.push(guess.toUpperCase());
		}
	},
	updateStats: function() {
		if (this.winner) {
			$('#wins').text(this.wins);
		}
		else {
			$('#faceKicks').text(this.faceKicks);
		}
	},
	showResults: function(status) {	
		if (this.winner) {
			$('.results-panel').css('background-color','#b9ddb4');
			$('.result-text').css('color', '#317a27').text(winnerText);
		}
		else {
			$('.results-panel').css('background-color', '#eecdcd');
			$('.result-text').css('color', '#be1c1c').text(loserText);
		}
		$('.results').slideDown().delay(7000).slideUp();
	},
	toggleTriesSection: function () {
		$('#tries').toggle();
		$('#triesHeader').toggle();
	},
	reset: function() {
		//reset object properties
		this.winner = false;
		this.gameOver = false;
		this.triesLeft = maxTries;
		this.triedLetters = [];
		$('#tries').text('');
		$('#triesLeft').text(maxTries + ' tries remaining').css('color', '#fff');
		$('#overlay').text(instructions);
		this.lastAnswer = this.currentAnswer;
		//choose new word
		this.chooseWord(answers);
		//checks to make sure the new word isn't the same as the previous word
		for(;;) {
			if (this.currentAnswer == this.lastAnswer) {
				this.chooseWord(answers);
			}
			else {
				break;
			}
		}
		this.isReset = true;
	},
	revealChuck: function() {
		var curPct = getPctWidthOfOverlay();
		var newPct = curPct - (100/maxTries);
		$('#overlay').css('width', newPct + "%");
	},
	playSound: function(type) {
		var audio = document.getElementById('soundEffect');
		switch (type) {
			case 'correct':
				audio.src = 'assets/mp3/correct.mp3';
				break;
			case 'applause':
				audio.src = 'assets/mp3/applause.mp3';
				break;
			case 'incorrect':
				audio.src = 'assets/mp3/swoosh.mp3';
				break;
			case 'kick':
			default:
				audio.src = 'assets/mp3/slap.mp3';
		}
	    audio.play();     
	}
};

// once the DOM is all loaded, we're good to go
$(document).ready(function () {
	// initialize HTML elements
	game.init();

	// choose the first word
	game.chooseWord(answers);
	game.lastAnswer = game.currentAnswer;

	// do stuff when key is pressed
	$(document).keyup(function(event) {
		var userGuess = event.key;
		var correctGuess = false;
		var alreadyGuessed = false;

		if(game.gameOver && !game.isReset) {
			// don't do nothin' until game resets
		}
		else {
			game.isReset = false;
			// check key code so ONLY letters are accepted
			if((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)) {
				$('.letters-only').fadeOut(250);
				$('#overlay').text('');
				// check to see if user already guessed the letter
				for(var i=0; i < game.triedLetters.length; i++) {
					if(game.triedLetters[i] == userGuess.toUpperCase()) {
						alreadyGuessed = true;
						break;
					}
				}
				
				if(!alreadyGuessed) {
					// display letters when guessed correctly
					for(var i=0; i <= game.currentAnswer.length - 1; i++) {
						if ($('#letter' + i).text() == '' && game.currentAnswer.charAt(i) == userGuess.toLowerCase()) {
							$('#letter' + i).append(userGuess.toLowerCase());
							game.lettersGotten.push(userGuess.toUpperCase());
							correctGuess = true;
							$('#letter' + i).css('border-bottom', 'none');
						}
					}
					// update list/array of tried letters
					game.updateTriedLetters(userGuess);

					// display the "tried letters" header after the first guess
					if ($('#tries').text().length == 2) {
						game.toggleTriesSection();
					}
				}

				// if the user has guessed all the letters, then s/he is a winner!
				if(game.lettersGotten.length == game.currentAnswer.length) {
					game.winner = true;
				}

				// if the user guesses a new letter and guesses wrong, reveal more Chuck. Otherwise, play a happy sound.
				if (!game.gameOver && !alreadyGuessed && !game.winner) {
					if(!correctGuess) {
						game.revealChuck();
						if(game.triesLeft > 1) {
							game.playSound('incorrect');
						}
						game.triesLeft--;
						game.updateTriesLeftDisplay();
					}
					else {
						game.playSound('correct');
					}
				}
				
				// if the user wins or runs out of tries, the game is over
				if(game.winner || game.triesLeft == 0)
					game.gameOver = true;		
				
				// if the game is over...
				if(game.gameOver) {
					// ... congratulate user if user won
					if(game.winner) {
						game.wins++;
						game.playSound('applause');
					}
					// ... kick user in face if user lost
					else {
						game.faceKicks++;
						game.playSound('kick');
					}
					// update wins/losses and show results
					game.toggleTriesSection();
					game.updateStats();
					game.showResults();

					// reset game
					if (getPctWidthOfOverlay() < 100) {
						$('#overlay').animate({ width: '100%' }, 500, function() {
							game.reset();
						});
					}
					else {
						game.reset();
					}
				}
			}
			else {
				$('.letters-only').show();
			}
		}
	})
})