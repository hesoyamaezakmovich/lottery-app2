import { createMenuScene } from './scenes/menu.js'
import { createGameScene } from './scenes/game.js'
import { createResultsScene } from './scenes/results.js'

// Initialize kaboom with error handling
kaboom({
    width: 1280,
    height: 720,
    background: [0, 0, 0],
    debug: true,
    errorHandler: (err) => {
        console.error('Kaboom error:', err)
    }
})

// Function to load all assets
async function loadAllAssets() {
    try {
        // Load sprite atlas
        await loadSpriteAtlas('assets/tileset.png', {
            'platform-left': { x: 82, y: 64, width: 16, height: 8 },
            'platform-middle': { x: 112, y: 64, width: 16, height: 8 },
            'platform-right': { x: 142, y: 64, width: 16, height: 8 },
            'smaller-tree': { x: 0, y: 80, width: 60, height: 65 },
            'bigger-tree': { x: 170, y: 10, width: 115, height: 200 },
            'ground': { x: 80, y: 144, width: 16, height: 16 },
            'ground-deep': { x: 0, y: 144, width: 16, height: 16 }
        })

        // Load individual sprites
        await Promise.all([
            loadSprite('background-0', 'assets/background_0.png'),
            loadSprite('background-1', 'assets/background_1.png'),
            loadSprite('background-2', 'assets/background_2.png'),
            loadSprite('idle-sprite', 'assets/Idle.png', {
                sliceX: 8,
                sliceY: 1,
                anims: { 'idle-anim': { from: 0, to: 7, loop: true }}
            }),
            loadSprite('run-sprite', 'assets/Run.png', {
                sliceX: 8,
                sliceY: 1,
                anims: { 'run-anim': { from: 0, to: 7, loop: true }}
            }),
            loadSprite('jump-sprite', 'assets/Jump.png', {
                sliceX: 2,
                sliceY: 1,
                anims: { 'jump-anim': { from: 0, to: 1, loop: true }}
            }),
            loadSprite('fall-sprite', 'assets/Fall.png', {
                sliceX: 2,
                sliceY: 1,
                anims: { 'fall-anim': { from: 0, to: 1, loop: true }}
            }),
            loadSprite('take-hit-sprite', 'assets/Take Hit.png', {
                sliceX: 4,
                sliceY: 1,
                anims: { 'take-hit': { from: 0, to: 3, loop: false }}
            }),
            loadSprite('death-sprite', 'assets/Death.png', {
                sliceX: 6,
                sliceY: 1,
                anims: { 'death': { from: 0, to: 5, loop: false }}
            }),
            loadSprite('heart', 'assets/heart.png', { width: 32, height: 32 }),
            loadSprite('attack1-sprite', 'assets/Attack1.png', {
                sliceX: 4,
                sliceY: 1,
                anims: { 'attack1-anim': { from: 0, to: 3, loop: false }}
            }),
            loadSprite('attack2-sprite', 'assets/Attack2.png', {
                sliceX: 4,
                sliceY: 1,
                anims: { 'attack2-anim': { from: 0, to: 3, loop: false }}
            }),
            loadSprite('rpg-chest', 'assets/RPG Chests.png')
        ])

        // Set gravity
        setGravity(1000)

        // Create scenes
        createMenuScene()
        createGameScene()
        createResultsScene()

        // Start with menu scene
        go('menu')
    } catch (err) {
        console.error('Error loading assets:', err)
    }
}

// Start loading assets when user interacts with the page
document.addEventListener('click', () => {
    loadAllAssets()
}, { once: true })

// Show loading screen
add([
    text('Click anywhere to start', { size: 32 }),
    pos(width() / 2, height() / 2),
    { origin: 'center' }
])