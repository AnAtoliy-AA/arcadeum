export const enMessages = {
  solitaire_v1: {
    name: 'Solitaire',
    description:
      'Classic Klondike Solitaire — build the four foundations straight up from Ace to King',
    summary:
      'The timeless card puzzle: uncover the tableau, alternate colors down the columns, and stack every suit from Ace to King.',
    board: {
      draw: 'Draw a card',
      recycle: 'Recycle the waste pile',
      foundation: 'Foundation',
      pile: 'Tableau pile',
      selectedHint: 'Card selected — tap a destination pile',
      loading: 'Shuffling…',
    },
    hud: {
      score: 'Score',
      moves: 'Moves',
      time: 'Time',
      newGame: 'New game',
    },
    result: {
      wonTitle: 'You win!',
      wonBody: 'All four foundations are complete. Brilliantly played.',
      lostTitle: 'No moves left',
      lostBody: 'The board is stuck — shuffle up and try again!',
      playAgain: 'Play again',
    },
    rules: {
      objective:
        'Move all 52 cards onto the four foundations, building each suit in ascending order from Ace to King.',
      gameplay:
        'Cards are dealt into seven tableau columns. Flip exposed cards, arrange columns in alternating colors in descending order, and draw from the stock when stuck.',
      scoring:
        'Foundation moves earn 10 points, tableau moves 5, and each newly revealed card adds another 5. Recycling the waste keeps your streak alive.',
    },
    landing: {
      tagline: 'Single-player · No signup',
      meta: {
        title: 'Solitaire — Free Online Klondike Card Game | Arcadeum',
        description:
          'Play classic Klondike Solitaire free online at Arcadeum. No download, no signup — instant single-player card puzzles with scoring, timer, and saved progress.',
        keywords:
          'solitaire, klondike, patience, card game, single player, free, online, browser game, no download',
      },
      hero: {
        title: 'Solitaire',
        subtitle:
          'The world’s favorite card puzzle. Uncover the tableau, alternate the colors, and build every suit from Ace to King.',
        ctaPlay: 'Play now',
      },
      features: {
        solo: {
          title: 'Truly single-player',
          body: 'No accounts, no waiting rooms — deal instantly and play at your own pace.',
        },
        progress: {
          title: 'Progress is saved',
          body: 'Close the tab mid-game and pick up exactly where you left off.',
        },
        stats: {
          title: 'Your results tracked',
          body: 'Wins and losses feed your Arcadeum stats dashboard automatically.',
        },
      },
      faq: {
        q1: {
          question: 'Is Solitaire free to play?',
          answer:
            'Yes — Solitaire on Arcadeum is completely free, requires no download, and needs no account to start playing.',
        },
        q2: {
          question: 'Do I need an opponent?',
          answer:
            'No. Solitaire is a single-player game that runs entirely in your browser — perfect for a quick break.',
        },
        q3: {
          question: 'Is my progress saved?',
          answer:
            'Yes. Your current board, score, and statistics are stored locally so you can continue anytime.',
        },
        q4: {
          question: 'What is the objective of Klondike Solitaire?',
          answer:
            'Build four suit foundation piles in ascending order from Ace to King while sequencing tableau columns in descending order with alternating colors.',
        },
        q5: {
          question: 'Can any card be placed on an empty column?',
          answer:
            'Under standard Klondike rules, only a King or a sequence headed by a King may be moved into an empty tableau space.',
        },
        q6: {
          question: 'What is the difference between Turn 1 and Turn 3?',
          answer:
            'Turn 1 flips a single card from the stockpile at a time for a relaxing experience, while Turn 3 flips three cards at once for greater challenge.',
        },
        q7: {
          question: 'Is every Solitaire deal winnable?',
          answer:
            'Not all deals are mathematically winnable, but uncovering face-down cards early and keeping empty spaces flexible gives you the best odds.',
        },
        q8: {
          question: 'Can cards be moved back down from foundations?',
          answer:
            'Yes. You can return foundation cards back to the tableau whenever it helps reveal trapped face-down cards in other columns.',
        },
        q9: {
          question: 'Can I play Solitaire on mobile phones?',
          answer:
            'Yes. Arcadeum Solitaire supports intuitive touch controls, tap-to-move, and fluid card animations on all iOS and Android devices.',
        },
        q10: {
          question: 'Does Solitaire offer an undo option?',
          answer:
            'Yes. You can undo moves at any point to correct misclicks or explore alternative card paths without penalty.',
        },
      },
      steps: {
        create: {
          title: 'Deal the cards',
          body: 'Open the game and the tableau is dealt instantly — seven columns with the top card revealed.',
        },
        join: {
          title: 'Learn the moves',
          body: 'Tap a card to select it, then tap its destination. Double-tap to send a card straight to its foundation.',
        },
        play: {
          title: 'Build the foundations',
          body: 'Stack each suit from Ace to King. Clear every card to win the game.',
        },
      },
    },
  },
};
