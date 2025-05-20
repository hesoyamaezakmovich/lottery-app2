import { gameState, difficulties } from '../logic/state.js'

export function createMenuScene() {
    scene('menu', () => {
        // Background
        add([
            sprite('background-0'),
            fixed(),
            scale(4)
        ])

        // Title
        add([
            text('Сокровищница', { size: 64 }),
            pos(width() / 2, 100),
            anchor('center')
        ])

        // Currency display
        add([
            text(`Бонусные монеты: ${gameState.bonusCurrency}`, { size: 32 }),
            pos(width() / 2, 200),
            anchor('center')
        ])

        // Difficulty buttons
        const createDifficultyButton = (buttonText, y, difficulty) => {
            // Button background
            const btnBg = add([
                rect(240, 80),
                pos(width() / 2, y),
                anchor('center'),
                area(),
                color(0.2, 0.6, 0.8)
            ])
            // Button text
            add([
                text(buttonText, { size: 32 }),
                pos(width() / 2, y),
                anchor('center')
            ])
            btnBg.onClick(() => {
                if (gameState.bonusCurrency >= difficulties[difficulty].cost) {
                    gameState.difficulty = difficulty
                    gameState.bonusCurrency -= difficulties[difficulty].cost
                    go('game')
                }
            })
        }

        createDifficultyButton('Легкий - 100', 300, 'easy')
        createDifficultyButton('Сложный - 300', 400, 'hard')

        // Instructions
        const instructions = [
            'Управление:',
            '← → - движение',
            '↑ - прыжок',
            'ЛКМ - атака',
            '',
            'Цель:',
            '• Собрать сокровища',
            '• Победить монстров',
            '• Набрать больше очков',
            '',
            'Особенности:',
            '• 60 секунд на игру',
            '• Сундуки каждые 10 секунд',
            '• Монстры наносят 1 урон',
            '• За монстра +20 очков'
        ]

        // Add instructions text
        instructions.forEach((line, index) => {
            add([
                text(line, { 
                    size: 24,
                    font: 'arial'
                }),
                pos(20, height() - 400 + (index * 25)),
                fixed()
            ])
        })
    })
} 