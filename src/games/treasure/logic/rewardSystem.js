// Constants for reward calculation
const REWARD_CONSTANTS = {
    BASE_MULTIPLIER: 1.0,
    NEWBIE_BONUS: 1.5,    // Bonus for new players
    PRO_PENALTY: 0.7,     // Penalty for professional players
    MAX_LEVEL: 10,
    MIN_LEVEL: 1
};

// Level ranges and their multipliers
const LEVEL_MULTIPLIERS = {
    NEWBIE: { min: 1, max: 3, multiplier: 1.5 },    // New players get 50% bonus
    INTERMEDIATE: { min: 4, max: 7, multiplier: 1.0 }, // Standard multiplier
    PRO: { min: 8, max: 10, multiplier: 0.7 }       // Pro players get 30% penalty
};

// Calculate reward based on player level and score
function calculateReward(playerLevel, baseScore) {
    // Ensure player level is within valid range
    const level = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, playerLevel));
    
    // Get appropriate multiplier based on level
    let levelMultiplier = REWARD_CONSTANTS.BASE_MULTIPLIER;
    
    if (level <= LEVEL_MULTIPLIERS.NEWBIE.max) {
        levelMultiplier = LEVEL_MULTIPLIERS.NEWBIE.multiplier;
    } else if (level <= LEVEL_MULTIPLIERS.INTERMEDIATE.max) {
        levelMultiplier = LEVEL_MULTIPLIERS.INTERMEDIATE.multiplier;
    } else {
        levelMultiplier = LEVEL_MULTIPLIERS.PRO.multiplier;
    }

    // Calculate skill multiplier (decreases as score increases)
    const skillMultiplier = calculateSkillMultiplier(baseScore);
    
    // Calculate final reward
    const finalReward = Math.floor(baseScore * levelMultiplier * skillMultiplier);
    
    return {
        finalReward,
        levelMultiplier,
        skillMultiplier,
        baseScore
    };
}

// Calculate skill multiplier based on score
// Higher scores get lower multipliers to prevent excessive rewards
function calculateSkillMultiplier(score) {
    if (score < 1000) return 1.2;  // Bonus for low scores
    if (score < 5000) return 1.0;  // Normal multiplier
    if (score < 10000) return 0.8; // Slight penalty
    return 0.6;                    // Higher penalty for very high scores
}

// Calculate player level based on various factors
function calculatePlayerLevel(stats) {
    const {
        totalScore,
        gamesPlayed,
        averageScore,
        winRate
    } = stats;

    // Base level calculation
    let level = 1;
    
    // Increase level based on total score
    level += Math.floor(totalScore / 10000);
    
    // Increase level based on games played (with diminishing returns)
    level += Math.floor(Math.log(gamesPlayed + 1) * 2);
    
    // Adjust level based on win rate
    if (winRate > 0.7) level += 2;
    else if (winRate > 0.5) level += 1;
    
    // Ensure level stays within bounds
    return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));
}

// Export functions for use in other files
export {
    calculateReward,
    calculatePlayerLevel,
    REWARD_CONSTANTS,
    LEVEL_MULTIPLIERS
}; 