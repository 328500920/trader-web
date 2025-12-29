<template>
  <div class="links-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>🔗 常用链接</h1>
      <p>快速访问交易常用工具和资源</p>
    </div>

    <!-- 链接分类 -->
    <div class="links-grid">
      <div 
        v-for="(category, index) in linkCategories" 
        :key="category.name" 
        class="link-category"
        :class="`category-${index + 1}`"
      >
        <div class="category-header">
          <span class="category-icon">{{ category.icon }}</span>
          <h3>{{ category.name }}</h3>
          <span class="link-count">{{ category.links.length }} 个链接</span>
        </div>

        <div class="category-links">
          <a 
            v-for="link in category.links" 
            :key="link.name"
            :href="link.url"
            target="_blank"
            class="link-item"
          >
            <div class="link-icon">
              <el-icon><Link /></el-icon>
            </div>
            <div class="link-info">
              <span class="link-name">{{ link.name }}</span>
              <span class="link-desc">{{ link.desc }}</span>
            </div>
            <el-icon class="link-arrow"><TopRight /></el-icon>
          </a>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-section">
      <h2>⚡ 快捷入口</h2>
      <div class="quick-grid">
        <a 
          v-for="quick in quickLinks" 
          :key="quick.name"
          :href="quick.url"
          target="_blank"
          class="quick-card"
          :style="{ background: quick.gradient }"
        >
          <span class="quick-icon">{{ quick.icon }}</span>
          <span class="quick-name">{{ quick.name }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const linkCategories = ref([
  {
    name: '图表分析',
    icon: '📈',
    links: [
      { name: 'TradingView', url: 'https://www.tradingview.com', desc: '专业图表分析平台' },
      { name: 'Binance', url: 'https://www.binance.com', desc: '全球最大加密货币交易所' },
      { name: 'OKX', url: 'https://www.okx.com', desc: '领先的数字资产交易平台' }
    ]
  },
  {
    name: '链上数据',
    icon: '⛓️',
    links: [
      { name: 'Glassnode', url: 'https://glassnode.com', desc: '链上数据分析平台' },
      { name: 'CryptoQuant', url: 'https://cryptoquant.com', desc: '加密货币链上分析' },
      { name: 'Whale Alert', url: 'https://whale-alert.io', desc: '大额转账追踪' },
      { name: 'Arkham', url: 'https://platform.arkhamintelligence.com', desc: '链上情报平台' }
    ]
  },
  {
    name: '市场情绪',
    icon: '📊',
    links: [
      { name: 'Coinglass', url: 'https://www.coinglass.com', desc: '合约数据分析' },
      { name: '恐惧贪婪指数', url: 'https://alternative.me/crypto/fear-and-greed-index', desc: '市场情绪指标' },
      { name: 'CoinMarketCap', url: 'https://coinmarketcap.com', desc: '加密货币市值排名' }
    ]
  },
  {
    name: '新闻资讯',
    icon: '📰',
    links: [
      { name: 'CoinDesk', url: 'https://www.coindesk.com', desc: '加密货币新闻' },
      { name: 'The Block', url: 'https://www.theblock.co', desc: '区块链深度报道' },
      { name: '金十数据', url: 'https://www.jin10.com', desc: '财经数据资讯' },
      { name: 'Cointelegraph', url: 'https://cointelegraph.com', desc: '区块链媒体' }
    ]
  },
  {
    name: '财经日历',
    icon: '📅',
    links: [
      { name: 'Investing.com', url: 'https://www.investing.com/economic-calendar', desc: '全球财经日历' },
      { name: 'ForexFactory', url: 'https://www.forexfactory.com/calendar', desc: '外汇财经日历' },
      { name: 'FedWatch', url: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html', desc: '美联储利率预期' }
    ]
  },
  {
    name: '学习资源',
    icon: '📚',
    links: [
      { name: 'Investopedia', url: 'https://www.investopedia.com', desc: '投资百科全书' },
      { name: 'BabyPips', url: 'https://www.babypips.com', desc: '外汇交易学习' },
      { name: 'YouTube', url: 'https://www.youtube.com', desc: '视频学习平台' }
    ]
  }
])

const quickLinks = ref([
  { name: 'BTC 行情', icon: '₿', url: 'https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT', gradient: 'linear-gradient(135deg, #f7931a, #ffb347)' },
  { name: 'ETH 行情', icon: 'Ξ', url: 'https://www.tradingview.com/chart/?symbol=BINANCE:ETHUSDT', gradient: 'linear-gradient(135deg, #627eea, #8fa8f8)' },
  { name: '恐惧指数', icon: '😱', url: 'https://alternative.me/crypto/fear-and-greed-index', gradient: 'linear-gradient(135deg, #f56c6c, #f89898)' },
  { name: '资金费率', icon: '💰', url: 'https://www.coinglass.com/FundingRate', gradient: 'linear-gradient(135deg, #67c23a, #85ce61)' },
  { name: '清算地图', icon: '🗺️', url: 'https://www.coinglass.com/LiquidationMap', gradient: 'linear-gradient(135deg, #e6a23c, #ebb563)' },
  { name: '财经日历', icon: '📅', url: 'https://www.investing.com/economic-calendar', gradient: 'linear-gradient(135deg, #409eff, #66b1ff)' }
])
</script>

<style lang="scss" scoped>
.links-page {
  padding-bottom: 40px;
}

// 页面头部
.page-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  p {
    font-size: 15px;
    color: var(--text-secondary);
  }
}

// 链接网格
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.link-category {
  background: var(--bg-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-color);

  &.category-1 .category-header { border-left: 4px solid #667eea; }
  &.category-2 .category-header { border-left: 4px solid #11998e; }
  &.category-3 .category-header { border-left: 4px solid #f093fb; }
  &.category-4 .category-header { border-left: 4px solid #e6a23c; }
  &.category-5 .category-header { border-left: 4px solid #409eff; }
  &.category-6 .category-header { border-left: 4px solid #67c23a; }
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: var(--bg-secondary);
}

.category-icon {
  font-size: 28px;
}

.category-header h3 {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.link-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 4px 10px;
  border-radius: 12px;
}

.category-links {
  padding: 16px 24px 24px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: var(--bg-secondary);
    transform: translateX(4px);

    .link-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.link-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 18px;
    color: white;
  }
}

.link-info {
  flex: 1;
  min-width: 0;

  .link-name {
    display: block;
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .link-desc {
    display: block;
    font-size: 12px;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.link-arrow {
  color: var(--text-secondary);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s;
}

// 快捷入口
.quick-section {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
  }
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  border-radius: 16px;
  text-decoration: none;
  color: white;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }

  .quick-icon {
    font-size: 32px;
  }

  .quick-name {
    font-size: 14px;
    font-weight: 600;
  }
}

// 响应式
@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
