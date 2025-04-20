// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize various components
  initGridAnimation();
  initThemeToggle();
  initTicTacToe();
});

// Grid background stars animation
function initGridAnimation() {
  const starsContainer = document.querySelector('.stars');

  // Create random star positions
  for (let i = 0; i < 50; i++) {
    createStar(starsContainer);
  }
}

function createStar(container) {
  const star = document.createElement('div');
  star.classList.add('star');

  // Random position
  const x = Math.random() * 100;
  const y = Math.random() * 100;

  // Random size
  const size = Math.random() * 2 + 1;

  // Random color
  const colors = ['var(--neon-cyan)', 'var(--neon-pink)', 'var(--neon-purple)'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Apply styles
  star.style.cssText = `
    position: absolute;
    top: ${y}%;
    left: ${x}%;
    width: ${size}px;
    height: ${size}px;
    background-color: ${color};
    border-radius: 50%;
    opacity: ${Math.random() * 0.5 + 0.3};
    box-shadow: 0 0 ${size * 2}px ${color};
  `;

  container.appendChild(star);
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const root = document.documentElement;

  themeToggle.addEventListener('click', () => {
    // Toggle between cyberpunk (default) and night mode
    if (body.classList.contains('night-mode')) {
      // Switch to cyberpunk mode
      body.classList.remove('night-mode');
      root.style.setProperty('--background-color', '#06070e');
      root.style.setProperty('--card-background', 'rgba(17, 18, 35, 0.7)');
      root.style.setProperty('--grid-line', 'rgba(33, 150, 243, 0.07)');
    } else {
      // Switch to night mode
      body.classList.add('night-mode');
      root.style.setProperty('--background-color', '#000000');
      root.style.setProperty('--card-background', 'rgba(10, 10, 20, 0.8)');
      root.style.setProperty('--grid-line', 'rgba(20, 20, 40, 0.1)');
    }
  });
}

// Tic Tac Toe Game
function initTicTacToe() {
  const gameBoard = document.querySelector('.game-board');
  const cells = document.querySelectorAll('.cell');
  const gameStatus = document.querySelector('.game-status p');
  const resetButton = document.querySelector('.reset-btn');
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');

  let gameActive = true;
  let currentPlayer = 'x';
  let gameState = ['', '', '', '', '', '', '', '', ''];
  let difficulty = 'easy'; // Default difficulty

  // Set default difficulty button as active
  difficultyButtons[0].classList.add('active');

  // Winning combinations
  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // Set difficulty level
  difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
      difficulty = button.getAttribute('data-difficulty');

      // Update active button
      difficultyButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Reset game when difficulty changes
      resetGame();
    });
  });

  // Handle cell click
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const cellIndex = parseInt(cell.getAttribute('data-cell-index'));

      // Check if cell is already occupied or game is not active
      if (gameState[cellIndex] !== '' || !gameActive) {
        return;
      }

      // Update game state and UI
      handleCellPlayed(cell, cellIndex);
      checkGameResult();

      // AI move if game is still active
      if (gameActive) {
        setTimeout(() => {
          makeAIMove();
          checkGameResult();
        }, 500);
      }
    });
  });

  // Reset button functionality
  resetButton.addEventListener('click', resetGame);

  // Handle player's move
  function handleCellPlayed(cell, index) {
    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer.toUpperCase();
    cell.classList.add(currentPlayer);
  }

  // Check if game is over
  function checkGameResult() {
    let roundWon = false;

    // Check winning combinations
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];

      if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
        continue;
      }

      if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
        roundWon = true;
        break;
      }
    }

    // Handle winning condition
    if (roundWon) {
      gameStatus.textContent = `Player ${currentPlayer.toUpperCase()} wins!`;
      gameActive = false;
      return;
    }

    // Handle draw
    if (!gameState.includes('')) {
      gameStatus.textContent = 'Game ended in a draw!';
      gameActive = false;
      return;
    }

    // Switch players
    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    gameStatus.textContent = `Player ${currentPlayer.toUpperCase()}'s turn`;
  }

  // AI move based on difficulty
  function makeAIMove() {
    let index;

    switch (difficulty) {
      case 'easy':
        index = getRandomEmptyCell();
        break;
      case 'medium':
        // 50% chance of making a smart move
        index = Math.random() > 0.5 ? findBestMove() : getRandomEmptyCell();
        break;
      case 'hard':
        index = findBestMove();
        break;
      default:
        index = getRandomEmptyCell();
    }

    if (index !== -1) {
      const cell = document.querySelector(`[data-cell-index="${index}"]`);
      handleCellPlayed(cell, index);
    }
  }

  // Get random empty cell
  function getRandomEmptyCell() {
    const emptyCells = gameState
      .map((cell, index) => cell === '' ? index : null)
      .filter(index => index !== null);

    if (emptyCells.length === 0) return -1;

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Find best move for AI (minimax algorithm simplified)
  function findBestMove() {
    // First check if AI can win in next move
    for (let i = 0; i < gameState.length; i++) {
      if (gameState[i] === '') {
        gameState[i] = 'o';

        if (checkWinner('o')) {
          gameState[i] = '';
          return i;
        }

        gameState[i] = '';
      }
    }

    // Then check if player can win in next move and block
    for (let i = 0; i < gameState.length; i++) {
      if (gameState[i] === '') {
        gameState[i] = 'x';

        if (checkWinner('x')) {
          gameState[i] = '';
          return i;
        }

        gameState[i] = '';
      }
    }

    // Take center if available
    if (gameState[4] === '') {
      return 4;
    }

    // Take corners if available
    const corners = [0, 2, 6, 8].filter(i => gameState[i] === '');
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // Take edges if available
    const edges = [1, 3, 5, 7].filter(i => gameState[i] === '');
    if (edges.length > 0) {
      return edges[Math.floor(Math.random() * edges.length)];
    }

    return getRandomEmptyCell();
  }

  // Check if player has won
  function checkWinner(player) {
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];

      if (
        gameState[a] === player &&
        gameState[b] === player &&
        gameState[c] === player
      ) {
        return true;
      }
    }

    return false;
  }

  // Reset game
  function resetGame() {
    gameActive = true;
    currentPlayer = 'x';
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameStatus.textContent = 'Your turn! Make a move.';

    cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('x', 'o');
    });
  }
}

// Add smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    window.scrollTo({
      top: targetElement.offsetTop - 80,
      behavior: 'smooth'
    });
  });
});

// Add hover glow effect to interactive elements
const interactiveElements = document.querySelectorAll('.project-card, .beyond-card');

interactiveElements.forEach(element => {
  element.addEventListener('mouseenter', () => {
    element.style.transform = 'translateY(-5px)';
    element.style.boxShadow = '0 0 15px var(--neon-purple), 0 0 30px var(--neon-purple)';
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = '';
    element.style.boxShadow = '';
  });
});

// Typing animation for section titles
document.querySelectorAll('.section-title').forEach(title => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        title.style.animation = 'typewriter 1.5s steps(30) forwards';
        observer.unobserve(title);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(title);
});

// Add animation to timeline elements when they come into view
const timelineItems = document.querySelectorAll('.timeline-item');

const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px'
};

const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
      timelineObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

timelineItems.forEach((item, index) => {
  item.style.opacity = '0';
  item.style.transform = 'translateX(-30px)';
  item.style.transition = `all 0.5s ease ${index * 0.1}s`;
  timelineObserver.observe(item);
});