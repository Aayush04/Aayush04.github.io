# Satti Center - Satte pe Satta Game

A web-based implementation of the popular Indian card game **Satte pe Satta** (also known as Sevens or Badam Satti).

## About the Game

Satte pe Satta is a classic card game played with a standard 52-card deck. The game revolves around the number 7 (Satta), and players must play cards in sequence starting from the sevens.

## Game Rules

1. **Starting the Game**: All four 7s (one from each suit) are automatically placed on the board at the start.

2. **Playing Cards**: Players must play cards adjacent to already-played cards in the same suit:
   - **Descending**: 6, 5, 4, 3, 2, Ace (to the left of 7)
   - **Ascending**: 8, 9, 10, Jack, Queen, King (to the right of 7)

3. **Valid Moves**: A card can only be played if:
   - The 7 of that suit is already on the board
   - The adjacent card (higher or lower) is already played

4. **Passing**: If you cannot play any card, you must pass your turn.

5. **Winning**: The first player to play all their cards wins!

## How to Play

1. Open `index.html` in your web browser
2. Click on cards in your hand to play them (playable cards will be highlighted in green)
3. If you can't play, click "Pass Turn"
4. Try to be the first to get rid of all your cards!

## Features

- 🎮 Player vs Computer gameplay
- 🎨 Beautiful, colorful interface
- 🃏 Automatic card validation
- 💡 Visual hints for playable cards
- 📱 Responsive design for mobile and desktop
- 🎯 Easy-to-understand game board layout

## Technologies Used

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (ES6+)

## File Structure

```
satti-center/
├── index.html      # Main game page
├── styles.css      # Game styling
├── game.js         # Game logic
└── README.md       # This file
```

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Tips & Strategy

- Try to play cards that open up more possibilities for future moves
- Keep track of which suits are more advanced
- Sometimes it's strategic to pass even if you have a card to play
- The player with fewer cards when both players are stuck wins

Enjoy playing Satti Center! 🎉
