/**
 * K线形态预设数据
 * 第1-6周课程配套形态
 */

export const patterns = {
  // ========== 第1周：单根K线形态 ==========
  
  // 大阳线
  bullish_candle: {
    id: 'bullish_candle',
    name: '大阳线',
    category: 'single',
    type: 'bullish',
    week: 1,
    description: '实体较长的阳线，表示买方力量强劲，价格大幅上涨',
    data: [
      { date: 'Day1', open: 100, close: 98, low: 97, high: 101 },
      { date: 'Day2', open: 97, close: 95, low: 94, high: 98 },
      { date: 'Day3', open: 94, close: 92, low: 91, high: 95 },
      { date: 'Day4', open: 91, close: 102, low: 90, high: 103 },
      { date: 'Day5', open: 103, close: 106, low: 102, high: 107 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 88, label: '大阳线' },
      { type: 'entry', index: 4, price: 103, label: '入场' },
      { type: 'stopLoss', price: 89, label: '止损' },
      { type: 'target', price: 115, label: '目标' }
    ],
    tips: ['实体长度至少是前几根K线的2倍', '成交量放大更有效', '出现在下跌末端是反转信号']
  },

  // 大阴线
  bearish_candle: {
    id: 'bearish_candle',
    name: '大阴线',
    category: 'single',
    type: 'bearish',
    week: 1,
    description: '实体较长的阴线，表示卖方力量强劲，价格大幅下跌',
    data: [
      { date: 'Day1', open: 100, close: 102, low: 99, high: 103 },
      { date: 'Day2', open: 103, close: 105, low: 102, high: 106 },
      { date: 'Day3', open: 106, close: 108, low: 105, high: 109 },
      { date: 'Day4', open: 109, close: 97, low: 96, high: 110 },
      { date: 'Day5', open: 96, close: 93, low: 92, high: 97 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 112, label: '大阴线' },
      { type: 'stopLoss', price: 111, label: '止损' },
      { type: 'target', price: 88, label: '目标' }
    ],
    tips: ['实体长度至少是前几根K线的2倍', '成交量放大更有效', '出现在上涨末端是反转信号']
  },

  // 锤子线
  hammer: {
    id: 'hammer',
    name: '锤子线',
    category: 'single',
    type: 'bullish',
    week: 1,
    description: '长下影线，小实体，出现在下跌末端，预示反转',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 90, low: 88, high: 95 },
      { date: 'Day3', open: 89, close: 85, low: 83, high: 90 },
      { date: 'Day4', open: 84, close: 86, low: 75, high: 87 },
      { date: 'Day5', open: 87, close: 92, low: 86, high: 93 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 73, label: '锤子线' },
      { type: 'entry', index: 4, price: 87, label: '入场' },
      { type: 'stopLoss', price: 74, label: '止损' },
      { type: 'target', price: 100, label: '目标' }
    ],
    tips: ['下影线长度至少是实体的2倍', '出现在下跌趋势末端更有效', '需要后续阳线确认']
  },

  // 倒锤子
  inverted_hammer: {
    id: 'inverted_hammer',
    name: '倒锤子',
    category: 'single',
    type: 'bullish',
    week: 1,
    description: '长上影线，小实体，出现在下跌末端，预示反转',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 90, low: 88, high: 95 },
      { date: 'Day3', open: 89, close: 85, low: 83, high: 90 },
      { date: 'Day4', open: 84, close: 85, low: 83, high: 95 },
      { date: 'Day5', open: 86, close: 91, low: 85, high: 92 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 97, label: '倒锤子' },
      { type: 'entry', index: 4, price: 86, label: '入场' },
      { type: 'stopLoss', price: 82, label: '止损' },
      { type: 'target', price: 98, label: '目标' }
    ],
    tips: ['上影线长度至少是实体的2倍', '出现在下跌趋势末端', '需要后续阳线确认']
  },

  // 上吊线
  hanging_man: {
    id: 'hanging_man',
    name: '上吊线',
    category: 'single',
    type: 'bearish',
    week: 1,
    description: '形态与锤子线相同，但出现在上涨末端，预示下跌',
    data: [
      { date: 'Day1', open: 90, close: 95, low: 89, high: 96 },
      { date: 'Day2', open: 96, close: 100, low: 95, high: 101 },
      { date: 'Day3', open: 101, close: 105, low: 100, high: 106 },
      { date: 'Day4', open: 106, close: 105, low: 96, high: 107 },
      { date: 'Day5', open: 104, close: 99, low: 98, high: 105 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 94, label: '上吊线' },
      { type: 'stopLoss', price: 108, label: '止损' },
      { type: 'target', price: 92, label: '目标' }
    ],
    tips: ['形态与锤子线相同', '关键是出现在上涨趋势末端', '需要后续阴线确认']
  },

  // 射击之星
  shooting_star: {
    id: 'shooting_star',
    name: '射击之星',
    category: 'single',
    type: 'bearish',
    week: 1,
    description: '长上影线，小实体，出现在上涨末端，预示下跌',
    data: [
      { date: 'Day1', open: 90, close: 95, low: 89, high: 96 },
      { date: 'Day2', open: 96, close: 100, low: 95, high: 101 },
      { date: 'Day3', open: 101, close: 105, low: 100, high: 106 },
      { date: 'Day4', open: 106, close: 105, low: 104, high: 116 },
      { date: 'Day5', open: 104, close: 98, low: 97, high: 105 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 118, label: '射击之星' },
      { type: 'stopLoss', price: 117, label: '止损' },
      { type: 'target', price: 92, label: '目标' }
    ],
    tips: ['上影线长度至少是实体的2倍', '出现在上涨趋势末端', '需要后续阴线确认']
  },

  // 十字星
  doji: {
    id: 'doji',
    name: '十字星',
    category: 'single',
    type: 'neutral',
    week: 1,
    description: '开盘价与收盘价几乎相等，表示多空平衡，可能转折',
    data: [
      { date: 'Day1', open: 95, close: 98, low: 94, high: 99 },
      { date: 'Day2', open: 99, close: 102, low: 98, high: 103 },
      { date: 'Day3', open: 103, close: 106, low: 102, high: 107 },
      { date: 'Day4', open: 107, close: 107, low: 103, high: 111 },
      { date: 'Day5', open: 106, close: 102, low: 101, high: 107 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 113, label: '十字星' }
    ],
    tips: ['开盘价与收盘价几乎相等', '表示多空力量平衡', '需要结合位置和后续K线判断方向']
  },

  // 蜻蜓十字
  dragonfly_doji: {
    id: 'dragonfly_doji',
    name: '蜻蜓十字',
    category: 'single',
    type: 'bullish',
    week: 1,
    description: '长下影线的十字星，出现在底部是看涨信号',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 90, low: 88, high: 95 },
      { date: 'Day3', open: 89, close: 85, low: 83, high: 90 },
      { date: 'Day4', open: 84, close: 84, low: 74, high: 85 },
      { date: 'Day5', open: 85, close: 90, low: 84, high: 91 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 72, label: '蜻蜓十字' },
      { type: 'entry', index: 4, price: 85, label: '入场' },
      { type: 'stopLoss', price: 73, label: '止损' }
    ],
    tips: ['开盘价、收盘价、最高价几乎相等', '长下影线表示下方有支撑', '出现在底部是强烈看涨信号']
  },

  // 墓碑十字
  gravestone_doji: {
    id: 'gravestone_doji',
    name: '墓碑十字',
    category: 'single',
    type: 'bearish',
    week: 1,
    description: '长上影线的十字星，出现在顶部是看跌信号',
    data: [
      { date: 'Day1', open: 90, close: 95, low: 89, high: 96 },
      { date: 'Day2', open: 96, close: 100, low: 95, high: 101 },
      { date: 'Day3', open: 101, close: 105, low: 100, high: 106 },
      { date: 'Day4', open: 106, close: 106, low: 105, high: 116 },
      { date: 'Day5', open: 105, close: 100, low: 99, high: 106 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 118, label: '墓碑十字' },
      { type: 'stopLoss', price: 117, label: '止损' }
    ],
    tips: ['开盘价、收盘价、最低价几乎相等', '长上影线表示上方有阻力', '出现在顶部是强烈看跌信号']
  },

  // ========== 第1周：双根K线组合 ==========

  // 看涨吞没
  bullish_engulfing: {
    id: 'bullish_engulfing',
    name: '看涨吞没',
    category: 'double',
    type: 'bullish',
    week: 1,
    description: '阳线实体完全包住前一根阴线实体，底部反转信号',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 90, low: 88, high: 95 },
      { date: 'Day3', open: 89, close: 85, low: 83, high: 90 },
      { date: 'Day4', open: 84, close: 80, low: 79, high: 85 },
      { date: 'Day5', open: 78, close: 88, low: 77, high: 89 }
    ],
    highlights: [3, 4],
    annotations: [
      { type: 'text', index: 4, price: 91, label: '看涨吞没' },
      { type: 'entry', index: 4, price: 88, label: '入场' },
      { type: 'stopLoss', price: 76, label: '止损' },
      { type: 'target', price: 100, label: '目标' }
    ],
    tips: ['阳线实体必须完全包住阴线实体', '出现在下跌趋势末端', '成交量放大更有效']
  },

  // 看跌吞没
  bearish_engulfing: {
    id: 'bearish_engulfing',
    name: '看跌吞没',
    category: 'double',
    type: 'bearish',
    week: 1,
    description: '阴线实体完全包住前一根阳线实体，顶部反转信号',
    data: [
      { date: 'Day1', open: 90, close: 95, low: 89, high: 96 },
      { date: 'Day2', open: 96, close: 100, low: 95, high: 101 },
      { date: 'Day3', open: 101, close: 105, low: 100, high: 106 },
      { date: 'Day4', open: 106, close: 110, low: 105, high: 111 },
      { date: 'Day5', open: 112, close: 102, low: 101, high: 113 }
    ],
    highlights: [3, 4],
    annotations: [
      { type: 'text', index: 4, price: 99, label: '看跌吞没' },
      { type: 'stopLoss', price: 114, label: '止损' },
      { type: 'target', price: 92, label: '目标' }
    ],
    tips: ['阴线实体必须完全包住阳线实体', '出现在上涨趋势末端', '成交量放大更有效']
  },

  // 乌云盖顶
  dark_cloud_cover: {
    id: 'dark_cloud_cover',
    name: '乌云盖顶',
    category: 'double',
    type: 'bearish',
    week: 1,
    description: '阴线开盘高于前阳线最高价，收盘深入阳线实体50%以上',
    data: [
      { date: 'Day1', open: 90, close: 95, low: 89, high: 96 },
      { date: 'Day2', open: 96, close: 100, low: 95, high: 101 },
      { date: 'Day3', open: 101, close: 106, low: 100, high: 107 },
      { date: 'Day4', open: 107, close: 112, low: 106, high: 113 },
      { date: 'Day5', open: 114, close: 105, low: 104, high: 115 }
    ],
    highlights: [3, 4],
    annotations: [
      { type: 'text', index: 4, price: 117, label: '乌云盖顶' },
      { type: 'stopLoss', price: 116, label: '止损' },
      { type: 'target', price: 95, label: '目标' }
    ],
    tips: ['阴线开盘高于前阳线最高价', '收盘深入阳线实体50%以上', '出现在上涨趋势末端']
  },

  // 刺透形态
  piercing_pattern: {
    id: 'piercing_pattern',
    name: '刺透形态',
    category: 'double',
    type: 'bullish',
    week: 1,
    description: '阳线开盘低于前阴线最低价，收盘深入阴线实体50%以上',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 90, low: 88, high: 95 },
      { date: 'Day3', open: 89, close: 84, low: 83, high: 90 },
      { date: 'Day4', open: 83, close: 78, low: 77, high: 84 },
      { date: 'Day5', open: 75, close: 85, low: 74, high: 86 }
    ],
    highlights: [3, 4],
    annotations: [
      { type: 'text', index: 4, price: 72, label: '刺透形态' },
      { type: 'entry', index: 4, price: 85, label: '入场' },
      { type: 'stopLoss', price: 73, label: '止损' },
      { type: 'target', price: 95, label: '目标' }
    ],
    tips: ['阳线开盘低于前阴线最低价', '收盘深入阴线实体50%以上', '出现在下跌趋势末端']
  },

  // ========== 第1周：三根K线组合 ==========

  // 早晨之星
  morning_star: {
    id: 'morning_star',
    name: '早晨之星',
    category: 'triple',
    type: 'bullish',
    week: 1,
    description: '三根K线组合：大阴线 + 小实体(星线) + 大阳线，底部反转',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 85, low: 84, high: 95 },
      { date: 'Day3', open: 84, close: 83, low: 81, high: 85 },
      { date: 'Day4', open: 84, close: 93, low: 83, high: 94 },
      { date: 'Day5', open: 94, close: 98, low: 93, high: 99 }
    ],
    highlights: [1, 2, 3],
    annotations: [
      { type: 'text', index: 2, price: 79, label: '星线' },
      { type: 'entry', index: 4, price: 94, label: '入场' },
      { type: 'stopLoss', price: 80, label: '止损' },
      { type: 'target', price: 105, label: '目标' }
    ],
    tips: ['第一根是大阴线', '第二根是小实体（星线）', '第三根是大阳线，收盘进入第一根阴线实体']
  },

  // 黄昏之星
  evening_star: {
    id: 'evening_star',
    name: '黄昏之星',
    category: 'triple',
    type: 'bearish',
    week: 1,
    description: '三根K线组合：大阳线 + 小实体(星线) + 大阴线，顶部反转',
    data: [
      { date: 'Day1', open: 90, close: 95, low: 89, high: 96 },
      { date: 'Day2', open: 96, close: 105, low: 95, high: 106 },
      { date: 'Day3', open: 106, close: 107, low: 105, high: 109 },
      { date: 'Day4', open: 106, close: 97, low: 96, high: 107 },
      { date: 'Day5', open: 96, close: 92, low: 91, high: 97 }
    ],
    highlights: [1, 2, 3],
    annotations: [
      { type: 'text', index: 2, price: 111, label: '星线' },
      { type: 'stopLoss', price: 110, label: '止损' },
      { type: 'target', price: 88, label: '目标' }
    ],
    tips: ['第一根是大阳线', '第二根是小实体（星线）', '第三根是大阴线，收盘进入第一根阳线实体']
  },

  // 三只乌鸦
  three_black_crows: {
    id: 'three_black_crows',
    name: '三只乌鸦',
    category: 'triple',
    type: 'bearish',
    week: 1,
    description: '连续三根大阴线，每根开盘在前一根实体内，收盘创新低',
    data: [
      { date: 'Day1', open: 90, close: 95, low: 89, high: 96 },
      { date: 'Day2', open: 96, close: 100, low: 95, high: 101 },
      { date: 'Day3', open: 99, close: 93, low: 92, high: 100 },
      { date: 'Day4', open: 92, close: 86, low: 85, high: 93 },
      { date: 'Day5', open: 85, close: 79, low: 78, high: 86 }
    ],
    highlights: [2, 3, 4],
    annotations: [
      { type: 'text', index: 3, price: 83, label: '三只乌鸦' },
      { type: 'stopLoss', price: 101, label: '止损' },
      { type: 'target', price: 70, label: '目标' }
    ],
    tips: ['连续三根大阴线', '每根开盘在前一根实体内', '每根收盘创新低']
  },

  // 三白兵
  three_white_soldiers: {
    id: 'three_white_soldiers',
    name: '三白兵',
    category: 'triple',
    type: 'bullish',
    week: 1,
    description: '连续三根大阳线，每根开盘在前一根实体内，收盘创新高',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 90, low: 88, high: 95 },
      { date: 'Day3', open: 91, close: 97, low: 90, high: 98 },
      { date: 'Day4', open: 98, close: 104, low: 97, high: 105 },
      { date: 'Day5', open: 105, close: 111, low: 104, high: 112 }
    ],
    highlights: [2, 3, 4],
    annotations: [
      { type: 'text', index: 3, price: 107, label: '三白兵' },
      { type: 'entry', index: 2, price: 97, label: '入场' },
      { type: 'stopLoss', price: 87, label: '止损' },
      { type: 'target', price: 120, label: '目标' }
    ],
    tips: ['连续三根大阳线', '每根开盘在前一根实体内', '每根收盘创新高']
  },

  // ========== 第2周：支撑阻力形态 ==========

  // 支撑位反弹
  support_bounce: {
    id: 'support_bounce',
    name: '支撑位反弹',
    category: 'support_resistance',
    type: 'bullish',
    week: 2,
    description: '价格下跌到支撑位后获得支撑，形成反弹',
    data: [
      { date: 'Day1', open: 105, close: 100, low: 99, high: 106 },
      { date: 'Day2', open: 99, close: 95, low: 94, high: 100 },
      { date: 'Day3', open: 94, close: 91, low: 90, high: 95 },
      { date: 'Day4', open: 90, close: 92, low: 89, high: 93 },
      { date: 'Day5', open: 93, close: 98, low: 92, high: 99 }
    ],
    highlights: [3],
    annotations: [
      { type: 'support', price: 89, label: '支撑位' },
      { type: 'entry', index: 4, price: 93, label: '入场' },
      { type: 'stopLoss', price: 87, label: '止损' },
      { type: 'target', price: 105, label: '目标' }
    ],
    tips: ['支撑位是价格多次获得支撑的水平', '在支撑位附近出现看涨K线形态更有效', '止损设在支撑位下方']
  },

  // 阻力位受阻
  resistance_rejection: {
    id: 'resistance_rejection',
    name: '阻力位受阻',
    category: 'support_resistance',
    type: 'bearish',
    week: 2,
    description: '价格上涨到阻力位后受阻，形成回落',
    data: [
      { date: 'Day1', open: 95, close: 100, low: 94, high: 101 },
      { date: 'Day2', open: 101, close: 105, low: 100, high: 106 },
      { date: 'Day3', open: 106, close: 109, low: 105, high: 110 },
      { date: 'Day4', open: 110, close: 108, low: 107, high: 112 },
      { date: 'Day5', open: 107, close: 102, low: 101, high: 108 }
    ],
    highlights: [3],
    annotations: [
      { type: 'resistance', price: 112, label: '阻力位' },
      { type: 'stopLoss', price: 113, label: '止损' },
      { type: 'target', price: 95, label: '目标' }
    ],
    tips: ['阻力位是价格多次受阻的水平', '在阻力位附近出现看跌K线形态更有效', '止损设在阻力位上方']
  },

  // 支撑突破
  support_break: {
    id: 'support_break',
    name: '支撑突破',
    category: 'support_resistance',
    type: 'bearish',
    week: 2,
    description: '价格跌破支撑位，支撑失效，继续下跌',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 91, low: 90, high: 95 },
      { date: 'Day3', open: 90, close: 92, low: 89, high: 93 },
      { date: 'Day4', open: 91, close: 85, low: 84, high: 92 },
      { date: 'Day5', open: 84, close: 80, low: 79, high: 85 }
    ],
    highlights: [3],
    annotations: [
      { type: 'support', price: 89, label: '支撑位' },
      { type: 'text', index: 3, price: 82, label: '突破' },
      { type: 'stopLoss', price: 93, label: '止损' },
      { type: 'target', price: 72, label: '目标' }
    ],
    tips: ['有效突破需要收盘价跌破支撑位', '突破时成交量放大更有效', '突破后支撑变阻力']
  },

  // 阻力突破
  resistance_break: {
    id: 'resistance_break',
    name: '阻力突破',
    category: 'support_resistance',
    type: 'bullish',
    week: 2,
    description: '价格突破阻力位，阻力失效，继续上涨',
    data: [
      { date: 'Day1', open: 95, close: 100, low: 94, high: 101 },
      { date: 'Day2', open: 101, close: 104, low: 100, high: 105 },
      { date: 'Day3', open: 105, close: 103, low: 102, high: 107 },
      { date: 'Day4', open: 104, close: 110, low: 103, high: 111 },
      { date: 'Day5', open: 111, close: 115, low: 110, high: 116 }
    ],
    highlights: [3],
    annotations: [
      { type: 'resistance', price: 107, label: '阻力位' },
      { type: 'text', index: 3, price: 112, label: '突破' },
      { type: 'entry', index: 4, price: 111, label: '入场' },
      { type: 'stopLoss', price: 102, label: '止损' },
      { type: 'target', price: 125, label: '目标' }
    ],
    tips: ['有效突破需要收盘价突破阻力位', '突破时成交量放大更有效', '突破后阻力变支撑']
  },

  // 支撑变阻力
  support_to_resistance: {
    id: 'support_to_resistance',
    name: '支撑变阻力',
    category: 'support_resistance',
    type: 'bearish',
    week: 2,
    description: '支撑位被跌破后，反弹到该位置受阻，角色转换',
    data: [
      { date: 'Day1', open: 95, close: 91, low: 90, high: 96 },
      { date: 'Day2', open: 90, close: 85, low: 84, high: 91 },
      { date: 'Day3', open: 84, close: 88, low: 83, high: 89 },
      { date: 'Day4', open: 89, close: 88, low: 87, high: 91 },
      { date: 'Day5', open: 87, close: 82, low: 81, high: 88 }
    ],
    highlights: [3],
    annotations: [
      { type: 'resistance', price: 90, label: '原支撑变阻力' },
      { type: 'text', index: 3, price: 93, label: '受阻' },
      { type: 'stopLoss', price: 92, label: '止损' },
      { type: 'target', price: 75, label: '目标' }
    ],
    tips: ['支撑位被跌破后角色转换', '反弹到原支撑位受阻是做空机会', '这是经典的角色转换交易']
  },

  // ========== 第3周：均线系统形态 ==========

  // 均线金叉
  ma_golden_cross: {
    id: 'ma_golden_cross',
    name: '均线金叉',
    category: 'ma',
    type: 'bullish',
    week: 3,
    description: '短期均线上穿长期均线，买入信号',
    data: [
      { date: 'D1', open: 100, close: 98, low: 97, high: 101, volume: 800 },
      { date: 'D2', open: 97, close: 95, low: 94, high: 98, volume: 750 },
      { date: 'D3', open: 94, close: 92, low: 91, high: 95, volume: 700 },
      { date: 'D4', open: 91, close: 89, low: 88, high: 92, volume: 650 },
      { date: 'D5', open: 88, close: 87, low: 86, high: 89, volume: 600 },
      { date: 'D6', open: 86, close: 88, low: 85, high: 89, volume: 700 },
      { date: 'D7', open: 89, close: 91, low: 88, high: 92, volume: 850 },
      { date: 'D8', open: 92, close: 95, low: 91, high: 96, volume: 1000 },
      { date: 'D9', open: 96, close: 99, low: 95, high: 100, volume: 1200 },
      { date: 'D10', open: 100, close: 103, low: 99, high: 104, volume: 1400 }
    ],
    highlights: [7, 8],
    indicators: { ma: { ma5: true, ma10: true } },
    showVolume: true,
    annotations: [
      { type: 'text', index: 7, price: 98, label: '金叉' },
      { type: 'entry', index: 8, price: 96, label: '入场' },
      { type: 'stopLoss', price: 84, label: '止损' },
      { type: 'target', price: 115, label: '目标' }
    ],
    tips: ['短期均线（如MA5）上穿长期均线（如MA10）', '金叉出现在低位更有效', '配合成交量放大确认']
  },

  // 均线死叉
  ma_death_cross: {
    id: 'ma_death_cross',
    name: '均线死叉',
    category: 'ma',
    type: 'bearish',
    week: 3,
    description: '短期均线下穿长期均线，卖出信号',
    data: [
      { date: 'D1', open: 90, close: 92, low: 89, high: 93, volume: 800 },
      { date: 'D2', open: 93, close: 95, low: 92, high: 96, volume: 850 },
      { date: 'D3', open: 96, close: 98, low: 95, high: 99, volume: 900 },
      { date: 'D4', open: 99, close: 101, low: 98, high: 102, volume: 950 },
      { date: 'D5', open: 102, close: 103, low: 101, high: 104, volume: 1000 },
      { date: 'D6', open: 104, close: 102, low: 101, high: 105, volume: 1100 },
      { date: 'D7', open: 101, close: 99, low: 98, high: 102, volume: 1200 },
      { date: 'D8', open: 98, close: 95, low: 94, high: 99, volume: 1400 },
      { date: 'D9', open: 94, close: 91, low: 90, high: 95, volume: 1300 },
      { date: 'D10', open: 90, close: 87, low: 86, high: 91, volume: 1100 }
    ],
    highlights: [6, 7],
    indicators: { ma: { ma5: true, ma10: true } },
    showVolume: true,
    annotations: [
      { type: 'text', index: 7, price: 92, label: '死叉' },
      { type: 'stopLoss', price: 106, label: '止损' },
      { type: 'target', price: 80, label: '目标' }
    ],
    tips: ['短期均线（如MA5）下穿长期均线（如MA10）', '死叉出现在高位更有效', '配合成交量放大确认']
  },

  // 均线多头排列
  ma_bullish_alignment: {
    id: 'ma_bullish_alignment',
    name: '均线多头排列',
    category: 'ma',
    type: 'bullish',
    week: 3,
    description: '短期均线在上，长期均线在下，呈发散状态，上涨趋势',
    data: [
      { date: 'D1', open: 85, close: 87, low: 84, high: 88, volume: 600 },
      { date: 'D2', open: 88, close: 90, low: 87, high: 91, volume: 700 },
      { date: 'D3', open: 91, close: 93, low: 90, high: 94, volume: 800 },
      { date: 'D4', open: 94, close: 96, low: 93, high: 97, volume: 900 },
      { date: 'D5', open: 97, close: 99, low: 96, high: 100, volume: 1000 },
      { date: 'D6', open: 100, close: 102, low: 99, high: 103, volume: 1100 },
      { date: 'D7', open: 103, close: 105, low: 102, high: 106, volume: 1200 },
      { date: 'D8', open: 106, close: 108, low: 105, high: 109, volume: 1300 },
      { date: 'D9', open: 109, close: 111, low: 108, high: 112, volume: 1400 },
      { date: 'D10', open: 112, close: 115, low: 111, high: 116, volume: 1500 }
    ],
    highlights: [],
    indicators: { ma: { ma5: true, ma10: true, ma20: true } },
    showVolume: true,
    annotations: [
      { type: 'text', index: 7, price: 112, label: '多头排列' },
      { type: 'entry', index: 5, price: 100, label: '入场' },
      { type: 'stopLoss', price: 90, label: '止损' }
    ],
    tips: ['MA5 > MA10 > MA20', '均线呈发散向上状态', '顺势做多，回调到均线附近加仓']
  },

  // 均线空头排列
  ma_bearish_alignment: {
    id: 'ma_bearish_alignment',
    name: '均线空头排列',
    category: 'ma',
    type: 'bearish',
    week: 3,
    description: '短期均线在下，长期均线在上，呈发散状态，下跌趋势',
    data: [
      { date: 'D1', open: 115, close: 113, low: 112, high: 116, volume: 600 },
      { date: 'D2', open: 112, close: 110, low: 109, high: 113, volume: 700 },
      { date: 'D3', open: 109, close: 107, low: 106, high: 110, volume: 800 },
      { date: 'D4', open: 106, close: 104, low: 103, high: 107, volume: 900 },
      { date: 'D5', open: 103, close: 101, low: 100, high: 104, volume: 1000 },
      { date: 'D6', open: 100, close: 98, low: 97, high: 101, volume: 1100 },
      { date: 'D7', open: 97, close: 95, low: 94, high: 98, volume: 1200 },
      { date: 'D8', open: 94, close: 92, low: 91, high: 95, volume: 1300 },
      { date: 'D9', open: 91, close: 89, low: 88, high: 92, volume: 1400 },
      { date: 'D10', open: 88, close: 85, low: 84, high: 89, volume: 1500 }
    ],
    highlights: [],
    indicators: { ma: { ma5: true, ma10: true, ma20: true } },
    showVolume: true,
    annotations: [
      { type: 'text', index: 7, price: 88, label: '空头排列' },
      { type: 'stopLoss', price: 118, label: '止损' }
    ],
    tips: ['MA5 < MA10 < MA20', '均线呈发散向下状态', '顺势做空，反弹到均线附近加仓']
  },

  // 均线支撑
  ma_support: {
    id: 'ma_support',
    name: '均线支撑',
    category: 'ma',
    type: 'bullish',
    week: 3,
    description: '价格回踩均线获得支撑，继续上涨',
    data: [
      { date: 'D1', open: 90, close: 93, low: 89, high: 94, volume: 800 },
      { date: 'D2', open: 94, close: 97, low: 93, high: 98, volume: 900 },
      { date: 'D3', open: 98, close: 101, low: 97, high: 102, volume: 1000 },
      { date: 'D4', open: 102, close: 105, low: 101, high: 106, volume: 1100 },
      { date: 'D5', open: 106, close: 108, low: 105, high: 109, volume: 1200 },
      { date: 'D6', open: 107, close: 104, low: 103, high: 108, volume: 800 },
      { date: 'D7', open: 103, close: 100, low: 99, high: 104, volume: 700 },
      { date: 'D8', open: 99, close: 98, low: 96, high: 100, volume: 600 },
      { date: 'D9', open: 99, close: 103, low: 98, high: 104, volume: 1000 },
      { date: 'D10', open: 104, close: 108, low: 103, high: 109, volume: 1300 }
    ],
    highlights: [7, 8],
    indicators: { ma: { ma5: true, ma10: true } },
    showVolume: true,
    annotations: [
      { type: 'text', index: 7, price: 94, label: '回踩MA10' },
      { type: 'entry', index: 8, price: 99, label: '入场' },
      { type: 'stopLoss', price: 94, label: '止损' },
      { type: 'target', price: 118, label: '目标' }
    ],
    tips: ['上涨趋势中价格回踩均线', '在均线附近出现看涨K线形态', '止损设在均线下方']
  },

  // ========== 第4周：MACD指标形态 ==========

  // MACD金叉
  macd_golden_cross: {
    id: 'macd_golden_cross',
    name: 'MACD金叉',
    category: 'macd',
    type: 'bullish',
    week: 4,
    description: 'MACD线上穿信号线，买入信号',
    data: [
      { date: 'Day1', open: 95, close: 92, low: 91, high: 96 },
      { date: 'Day2', open: 91, close: 88, low: 87, high: 92 },
      { date: 'Day3', open: 87, close: 85, low: 84, high: 88 },
      { date: 'Day4', open: 84, close: 88, low: 83, high: 89 },
      { date: 'Day5', open: 89, close: 94, low: 88, high: 95 }
    ],
    highlights: [3, 4],
    annotations: [
      { type: 'text', index: 4, price: 97, label: 'MACD金叉' },
      { type: 'entry', index: 4, price: 89, label: '入场' },
      { type: 'stopLoss', price: 82, label: '止损' },
      { type: 'target', price: 105, label: '目标' }
    ],
    tips: ['DIF线上穿DEA线形成金叉', '零轴下方金叉是底部信号', '配合K线形态确认']
  },

  // MACD死叉
  macd_death_cross: {
    id: 'macd_death_cross',
    name: 'MACD死叉',
    category: 'macd',
    type: 'bearish',
    week: 4,
    description: 'MACD线下穿信号线，卖出信号',
    data: [
      { date: 'Day1', open: 100, close: 103, low: 99, high: 104 },
      { date: 'Day2', open: 104, close: 107, low: 103, high: 108 },
      { date: 'Day3', open: 108, close: 110, low: 107, high: 111 },
      { date: 'Day4', open: 111, close: 107, low: 106, high: 112 },
      { date: 'Day5', open: 106, close: 101, low: 100, high: 107 }
    ],
    highlights: [3, 4],
    annotations: [
      { type: 'text', index: 4, price: 98, label: 'MACD死叉' },
      { type: 'stopLoss', price: 113, label: '止损' },
      { type: 'target', price: 90, label: '目标' }
    ],
    tips: ['DIF线下穿DEA线形成死叉', '零轴上方死叉是顶部信号', '配合K线形态确认']
  },

  // MACD顶背离
  macd_top_divergence: {
    id: 'macd_top_divergence',
    name: 'MACD顶背离',
    category: 'macd',
    type: 'bearish',
    week: 4,
    description: '价格创新高，但MACD未创新高，见顶信号',
    data: [
      { date: 'Day1', open: 95, close: 100, low: 94, high: 101 },
      { date: 'Day2', open: 101, close: 105, low: 100, high: 106 },
      { date: 'Day3', open: 104, close: 100, low: 99, high: 105 },
      { date: 'Day4', open: 101, close: 107, low: 100, high: 108 },
      { date: 'Day5', open: 106, close: 102, low: 101, high: 107 }
    ],
    highlights: [1, 3],
    annotations: [
      { type: 'text', index: 1, price: 108, label: '高点1' },
      { type: 'text', index: 3, price: 110, label: '高点2(更高)' },
      { type: 'text', index: 4, price: 99, label: 'MACD背离' },
      { type: 'stopLoss', price: 109, label: '止损' },
      { type: 'target', price: 92, label: '目标' }
    ],
    tips: ['价格创新高，MACD未创新高', '是趋势即将反转的信号', '需要等待K线确认后入场']
  },

  // MACD底背离
  macd_bottom_divergence: {
    id: 'macd_bottom_divergence',
    name: 'MACD底背离',
    category: 'macd',
    type: 'bullish',
    week: 4,
    description: '价格创新低，但MACD未创新低，见底信号',
    data: [
      { date: 'Day1', open: 105, close: 100, low: 99, high: 106 },
      { date: 'Day2', open: 99, close: 95, low: 94, high: 100 },
      { date: 'Day3', open: 96, close: 100, low: 95, high: 101 },
      { date: 'Day4', open: 99, close: 93, low: 92, high: 100 },
      { date: 'Day5', open: 94, close: 98, low: 93, high: 99 }
    ],
    highlights: [1, 3],
    annotations: [
      { type: 'text', index: 1, price: 92, label: '低点1' },
      { type: 'text', index: 3, price: 90, label: '低点2(更低)' },
      { type: 'text', index: 4, price: 101, label: 'MACD背离' },
      { type: 'entry', index: 4, price: 94, label: '入场' },
      { type: 'stopLoss', price: 91, label: '止损' },
      { type: 'target', price: 108, label: '目标' }
    ],
    tips: ['价格创新低，MACD未创新低', '是趋势即将反转的信号', '需要等待K线确认后入场']
  },

  // 零轴上方金叉
  macd_above_zero_cross: {
    id: 'macd_above_zero_cross',
    name: '零轴上方金叉',
    category: 'macd',
    type: 'bullish',
    week: 4,
    description: 'MACD在零轴上方形成金叉，强势买入信号',
    data: [
      { date: 'Day1', open: 100, close: 105, low: 99, high: 106 },
      { date: 'Day2', open: 106, close: 110, low: 105, high: 111 },
      { date: 'Day3', open: 109, close: 106, low: 105, high: 110 },
      { date: 'Day4', open: 105, close: 103, low: 102, high: 106 },
      { date: 'Day5', open: 104, close: 110, low: 103, high: 111 }
    ],
    highlights: [4],
    annotations: [
      { type: 'text', index: 4, price: 113, label: '零轴上金叉' },
      { type: 'entry', index: 4, price: 104, label: '入场' },
      { type: 'stopLoss', price: 101, label: '止损' },
      { type: 'target', price: 120, label: '目标' }
    ],
    tips: ['MACD在零轴上方运行表示多头趋势', '零轴上方金叉是强势买入信号', '适合趋势跟踪策略']
  },

  // ========== 第5周：RSI与布林带形态 ==========

  // RSI超买
  rsi_overbought: {
    id: 'rsi_overbought',
    name: 'RSI超买',
    category: 'rsi',
    type: 'bearish',
    week: 5,
    description: 'RSI超过70，市场超买，可能回调',
    data: [
      { date: 'Day1', open: 95, close: 100, low: 94, high: 101 },
      { date: 'Day2', open: 101, close: 106, low: 100, high: 107 },
      { date: 'Day3', open: 107, close: 112, low: 106, high: 113 },
      { date: 'Day4', open: 113, close: 117, low: 112, high: 118 },
      { date: 'Day5', open: 116, close: 112, low: 111, high: 117 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 120, label: 'RSI>70超买' },
      { type: 'stopLoss', price: 119, label: '止损' },
      { type: 'target', price: 105, label: '目标' }
    ],
    tips: ['RSI超过70表示超买', '超买不等于立即下跌', '需要配合K线形态确认']
  },

  // RSI超卖
  rsi_oversold: {
    id: 'rsi_oversold',
    name: 'RSI超卖',
    category: 'rsi',
    type: 'bullish',
    week: 5,
    description: 'RSI低于30，市场超卖，可能反弹',
    data: [
      { date: 'Day1', open: 105, close: 100, low: 99, high: 106 },
      { date: 'Day2', open: 99, close: 94, low: 93, high: 100 },
      { date: 'Day3', open: 93, close: 88, low: 87, high: 94 },
      { date: 'Day4', open: 87, close: 83, low: 82, high: 88 },
      { date: 'Day5', open: 84, close: 88, low: 83, high: 89 }
    ],
    highlights: [3],
    annotations: [
      { type: 'text', index: 3, price: 80, label: 'RSI<30超卖' },
      { type: 'entry', index: 4, price: 84, label: '入场' },
      { type: 'stopLoss', price: 81, label: '止损' },
      { type: 'target', price: 95, label: '目标' }
    ],
    tips: ['RSI低于30表示超卖', '超卖不等于立即上涨', '需要配合K线形态确认']
  },

  // RSI背离
  rsi_divergence: {
    id: 'rsi_divergence',
    name: 'RSI背离',
    category: 'rsi',
    type: 'bullish',
    week: 5,
    description: '价格创新低，RSI未创新低，底背离信号',
    data: [
      { date: 'Day1', open: 100, close: 95, low: 94, high: 101 },
      { date: 'Day2', open: 94, close: 90, low: 89, high: 95 },
      { date: 'Day3', open: 91, close: 95, low: 90, high: 96 },
      { date: 'Day4', open: 94, close: 88, low: 87, high: 95 },
      { date: 'Day5', open: 89, close: 94, low: 88, high: 95 }
    ],
    highlights: [1, 3],
    annotations: [
      { type: 'text', index: 1, price: 87, label: '低点1' },
      { type: 'text', index: 3, price: 85, label: '低点2' },
      { type: 'text', index: 4, price: 97, label: 'RSI背离' },
      { type: 'entry', index: 4, price: 89, label: '入场' },
      { type: 'stopLoss', price: 86, label: '止损' }
    ],
    tips: ['价格创新低，RSI未创新低', '是趋势反转的重要信号', '配合K线形态确认入场']
  },

  // 布林带收口
  bollinger_squeeze: {
    id: 'bollinger_squeeze',
    name: '布林带收口',
    category: 'bollinger',
    type: 'neutral',
    week: 5,
    description: '布林带收窄，波动率降低，即将突破',
    data: [
      { date: 'D1', open: 95, close: 97, low: 94, high: 98, volume: 1000 },
      { date: 'D2', open: 98, close: 100, low: 97, high: 101, volume: 1100 },
      { date: 'D3', open: 101, close: 103, low: 100, high: 104, volume: 1200 },
      { date: 'D4', open: 104, close: 102, low: 101, high: 105, volume: 900 },
      { date: 'D5', open: 101, close: 100, low: 99, high: 102, volume: 800 },
      { date: 'D6', open: 99, close: 100, low: 98, high: 101, volume: 700 },
      { date: 'D7', open: 100, close: 101, low: 99, high: 102, volume: 650 },
      { date: 'D8', open: 101, close: 100, low: 99, high: 102, volume: 600 },
      { date: 'D9', open: 100, close: 101, low: 99, high: 102, volume: 550 },
      { date: 'D10', open: 101, close: 100, low: 99, high: 102, volume: 500 },
      { date: 'D11', open: 100, close: 101, low: 99, high: 102, volume: 480 },
      { date: 'D12', open: 101, close: 100, low: 99, high: 102, volume: 450 }
    ],
    highlights: [9, 10, 11],
    indicators: { bollinger: { period: 10, multiplier: 2 } },
    showVolume: true,
    annotations: [
      { type: 'text', index: 10, price: 104, label: '收口' }
    ],
    tips: ['布林带收窄表示波动率降低', '收口后通常会有大幅突破', '关注突破方向决定交易方向']
  },

  // 布林带突破
  bollinger_breakout: {
    id: 'bollinger_breakout',
    name: '布林带突破',
    category: 'bollinger',
    type: 'bullish',
    week: 5,
    description: '价格突破布林带上轨，趋势启动',
    data: [
      { date: 'D1', open: 95, close: 97, low: 94, high: 98, volume: 800 },
      { date: 'D2', open: 98, close: 100, low: 97, high: 101, volume: 850 },
      { date: 'D3', open: 101, close: 99, low: 98, high: 102, volume: 750 },
      { date: 'D4', open: 98, close: 100, low: 97, high: 101, volume: 700 },
      { date: 'D5', open: 100, close: 101, low: 99, high: 102, volume: 650 },
      { date: 'D6', open: 101, close: 100, low: 99, high: 102, volume: 600 },
      { date: 'D7', open: 100, close: 101, low: 99, high: 102, volume: 580 },
      { date: 'D8', open: 101, close: 100, low: 99, high: 102, volume: 550 },
      { date: 'D9', open: 100, close: 102, low: 99, high: 103, volume: 900 },
      { date: 'D10', open: 103, close: 107, low: 102, high: 108, volume: 1500 },
      { date: 'D11', open: 108, close: 112, low: 107, high: 113, volume: 1800 },
      { date: 'D12', open: 113, close: 116, low: 112, high: 117, volume: 2000 }
    ],
    highlights: [9, 10, 11],
    indicators: { bollinger: { period: 10, multiplier: 2 } },
    showVolume: true,
    annotations: [
      { type: 'text', index: 9, price: 110, label: '突破上轨' },
      { type: 'entry', index: 10, price: 108, label: '入场' },
      { type: 'stopLoss', price: 98, label: '止损' }
    ],
    tips: ['价格突破布林带上轨', '配合成交量放大更有效', '止损设在中轨附近']
  },

  // ========== 第6周：成交量形态 ==========

  // 放量突破
  volume_breakout: {
    id: 'volume_breakout',
    name: '放量突破',
    category: 'volume',
    type: 'bullish',
    week: 6,
    description: '价格突破关键位置时成交量放大，有效突破',
    data: [
      { date: 'D1', open: 95, close: 97, low: 94, high: 98, volume: 600 },
      { date: 'D2', open: 98, close: 100, low: 97, high: 101, volume: 700 },
      { date: 'D3', open: 100, close: 99, low: 98, high: 101, volume: 500 },
      { date: 'D4', open: 98, close: 100, low: 97, high: 101, volume: 550 },
      { date: 'D5', open: 100, close: 101, low: 99, high: 102, volume: 600 },
      { date: 'D6', open: 101, close: 100, low: 99, high: 102, volume: 500 },
      { date: 'D7', open: 100, close: 101, low: 99, high: 102, volume: 550 },
      { date: 'D8', open: 102, close: 107, low: 101, high: 108, volume: 1800 },
      { date: 'D9', open: 108, close: 112, low: 107, high: 113, volume: 2200 },
      { date: 'D10', open: 113, close: 117, low: 112, high: 118, volume: 2500 }
    ],
    highlights: [7, 8],
    showVolume: true,
    annotations: [
      { type: 'resistance', price: 102, label: '阻力位' },
      { type: 'text', index: 7, price: 110, label: '放量突破' },
      { type: 'entry', index: 8, price: 108, label: '入场' },
      { type: 'stopLoss', price: 100, label: '止损' },
      { type: 'target', price: 125, label: '目标' }
    ],
    tips: ['突破时成交量明显放大', '成交量是突破有效性的确认', '无量突破容易失败']
  },

  // 缩量回调
  volume_pullback: {
    id: 'volume_pullback',
    name: '缩量回调',
    category: 'volume',
    type: 'bullish',
    week: 6,
    description: '上涨趋势中回调时成交量萎缩，健康回调',
    data: [
      { date: 'D1', open: 90, close: 93, low: 89, high: 94, volume: 800 },
      { date: 'D2', open: 94, close: 98, low: 93, high: 99, volume: 1200 },
      { date: 'D3', open: 99, close: 103, low: 98, high: 104, volume: 1500 },
      { date: 'D4', open: 104, close: 108, low: 103, high: 109, volume: 1800 },
      { date: 'D5', open: 107, close: 105, low: 104, high: 108, volume: 600 },
      { date: 'D6', open: 104, close: 102, low: 101, high: 105, volume: 500 },
      { date: 'D7', open: 101, close: 100, low: 99, high: 102, volume: 400 },
      { date: 'D8', open: 101, close: 105, low: 100, high: 106, volume: 1000 },
      { date: 'D9', open: 106, close: 110, low: 105, high: 111, volume: 1600 },
      { date: 'D10', open: 111, close: 115, low: 110, high: 116, volume: 2000 }
    ],
    highlights: [5, 6],
    showVolume: true,
    annotations: [
      { type: 'text', index: 6, price: 97, label: '缩量回调' },
      { type: 'entry', index: 7, price: 101, label: '入场' },
      { type: 'stopLoss', price: 98, label: '止损' },
      { type: 'target', price: 120, label: '目标' }
    ],
    tips: ['上涨时放量，回调时缩量', '缩量回调是健康的调整', '回调结束后继续上涨']
  },

  // 天量见顶
  volume_climax_top: {
    id: 'volume_climax_top',
    name: '天量见顶',
    category: 'volume',
    type: 'bearish',
    week: 6,
    description: '上涨末端出现巨量，可能见顶',
    data: [
      { date: 'D1', open: 90, close: 93, low: 89, high: 94, volume: 800 },
      { date: 'D2', open: 94, close: 98, low: 93, high: 99, volume: 1000 },
      { date: 'D3', open: 99, close: 103, low: 98, high: 104, volume: 1200 },
      { date: 'D4', open: 104, close: 109, low: 103, high: 110, volume: 1500 },
      { date: 'D5', open: 110, close: 115, low: 109, high: 116, volume: 1800 },
      { date: 'D6', open: 116, close: 122, low: 115, high: 123, volume: 2200 },
      { date: 'D7', open: 123, close: 118, low: 116, high: 128, volume: 4000 },
      { date: 'D8', open: 117, close: 112, low: 111, high: 118, volume: 2500 },
      { date: 'D9', open: 111, close: 106, low: 105, high: 112, volume: 2000 },
      { date: 'D10', open: 105, close: 100, low: 99, high: 106, volume: 1800 }
    ],
    highlights: [6],
    showVolume: true,
    annotations: [
      { type: 'text', index: 6, price: 130, label: '天量' },
      { type: 'stopLoss', price: 129, label: '止损' },
      { type: 'target', price: 95, label: '目标' }
    ],
    tips: ['上涨末端出现异常放量', '天量往往伴随长上影线', '是主力出货的信号']
  },

  // 地量见底
  volume_climax_bottom: {
    id: 'volume_climax_bottom',
    name: '地量见底',
    category: 'volume',
    type: 'bullish',
    week: 6,
    description: '下跌末端成交量极度萎缩，可能见底',
    data: [
      { date: 'D1', open: 115, close: 112, low: 111, high: 116, volume: 1500 },
      { date: 'D2', open: 111, close: 107, low: 106, high: 112, volume: 1400 },
      { date: 'D3', open: 106, close: 102, low: 101, high: 107, volume: 1200 },
      { date: 'D4', open: 101, close: 97, low: 96, high: 102, volume: 1000 },
      { date: 'D5', open: 96, close: 93, low: 92, high: 97, volume: 800 },
      { date: 'D6', open: 92, close: 90, low: 89, high: 93, volume: 500 },
      { date: 'D7', open: 89, close: 88, low: 87, high: 90, volume: 300 },
      { date: 'D8', open: 88, close: 87, low: 86, high: 89, volume: 200 },
      { date: 'D9', open: 88, close: 91, low: 87, high: 92, volume: 600 },
      { date: 'D10', open: 92, close: 96, low: 91, high: 97, volume: 1000 }
    ],
    highlights: [7],
    showVolume: true,
    annotations: [
      { type: 'text', index: 7, price: 84, label: '地量' },
      { type: 'entry', index: 8, price: 88, label: '入场' },
      { type: 'stopLoss', price: 85, label: '止损' },
      { type: 'target', price: 105, label: '目标' }
    ],
    tips: ['下跌末端成交量极度萎缩', '地量表示卖压枯竭', '配合看涨K线形态确认']
  }
}

// 按周分组的形态列表
export const patternsByWeek = {
  1: ['bullish_candle', 'bearish_candle', 'hammer', 'inverted_hammer', 'hanging_man', 'shooting_star', 'doji', 'dragonfly_doji', 'gravestone_doji', 'bullish_engulfing', 'bearish_engulfing', 'dark_cloud_cover', 'piercing_pattern', 'morning_star', 'evening_star', 'three_black_crows', 'three_white_soldiers'],
  2: ['support_bounce', 'resistance_rejection', 'support_break', 'resistance_break', 'support_to_resistance'],
  3: ['ma_golden_cross', 'ma_death_cross', 'ma_bullish_alignment', 'ma_bearish_alignment', 'ma_support'],
  4: ['macd_golden_cross', 'macd_death_cross', 'macd_top_divergence', 'macd_bottom_divergence', 'macd_above_zero_cross'],
  5: ['rsi_overbought', 'rsi_oversold', 'rsi_divergence', 'bollinger_squeeze', 'bollinger_breakout'],
  6: ['volume_breakout', 'volume_pullback', 'volume_climax_top', 'volume_climax_bottom']
}

// 按类型分组
export const patternsByType = {
  bullish: Object.keys(patterns).filter(k => patterns[k].type === 'bullish'),
  bearish: Object.keys(patterns).filter(k => patterns[k].type === 'bearish'),
  neutral: Object.keys(patterns).filter(k => patterns[k].type === 'neutral')
}

// 获取所有形态列表
export const getAllPatterns = () => Object.values(patterns)

// 获取形态详情
export const getPattern = (id) => patterns[id]
