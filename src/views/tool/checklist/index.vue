<template>
  <div class="checklist-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>✅ 交易前检查清单</h1>
        <p>系统化检查，避免冲动交易</p>
      </div>
      <div class="header-progress">
        <el-progress 
          type="circle" 
          :percentage="completionPercent" 
          :width="100"
          :stroke-width="10"
          :color="progressColor"
        >
          <template #default>
            <div class="progress-content">
              <span class="count">{{ completedCount }}/{{ totalCount }}</span>
            </div>
          </template>
        </el-progress>
      </div>
    </div>

    <!-- 检查清单 -->
    <div class="checklist-grid">
      <div 
        v-for="(section, sectionIndex) in checklist" 
        :key="section.title" 
        class="checklist-card"
        :class="`section-${sectionIndex + 1}`"
      >
        <div class="card-header">
          <div class="header-icon">
            <span>{{ section.icon }}</span>
          </div>
          <div class="header-info">
            <h3>{{ section.title }}</h3>
            <span class="section-progress">
              {{ getSectionCompleted(section) }}/{{ section.items.length }}
            </span>
          </div>
          <el-progress 
            :percentage="getSectionPercent(section)" 
            :stroke-width="6"
            :show-text="false"
            :color="getSectionColor(sectionIndex)"
            style="width: 80px;"
          />
        </div>

        <div class="card-body">
          <div 
            v-for="item in section.items" 
            :key="item.id" 
            class="check-item"
            :class="{ checked: item.checked }"
            @click="toggleItem(item)"
          >
            <div class="item-checkbox">
              <el-icon v-if="item.checked"><CircleCheckFilled /></el-icon>
              <div v-else class="checkbox-empty"></div>
            </div>
            <span class="item-text">{{ item.content }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="action-section">
      <div class="action-card">
        <div class="action-status">
          <div class="status-icon" :class="canTrade ? 'ready' : 'not-ready'">
            <el-icon v-if="canTrade"><CircleCheckFilled /></el-icon>
            <el-icon v-else><Warning /></el-icon>
          </div>
          <div class="status-text">
            <h3 v-if="canTrade">✅ 检查完成，可以交易</h3>
            <h3 v-else>⚠️ 请完成至少 80% 的检查项</h3>
            <p v-if="!canTrade">还需完成 {{ Math.ceil(totalCount * 0.8) - completedCount }} 项检查</p>
          </div>
        </div>
        <div class="action-buttons">
          <el-button @click="resetChecklist">
            <el-icon><RefreshRight /></el-icon>重置清单
          </el-button>
          <el-button 
            type="primary" 
            size="large"
            :disabled="!canTrade"
            @click="confirmTrade"
          >
            <el-icon><Check /></el-icon>确认可以交易
          </el-button>
        </div>
      </div>
    </div>

    <!-- 交易提示 -->
    <div class="tips-section">
      <div class="tip-item">
        <el-icon><InfoFilled /></el-icon>
        <span>完成检查清单可以帮助你避免情绪化交易，提高交易质量</span>
      </div>
      <div class="tip-item">
        <el-icon><InfoFilled /></el-icon>
        <span>如果多项检查不通过，建议今日观望，等待更好的机会</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const sectionColors = ['#667eea', '#11998e', '#f093fb', '#e6a23c']

const checklist = ref([
  {
    title: '宏观环境检查',
    icon: '🌍',
    items: [
      { id: 1, content: '本周有无重大经济数据发布？', checked: false },
      { id: 2, content: '美联储近期态度？（鹰派/鸽派）', checked: false },
      { id: 3, content: '美元指数趋势？', checked: false },
      { id: 4, content: '有无行业重大消息？', checked: false }
    ]
  },
  {
    title: '链上数据检查',
    icon: '⛓️',
    items: [
      { id: 5, content: '交易所BTC净流入/流出？', checked: false },
      { id: 6, content: '巨鲸近期动向？', checked: false },
      { id: 7, content: '长期持有者在买还是卖？', checked: false }
    ]
  },
  {
    title: '市场情绪检查',
    icon: '📊',
    items: [
      { id: 8, content: '恐惧贪婪指数当前值？', checked: false },
      { id: 9, content: '资金费率是否极端？', checked: false },
      { id: 10, content: '多空比是否失衡？', checked: false },
      { id: 11, content: 'OI变化趋势？', checked: false }
    ]
  },
  {
    title: '技术面检查',
    icon: '📈',
    items: [
      { id: 12, content: '大周期趋势方向？', checked: false },
      { id: 13, content: '当前价格在关键位置？', checked: false },
      { id: 14, content: '指标是否给出信号？', checked: false },
      { id: 15, content: '是否有背离？', checked: false }
    ]
  }
])

const totalCount = computed(() => {
  return checklist.value.reduce((sum, section) => sum + section.items.length, 0)
})

const completedCount = computed(() => {
  return checklist.value.reduce((sum, section) => {
    return sum + section.items.filter(item => item.checked).length
  }, 0)
})

const completionPercent = computed(() => {
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const canTrade = computed(() => {
  return completedCount.value >= totalCount.value * 0.8
})

const progressColor = computed(() => {
  if (completionPercent.value === 100) return '#67c23a'
  if (completionPercent.value >= 80) return '#409eff'
  if (completionPercent.value >= 50) return '#e6a23c'
  return '#f56c6c'
})

const getSectionCompleted = (section) => {
  return section.items.filter(item => item.checked).length
}

const getSectionPercent = (section) => {
  return Math.round((getSectionCompleted(section) / section.items.length) * 100)
}

const getSectionColor = (index) => {
  return sectionColors[index % sectionColors.length]
}

const toggleItem = (item) => {
  item.checked = !item.checked
}

const resetChecklist = () => {
  checklist.value.forEach(section => {
    section.items.forEach(item => {
      item.checked = false
    })
  })
  ElMessage.info('清单已重置')
}

const confirmTrade = () => {
  ElMessage.success('🎉 检查完成，祝交易顺利！')
}
</script>

<style lang="scss" scoped>
.checklist-page {
  padding-bottom: 40px;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  margin-bottom: 28px;
  color: white;

  .header-content {
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    p {
      font-size: 15px;
      opacity: 0.9;
    }
  }

  .header-progress {
    .progress-content {
      .count {
        font-size: 20px;
        font-weight: 700;
        color: white;
      }
    }

    :deep(.el-progress__text) {
      color: white !important;
    }

    :deep(.el-progress-circle__track) {
      stroke: rgba(255, 255, 255, 0.3);
    }
  }
}

// 检查清单网格
.checklist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 28px;
}

.checklist-card {
  background: var(--bg-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-color);

  &.section-1 .card-header { border-left: 4px solid #667eea; }
  &.section-2 .card-header { border-left: 4px solid #11998e; }
  &.section-3 .card-header { border-left: 4px solid #f093fb; }
  &.section-4 .card-header { border-left: 4px solid #e6a23c; }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--bg-secondary);
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.header-info {
  flex: 1;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .section-progress {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.card-body {
  padding: 16px 24px 24px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: var(--bg-secondary);
  }

  &.checked {
    background: rgba(103, 194, 58, 0.1);

    .item-checkbox {
      .el-icon {
        color: var(--success-color);
      }
    }

    .item-text {
      color: var(--text-secondary);
      text-decoration: line-through;
    }
  }
}

.item-checkbox {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 24px;
  }

  .checkbox-empty {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    border-radius: 50%;
  }
}

.item-text {
  font-size: 14px;
  color: var(--text-primary);
}

// 底部操作区
.action-section {
  margin-bottom: 24px;
}

.action-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.action-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 32px;
    color: white;
  }

  &.ready {
    background: linear-gradient(135deg, #67c23a, #85ce61);
  }

  &.not-ready {
    background: linear-gradient(135deg, #e6a23c, #ebb563);
  }
}

.status-text {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
}

// 提示区域
.tips-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);

  .el-icon {
    color: var(--primary-color);
  }
}

// 响应式
@media (max-width: 1024px) {
  .checklist-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;
  }

  .action-card {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .action-status {
    flex-direction: column;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
}
</style>
