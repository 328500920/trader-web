<template>
  <div class="patterns-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <h1>K线形态图鉴</h1>
        <p class="subtitle">掌握经典K线形态，提升技术分析能力</p>
      </div>
      <div class="header-search">
        <el-input
          v-model="searchText"
          placeholder="搜索形态名称..."
          prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>
    </header>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">类型：</span>
        <el-radio-group v-model="filterType" size="small">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="bullish">
            <span class="type-tag bullish">看涨</span>
          </el-radio-button>
          <el-radio-button label="bearish">
            <span class="type-tag bearish">看跌</span>
          </el-radio-button>
          <el-radio-button label="neutral">
            <span class="type-tag neutral">中性</span>
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-group">
        <span class="filter-label">周数：</span>
        <el-radio-group v-model="filterWeek" size="small">
          <el-radio-button :label="0">全部</el-radio-button>
          <el-radio-button :label="1">第1周</el-radio-button>
          <el-radio-button :label="2">第2周</el-radio-button>
          <el-radio-button :label="3">第3周</el-radio-button>
          <el-radio-button :label="4">第4周</el-radio-button>
          <el-radio-button :label="5">第5周</el-radio-button>
          <el-radio-button :label="6">第6周</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 形态卡片网格 -->
    <div class="patterns-grid">
      <div
        v-for="pattern in filteredPatterns"
        :key="pattern.id"
        class="pattern-card"
        @click="showPatternDetail(pattern)"
      >
        <div class="card-chart">
          <CandlestickChart :pattern="pattern.id" :height="180" :showTooltip="false" />
        </div>
        <div class="card-info">
          <h3 class="pattern-name">{{ pattern.name }}</h3>
          <div class="pattern-meta">
            <span class="type-badge" :class="pattern.type">
              {{ typeLabels[pattern.type] }}
            </span>
            <span class="week-badge">第{{ pattern.week }}周</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="filteredPatterns.length === 0" description="没有找到匹配的形态" />

    <!-- 形态详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentPattern?.name"
      width="700px"
      class="pattern-dialog"
    >
      <div class="detail-content" v-if="currentPattern">
        <div class="detail-chart">
          <CandlestickChart :pattern="currentPattern.id" :height="300" />
        </div>
        <div class="detail-info">
          <div class="info-row">
            <span class="info-label">类型：</span>
            <span class="type-badge large" :class="currentPattern.type">
              {{ typeLabels[currentPattern.type] }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">所属周：</span>
            <span>第{{ currentPattern.week }}周课程</span>
          </div>
          <div class="info-row description">
            <span class="info-label">说明：</span>
            <p>{{ currentPattern.description }}</p>
          </div>
          <div class="info-row tips" v-if="currentPattern.tips?.length">
            <span class="info-label">识别要点：</span>
            <ul>
              <li v-for="(tip, idx) in currentPattern.tips" :key="idx">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CandlestickChart from '@/components/CandlestickChart/index.vue'
import { getAllPatterns } from '@/components/CandlestickChart/patterns'

const searchText = ref('')
const filterType = ref('')
const filterWeek = ref(0)
const detailVisible = ref(false)
const currentPattern = ref(null)

const typeLabels = {
  bullish: '看涨',
  bearish: '看跌',
  neutral: '中性'
}

const allPatterns = getAllPatterns()

const filteredPatterns = computed(() => {
  return allPatterns.filter(p => {
    if (searchText.value && !p.name.includes(searchText.value)) return false
    if (filterType.value && p.type !== filterType.value) return false
    if (filterWeek.value && p.week !== filterWeek.value) return false
    return true
  })
})

const showPatternDetail = (pattern) => {
  currentPattern.value = pattern
  detailVisible.value = true
}
</script>

<style lang="scss" scoped>
.patterns-page {
  padding: 24px;
  min-height: 100vh;
  background: var(--bg-secondary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);

  .header-content {
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }
    .subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .search-input {
    width: 240px;
  }
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);

  .filter-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .filter-label {
    font-size: 14px;
    color: var(--text-secondary);
    white-space: nowrap;
  }
}

.type-tag {
  &.bullish { color: #26a69a; }
  &.bearish { color: #ef5350; }
  &.neutral { color: #ff9800; }
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.pattern-card {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }

  .card-chart {
    padding: 12px;
    background: var(--bg-secondary);
  }

  .card-info {
    padding: 16px;

    .pattern-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 12px 0;
    }

    .pattern-meta {
      display: flex;
      gap: 8px;
    }
  }
}

.type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.bullish {
    background: rgba(38, 166, 154, 0.15);
    color: #26a69a;
  }
  &.bearish {
    background: rgba(239, 83, 80, 0.15);
    color: #ef5350;
  }
  &.neutral {
    background: rgba(255, 152, 0, 0.15);
    color: #ff9800;
  }
  &.large {
    padding: 4px 14px;
    font-size: 14px;
  }
}

.week-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.pattern-dialog {
  .detail-content {
    .detail-chart {
      margin-bottom: 20px;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: 8px;
    }

    .detail-info {
      .info-row {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;

        .info-label {
          font-weight: 500;
          color: var(--text-secondary);
          min-width: 80px;
        }

        &.description p {
          margin: 0;
          line-height: 1.6;
          color: var(--text-primary);
        }

        &.tips ul {
          margin: 0;
          padding-left: 20px;
          li {
            line-height: 1.8;
            color: var(--text-primary);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

    .search-input {
      width: 100%;
    }
  }

  .filter-bar {
    flex-direction: column;
  }

  .patterns-grid {
    grid-template-columns: 1fr;
  }
}
</style>
