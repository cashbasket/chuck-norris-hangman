//global variables and stuff I want to be able to find and edit easily
var answerBank = ['walker, texas ranger', 'martial artist', 'roundhouse kick', 'the hitman', 'the delta force', 'flying kick', 'hellbound', 'missing in action', 'knockout punch', 'devout christian', 'conservative', 'republican', 'military man', 'patriot', 'greatest person ever', 'american hero', 'oklahoma rules', 'the most awesome living human', 'firewalker', 'karate master', 'code of silence', 'the expendables 2', 'the colombian connection', 'sidekicks', 'the octagon', 'an eye for an eye', 'forced vengeance', 'silent rage', 'trial by fire', 'invasion u.s.a.', 'lone wolf mcquade', 'the way of the dragon', 'a force of one', 'karate kommandos', 'the president\'s man', 'logan\'s war', 'forest warrior', 'wind in the wire', 'hero and the terror', 'black tigers', 'the cutter', 'good guys wear black', 'bells of innocence', 'breaker! breaker!'];
var specialCharacters = [' ', ',', '.', ':', '\'', '-', '!'];
var winnerText = 'You got it! Chuck is pleased, and wants to keep this game going. Give him a second to think up a new answer.';
var loserText = 'Chuck got real mad and kicked you in the face. However, he wants to keep playing. Give him a second to think up a new answer.';
var factHeader = '<span class="fact-header">Fact:</span>';
var facts = ['Chuck Norris was bitten by a cobra, and after five days of excruciating pain, the cobra died.', 'Chuck Norris once kicked a horse in the chin. Its descendants today are known as giraffes.', 'Chuck Norris doesn\'t breathe air; he holds air hostage.', 'When Chuck Norris turned 18, his parents moved out.', 'Chuck Norris doesn\'t dial the wrong number; you answer the wrong phone.', 'If Chuck Norris were a Spartan in the movie "300," the movie would be called "1."', 'Chuck Norris is currently suing NBC, claiming "Law" and "Order" are trademarked names for his left and right legs.', 'Chuck Norris will never have a heart attack; his heart isn\'t nearly foolish enough to attack him.', 'Chuck Norris can kill two stones with one bird.', 'Chuck Norris does not sleep; he waits.', 'The easiest way to determine Chuck Norris\' age is to cut him in half and count the rings.', 'There is no chin underneath Chuck Norris\' beard; there is only another fist.'];
var alreadyGuessedError = 'You already tried that one!';
var invalidGuessError = 'Only letter and number keys are allowed.';
var instructionText = 'Press a letter or number key to get started!';
var onplaying = true;
var onpause = false;

//global math functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getPctWidthOfOverlay() {
	return parseFloat($('#overlay').width() / $('#chuckHolder').width()) * 100;
}
//global string functions
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

//define game object
var game = { 
	currentAnswer: '',
	uniqueChars: [],
	maxTries: 10,
	triesLeft: 0,
	triedLetters: [],
	correctGuesses: 0,
	answersLeft: [],
	wins: 0,
	losses: 0,
	isReset: false,
	init: function() { 
		//set number of tries left to max number of tries
		this.triesLeft = this.maxTries;

		//create audio element that plays all the awesome sounds
		var audio = document.createElement('audio');
		audio.id = 'audio';
		$('body').prepend(audio);

		$('#wins').text(this.wins);
		$('#losses').text(this.losses);
		$('#maxTriesText').text(this.maxTries + ' times');
		$('#results').hide();
		$('#fact').html(factHeader + '<br>' + this.getRandomFact())
				  .fadeIn(200);
		$('#errors').hide();
		$('.get-started').text(instructionText);

		this.currentAnswer = this.chooseAnswer();
		this.prepareGameDisplay(this.currentAnswer);
		this.updateTriesLeftDisplay();
	},
	getRandomFact: function() {
		return facts[getRandomInt(0, facts.length - 1)];
	},
	chooseAnswer: function() {
		//if answersLeft is empty, populate it with all values from answerBank
		if(this.answersLeft.length === 0) {
			this.answersLeft = answerBank.slice(0);
		}
		//select random answer from answersLeft array
		var selectedAnswer = this.answersLeft[getRandomInt(0, this.answersLeft.length - 1)];
		
		//remove selected answer from answersLeft array
		this.answersLeft.splice(this.answersLeft.indexOf(selectedAnswer), 1);

		//keep track of the unique non-special characters in each answer
		for (var i = 0; i < selectedAnswer.length; i++) {
			if(!specialCharacters.includes(selectedAnswer.charAt(i)) && !this.uniqueChars.includes(selectedAnswer.charAt(i).toUpperCase())) {
				this.uniqueChars.push(selectedAnswer.charAt(i).toUpperCase());
			}
		}
		return selectedAnswer;
	},
	prepareGameDisplay: function(answer) {
		var displayed = answer;
		//replace all non-special characters in answer with underscores
		for(var i=0; i < answer.length; i++) {
			if(!specialCharacters.includes(answer.charAt(i)))
				displayed = displayed.replaceAt(i, '_');
		}
		$('#word').text(displayed);

		//display either "current word" or "current phrase" depending on how many words are in the answer
		if(answer.indexOf(' ') > 0) {
			$('#answerType').text('phrase');
		}
		else {
			$('#answerType').text('word');
		}
	},
	processGuess: function(guess) {
		var displayed = $('#word').text();
		var correctGuess = false;
		// update word/phase with guess if correct
		for(var i=0; i < this.currentAnswer.length; i++) {
			if (this.currentAnswer.charAt(i) == guess.toLowerCase()) {
				displayed = displayed.replaceAt(i, guess.toUpperCase());
				correctGuess = true;
			}
		}
		$('#word').text(displayed);

		// track tried characters
		if (!this.isWinner()) {
			this.triedLetters.push(guess.toUpperCase());
		}
		$('#gameDisplay').removeClass('pulsate');

		// mark the on-screen keyboard button
		var $btn = $('.kb-btn[data-key="' + guess.toUpperCase() + '"]');
		$btn.prop('disabled', true);

		if(!correctGuess) {
			$btn.addClass('kb-incorrect');
			this.openCurtain();
			if(this.triesLeft > 1) {
				this.playSound('incorrect');
			}
			this.triesLeft--;
			this.updateTriesLeftDisplay();
			if(this.triesLeft < this.maxTries) {
				$('#fact').fadeOut(200);
			}
		}
		else {
			$btn.addClass('kb-correct');
			this.correctGuesses++;
			//don't play the 'correct' sound for the last remaining guess. Otherwise, it creates a conflict with the 'victory' sound and throws a JS error.
			if(this.uniqueChars.length != this.correctGuesses) {
				this.playSound('correct');
			}
		}
	},
	updateTriesLeftDisplay: function () {
		var triesSuffix = this.triesLeft != 1 ? ' tries remaining' : ' try remaining';
		$('#triesLeft').text(this.triesLeft + triesSuffix);
		if (this.triesLeft <= parseFloat(this.maxTries/2)) {
			$('#triesLeft').addClass('yellow');
		}
		else {
			$('#triesLeft').removeClass('yellow');
		}
	},
	showErrors: function(type) {
		switch(type) {
			case 'already-guessed':
				$('#errors').text(alreadyGuessedError);
				break;
			case 'invalid-guess':
			default:
				$('#errors').text(invalidGuessError);
		}
		$('#errors').slideDown(200);
	},
	hideErrors: function() {
		$('#errors').slideUp(200);
	},
	isNewGuess: function(guess) {
		for(var i=0; i < game.triedLetters.length; i++) {
			if(game.triedLetters[i] == guess.toUpperCase()) {
				return false;
			}
		}
		return true;
	},
	isValidKeyCode: function(keyCode) {
		return ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122));
	},
	isWinner: function() {
		return this.correctGuesses == this.uniqueChars.length;
	},
	isGameOver: function() {
		return (this.isWinner() || this.triesLeft === 0);
	},
	updateStats: function() {
		if (this.isWinner()) {
			$('#wins').text(this.wins);
		}
		else {
			$('#losses').text(this.losses);
		}
	},
	showResults: function() {	
		$('#results').removeClass('resultWin resultLoss');
		if (this.isWinner()) {
			$('#results').addClass('resultWin').text(winnerText);
		}
		else {
			$('#results').addClass('resultLoss').text(loserText);
		}	
		var dotCount = 0;
		var dotInterval = setInterval(function() {
		    $('#results').append('.');
		    dotCount++;
		    if(dotCount == 10) {
		    	clearInterval(dotInterval);
		    }
		  }, 700);
		
		$('#results').slideDown(200).delay(5000).slideUp(200);
	},
	openCurtain: function() {
		var newPct = getPctWidthOfOverlay() - parseFloat(100/this.maxTries);
		$('#overlay').animate({ maxWidth: newPct + "%"},100);
	},
	playSound: function(type) {
		var audio = document.getElementById('audio');
		switch (type) {
			case 'correct':
				audio.src = 'assets/mp3/correct.mp3';
				break;
			case 'victory':
				audio.src = 'assets/mp3/absolutely-right.mp3';
				break;
			case 'incorrect':
				audio.src = 'assets/mp3/swoosh.mp3';
				break;
			case 'kick':
			default:
				audio.src = 'assets/mp3/slap.mp3';
		}
		// I know this isn't the best way to do it and that it produces an annoying Chrome console error on occasion, but I went deep into a web audio rabbit-hole after I saw the error and barely made it out alive.  Will get to this at some point.
		audio.play();
	},
	reset: function() {
		this.triesLeft = this.maxTries;
		this.triedLetters = [];
		this.uniqueChars = [];
		this.correctGuesses = 0;
		$('#word').text('');
		$('#gameDisplay').addClass('pulsate');
		$('#fact').html(factHeader + '<br>' + this.getRandomFact()).fadeIn(200);
		// re-enable all on-screen keyboard buttons
		$('.kb-btn').prop('disabled', false).removeClass('kb-correct kb-incorrect');
		//don't forget to reset Chuck!
		$('#imgContainer').css('left','0');
		//choose new word
		this.currentAnswer = this.chooseAnswer();
		this.prepareGameDisplay(this.currentAnswer);
		this.updateTriesLeftDisplay();
		this.isReset = true;
	},
	performGuess: function (keyCode) {
		var key = String.fromCharCode(keyCode);

		//don't do anything until game resets
		if(!(this.isGameOver() && !this.isReset)) {
			this.isReset = false;
			// check key code so ONLY letters are accepted
			if(this.isValidKeyCode(keyCode)) {
				//check to see if user guessed a new letter
				if(this.isNewGuess(key.toUpperCase())) {
					this.hideErrors();
					//if it's a new letter, process the guess
					this.processGuess(key.toUpperCase());
				}
				else {
					//otherwise, let 'em know they already guessed that letter
					this.showErrors('already-guessed');
				}

				var gameOver = this.isGameOver();
				//check to see if guess results in game over
				if(gameOver) {
					// congratulate user if user won
					if(this.isWinner()) {
						this.wins++;
						this.playSound('victory');
					}
					// kick user in face if user lost
					else {
						this.losses++;
						this.playSound('kick');
						// animate Chuck!
						 $('#imgContainer').stop().animate({
				         	left: '100%'
				         });
					}

					// update wins/losses and show results
					this.updateStats();
					this.showResults();	
				}

				return gameOver;
			}
			else {
				this.showErrors('invalid-guess');
			}
		}
	}
};

// once the DOM is all loaded, we're good to go
$(document).ready(function () {
	// initialize game
	game.init();

	$(document).on('click', '.kb-btn', function() {
		var key = $(this).data('key');
		if (game.performGuess(key.charCodeAt(0))) {
			setTimeout((function() {
				$('#overlay').stop().animate({maxWidth: '100%'}, 500, function() {
					game.reset();
				});
            }), 5200);
		}
	});

	$(document).on('keyup', function(event) {
		//performGuess returns whether or not the game is over after the key is pressed
		if (game.performGuess(event.keyCode)) {
			//if game is over, pause for a few seconds so user can see either the correct answer OR the awesome image of Chuck, and THEN reset
			setTimeout((function() {
				$('#overlay').stop().animate({maxWidth: '100%'}, 500, function() {
					game.reset();
				});
            }), 5200);
		}
	});
});