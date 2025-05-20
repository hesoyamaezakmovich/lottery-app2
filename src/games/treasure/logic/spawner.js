import { difficulties, gameState } from './state.js'

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Проверка на близость к другим монстрам
function isPositionFree(posVec, monsters, minDist = 40) {
    return !monsters.some(m => m.exists() && m.pos.dist(posVec) < minDist)
}

const MONSTER_STATE = {
    PATROL: 'patrol',
    CHASE: 'chase',
    RETURN: 'return',
    SLEEP: 'sleep',
}

// Monster spawner
export function spawnMonster(player, monsters) {
    // Типы монстров
    const types = ['normal', 'fast', 'jumper', 'elite']
    let lastTypes = monsters.slice(-2).map(m => m.type)
    let availableTypes = types.filter(t => lastTypes.filter(l => l === t).length < 2)
    const type = availableTypes.length > 0 ? availableTypes[Math.floor(Math.random() * availableTypes.length)] : types[Math.floor(Math.random() * types.length)]
    let speed = difficulties[gameState.difficulty].monsterSpeed
    if (type === 'fast') speed *= 1.5
    if (type === 'jumper') speed *= 1.1
    if (type === 'elite') speed *= 1.3

    // Спавним ближе к игроку, но не ближе 120px
    let posVec
    let attempts = 0
    do {
        // Увеличиваем диапазон спавна и учитываем позицию камеры
        const cameraX = camPos().x
        let px = clamp(player.pos.x + rand(-350, 350), cameraX - 400, cameraX + width() + 400)
        let py = clamp(player.pos.y + rand(-120, 120), 100, height() - 100)
        posVec = vec2(px, py)
        attempts++
    } while ((!isPositionFree(posVec, monsters, 48) || posVec.dist(player.pos) < 120) && attempts < 10)
    if (!isPositionFree(posVec, monsters, 48) || posVec.dist(player.pos) < 120) return

    const monster = createMonster(posVec, speed, type, player, monsters)
    monsters.push(monster)
}

// Monster class
function createMonster(posVec, speed, type, player, monsters) {
    let colorVal = type === 'fast' ? rgb(255,80,80) : type === 'jumper' ? rgb(80,255,80) : type === 'elite' ? rgb(255,215,0) : rgb(255,0,0)
    const spawnPoint = posVec.clone()
    
    // Определяем размер монстра в зависимости от типа
    let monsterSize = 32
    if (type === 'fast') monsterSize = 24 // маленький
    if (type === 'jumper') monsterSize = 40 // большой
    if (type === 'elite') monsterSize = 48 // самый большой
    
    const monster = add([
        rect(monsterSize, monsterSize),
        pos(posVec.x, posVec.y),
        area(),
        body(),
        color(colorVal),
        'monster',
        {
            speed: speed,
            direction: Math.random() < 0.5 ? 1 : -1,
            type: type,
            state: MONSTER_STATE.PATROL,
            spawnPoint: spawnPoint,
            sleepTimer: 0
        }
    ])

    // Визуальный эффект появления
    monster.opacity = 0.2
    tween(monster.opacity, 1, 0.5, v => monster.opacity = v)

    monster.onUpdate(() => {
        // Проверка расстояния до игрока и spawnPoint
        const distToPlayer = monster.pos.dist(player.pos)
        const distToSpawn = monster.pos.dist(monster.spawnPoint)
        const cameraX = camPos().x
        const onScreen = monster.pos.x > cameraX - 100 && 
                        monster.pos.x < cameraX + width() + 100 && 
                        monster.pos.y > 0 && 
                        monster.pos.y < height()

        // SLEEP: если далеко от игрока и вне экрана
        if (distToPlayer > 1200 && !onScreen) { // Увеличили дистанцию
            monster.state = MONSTER_STATE.SLEEP
            monster.sleepTimer += dt()
            if (monster.sleepTimer > 20) monster.destroy() // Увеличили время жизни
            return
        } else {
            monster.sleepTimer = 0
        }

        // CHASE: если игрок близко
        if (distToPlayer < 600 && Math.abs(player.pos.y - monster.pos.y) < 120) { // Увеличили дистанцию преследования
            monster.state = MONSTER_STATE.CHASE
        } else if (monster.state === MONSTER_STATE.CHASE && distToPlayer >= 800) { // Увеличили дистанцию возврата
            monster.state = MONSTER_STATE.RETURN
        }

        // RETURN: возвращаемся к spawnPoint
        if (monster.state === MONSTER_STATE.RETURN) {
            if (distToSpawn > 10) {
                if (monster.spawnPoint.x > monster.pos.x) {
                    monster.move(monster.speed, 0)
                    monster.direction = 1
                } else {
                    monster.move(-monster.speed, 0)
                    monster.direction = -1
                }
                // Прыжок, если spawn выше
                if (monster.spawnPoint.y < monster.pos.y - 10 && monster.isGrounded()) {
                    monster.jump()
                }
            } else {
                monster.state = MONSTER_STATE.PATROL
            }
            return
        }

        // SLEEP: если далеко от игрока
        if (distToPlayer > 900) {
            monster.state = MONSTER_STATE.SLEEP
            return
        }

        // PATROL: ходим по платформе
        if (monster.state === MONSTER_STATE.PATROL) {
            if (monster.isGrounded()) {
                monster.move(monster.speed * monster.direction, 0)
            }
            // Смена направления у края экрана
            if (monster.pos.x <= 0 || monster.pos.x >= width()) {
                monster.direction *= -1
            }
            // Случайная смена направления
            if (Math.random() < 0.005) monster.direction *= -1
        }

        // CHASE: преследуем игрока
        if (monster.state === MONSTER_STATE.CHASE) {
            let moveSpeed = monster.speed * 1.5
            if (player.pos.x > monster.pos.x) {
                monster.move(moveSpeed, 0)
                monster.direction = 1
            } else {
                monster.move(-moveSpeed, 0)
                monster.direction = -1
            }
            // Прыжок, если игрок выше
            if (player.pos.y < monster.pos.y - 10 && monster.isGrounded()) {
                monster.jump()
            }
        }

        // Прыгающий монстр
        if ((monster.type === 'jumper' || monster.type === 'elite') && monster.isGrounded() && Math.random() < 0.02) {
            monster.jump()
        }
    })

    // Удаляем из массива при уничтожении
    monster.onDestroy(() => {
        const idx = monsters.indexOf(monster)
        if (idx !== -1) monsters.splice(idx, 1)
    })

    return monster
}

// Chest spawner
export function spawnChest() {
    const x = rand(100, width() - 100)
    const y = rand(100, height() - 100)
    createChest(vec2(x, y))
}

// Chest class
function createChest(posVec) {
    return add([
        sprite('rpg-chest'),
        pos(posVec.x, posVec.y),
        area(),
        body({isStatic: true}),
        scale(2),
        'chest'
    ])
} 