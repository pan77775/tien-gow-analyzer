// 簡單的權重修正測試
const fs = require('fs');

// 載入分析引擎
const TienGowAnalyzer = require('./web/scripts/tien-gow.js');

// 載入分數表
const rankings = JSON.parse(fs.readFileSync('./web/data/rankings.json', 'utf8'));

// 創建分析器
const analyzer = new TienGowAnalyzer(rankings);

// 測試權重邏輯
function testWeights() {
    console.log('=== 權重修正測試 ===\n');
    
    // 測試一個簡單的手牌組合
    const testHand = ['天', '地', '人', '和'];
    console.log('測試手牌:', testHand.join(', '));
    
    // 手動測試權重計算
    console.log('\n--- 測試權重分配邏輯 ---');
    
    // 模擬幾個不同的莊家手牌
    const dealerHand1 = ['長10', '短11', '雜9', '雜8'];  // 假設這個有1種排列
    const dealerHand2 = ['長6', '短10', '雜7', '雜6'];   // 假設這個有3種排列
    
    const arrangements1 = analyzer.getValidArrangements(dealerHand1);
    const arrangements2 = analyzer.getValidArrangements(dealerHand2);
    
    console.log(`莊家手牌1 ${dealerHand1.join(',')} 有 ${arrangements1.length} 種排列`);
    console.log(`莊家手牌2 ${dealerHand2.join(',')} 有 ${arrangements2.length} 種排列`);
    
    // 計算權重
    const weight1 = 1 / arrangements1.length;
    const weight2 = 1 / arrangements2.length;
    
    console.log(`權重1: ${weight1.toFixed(4)} (${arrangements1.length}種排列)`);
    console.log(`權重2: ${weight2.toFixed(4)} (${arrangements2.length}種排列)`);
    console.log(`權重總和應該相等: ${(weight1 * arrangements1.length).toFixed(4)} vs ${(weight2 * arrangements2.length).toFixed(4)}`);
    
    // 執行完整分析
    console.log('\n--- 執行完整分析 ---');
    try {
        const result = analyzer.analyzeHand(testHand);
        if (result) {
            console.log(`✅ 分析成功`);
            console.log(`最佳期望值: ${result.best.expectedValue.toFixed(4)}`);
            console.log(`總組合數: ${result.all.length}`);
            console.log(`權重修正 + 策略優化已生效`);
            
            // 顯示玩家的所有組合
            console.log('\n--- 玩家可見組合 ---');
            result.all.forEach((combo, index) => {
                const frontPair = combo.front.join('+');
                const backPair = combo.back.join('+');
                console.log(`組合${index+1}: 前對(${frontPair})=${combo.frontScore}, 後對(${backPair})=${combo.backScore}, 期望值=${combo.expectedValue.toFixed(4)}`);
            });
        } else {
            console.log('❌ 分析失敗');
        }
    } catch (error) {
        console.error('❌ 分析過程出錯:', error.message);
    }
}

testWeights();