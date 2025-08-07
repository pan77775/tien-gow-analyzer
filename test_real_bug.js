// Test if the 100% win rate bug actually exists
const fs = require('fs');
const TienGowAnalyzer = require('./scripts/tien-gow.js');

// Load rankings
const rankings = JSON.parse(fs.readFileSync('./data/rankings.json', 'utf8'));
const analyzer = new TienGowAnalyzer(rankings);

function testRealBug() {
    console.log('=== 測試真實的100%勝率Bug ===\n');
    
    // Test with a hand where 和+和 CAN be in front position
    // Need a hand with 和+和 and another pair that scores ≥65
    const testHand = ['和', '和', '天', '天'];  // 和+和(65) and 天+天(68)
    console.log('測試手牌:', testHand.join(', '));
    
    const result = analyzer.analyzeHand(testHand);
    
    if (result) {
        console.log('\n分析結果:');
        result.all.forEach((arrangement, i) => {
            console.log(`\n${i+1}. 前對: ${arrangement.front.join('+')} (${arrangement.frontScore}分), 後對: ${arrangement.back.join('+')} (${arrangement.backScore}分)`);
            console.log(`   前對勝率: ${(arrangement.frontWinRate * 100).toFixed(2)}%`);
            console.log(`   後對勝率: ${(arrangement.backWinRate * 100).toFixed(2)}%`);
            console.log(`   整體期望值: ${arrangement.expectedValue.toFixed(4)}`);
            
            // Check if this is the 和+和 front pair arrangement
            if (arrangement.frontScore === 65) {
                console.log(`   🔍 這是和+和前對組合!`);
                if (arrangement.frontWinRate >= 0.999) {
                    console.log(`   ❌ BUG確認: 和+和前對顯示${(arrangement.frontWinRate * 100).toFixed(2)}%勝率，應該會輸給天對、地對、人對、雜6對`);
                } else {
                    console.log(`   ✅ 正常: 和+和前對勝率${(arrangement.frontWinRate * 100).toFixed(2)}%，符合預期`);
                }
            }
        });
    }
    
    // Test another combination to double-check
    console.log('\n\n=== 測試另一個組合 ===');
    const testHand2 = ['和', '和', '雜6', '雜6'];  // 和+和(65) and 雜6+雜6(69)
    console.log('測試手牌:', testHand2.join(', '));
    
    const result2 = analyzer.analyzeHand(testHand2);
    if (result2) {
        result2.all.forEach((arrangement, i) => {
            if (arrangement.frontScore === 65) {
                console.log(`\n和+和前對組合: 勝率 ${(arrangement.frontWinRate * 100).toFixed(2)}%`);
                if (arrangement.frontWinRate >= 0.999) {
                    console.log(`❌ BUG存在: 顯示${(arrangement.frontWinRate * 100).toFixed(2)}%`);
                } else {
                    console.log(`✅ 正常: ${(arrangement.frontWinRate * 100).toFixed(2)}%`);
                }
            }
        });
    }
}

testRealBug();

// Additional debugging to understand why strong pairs don't appear
console.log('\n\n=== 檢查為什麼強勢對子不出現在前對位置 ===');

const testHand3 = ['和', '和', '天', '天'];
console.log('\n測試手牌:', testHand3.join(', '));

// Check remaining cards  
const remainingCards = analyzer.getRemainingCards(testHand3);

// Count remaining card types
const cardCounts = {};
for (let card of remainingCards) {
    cardCounts[card] = (cardCounts[card] || 0) + 1;
}

console.log('\n剩餘牌中可形成的對子 (≥65分):');
Object.entries(cardCounts).forEach(([card, count]) => {
    if (count >= 2) {
        const score = analyzer.getPairScore(card, card);
        if (score >= 65) {
            console.log(`${card}+${card}: ${score}分 (可擊敗和+和)`);
        }
    }
});

console.log('\n檢查包含天+天的莊家手牌的排列約束:');

// Look for hands containing 天+天
const dealerHands = analyzer.combinations(remainingCards, 4).slice(0, 10);
let foundStrongFrontPair = false;

for (let dealerHand of dealerHands) {
    const handCounts = {};
    for (let card of dealerHand) {
        handCounts[card] = (handCounts[card] || 0) + 1;
    }
    
    if (handCounts['天'] >= 2) {
        console.log(`\n莊家手牌: ${dealerHand.join(',')} (包含天+天)`);
        const arrangements = analyzer.getValidArrangements(dealerHand);
        
        arrangements.forEach((arr, i) => {
            const frontScore = analyzer.getPairScore(arr[0][0], arr[0][1]);
            const backScore = analyzer.getPairScore(arr[1][0], arr[1][1]);
            const canBeatHe = frontScore > 65;
            
            console.log(`  排列${i+1}: 前${arr[0].join('+')}(${frontScore}) 後${arr[1].join('+')}(${backScore}) ${canBeatHe ? '✅可擊敗和+和' : ''}`);
            
            if (canBeatHe) foundStrongFrontPair = true;
        });
        
        if (foundStrongFrontPair) break;
    }
}

if (!foundStrongFrontPair) {
    console.log('\n❌ 確認問題: 在莊家手牌中找不到任何可以擊敗和+和(65分)的前對排列');
    console.log('這是因為天九牌規則約束: 後對分數 ≥ 前對分數');
    console.log('天+天(68分)只能放前對如果後對有≥68分的組合，但最高分是雜6+雜6(69分)');
}