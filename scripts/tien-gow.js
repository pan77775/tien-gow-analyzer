/**
 * 天九牌分析工具 - JavaScript版本
 * 從Python版本轉換而來，保持完全相同的計算邏輯
 */

class TienGowAnalyzer {
    constructor(rankings, pairNames = null) {
        // 16種牌型，每種2張，共32張牌
        this.allCards = ['天', '地', '人', '和', '長10', '長6', '長4', 
                        '短11', '短10', '短7', '短6', '雜9', '雜8', '雜7', '猴', '雜5'];
        
        this.rankings = rankings; // 牌型分數表
        this.pairNames = pairNames || {}; // 對子名稱表
        this.deck = [...this.allCards, ...this.allCards]; // 完整牌庫
        
        // 預計算快取
        this.scoreCache = new Map();
        this.arrangementCache = new Map();
        
        this.precomputeScores();
        console.log('天九牌分析引擎初始化完成');
    }

    /**
     * 預計算所有牌對分數
     */
    precomputeScores() {
        console.log('預計算牌對分數...');
        
        for (let card1 of this.allCards) {
            for (let card2 of this.allCards) {
                const key = [card1, card2].sort().join('-');
                if (!this.scoreCache.has(key)) {
                    let score = 0;
                    
                    // 查找分數，先試card1-card2，再試card2-card1
                    if (this.rankings[card1] && this.rankings[card1][card2] !== undefined) {
                        score = parseInt(this.rankings[card1][card2]);
                    } else if (this.rankings[card2] && this.rankings[card2][card1] !== undefined) {
                        score = parseInt(this.rankings[card2][card1]);
                    }
                    
                    this.scoreCache.set(key, score);
                }
            }
        }
        
        console.log(`預計算完成，快取了 ${this.scoreCache.size} 個牌對分數`);
    }

    /**
     * 獲取兩張牌組合的分數
     */
    getPairScore(card1, card2) {
        const key = [card1, card2].sort().join('-');
        return this.scoreCache.get(key) || 0;
    }

    /**
     * 獲取對子的中文名稱
     */
    getPairName(card1, card2) {
        const score = this.getPairScore(card1, card2);
        return this.pairNames[score.toString()] || '';
    }

    /**
     * 格式化對子顯示（包含中文名稱）
     */
    formatPairDisplay(card1, card2) {
        const pairName = this.getPairName(card1, card2);
        const cards = `${card1}+${card2}`;
        return pairName ? `${pairName}(${cards})` : cards;
    }

    /**
     * 獲取剩餘的牌
     */
    getRemainingCards(hand, knownCards = []) {
        const remaining = [...this.deck];
        
        // 移除手牌
        for (let card of hand) {
            const index = remaining.indexOf(card);
            if (index > -1) {
                remaining.splice(index, 1);
            }
        }
        
        // 移除已知牌
        for (let card of knownCards) {
            const index = remaining.indexOf(card);
            if (index > -1) {
                remaining.splice(index, 1);
            }
        }
        
        return remaining;
    }

    /**
     * 生成所有可能的2張牌組合
     */
    combinations(arr, k) {
        if (k === 1) return arr.map(x => [x]);
        if (k === arr.length) return [arr];
        
        const result = [];
        for (let i = 0; i <= arr.length - k; i++) {
            const head = arr[i];
            const tailCombinations = this.combinations(arr.slice(i + 1), k - 1);
            for (let tail of tailCombinations) {
                result.push([head, ...tail]);
            }
        }
        return result;
    }

    /**
     * 獲取有效的牌型排列（後對分數 >= 前對分數）
     */
    getValidArrangements(fourCards) {
        const cacheKey = fourCards.slice().sort().join('-');
        
        if (this.arrangementCache.has(cacheKey)) {
            return this.arrangementCache.get(cacheKey);
        }
        
        const validArrangements = [];
        
        // 生成所有可能的兩兩配對
        const indices = [0, 1, 2, 3];
        const pairCombinations = this.combinations(indices, 2);
        
        for (let frontIndices of pairCombinations) {
            const backIndices = indices.filter(i => !frontIndices.includes(i));
            
            const front = [fourCards[frontIndices[0]], fourCards[frontIndices[1]]].sort();
            const back = [fourCards[backIndices[0]], fourCards[backIndices[1]]].sort();
            
            const frontScore = this.getPairScore(front[0], front[1]);
            const backScore = this.getPairScore(back[0], back[1]);
            
            // 後對分數必須大於等於前對分數
            if (backScore >= frontScore) {
                const arrangement = [front, back];
                
                // 避免重複排列
                const arrangementKey = `${front.join('-')}_${back.join('-')}`;
                if (!validArrangements.some(arr => 
                    `${arr[0].join('-')}_${arr[1].join('-')}` === arrangementKey)) {
                    validArrangements.push(arrangement);
                }
            }
        }
        
        this.arrangementCache.set(cacheKey, validArrangements);
        return validArrangements;
    }

    /**
     * 計算單個排列對所有莊家排列的勝率（支援加權計算）
     */
    calculateArrangementWinRate(myArrangement, dealerArrangements) {
        const [myFront, myBack] = myArrangement;
        const myFrontScore = this.getPairScore(myFront[0], myFront[1]);
        const myBackScore = this.getPairScore(myBack[0], myBack[1]);
        
        if (dealerArrangements.length === 0) {
            return { win: 0, tie: 0, lose: 0, expectedValue: 0 };
        }
        
        let totalWeight = 0;
        let weightedWinCount = 0;
        let weightedTieCount = 0;
        let weightedLoseCount = 0;
        
        for (let dealerData of dealerArrangements) {
            // 支援新的加權格式 {arrangement, weight} 和舊的格式（純排列）
            const dealerArrangement = dealerData.arrangement || dealerData;
            const weight = dealerData.weight || 1;
            
            totalWeight += weight;
            
            const [dealerFront, dealerBack] = dealerArrangement;
            const dealerFrontScore = this.getPairScore(dealerFront[0], dealerFront[1]);
            const dealerBackScore = this.getPairScore(dealerBack[0], dealerBack[1]);
            
            // 判斷前對勝負
            const frontWin = myFrontScore > dealerFrontScore;
            const frontTie = myFrontScore === dealerFrontScore;
            
            // 判斷後對勝負
            const backWin = myBackScore > dealerBackScore;
            const backTie = myBackScore === dealerBackScore;
            
            // 總體勝負判定（按照天九牌規則）
            if ((frontWin && backWin) || (frontWin && backTie) || (frontTie && backWin)) {
                weightedWinCount += weight;
            } else if ((!frontWin && !frontTie && !backWin && !backTie) ||
                      (!frontWin && !frontTie && backTie) ||
                      (frontTie && !backWin && !backTie)) {
                weightedLoseCount += weight;
            } else {
                weightedTieCount += weight;
            }
        }
        
        const winRate = weightedWinCount / totalWeight;
        const tieRate = weightedTieCount / totalWeight;
        const loseRate = weightedLoseCount / totalWeight;
        const expectedValue = winRate * 1 + tieRate * 0 + loseRate * (-1);
        
        return {
            win: winRate,
            tie: tieRate,
            lose: loseRate,
            expectedValue: expectedValue
        };
    }

    /**
     * 過濾被支配的排列（基於分數直接比較）
     */
    filterDominatedArrangements(arrangements) {
        if (arrangements.length <= 1) return arrangements;
        
        const filtered = [];
        
        for (let i = 0; i < arrangements.length; i++) {
            const arr1 = arrangements[i];
            let isDominated = false;
            
            for (let j = 0; j < arrangements.length; j++) {
                if (i === j) continue;
                
                const arr2 = arrangements[j];
                
                // 劣勢組合定義：另一個組合的前後對分數都大於等於此組合，且至少有一個嚴格大於
                if (arr2.frontScore >= arr1.frontScore && 
                    arr2.backScore >= arr1.backScore &&
                    (arr2.frontScore > arr1.frontScore || arr2.backScore > arr1.backScore)) {
                    console.log(`組合被支配: 前對${arr1.frontScore} vs ${arr2.frontScore}, 後對${arr1.backScore} vs ${arr2.backScore}`);
                    isDominated = true;
                    break;
                }
            }
            
            if (!isDominated) {
                filtered.push(arr1);
            }
        }
        
        // 確保至少保留一個組合
        if (filtered.length === 0) {
            return [arrangements[0]];
        }
        
        return filtered;
    }

    /**
     * 分析手牌並返回最佳組合
     */
    analyzeHand(hand, knownCards = []) {
        console.log(`開始分析手牌: ${hand.join(', ')}`);
        
        // 獲取我的有效排列
        const myValidArrangements = this.getValidArrangements(hand);
        
        if (myValidArrangements.length === 0) {
            console.log('沒有有效的排列');
            return null;
        }
        
        // 獲取剩餘牌
        const remainingCards = this.getRemainingCards(hand, knownCards);
        
        const totalKnown = hand.length + knownCards.length;
        const isSecondHalf = knownCards.length > 0;
        
        if (isSecondHalf) {
            console.log(`下半場計算中... 已知${totalKnown}張牌，剩餘${remainingCards.length}張未知牌`);
        } else {
            console.log(`上半場計算中... 剩餘${remainingCards.length}張牌`);
        }
        
        // 生成所有可能的莊家手牌
        const allDealerHands = this.combinations(remainingCards, 4);
        console.log(`共有${allDealerHands.length}種可能的莊家手牌`);
        
        // 獲取所有莊家的有效排列（加權處理）
        const allDealerArrangements = [];
        
        for (let dealerHand of allDealerHands) {
            const validArrangements = this.getValidArrangements(dealerHand);
            const weight = 1 / validArrangements.length; // 權重 = 1/該手牌的有效排列數
            
            for (let arrangement of validArrangements) {
                allDealerArrangements.push({
                    arrangement: arrangement,
                    weight: weight
                });
            }
        }
        
        console.log(`莊家共有${allDealerArrangements.length}種可能的有效排列（已加權處理）`);
        
        // 計算每個我的排列的勝率
        const results = [];
        
        for (let myArrangement of myValidArrangements) {
            const [myFront, myBack] = myArrangement;
            const myFrontScore = this.getPairScore(myFront[0], myFront[1]);
            const myBackScore = this.getPairScore(myBack[0], myBack[1]);
            
            // 計算前後對分別的勝率（用於顯示，加權計算）
            let totalWeight = 0;
            let frontWinWeight = 0;
            let backWinWeight = 0;
            
            for (let dealerData of allDealerArrangements) {
                const arrangement = dealerData.arrangement;
                const weight = dealerData.weight;
                totalWeight += weight;
                
                const dealerFrontScore = this.getPairScore(arrangement[0][0], arrangement[0][1]);
                const dealerBackScore = this.getPairScore(arrangement[1][0], arrangement[1][1]);
                
                if (myFrontScore > dealerFrontScore) {
                    frontWinWeight += weight;
                }
                if (myBackScore > dealerBackScore) {
                    backWinWeight += weight;
                }
            }
            
            const frontWinRate = totalWeight > 0 ? frontWinWeight / totalWeight : 0;
            const backWinRate = totalWeight > 0 ? backWinWeight / totalWeight : 0;
            
            // 計算整體勝率
            const overallRates = this.calculateArrangementWinRate(myArrangement, allDealerArrangements);
            
            results.push({
                arrangement: myArrangement,
                front: myFront,
                back: myBack,
                frontScore: myFrontScore,
                backScore: myBackScore,
                frontWinRate: frontWinRate,
                backWinRate: backWinRate,
                winProb: overallRates.win,
                tieProb: overallRates.tie,
                loseProb: overallRates.lose,
                expectedValue: overallRates.expectedValue
            });
        }
        
        // 按期望值排序
        results.sort((a, b) => b.expectedValue - a.expectedValue);
        
        // 過濾被支配的劣勢組合
        const filteredResults = this.filterDominatedArrangements(results);
        
        console.log(`分析完成，最佳期望值: ${results[0].expectedValue.toFixed(3)}`);
        console.log(`過濾前: ${results.length} 個組合，過濾後: ${filteredResults.length} 個組合`);
        
        return {
            best: results[0],
            all: filteredResults
        };
    }
}

// 導出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TienGowAnalyzer;
}