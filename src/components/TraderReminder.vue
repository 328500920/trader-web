<template>
  <Teleport to="body">
    <Transition name="reminder-slide">
      <div v-if="visible" class="trader-reminder">
        <div class="reminder-header">
          <div class="header-title">
            <el-icon class="title-icon"><Trophy /></el-icon>
            <span>交易员核心能力提醒</span>
          </div>
          <el-button class="close-btn" text circle @click="closeReminder">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <div class="reminder-body">
          <!-- 六大核心能力 -->
          <div class="section">
            <h3><el-icon><Star /></el-icon> 顶级交易员的6大核心能力</h3>
            <div class="ability-grid">
              <div class="ability-item">
                <span class="num">1</span>
                <div class="content">
                  <strong>技术分析</strong>
                  <p>K线、指标、趋势、支撑阻力</p>
                </div>
              </div>
              <div class="ability-item">
                <span class="num">2</span>
                <div class="content">
                  <strong>基本面分析</strong>
                  <p>宏观经济、行业事件、项目研究</p>
                </div>
              </div>
              <div class="ability-item">
                <span class="num">3</span>
                <div class="content">
                  <strong>链上数据</strong>
                  <p>巨鲸动向、交易所流量、持仓分布</p>
                </div>
              </div>
              <div class="ability-item">
                <span class="num">4</span>
                <div class="content">
                  <strong>市场情绪</strong>
                  <p>恐惧贪婪、资金费率、多空比、OI</p>
                </div>
              </div>
              <div class="ability-item">
                <span class="num">5</span>
                <div class="content">
                  <strong>资金管理</strong>
                  <p>仓位控制、风险分散、止损策略</p>
                </div>
              </div>
              <div class="ability-item">
                <span class="num">6</span>
                <div class="content">
                  <strong>交易心理</strong>
                  <p>情绪控制、执行纪律、认知偏差</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 核心三要素 -->
          <div class="section highlight-section">
            <h3><el-icon><Aim /></el-icon> 核心三要素</h3>
            <div class="core-items">
              <span class="core-tag">1. 仓位管理</span>
              <span class="core-tag">2. 开仓带止损，分批止盈</span>
              <span class="core-tag">3. 心态管理</span>
            </div>
          </div>

          <!-- 十大原则 -->
          <div class="section">
            <h3><el-icon><List /></el-icon> 十大原则</h3>
            <div class="principles-list">
              <div class="principle-item">
                <span class="idx">1</span>
                <span>大行情（美股开盘、消息面）不做，庄赚庄的钱，玩家赚玩家的钱</span>
              </div>
              <div class="principle-item">
                <span class="idx">2</span>
                <span>少研究技术，如果要学成体系成系统的学，不要碎片式</span>
              </div>
              <div class="principle-item">
                <span class="idx">3</span>
                <span>顺应趋势，别去对抗，做趋势单</span>
              </div>
              <div class="principle-item">
                <span class="idx">4</span>
                <span>连续盈利和连续亏损停一停，盯一会盘面，前者防飘后者调整状态</span>
              </div>
              <div class="principle-item">
                <span class="idx">5</span>
                <span>不要一个人做单，找志同道合的玩家互相监督提醒</span>
              </div>
              <div class="principle-item">
                <span class="idx">6</span>
                <span>情绪不稳定的时候少操作</span>
              </div>
              <div class="principle-item">
                <span class="idx">7</span>
                <span>随时随刻调整心态，稳定的情绪是做单的最佳辅助</span>
              </div>
              <div class="principle-item">
                <span class="idx">8</span>
                <span>交易系统要完整，开单跟单要有思路</span>
              </div>
              <div class="principle-item">
                <span class="idx">9</span>
                <span>不要纯跟单，学一点开单思路才能找对节奏，多问问题</span>
              </div>
            </div>
          </div>
        </div>

        <div class="reminder-footer">
          <el-checkbox v-model="dontShowToday" label="今日不再提醒" />
          <el-button type="primary" @click="closeReminder">我已了解</el-button>
        </div>
      </div>
    </Transition>
    
    <!-- 遮罩层 -->
    <Transition name="fade">
      <div v-if="visible" class="reminder-overlay" @click="closeReminder"></div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Trophy, Close, Star, Aim, List } from '@element-plus/icons-vue'

const visible = ref(false)
const dontShowToday = ref(false)

const STORAGE_KEY = 'trader_reminder_hidden_date'

const checkShouldShow = () => {
  const hiddenDate = localStorage.getItem(STORAGE_KEY)
  if (hiddenDate) {
    const today = new Date().toDateString()
    if (hiddenDate === today) {
      return false
    }
  }
  return true
}

const closeReminder = () => {
  if (dontShowToday.value) {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString())
  }
  visible.value = false
}

onMounted(() => {
  // 延迟显示，等页面加载完成
  setTimeout(() => {
    if (checkShouldShow()) {
      visible.value = true
    }
  }, 500)
})
</script>

<style lang="scss" scoped>
.reminder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.trader-reminder {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 680px;
  max-height: 85vh;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.reminder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;

  .title-icon {
    font-size: 24px;
  }
}

.close-btn {
  color: white;
  font-size: 18px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.reminder-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--border-light);

    .el-icon {
      color: var(--primary-color);
    }
  }
}

.highlight-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);

  h3 {
    border-bottom-color: rgba(102, 126, 234, 0.3);
  }
}

.ability-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.ability-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
  }

  .num {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    min-width: 0;

    strong {
      display: block;
      font-size: 14px;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    p {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }
  }
}

.core-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.core-tag {
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.principles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.principle-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;

  .idx {
    width: 22px;
    height: 22px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }
}

.reminder-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

// 动画
.reminder-slide-enter-active,
.reminder-slide-leave-active {
  transition: all 0.3s ease;
}

.reminder-slide-enter-from,
.reminder-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 移动端适配
@media (max-width: 768px) {
  .trader-reminder {
    width: 95%;
    max-height: 90vh;
  }

  .reminder-header {
    padding: 16px 20px;
  }

  .header-title {
    font-size: 16px;
  }

  .reminder-body {
    padding: 16px 20px;
  }

  .ability-grid {
    grid-template-columns: 1fr;
  }

  .core-items {
    flex-direction: column;
  }

  .core-tag {
    text-align: center;
  }

  .reminder-footer {
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;

    .el-button {
      width: 100%;
    }
  }
}
</style>
