/**
 * 手機版天九牌分析工具 UI 邏輯 - Tailwind 版本
 */

class MobileTienGowUI {
    constructor() {
        this.analyzer = null;
        this.selectionMode = 'known'; // 'hand' | 'known' - 當前選擇模式（預設為已知牌）
        this.knownCards = []; // 已知牌
        this.handCards = []; // 手牌
        this.selectedCardIndices = { known: new Set(), hand: new Set() }; // 追蹤選中的牌索引
        this.cardCounts = {}; // 每種牌的使用計數
        this.isUpdating = false; // 防止重複點擊標誌
        
        // 16種牌型，每種2張
        this.allCardTypes = [
            '天', '地', '人', '和', 
            '長10', '長6', '長4', '短11',
            '短10', '短7', '短6', '雜9',
            '雜8', '雜7', '猴', '雜5'
        ];
        
        this.init();
    }
    
    async init() {
        try {
            // 初始化牌計數
            this.resetCardCounts();
            
            // 載入分析引擎
            await this.loadAnalyzer();
            
            // 綁定事件
            this.bindEvents();
            
            // 初始化牌網格
            this.initCardGrids();
            
            // 初始化選擇模式按鈕狀態
            this.switchSelectionMode(this.selectionMode);
            
            // 更新UI狀態
            this.updateUI();
            
            console.log('✅ 手機版天九牌助手初始化完成');
        } catch (error) {
            console.error('❌ 初始化失敗:', error);
            this.showAlert('初始化失敗，請刷新頁面重試', 'error');
        }
    }
    
    async loadAnalyzer() {
        try {
            const [rankingsRes, pairNamesRes] = await Promise.all([
                fetch('data/rankings.json'),
                fetch('data/pair_names.json')
            ]);
            
            if (!rankingsRes.ok || !pairNamesRes.ok) {
                throw new Error('載入數據文件失敗');
            }
            
            const rankings = await rankingsRes.json();
            const pairNames = await pairNamesRes.json();
            
            this.analyzer = new TienGowAnalyzer(rankings, pairNames);
            
            // 測試分析器
            const testResult = this.analyzer.analyzeHand(['天', '天', '地', '地']);
            if (!testResult || !testResult.best) {
                throw new Error('分析器測試失敗');
            }
            
            console.log('✅ 分析引擎載入成功');
        } catch (error) {
            console.error('❌ 載入分析引擎失敗:', error);
            throw error;
        }
    }
    
    bindEvents() {
        // 選擇模式切換（手牌/已知牌）
        document.querySelectorAll('[data-selection]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selection = e.target.closest('[data-selection]').dataset.selection;
                this.switchSelectionMode(selection);
            });
        });
        
        // 觸摸優化
        document.addEventListener('touchstart', function(){}, {passive: true});
    }
    
    initCardGrids() {
        this.initCardGrid();
    }
    
    initCardGrid() {
        const grid = document.getElementById('cardGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // 創建32張牌
        const allCards = [];
        this.allCardTypes.forEach(cardType => {
            allCards.push(cardType, cardType);
        });
        
        allCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            cardElement.dataset.card = card;
            cardElement.dataset.index = index; // 添加唯一索引
            cardElement.innerHTML = card;
            
            cardElement.addEventListener('click', () => {
                this.toggleCard(card, this.selectionMode, index);
            });
            
            grid.appendChild(cardElement);
        });
    }
    
    switchSelectionMode(mode) {
        this.selectionMode = mode;
        
        // 更新選擇模式按鈕狀態
        document.querySelectorAll('[data-selection]').forEach(btn => {
            const isActive = btn.dataset.selection === mode;
            if (isActive) {
                // 已知牌用紅色，手牌用藍色
                const bgColor = mode === 'known' ? 'bg-red-500' : 'bg-blue-500';
                btn.className = `mode-btn flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${bgColor} text-white`;
            } else {
                btn.className = 'mode-btn flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-white text-gray-700 border-2 border-gray-300';
            }
        });
        
        // 更新網格顯示
        this.updateCardGrid();
        
        // 更新已選牌顯示
        this.updateSelectedCardsDisplay();
        
        this.updateUI();
    }
    
    toggleCard(cardType, type, cardIndex) {
        if (type === 'known') {
            this.toggleKnownCard(cardType, cardIndex);
        } else if (type === 'hand') {
            this.toggleHandCard(cardType, cardIndex);
        }
    }
    
    toggleKnownCard(cardType, cardIndex) {
        const maxKnownCards = 16;
        const maxCardType = 2;
        
        const currentKnownCount = this.knownCards.length;
        const totalTypeUsed = this.getTotalCardUsage(cardType);
        
        // 防止重複點擊造成的問題
        if (this.isUpdating) {
            return;
        }
        this.isUpdating = true;
        
        // 添加視覺反饋到具體的牌
        const targetCard = document.querySelector(`[data-index="${cardIndex}"]`);
        if (targetCard) {
            targetCard.classList.add('opacity-50');
        }
        
        try {
            if (this.selectedCardIndices.known.has(cardIndex)) {
                // 移除這張特定的牌
                this.selectedCardIndices.known.delete(cardIndex);
                const knownIndex = this.knownCards.indexOf(cardType);
                if (knownIndex > -1) {
                    this.knownCards.splice(knownIndex, 1);
                }
            } else {
                // 檢查是否可以添加
                if (currentKnownCount >= maxKnownCards) {
                    this.showAlert('最多只能選擇16張已知牌', 'error');
                    return;
                }
                
                if (totalTypeUsed >= maxCardType) {
                    this.showAlert(`${cardType} 已被使用完畢`, 'error');
                    return;
                }
                
                if (this.selectedCardIndices.hand.has(cardIndex)) {
                    this.showAlert('此牌已在手牌中', 'error');
                    return;
                }
                
                // 添加這張特定的牌
                this.selectedCardIndices.known.add(cardIndex);
                this.knownCards.push(cardType);
            }
            
            this.updateCardCounts();
            this.updateCardGrids();
            this.updateDisplays();
            this.updateUI();
        } finally {
            // 移除視覺反饋並使用短暂延迟防止快速重複點擊
            setTimeout(() => {
                if (targetCard) {
                    targetCard.classList.remove('opacity-50');
                }
                this.isUpdating = false;
            }, 100);
        }
    }
    
    toggleHandCard(cardType, cardIndex) {
        const maxHandCards = 4;
        const maxCardType = 2;
        
        const currentHandCount = this.handCards.length;
        const totalTypeUsed = this.getTotalCardUsage(cardType);
        
        // 防止重複點擊造成的問題
        if (this.isUpdating) {
            return;
        }
        this.isUpdating = true;
        
        // 添加視覺反饋到具體的牌
        const targetCard = document.querySelector(`[data-index="${cardIndex}"]`);
        if (targetCard) {
            targetCard.classList.add('opacity-50');
        }
        
        try {
            if (this.selectedCardIndices.hand.has(cardIndex)) {
                // 移除這張特定的牌
                this.selectedCardIndices.hand.delete(cardIndex);
                const handIndex = this.handCards.indexOf(cardType);
                if (handIndex > -1) {
                    this.handCards.splice(handIndex, 1);
                }
            } else {
                // 檢查是否可以添加
                if (currentHandCount >= maxHandCards) {
                    this.showAlert('最多只能選擇4張手牌', 'error');
                    return;
                }
                
                if (totalTypeUsed >= maxCardType) {
                    this.showAlert(`${cardType} 已被使用完畢`, 'error');
                    return;
                }
                
                if (this.selectedCardIndices.known.has(cardIndex)) {
                    this.showAlert('此牌已在已知牌中', 'error');
                    return;
                }
                
                // 添加這張特定的牌
                this.selectedCardIndices.hand.add(cardIndex);
                this.handCards.push(cardType);
            }
            
            this.updateCardCounts();
            this.updateCardGrids();
            this.updateDisplays();
            this.updateUI();
        } finally {
            // 移除視覺反饋並使用短暂延迟防止快速重複點擊
            setTimeout(() => {
                if (targetCard) {
                    targetCard.classList.remove('opacity-50');
                }
                this.isUpdating = false;
            }, 100);
        }
    }
    
    getTotalCardUsage(cardType) {
        const knownCount = this.knownCards.filter(c => c === cardType).length;
        const handCount = this.handCards.filter(c => c === cardType).length;
        return knownCount + handCount;
    }
    
    updateCardCounts() {
        // 重置計數
        this.resetCardCounts();
        
        // 計算已知牌
        this.knownCards.forEach(card => {
            this.cardCounts[card] = (this.cardCounts[card] || 0) + 1;
        });
        
        // 計算手牌
        this.handCards.forEach(card => {
            this.cardCounts[card] = (this.cardCounts[card] || 0) + 1;
        });
    }
    
    resetCardCounts() {
        this.cardCounts = {};
        this.allCardTypes.forEach(card => {
            this.cardCounts[card] = 0;
        });
    }
    
    updateCardGrids() {
        this.updateCardGrid();
    }
    
    updateCardGrid() {
        const grid = document.getElementById('cardGrid');
        if (!grid) return;
        
        const cards = grid.querySelectorAll('.card-item');
        cards.forEach(cardElement => {
            const cardType = cardElement.dataset.card;
            const cardIndex = parseInt(cardElement.dataset.index);
            
            // 根據當前選擇模式顯示狀態
            let isSelected = false;
            let isDisabled = false;
            
            if (this.selectionMode === 'hand') {
                isSelected = this.selectedCardIndices.hand.has(cardIndex);
                const totalUsed = this.getTotalCardUsage(cardType);
                isDisabled = (totalUsed >= 2 && !isSelected) || this.selectedCardIndices.known.has(cardIndex);
            } else {
                isSelected = this.selectedCardIndices.known.has(cardIndex);
                const totalUsed = this.getTotalCardUsage(cardType);
                isDisabled = (totalUsed >= 2 && !isSelected) || this.selectedCardIndices.hand.has(cardIndex);
            }
            
            // 移除所有模式類
            cardElement.classList.remove('hand-mode', 'known-mode');
            
            // 根據選擇模式添加對應的類
            if (isSelected) {
                cardElement.classList.add('selected');
                cardElement.classList.add(this.selectionMode === 'hand' ? 'hand-mode' : 'known-mode');
            } else {
                cardElement.classList.remove('selected');
            }
            
            cardElement.classList.toggle('disabled', isDisabled);
        });
    }
    
    updateDisplays() {
        this.updateSelectedCardsDisplay();
    }
    
    updateSelectedCardsDisplay() {
        // 更新按鈕上的文字即可，不需要額外的顯示區域
        this.updateUI();
    }
    
    updateUI() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const canAnalyze = this.handCards.length === 4;
        
        if (analyzeBtn) {
            analyzeBtn.disabled = !canAnalyze;
            if (canAnalyze) {
                analyzeBtn.textContent = '分析組合';
            } else {
                analyzeBtn.textContent = `選擇手牌 (${this.handCards.length}/4)`;
            }
        }
        
        // 更新選擇模式按鈕的文字
        document.querySelectorAll('[data-selection]').forEach(btn => {
            if (btn.dataset.selection === 'hand') {
                const handText = this.handCards.length > 0 ? ` (${this.handCards.length}/4)` : ' (4張)';
                btn.innerHTML = `手牌<span class="text-xs">${handText}</span>`;
            } else {
                const knownText = this.knownCards.length > 0 ? ` (${this.knownCards.length}/16)` : ' (最多16張)';
                btn.innerHTML = `已知牌<span class="text-xs">${knownText}</span>`;
            }
        });
    }
    
    // 清空功能
    clearKnownCards() {
        this.knownCards = [];
        this.selectedCardIndices.known.clear();
        this.updateCardCounts();
        this.updateCardGrids();
        this.updateDisplays();
        this.updateUI();
    }
    
    clearHandCards() {
        this.handCards = [];
        this.selectedCardIndices.hand.clear();
        this.updateCardCounts();
        this.updateCardGrids();
        this.updateDisplays();
        this.updateUI();
    }
    
    // 隨機選牌
    randomKnownCards() {
        this.clearKnownCards();
        
        // 創建所有可用索引的數組 (0-31)
        const availableIndices = Array.from({length: 32}, (_, i) => i);
        
        // 隨機選16個索引
        const shuffled = availableIndices.sort(() => Math.random() - 0.5);
        const selectedIndices = shuffled.slice(0, 16);
        
        // 使用 Map 來計算每種牌型的數量
        const cardTypeCount = new Map();
        
        // 根據索引設置選中狀態
        selectedIndices.forEach(index => {
            this.selectedCardIndices.known.add(index);
            const cardType = this.allCardTypes[Math.floor(index / 2)];
            
            // 計算每種牌型出現的次數
            const count = cardTypeCount.get(cardType) || 0;
            cardTypeCount.set(cardType, count + 1);
        });
        
        // 根據計數添加牌到 knownCards
        cardTypeCount.forEach((count, cardType) => {
            for (let i = 0; i < count; i++) {
                this.knownCards.push(cardType);
            }
        });
        
        this.updateCardCounts();
        this.updateCardGrids();
        this.updateDisplays();
        this.updateUI();
    }
    
    randomHandCards() {
        this.clearHandCards();
        
        // 獲取未被使用的索引
        const availableIndices = [];
        for (let i = 0; i < 32; i++) {
            if (!this.selectedCardIndices.known.has(i)) {
                availableIndices.push(i);
            }
        }
        
        if (availableIndices.length < 4) {
            this.showAlert('可用的牌不足4張', 'error');
            return;
        }
        
        // 隨機選4個索引
        const shuffled = availableIndices.sort(() => Math.random() - 0.5);
        const selectedIndices = shuffled.slice(0, 4);
        
        // 使用 Map 來計算每種牌型的數量
        const cardTypeCount = new Map();
        
        // 根據索引設置選中狀態
        selectedIndices.forEach(index => {
            this.selectedCardIndices.hand.add(index);
            const cardType = this.allCardTypes[Math.floor(index / 2)];
            
            // 計算每種牌型出現的次數
            const count = cardTypeCount.get(cardType) || 0;
            cardTypeCount.set(cardType, count + 1);
        });
        
        // 根據計數添加牌到 handCards
        cardTypeCount.forEach((count, cardType) => {
            for (let i = 0; i < count; i++) {
                this.handCards.push(cardType);
            }
        });
        
        this.updateCardCounts();
        this.updateCardGrids();
        this.updateDisplays();
        this.updateUI();
    }
    
    // 重置所有
    resetAll() {
        this.knownCards = [];
        this.handCards = [];
        this.selectedCardIndices.known.clear();
        this.selectedCardIndices.hand.clear();
        this.resetCardCounts();
        this.updateCardGrids();
        this.updateDisplays();
        this.updateUI();
        this.hideResults();
    }
    
    // 分析功能
    async analyzeCards() {
        if (this.handCards.length !== 4) {
            this.showAlert('請選擇4張手牌', 'error');
            return;
        }
        
        if (!this.analyzer) {
            this.showAlert('分析引擎未載入', 'error');
            return;
        }
        
        try {
            this.showResults();
            this.showLoading(true);
            
            // 根據已知牌數量進行分析
            const knownCardsForAnalysis = [...this.knownCards];
            
            console.log('🔍 開始分析:', {
                knownCards: knownCardsForAnalysis.length,
                handCards: this.handCards,
                analysisMode: knownCardsForAnalysis.length === 0 ? '上半場' : '下半場'
            });
            
            const result = this.analyzer.analyzeHand([...this.handCards], knownCardsForAnalysis);
            
            if (result && result.all && result.all.length > 0) {
                this.displayAnalysisResults(result);
            } else {
                this.showAlert('沒有找到有效組合', 'error');
            }
            
        } catch (error) {
            console.error('❌ 分析失敗:', error);
            this.showAlert(`分析失敗: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    showResults() {
        const resultsSection = document.getElementById('analysisResults');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    hideResults() {
        const resultsSection = document.getElementById('analysisResults');
        if (resultsSection) {
            resultsSection.classList.add('hidden');
        }
    }
    
    showLoading(show) {
        const loading = document.getElementById('loadingIndicator');
        
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
    }
    
    displayAnalysisResults(result) {
        const content = document.getElementById('resultsContent');
        const subtitle = document.getElementById('analysisSubtitle');
        
        if (!content) return;
        
        // 隱藏副標題
        if (subtitle) {
            subtitle.style.display = 'none';
        }
        
        let html = '';
        
        result.all.forEach((arrangement, index) => {
            const frontDisplay = this.analyzer.formatPairDisplay(
                arrangement.arrangement[0][0], 
                arrangement.arrangement[0][1]
            );
            const backDisplay = this.analyzer.formatPairDisplay(
                arrangement.arrangement[1][0], 
                arrangement.arrangement[1][1]
            );
            
            const isFirst = index === 0;
            
            html += `
                <div class="combination-item ${isFirst ? 'best-combination' : 'regular-combination'}">
                    <div class="combination-title">
                        組合 ${index + 1} (期望值: ${arrangement.expectedValue.toFixed(3)})
                    </div>
                    <div class="pair-display">
                        前對: ${frontDisplay} 勝率: ${(arrangement.frontWinRate * 100).toFixed(1)}%
                    </div>
                    <div class="pair-display">
                        後對: ${backDisplay} 勝率: ${(arrangement.backWinRate * 100).toFixed(1)}%
                    </div>
                    <div class="stats">
                        勝率: ${(arrangement.winProb * 100).toFixed(1)}% | 
                        平手: ${(arrangement.tieProb * 100).toFixed(1)}% | 
                        敗率: ${(arrangement.loseProb * 100).toFixed(1)}%
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = html;
    }
    
    showAlert(message, type = 'error') {
        // 移除舊的提示
        const oldAlert = document.querySelector('.alert');
        if (oldAlert) {
            oldAlert.remove();
        }
        
        // 創建新提示
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // 插入到容器頂部
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
        }
        
        // 3秒後自動移除
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}

// 全域函數供HTML調用
let mobileUI;

function clearCurrentSelection() {
    if (mobileUI) {
        if (mobileUI.selectionMode === 'hand') {
            mobileUI.clearHandCards();
        } else {
            mobileUI.clearKnownCards();
        }
    }
}

function randomCurrentSelection() {
    if (mobileUI) {
        if (mobileUI.selectionMode === 'hand') {
            mobileUI.randomHandCards();
        } else {
            mobileUI.randomKnownCards();
        }
    }
}

function resetAll() {
    if (mobileUI) mobileUI.resetAll();
}

function analyzeCards() {
    if (mobileUI) mobileUI.analyzeCards();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    mobileUI = new MobileTienGowUI();
});