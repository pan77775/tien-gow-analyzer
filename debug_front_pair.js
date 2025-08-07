// Debug front pair win rate issue
const fs = require('fs');
const TienGowAnalyzer = require('./scripts/tien-gow.js');

// Load rankings
const rankings = JSON.parse(fs.readFileSync('./data/rankings.json', 'utf8'));

// Create analyzer
const analyzer = new TienGowAnalyzer(rankings);

function debugFrontPairWinRate() {
    console.log('=== Debug Front Pair Win Rate ===\n');
    
    // Test hand with 和+和 pair
    const testHand = ['和', '和', '人', '地'];
    console.log('測試手牌:', testHand.join(', '));
    
    // Get valid arrangements
    const myValidArrangements = analyzer.getValidArrangements(testHand);
    console.log('\n我的有效排列:');
    myValidArrangements.forEach((arr, i) => {
        const frontScore = analyzer.getPairScore(arr[0][0], arr[0][1]);
        const backScore = analyzer.getPairScore(arr[1][0], arr[1][1]);
        console.log(`${i+1}. 前對: ${arr[0].join('+')} (${frontScore}分), 後對: ${arr[1].join('+')} (${backScore}分)`);
    });
    
    // Check what pairs can beat 和+和 (65分)
    const heScore = 65;
    const strongerPairs = [];
    
    for (let card1 of analyzer.allCards) {
        for (let card2 of analyzer.allCards) {
            const score = analyzer.getPairScore(card1, card2);
            if (score > heScore) {
                strongerPairs.push({cards: [card1, card2], score: score});
            }
        }
    }
    
    // Remove duplicates
    const uniqueStrongerPairs = [];
    const seen = new Set();
    for (let pair of strongerPairs) {
        const key = pair.cards.slice().sort().join('-');
        if (!seen.has(key)) {
            seen.add(key);
            uniqueStrongerPairs.push(pair);
        }
    }
    
    console.log(`\n可以擊敗和+和(${heScore}分)的對子:`);
    uniqueStrongerPairs.forEach(pair => {
        console.log(`${pair.cards.join('+')} (${pair.score}分)`);
    });
    
    // Test specific case: 和+和 as front pair
    // Try to find if 天對, 地對, 人對, 雜6對 appear in dealer arrangements
    const testArrangement = [['和', '和'], ['人', '地']];  // 和+和 in front
    
    // Get remaining cards (excluding test hand)
    const remainingCards = analyzer.getRemainingCards(testHand);
    console.log(`\n剩餘牌數: ${remainingCards.length}`);
    console.log('剩餘牌型:', remainingCards.join(', '));
    
    // Check if we can form stronger pairs
    const cardCounts = {};
    for (let card of remainingCards) {
        cardCounts[card] = (cardCounts[card] || 0) + 1;
    }
    
    console.log('\n剩餘牌型統計:');
    Object.entries(cardCounts).forEach(([card, count]) => {
        console.log(`${card}: ${count}張`);
    });
    
    console.log('\n可形成的對子:');
    Object.entries(cardCounts).forEach(([card, count]) => {
        if (count >= 2) {
            const score = analyzer.getPairScore(card, card);
            console.log(`${card}+${card}: ${score}分 ${score > heScore ? '(可擊敗和+和)' : ''}`);
        }
    });
    
    // Check if stronger pairs can appear in dealer hands
    console.log('\n檢查強勢對子是否會出現在莊家手牌中...');
    
    // Look specifically for hands with 天+天 or 雜6+雜6
    console.log('\n尋找包含天+天或雜6+雜6的莊家手牌...');
    
    const dealerHands = analyzer.combinations(remainingCards, 4);
    let strongPairCount = 0;
    let totalArrangements = 0;
    let tianPairHands = 0;
    let za6PairHands = 0;
    
    for (let dealerHand of dealerHands) {
        // Check if this hand contains 天+天 or 雜6+雜6
        const handCounts = {};
        for (let card of dealerHand) {
            handCounts[card] = (handCounts[card] || 0) + 1;
        }
        
        const hasTianPair = handCounts['天'] >= 2;
        const hasZa6Pair = handCounts['雜6'] >= 2;
        
        if (hasTianPair) tianPairHands++;
        if (hasZa6Pair) za6PairHands++;
        
        if (hasTianPair && hasZa6Pair) {
            console.log(`\n🔥 發現同時包含天+天和雜6+雜6的手牌: ${dealerHand.join(',')}`);
        }
        
        if (hasTianPair || hasZa6Pair) {
            const arrangements = analyzer.getValidArrangements(dealerHand);
            console.log(`\n手牌: ${dealerHand.join(',')} - ${arrangements.length}種排列`);
            
            arrangements.forEach((arr, i) => {
                const frontScore = analyzer.getPairScore(arr[0][0], arr[0][1]);
                const backScore = analyzer.getPairScore(arr[1][0], arr[1][1]);
                console.log(`  ${i+1}. 前對: ${arr[0].join('+')} (${frontScore}分), 後對: ${arr[1].join('+')} (${backScore}分)`);
                
                if (frontScore > heScore) {
                    strongPairCount++;
                    console.log(`    ✅ 這個前對可以擊敗和+和!`);
                }
            });
            
            totalArrangements += arrangements.length;
        }
        
        if (strongPairCount >= 10) break; // 限制輸出數量
    }
    
    console.log(`\n統計: 包含天+天的手牌: ${tianPairHands}個, 包含雜6+雜6的手牌: ${za6PairHands}個`);
    
    console.log(`\n統計總結:`);
    console.log(`總莊家手牌數: ${dealerHands.length}`);
    console.log(`包含天+天的手牌: ${tianPairHands}個`);
    console.log(`包含雜6+雜6的手牌: ${za6PairHands}個`);
    console.log(`發現強勢前對總數: ${strongPairCount}個`);
    console.log(`總有效排列數: ${totalArrangements}`);
    
    if (strongPairCount === 0) {
        console.log('\n❌ Bug確認: 沒有找到任何強勢前對，這解釋了為什麼勝率顯示100%');
    } else {
        console.log(`\n✅ 部分正常: 找到了${strongPairCount}個強勢前對，但比例很小: ${(strongPairCount/totalArrangements*100).toFixed(4)}%`);
        console.log('勝率應該接近但不是100%，除非權重計算有問題');
        
        // 進行完整分析來確認
        console.log('\n=== 執行完整分析驗證 ===');
        const fullResult = analyzer.analyzeHand(testHand);
        console.log(`找到的組合數: ${fullResult ? fullResult.all.length : 0}`);
        
        if (fullResult) {
            fullResult.all.forEach((result, i) => {
                console.log(`${i+1}. 前對: ${result.front.join('+')} (${result.frontScore}分), 後對: ${result.back.join('+')} (${result.backScore}分)`);
                console.log(`   前對勝率: ${(result.frontWinRate * 100).toFixed(2)}%, 期望值: ${result.expectedValue.toFixed(4)}`);
            });
            
            const heArrangement = fullResult.all.find(result => 
                result.frontScore === 65
            );
            if (heArrangement) {
                console.log(`\n✅ 找到和+和前對: 勝率 ${(heArrangement.frontWinRate * 100).toFixed(2)}%`);
            } else {
                console.log(`\n❌ 沒有找到和+和作為前對的組合 - 可能被過濾掉了`);
                
                // 檢查原始的有效排列
                const allArrangements = analyzer.getValidArrangements(testHand);
                console.log(`\n原始有效排列:`);
                allArrangements.forEach((arr, i) => {
                    const frontScore = analyzer.getPairScore(arr[0][0], arr[0][1]);
                    const backScore = analyzer.getPairScore(arr[1][0], arr[1][1]);
                    console.log(`${i+1}. 前對: ${arr[0].join('+')} (${frontScore}分), 後對: ${arr[1].join('+')} (${backScore}分)`);
                });
            }
        }
    }
}

debugFrontPairWinRate();