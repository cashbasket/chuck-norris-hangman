//global variables
var maxTries = 10;
var answers = ['walker texas ranger','fighter','roundhouse kick','the hitman','the delta force','flying kick','punch','hellbound','missing in action','christian','conservative','republican','veteran','patriot','greatest person ever','american hero','oklahoma','awesome','firewalker','karate master','code of silence'];
var winnerText = 'You guessed all the letters! Chuck is pleased. He wants to keep playing, though, so he picked a new word/phrase for you. Guess away!';
var loserText = 'You ran out of tries, and have therefore been kicked in the face. However, Chuck just thought up a new word (or phrase)! Do not disappoint him again.';
var chuckQuoteIntro = 'Relevant Chuck Quote:';
var chuckQuote = '"Violence is my last option."';
var errors = ['Only letter keys are allowed.','You\'ve already tried that letter.'];

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
	correctGuess: false,
	alreadyGuessed: false,
	isLetter: false,
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
		$('.wins').text(this.wins);
		$('.face-kicks').text(this.faceKicks);
		$('#maxTries').text(maxTries + ' times');
		$('#tries').text('').hide();
		$('#triesHeader').hide();
		$('.results').hide();
		$('#overlay').html(chuckQuoteIntro + '<br>' + chuckQuote);
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
			$('#triesLeft').css('color', '#ffcc00');
		}	
	},
	updateTriedLetters: function(guess) {
		if (!this.winner) { 
			$('#tries').append(guess.toUpperCase() + ' ');
			this.triedLetters.push(guess.toUpperCase());
		}
	},
	showErrors: function() {
		if(game.isLetter) {
			$('.letters-only > span').text(errors[1]);
		}
		else {
			$('.letters-only > span').text(errors[0]);
		}
		$('.letters-only').slideDown(200);
	},
	hideErrors: function() {
		$('.letters-only').slideUp(200);
	},
	checkForNewGuess: function(guess) {
		// check to see if user already guessed the letter
		for(var i=0; i < game.triedLetters.length; i++) {
			if(game.triedLetters[i] == guess.toUpperCase()) {
				this.alreadyGuessed = true;
				break;
			}
		}
		return this.alreadyGuessed;
	},
	checkForWinner: function() {
		if(this.lettersGotten.length == this.currentAnswer.length) {
			this.winner = true;
		}
		return this.winner;
	},
	checkForGameOver: function() {
		if(this.winner || this.triesLeft == 0) {
			this.gameOver = true;	
		}
		return this.gameOver;
	},
	displayLetters: function(guess) {
		for(var i=0; i <= this.currentAnswer.length - 1; i++) {
			if ($('#letter' + i).text() == '' && this.currentAnswer.charAt(i) == guess.toLowerCase()) {
				$('#letter' + i).append(guess.toLowerCase());
				this.lettersGotten.push(guess.toUpperCase());
				this.correctGuess = true;
				$('#letter' + i).css('border-bottom', 'none');
			}
		}
	},
	updateStats: function() {
		if (this.winner) {
			$('.wins').text(this.wins);
		}
		else {
			$('.face-kicks').text(this.faceKicks);
		}
	},
	postGame: function() {
		// congratulate user if user won
		if(this.winner) {
			this.wins++;
			this.playSound('applause');
		}
		// kick user in face if user lost
		else {
			this.faceKicks++;
			this.playSound('kick');
		}
		// update wins/losses and show results
		this.toggleTriesSection();
		this.updateStats();
		this.showResults();			
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
		this.correctGuess = false;
		this.alreadyGuessed = false;
		this.isLetter = false;
		this.winner = false;
		this.gameOver = false;
		this.triesLeft = maxTries;
		this.triedLetters = [];
		$('#tries').text('');
		$('#triesLeft').text(maxTries + ' tries remaining').css('color', '#fff');
		$('#overlay').html(chuckQuoteIntro + '<br>' + chuckQuote);
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
		$('#overlay').animate({ maxWidth: newPct + "%"},200);
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
		game.correctGuess = false;
		game.alreadyGuessed = false;
		game.isLetter = false;

		if(game.gameOver && !game.isReset) {
			// don't do nothin' until game resets
		}
		else {
			game.isReset = false;
			// check key code so ONLY letters are accepted
			if((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)) {
				game.isLetter = true;
				var isNewGuess = game.checkForNewGuess(userGuess.toUpperCase());
				if(!isNewGuess) {
					game.hideErrors();
					// display letters when guessed correctly
					game.displayLetters(userGuess.toUpperCase());
					// update list/array of tried letters
					game.updateTriedLetters(userGuess.toUpperCase());
					// display the "tried letters" header after the first guess
					if ($('#tries').text().length == 2) {
						game.toggleTriesSection();
					}
				}
				else {
					game.showErrors();
				}

				// check for win status
				var isWinner = game.checkForWinner();
				// if the user guesses a new letter and guesses wrong, reveal more Chuck. Otherwise, play a happy sound.
				if (!game.gameOver && !isNewGuess && !isWinner) {
					if(!game.correctGuess) {
						game.revealChuck();
						if(game.triesLeft > 1) {
							game.playSound('incorrect');
						}
						game.triesLeft--;
						game.updateTriesLeftDisplay();
						if(game.triesLeft < maxTries) {
							$('#overlay').text('');
						}
					}
					else {
						game.playSound('correct');
					}
				}

				//check to see if game is over
				if(game.checkForGameOver()) {
					game.postGame();
					if (getPctWidthOfOverlay() < 100) {
						$('#overlay').animate({ maxWidth: '100%' }, 500, function() {
							game.reset();
						});
					}
					else {
						game.reset();
					}
				}
			}
			else {
				game.showErrors();
			}
		}
	})
})