// 正確分析：手牌是和對+人對的情況
const fs = require('fs');
const TienGowAnalyzer = require('./scripts/tien-gow.js');

const rankings = JSON.parse(fs.readFileSync('./data/rankings.json', 'utf8'));
const analyzer = new TienGowAnalyzer(rankings);

function correctAnalysis() {
    console.log('=== 正確分析：手牌是和對+人對 ===\n');
    
    // 手牌：和對+人對
    const testHand = ['和', '和', '人', '人'];
    console.log('手牌:', testHand.join(', '));
    
    // 可能的排列
    const arrangements = analyzer.getValidArrangements(testHand);
    console.log('\n可能的排列:');
    arrangements.forEach((arr, i) => {
        const frontScore = analyzer.getPairScore(arr[0][0], arr[0][1]);
        const backScore = analyzer.getPairScore(arr[1][0], arr[1][1]);
        console.log(`${i+1}. 前對: ${arr[0].join('+')} (${frontScore}分), 後對: ${arr[1].join('+')} (${backScore}分)`);
    });
    
    // 檢查剩餘牌
    const remainingCards = analyzer.getRemainingCards(testHand);
    const cardCounts = {};
    for (let card of remainingCards) {
        cardCounts[card] = (cardCounts[card] || 0) + 1;
    }
    
    console.log('\n剩餘牌統計:');
    Object.entries(cardCounts).forEach(([card, count]) => {
        console.log(`${card}: ${count}張`);
    });
    
    // 可形成的強勢對子（能擊敗和+和 65分）
    console.log('\n可形成的強勢對子（>65分）:');
    const strongPairs = [];
    Object.entries(cardCounts).forEach(([card, count]) => {
        if (count >= 2) {
            const score = analyzer.getPairScore(card, card);
            if (score > 65) {
                strongPairs.push({card, score, count});
                console.log(`${card}+${card}: ${score}分 (剩餘${count}張) ✅`);
            }
        }
    });
    
    // 檢查可能的強勢前對組合
    console.log('\n可能擊敗和+和前對的組合:');
    let validCombinations = 0;
    
    for (let i = 0; i < strongPairs.length; i++) {
        for (let j = 0; j < strongPairs.length; j++) {
            const frontPair = strongPairs[i];
            const backPair = strongPairs[j];
            
            // 檢查約束：後對分數 >= 前對分數
            if (backPair.score >= frontPair.score) {
                // 檢查是否有足夠的牌
                let canForm = true;
                if (frontPair.card === backPair.card) {
                    canForm = frontPair.count >= 4; // 需要4張同樣的牌
                }
                
                if (canForm) {
                    console.log(`${frontPair.card}對(前${frontPair.score}) + ${backPair.card}對(後${backPair.score}) ✅`);
                    validCombinations++;
                }
            }
        }
    }
    
    console.log(`\n理論上可能的強勢前對組合: ${validCombinations}種`);
    
    // 實際統計
    console.log('\n=== 實際統計莊家手牌 ===');
    const dealerHands = analyzer.combinations(remainingCards, 4);
    let actualCount = 0;
    let detailedCount = {};
    
    for (let dealerHand of dealerHands) {
        const arrangements = analyzer.getValidArrangements(dealerHand);
        
        for (let arr of arrangements) {
            const frontScore = analyzer.getPairScore(arr[0][0], arr[0][1]);
            if (frontScore > 65) {
                actualCount++;
                const frontName = arr[0].join('+');
                const backName = arr[1].join('+');
                const backScore = analyzer.getPairScore(arr[1][0], arr[1][1]);
                const combName = `${frontName}(${frontScore})+${backName}(${backScore})`;
                detailedCount[combName] = (detailedCount[combName] || 0) + 1;
            }
        }
    }
    
    console.log(`實際強勢前對排列數: ${actualCount}`);
    console.log('\n詳細統計:');
    Object.entries(detailedCount).forEach(([comb, count]) => {
        console.log(`${comb}: ${count}次`);
    });
    
    const totalArrangements = dealerHands.reduce((sum, hand) => sum + analyzer.getValidArrangements(hand).length, 0);
    console.log(`\n總莊家排列數: ${totalArrangements}`);
    console.log(`強勢前對比例: ${(actualCount / totalArrangements * 100).toFixed(4)}%`);
    console.log(`和+和前對勝率: ${(100 - actualCount / totalArrangements * 100).toFixed(2)}%`);
}

correctAnalysis();