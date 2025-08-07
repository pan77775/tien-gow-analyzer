// 檢查所有可能擊敗和+和前對的組合
const fs = require('fs');
const TienGowAnalyzer = require('./scripts/tien-gow.js');

const rankings = JSON.parse(fs.readFileSync('./data/rankings.json', 'utf8'));
const analyzer = new TienGowAnalyzer(rankings);

function checkAllStrongPairs() {
    console.log('=== 檢查所有可能擊敗和+和(65分)前對的組合 ===\n');
    
    // 測試手牌
    const testHand = ['和', '和', '天', '天'];
    console.log('測試手牌:', testHand.join(', '));
    
    const remainingCards = analyzer.getRemainingCards(testHand);
    console.log('剩餘牌數:', remainingCards.length);
    
    // 找出所有可能擊敗和+和的對子組合
    const strongPairs = [
        {name: '天對', cards: ['天', '天'], score: 68},
        {name: '地對', cards: ['地', '地'], score: 67}, 
        {name: '人對', cards: ['人', '人'], score: 66},
        {name: '雜6對', cards: ['雜6', '雜6'], score: 69}
    ];
    
    console.log('\n可能擊敗和+和的對子:');
    strongPairs.forEach(pair => {
        console.log(`${pair.name}: ${pair.score}分`);
    });
    
    // 檢查哪些強勢對子可以形成（根據剩餘牌）
    const cardCounts = {};
    for (let card of remainingCards) {
        cardCounts[card] = (cardCounts[card] || 0) + 1;
    }
    
    const availableStrongPairs = [];
    strongPairs.forEach(pair => {
        const cardType = pair.cards[0];
        if (cardCounts[cardType] >= 2) {
            availableStrongPairs.push(pair);
            console.log(`✅ ${pair.name} 可形成 (剩餘${cardCounts[cardType]}張${cardType})`);
        } else {
            console.log(`❌ ${pair.name} 無法形成 (剩餘${cardCounts[cardType] || 0}張${cardType})`);
        }
    });
    
    console.log(`\n可形成的強勢對子: ${availableStrongPairs.length}種`);
    
    // 檢查所有可能的強勢對子組合
    console.log('\n=== 檢查有效的強勢前對組合 ===');
    
    let totalValidCombinations = 0;
    
    // 兩兩組合檢查
    for (let i = 0; i < availableStrongPairs.length; i++) {
        for (let j = 0; j < availableStrongPairs.length; j++) {
            if (i === j) continue; // 跳過相同對子
            
            const frontPair = availableStrongPairs[i];
            const backPair = availableStrongPairs[j];
            
            // 檢查約束：後對分數 >= 前對分數
            if (backPair.score >= frontPair.score) {
                console.log(`${frontPair.name}(前${frontPair.score}) + ${backPair.name}(後${backPair.score}) ✅`);
                totalValidCombinations++;
            } else {
                console.log(`${frontPair.name}(前${frontPair.score}) + ${backPair.name}(後${backPair.score}) ❌ (違反約束)`);
            }
        }
    }
    
    // 同對子組合（如果有足夠牌）
    availableStrongPairs.forEach(pair => {
        const cardType = pair.cards[0];
        if (cardCounts[cardType] >= 4) { // 需要4張才能前後都是同對子
            console.log(`${pair.name}(前${pair.score}) + ${pair.name}(後${pair.score}) ✅ (同對子)`);
            totalValidCombinations++;
        }
    });
    
    console.log(`\n理論上的有效強勢前對組合數: ${totalValidCombinations}種`);
    
    // 實際統計莊家手牌中的情況
    console.log('\n=== 實際統計莊家手牌 ===');
    
    const dealerHands = analyzer.combinations(remainingCards, 4);
    let actualStrongFrontCount = 0;
    let detailedCount = {};
    
    for (let dealerHand of dealerHands) {
        const arrangements = analyzer.getValidArrangements(dealerHand);
        
        for (let arr of arrangements) {
            const frontScore = analyzer.getPairScore(arr[0][0], arr[0][1]);
            if (frontScore > 65) { // 能擊敗和+和
                actualStrongFrontCount++;
                
                const frontName = `${arr[0].join('+')}(${frontScore})`;
                const backName = `${arr[1].join('+')}(${analyzer.getPairScore(arr[1][0], arr[1][1])})`;
                const combName = `${frontName}+${backName}`;
                
                detailedCount[combName] = (detailedCount[combName] || 0) + 1;
            }
        }
    }
    
    console.log(`實際找到的強勢前對排列數: ${actualStrongFrontCount}`);
    console.log('\n詳細統計:');
    Object.entries(detailedCount).forEach(([comb, count]) => {
        console.log(`${comb}: ${count}次`);
    });
    
    console.log(`\n總莊家排列數: ${dealerHands.reduce((sum, hand) => sum + analyzer.getValidArrangements(hand).length, 0)}`);
    console.log(`強勢前對比例: ${(actualStrongFrontCount / dealerHands.reduce((sum, hand) => sum + analyzer.getValidArrangements(hand).length, 0) * 100).toFixed(4)}%`);
}

checkAllStrongPairs();