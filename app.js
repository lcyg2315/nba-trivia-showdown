/**
 * NBA Trivia Showdown - App Controller
 * Integrates Trivia Engine, Basketball Canvas, and handles UI updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State Variables
  let scoreHome = 0; // You (Home)
  let scoreAway = 0; // Opponent (Away)
  let currentStreak = 0;
  let highStreak = 0;
  let totalAnswered = 0;
  let correctCount = 0;
  let activeQuestion = null;
  let isAnswered = false;
  
  // Timer State
  let timeLeft = 15; // 15 seconds per question
  let timerInterval = null;
  const questionTimeLimit = 15;
  
  // UI References
  const homeScoreEl = document.getElementById('home-score');
  const awayScoreEl = document.getElementById('away-score');
  const streakCounterEl = document.getElementById('streak-counter');
  const highStreakEl = document.getElementById('high-streak');
  const accuracyDisplayEl = document.getElementById('accuracy-display');
  const questionCountEl = document.getElementById('question-count');
  const questionCategoryEl = document.getElementById('question-category');
  const questionTextEl = document.getElementById('question-text');
  const optionsGridEl = document.getElementById('options-grid');
  const timerBarEl = document.getElementById('timer-bar');
  const feedbackOverlayEl = document.getElementById('feedback-overlay');
  const feedbackMessageEl = document.getElementById('feedback-message');
  const commentaryTextEl = document.getElementById('commentary-text');
  const courtAnnouncementEl = document.getElementById('court-announcement');
  const muteBtn = document.getElementById('mute-btn');
  const volumeIcon = document.getElementById('volume-icon');
  const restartBtn = document.getElementById('restart-btn');
  const gameClockEl = document.getElementById('game-clock');
  
  // Commentary Pools
  const correctComments = [
    "BANG! From downtown!",
    "BOOMSHAKALAKA! A posterizing slam!",
    "Splashes it cleanly from the logo!",
    "Beautiful crossover leads to an open lay-up!",
    "Got the defender leaning and drilled the step-back!",
    "He's heating up! Clean swish!",
    "Stellar ball movement ends in an easy two points!",
    "Runs the floor and finishes with a finger-roll!"
  ];
  
  const incorrectComments = [
    "REJECTED! Swatted out of bounds by the defender!",
    "STEAL! Opponent intercepts and sprints downcourt!",
    "BRICK! Hits the back rim hard.",
    "Airball! Completely missed the rim.",
    "Turnover! Lost the dribble at the three-point line.",
    "In and out! Unlucky bounce on the jump shot.",
    "Opponent picks the pocket and drives in for a slam!",
    "Heavy defensive pressure forces a shot-clock violation!"
  ];

  // Helper: Format scoreboard numbers to double digits
  function formatScore(num) {
    return num.toString().padStart(2, '0');
  }

  // Scoreboard Update
  function updateScoreboard() {
    homeScoreEl.textContent = formatScore(scoreHome);
    awayScoreEl.textContent = formatScore(scoreAway);
    streakCounterEl.textContent = currentStreak;
    highStreakEl.textContent = highStreak;
    
    // Streak flame scale effect
    if (currentStreak >= 3) {
      streakCounterEl.classList.add('on-fire');
      streakCounterEl.style.boxShadow = '0 0 15px #ff6b00';
    } else {
      streakCounterEl.classList.remove('on-fire');
      streakCounterEl.style.boxShadow = '';
    }
    
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    accuracyDisplayEl.textContent = `${accuracy}%`;
  }
  


  // Update Game Clock (Decrements simulated game clock)
  let minutes = 12;
  let seconds = 0;
  function updateGameClock() {
    if (seconds === 0) {
      if (minutes > 0) {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }
    gameClockEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Typewriter Ticker Effect
  function setCommentary(text) {
    // We update the ticker commentary text and restart scrolling animation
    commentaryTextEl.style.animation = 'none';
    commentaryTextEl.offsetHeight; /* trigger reflow */
    commentaryTextEl.textContent = text;
    commentaryTextEl.style.animation = 'scrollText 16s linear infinite';
  }

  // Trigger correct answer flow
  function handleCorrectAnswer() {
    isAnswered = true;
    clearInterval(timerInterval);
    
    // Scoring reward
    totalAnswered++;
    correctCount++;
    currentStreak++;
    if (currentStreak > highStreak) {
      highStreak = currentStreak;
    }
    
    // Game to 21 points, one point each
    const pointValue = 1;
    scoreHome += pointValue;
    
    updateScoreboard();
    
    // Sound & Canvas trigger
    gameEngine.triggerCorrect();
    
    // Commentary update
    const randomComment = correctComments[Math.floor(Math.random() * correctComments.length)];
    const ptsText = "+1 POINT!";
    setCommentary(`[HOME] ${ptsText} ${randomComment}`);
    
    // Announcement text overlays on court
    courtAnnouncementEl.textContent = `HOME TEAM SCORES! (1 PT)`;
    courtAnnouncementEl.style.color = '#ffd700';
    
    // Show correct overlay
    feedbackMessageEl.textContent = `CORRECT! +1 PT`;
    feedbackOverlayEl.className = 'feedback-overlay correct-overlay';
    feedbackOverlayEl.classList.remove('hidden');
    
    // Update game period/quarter randomly to make time advance
    updateGameClock();
    
    // Check victory condition
    setTimeout(() => {
      if (scoreHome >= 21) {
        showGameOver(true);
      } else {
        loadNewQuestion();
      }
    }, 2500);
  }

  // Trigger incorrect answer flow (or time out)
  function handleIncorrectAnswer(clickedBtn = null) {
    isAnswered = true;
    clearInterval(timerInterval);
    
    totalAnswered++;
    currentStreak = 0;
    
    // Opponent scores 1 point
    const opponentPointValue = 1;
    scoreAway += opponentPointValue;
    
    updateScoreboard();
    
    // Sound & Canvas trigger
    gameEngine.triggerIncorrect();
    
    // Commentary update
    const randomComment = incorrectComments[Math.floor(Math.random() * incorrectComments.length)];
    setCommentary(`[AWAY] OPPONENT SCORES! +1 PT. ${randomComment}`);
    
    // Announcement text overlays on court
    courtAnnouncementEl.textContent = `OPPONENT SCORES! (+1 PT)`;
    courtAnnouncementEl.style.color = '#ff3b30';
    
    // Highlight options
    const options = optionsGridEl.querySelectorAll('.option-btn');
    options.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === activeQuestion.answer) {
        btn.classList.add('correct');
      } else if (clickedBtn && btn === clickedBtn) {
        btn.classList.add('incorrect');
      } else {
        btn.classList.add('dimmed');
      }
    });
    
    // Show incorrect overlay
    feedbackMessageEl.textContent = clickedBtn ? `WRONG ANSWER!` : `TIME OUT!`;
    feedbackOverlayEl.className = 'feedback-overlay incorrect-overlay';
    feedbackOverlayEl.classList.remove('hidden');
    
    updateGameClock();
    
    // Check defeat condition
    setTimeout(() => {
      if (scoreAway >= 21) {
        showGameOver(false);
      } else {
        loadNewQuestion();
      }
    }, 2500);
  }

  // Load a new question from the generator
  function loadNewQuestion() {
    isAnswered = false;
    feedbackOverlayEl.classList.add('hidden');
    courtAnnouncementEl.textContent = "1-ON-1 IN PROGRESS";
    courtAnnouncementEl.style.color = "rgba(255, 255, 255, 0.35)";
    
    // Retrieve next trivia
    activeQuestion = TriviaEngine.getNextQuestion();
    
    // Populate card details
    questionCategoryEl.textContent = activeQuestion.category;
    questionCountEl.textContent = `Q# ${activeQuestion.id}`;
    questionTextEl.textContent = activeQuestion.question;
    
    // Clear & populate buttons
    optionsGridEl.innerHTML = '';
    
    activeQuestion.options.forEach(optionText => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = optionText;
      
      btn.addEventListener('click', (e) => {
        if (isAnswered) return;
        gameEngine.playSynthSound('click');
        
        if (optionText === activeQuestion.answer) {
          btn.classList.add('correct');
          // Dim other buttons
          const siblingBtns = optionsGridEl.querySelectorAll('.option-btn');
          siblingBtns.forEach(sb => {
            if (sb !== btn) sb.classList.add('dimmed');
            sb.disabled = true;
          });
          handleCorrectAnswer();
        } else {
          handleIncorrectAnswer(btn);
        }
      });
      
      optionsGridEl.appendChild(btn);
    });
    
    // Reset Timer Countdown
    resetTimer();
  }

  // Timer Bar control
  function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = questionTimeLimit;
    timerBarEl.style.transform = 'scaleX(1)';
    timerBarEl.style.background = 'linear-gradient(90deg, var(--color-secondary), var(--color-primary))';
    
    const tickTime = 100; // tick every 100ms for smooth fluid animation
    const decrement = tickTime / (questionTimeLimit * 1000);
    let scaleX = 1;
    
    timerInterval = setInterval(() => {
      scaleX -= decrement;
      if (scaleX <= 0) {
        scaleX = 0;
        timerBarEl.style.transform = 'scaleX(0)';
        clearInterval(timerInterval);
        if (!isAnswered) {
          handleIncorrectAnswer();
        }
      } else {
        timerBarEl.style.transform = `scaleX(${scaleX})`;
        
        // Change color to glowing solid red when time is low (< 4s)
        if (scaleX < 0.25) {
          timerBarEl.style.background = 'var(--color-error)';
          timerBarEl.style.boxShadow = '0 0 10px var(--color-error-glow)';
        }
      }
    }, tickTime);
  }

  // Initialize Basketball Engine
  const gameEngine = new BasketballGame('basketball-canvas', (isUser) => {
    // This callback executes inside basketball.js when the ball hits the hoop
    // We can trigger screen shakes or extra particle bursts here if we want!
  });
  
  // Set initial game clock
  gameClockEl.textContent = "12:00";
  
  // Load first question
  loadNewQuestion();
  
  // Volume controls (Mute / Unmute)
  muteBtn.addEventListener('click', () => {
    gameEngine.muted = !gameEngine.muted;
    
    if (gameEngine.muted) {
      // Set speaker off icon
      volumeIcon.innerHTML = `<path fill="currentColor" d="M3.27,1.44L2,2.72L5.28,6H3V12H7L12,17V8.27L16.25,12.5C15.58,13 14.83,13.4 14,13.68V15.74C15.38,15.39 16.63,14.68 17.65,13.7L19.28,15.33L20.56,14.05L3.27,1.44M12,4L9.91,6.09L12,8.18V4M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,12.75 18.88,13.47 18.66,14.16L20.18,15.68C20.7,14.55 21,13.31 21,12C21,7.72 18.07,4.14 14,3.23M16.5,12C16.5,11.53 16.4,11.08 16.22,10.68L17.91,12.37C18,12.25 18,12.12 18,12C18,10.23 17,8.71 15.5,7.97V9.96L16.5,10.96V12Z" />`;
      muteBtn.style.color = '#ef4444';
    } else {
      // Set speaker on icon
      volumeIcon.innerHTML = `<path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.07,19.86 21,16.28 21,12C21,7.72 18.07,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />`;
      muteBtn.style.color = '';
      
      // Play a short synth sound to confirm unmute
      gameEngine.playSynthSound('bounce');
    }
  });
  
  // Game Over UI References
  const gameOverOverlayEl = document.getElementById('game-over-overlay');
  const gameOverTitleEl = document.getElementById('game-over-title');
  const gameOverSubtitleEl = document.getElementById('game-over-subtitle');
  const gameOverBtn = document.getElementById('game-over-btn');

  function showGameOver(isWin) {
    clearInterval(timerInterval);
    isAnswered = true;
    
    if (isWin) {
      gameOverTitleEl.textContent = "🏆 VICTORY!";
      gameOverTitleEl.style.color = "var(--color-success)";
      gameOverTitleEl.style.textShadow = "0 0 15px var(--color-success-glow)";
      gameOverSubtitleEl.textContent = `You beat the opponent 21 - ${scoreAway}!`;
      courtAnnouncementEl.textContent = "🏆 YOU WIN THE SHOWDOWN!";
      courtAnnouncementEl.style.color = '#ffd700';
      setCommentary(`[GAME OVER] VICTORY! You defeated the opponent 21 to ${scoreAway}!`);
    } else {
      gameOverTitleEl.textContent = "💔 DEFEAT";
      gameOverTitleEl.style.color = "var(--color-error)";
      gameOverTitleEl.style.textShadow = "0 0 15px var(--color-error-glow)";
      gameOverSubtitleEl.textContent = `The opponent beat you 21 - ${scoreHome}!`;
      courtAnnouncementEl.textContent = "💔 OPPONENT WINS THE SHOWDOWN";
      courtAnnouncementEl.style.color = '#ff3b30';
      setCommentary(`[GAME OVER] DEFEAT! Opponent won the game 21 to ${scoreHome}. Try again!`);
    }
    
    gameOverOverlayEl.classList.remove('hidden');
  }

  function restartGame() {
    scoreHome = 0;
    scoreAway = 0;
    currentStreak = 0;
    totalAnswered = 0;
    correctCount = 0;
    minutes = 12;
    seconds = 0;
    
    gameClockEl.textContent = "12:00";
    updateScoreboard();
    
    // Reset positions on canvas
    gameEngine.resetPositions();
    
    // Hide overlays
    gameOverOverlayEl.classList.add('hidden');
    feedbackOverlayEl.classList.add('hidden');
    
    // Reload first question
    loadNewQuestion();
    
    setCommentary("Game restarted. Jump ball at center court!");
  }

  // Restart controls (Full Reset)
  restartBtn.addEventListener('click', () => {
    gameEngine.playSynthSound('click');
    restartGame();
  });

  gameOverBtn.addEventListener('click', () => {
    gameEngine.playSynthSound('click');
    restartGame();
  });
});
