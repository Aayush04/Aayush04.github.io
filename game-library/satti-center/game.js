// Satte pe Satta (Sevens) Game Logic

class SattiCenterGame {
    constructor() {
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.suitSymbols = {
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣',
            spades: '♠'
        };
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.players = 2; // Player vs Computer
        this.currentPlayer = 0;
        this.hands = [[], []];
        this.board = {
            hearts: Array(13).fill(null),
            diamonds: Array(13).fill(null),
            clubs: Array(13).fill(null),
            spades: Array(13).fill(null)
        };
        this.consecutivePasses = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('play-again').addEventListener('click', () => {
            this.hideWinnerModal();
            this.startNewGame();
        });
        document.getElementById('pass-turn').addEventListener('click', () => this.passTurn());
    }

    startNewGame() {
        // Reset board
        this.suits.forEach(suit => {
            this.board[suit] = Array(13).fill(null);
        });
        
        // Create and shuffle deck
        const deck = this.createDeck();
        this.shuffleDeck(deck);
        
        // Deal cards
        this.dealCards(deck);
        
        // Place all 7s on the board automatically
        this.placeAllSevens();
        
        // Reset game state
        this.currentPlayer = 0;
        this.consecutivePasses = 0;
        
        // Update display
        this.updateBoard();
        this.updateHand();
        this.updateGameInfo();
    }

    createDeck() {
        const deck = [];
        this.suits.forEach(suit => {
            this.values.forEach((value, index) => {
                deck.push({
                    suit: suit,
                    value: value,
                    numValue: index + 1
                });
            });
        });
        return deck;
    }

    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    dealCards(deck) {
        this.hands = [[], []];
        deck.forEach((card, index) => {
            this.hands[index % this.players].push(card);
        });
        
        // Sort hands
        this.hands.forEach(hand => {
            hand.sort((a, b) => {
                if (a.suit !== b.suit) {
                    return this.suits.indexOf(a.suit) - this.suits.indexOf(b.suit);
                }
                return a.numValue - b.numValue;
            });
        });
    }

    placeAllSevens() {
        // Remove all 7s from hands and place them on board
        this.hands.forEach(hand => {
            for (let i = hand.length - 1; i >= 0; i--) {
                if (hand[i].numValue === 7) {
                    const card = hand.splice(i, 1)[0];
                    this.board[card.suit][6] = card;
                }
            }
        });
    }

    canPlayCard(card) {
        const suit = card.suit;
        const pos = card.numValue - 1;
        
        // Check if position is empty
        if (this.board[suit][pos] !== null) {
            return false;
        }
        
        // Check if 7 of this suit is played
        if (this.board[suit][6] === null) {
            return false;
        }
        
        // Check if adjacent card is played
        if (pos < 6) {
            // Lower than 7, check if next higher card is played
            return this.board[suit][pos + 1] !== null;
        } else {
            // Higher than 7, check if next lower card is played
            return this.board[suit][pos - 1] !== null;
        }
    }

    playCard(card) {
        if (!this.canPlayCard(card)) {
            return false;
        }
        
        // Remove card from current player's hand
        const hand = this.hands[this.currentPlayer];
        const index = hand.findIndex(c => c.suit === card.suit && c.numValue === card.numValue);
        if (index !== -1) {
            hand.splice(index, 1);
            this.board[card.suit][card.numValue - 1] = card;
            
            // Check for winner
            if (hand.length === 0) {
                this.showWinner(this.currentPlayer);
                return true;
            }
            
            // Reset consecutive passes
            this.consecutivePasses = 0;
            
            // Next player
            this.nextPlayer();
            return true;
        }
        return false;
    }

    passTurn() {
        this.consecutivePasses++;
        
        // If both players pass consecutively, game is stuck
        if (this.consecutivePasses >= this.players) {
            const winner = this.hands[0].length <= this.hands[1].length ? 0 : 1;
            this.showWinner(winner);
            return;
        }
        
        this.nextPlayer();
    }

    nextPlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players;
        this.updateGameInfo();
        this.updateHand();
        
        // If it's computer's turn, play automatically
        if (this.currentPlayer === 1) {
            setTimeout(() => this.computerPlay(), 1000);
        }
    }

    computerPlay() {
        const hand = this.hands[1];
        
        // Try to play a card
        for (let card of hand) {
            if (this.canPlayCard(card)) {
                this.playCard(card);
                this.updateBoard();
                return;
            }
        }
        
        // If no card can be played, pass
        this.passTurn();
    }

    updateBoard() {
        this.suits.forEach(suit => {
            const stackContainer = document.getElementById(`${suit}-stack`);
            stackContainer.innerHTML = '';
            
            // Find all played cards
            const playedCards = [];
            for (let i = 0; i < this.board[suit].length; i++) {
                if (this.board[suit][i] !== null) {
                    playedCards.push(this.board[suit][i]);
                }
            }
            
            // If no cards played, show empty state
            if (playedCards.length === 0) {
                const emptyDiv = document.createElement('div');
                emptyDiv.style.cssText = 'color: #999; font-size: 0.9em; padding: 20px;';
                emptyDiv.textContent = 'No cards yet';
                stackContainer.appendChild(emptyDiv);
                return;
            }
            
            // Sort cards from lowest to highest
            playedCards.sort((a, b) => a.numValue - b.numValue);
            
            // Create wrapper for stacking
            const wrapper = document.createElement('div');
            wrapper.className = 'stack-wrapper';
            
            // Calculate offsets
            const baseOffset = 20; // pixels each card peeks
            const totalHeight = playedCards.length > 1 
                ? (playedCards.length - 1) * baseOffset + 110 
                : 110;
            wrapper.style.height = `${totalHeight}px`;
            
            // Create each card
            playedCards.forEach((card, index) => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'stack-card';
                
                // Position from top
                cardDiv.style.top = `${index * baseOffset}px`;
                cardDiv.style.zIndex = index;
                
                // Clip cards except the last one
                if (index < playedCards.length - 1) {
                    if (index === 0) {
                        // Bottom card: show 70%
                        cardDiv.style.height = '77px'; // 70% of 110px
                    } else {
                        // Middle cards: show 20%
                        cardDiv.style.height = '22px'; // 20% of 110px
                    }
                }
                
                const valueDiv = document.createElement('div');
                valueDiv.className = 'stack-card-value';
                valueDiv.textContent = card.value;
                
                const suitDiv = document.createElement('div');
                suitDiv.className = 'stack-card-suit';
                suitDiv.textContent = this.suitSymbols[suit];
                
                cardDiv.appendChild(valueDiv);
                cardDiv.appendChild(suitDiv);
                wrapper.appendChild(cardDiv);
            });
            
            stackContainer.appendChild(wrapper);
        });
    }

    updateHand() {
        const handContainer = document.getElementById('hand-cards');
        handContainer.innerHTML = '';
        
        if (this.currentPlayer === 0) {
            const hand = this.hands[0];
            hand.forEach(card => {
                const cardElement = this.createCardElement(card);
                
                // Check if card is playable
                if (this.canPlayCard(card)) {
                    cardElement.classList.add('playable');
                } else {
                    cardElement.classList.add('not-playable');
                }
                
                cardElement.addEventListener('click', () => {
                    if (this.currentPlayer === 0 && this.canPlayCard(card)) {
                        if (this.playCard(card)) {
                            this.updateBoard();
                        }
                    }
                });
                
                handContainer.appendChild(cardElement);
            });
        } else {
            // Show computer's card count
            const computerInfo = document.createElement('div');
            computerInfo.style.cssText = 'padding: 20px; text-align: center; font-size: 1.2em; color: #666;';
            computerInfo.textContent = `Computer is thinking... (${this.hands[1].length} cards remaining)`;
            handContainer.appendChild(computerInfo);
        }
        
        // Update pass button state
        const passButton = document.getElementById('pass-turn');
        passButton.disabled = this.currentPlayer !== 0;
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.suit}`;
        
        const valueDiv = document.createElement('div');
        valueDiv.textContent = card.value;
        
        const suitDiv = document.createElement('div');
        suitDiv.className = 'card-suit';
        suitDiv.textContent = this.suitSymbols[card.suit];
        
        cardDiv.appendChild(valueDiv);
        cardDiv.appendChild(suitDiv);
        
        return cardDiv;
    }

    updateGameInfo() {
        const currentPlayerEl = document.getElementById('current-player');
        currentPlayerEl.textContent = this.currentPlayer === 0 ? 'Player 1 (You)' : 'Computer';
        
        const cardsRemainingEl = document.getElementById('cards-remaining');
        cardsRemainingEl.textContent = this.hands[this.currentPlayer].length;
    }

    showWinner(player) {
        const modal = document.getElementById('winner-modal');
        const winnerText = document.getElementById('winner-text');
        
        if (player === 0) {
            winnerText.textContent = '🎊 Congratulations! You Won! 🎊';
        } else {
            winnerText.textContent = '💻 Computer Won! Better luck next time! 💻';
        }
        
        modal.classList.remove('hidden');
    }

    hideWinnerModal() {
        const modal = document.getElementById('winner-modal');
        modal.classList.add('hidden');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SattiCenterGame();
});
