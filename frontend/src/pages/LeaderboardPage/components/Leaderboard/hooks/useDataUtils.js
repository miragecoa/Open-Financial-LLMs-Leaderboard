import { useMemo } from "react";
import {
  looksLikeRegex,
  parseSearchQuery,
  getValueByPath,
} from "../utils/searchUtils";
import { ALLOWED_MODELS, isModelAllowed } from "../constants/allowedModels";

// 硬编码数据集
const HARDCODED_SCORES = {
  // BloombergGPT Dataset Leaderboard 平均分
  bloomberggpt: {
    "GPT-4o": 83.25, "GPT-5": 81.92, "o3-mini": 81.24, "o3": 81.28,
    "Gemini 3.1 Flash": 80.88, "Grok4": 79.33, "Claude 4 Sonnet": 79.50,
    "Llama-3.1-8B-Instruct": 77.75, "meta-llama/Llama-3.1-70B-Instruct": 77.75,
    "DeepSeek Chat": 77.13, "Deepseek-V3": 77.13
  }
};

// Calculate min/max averages
export const useAverageRange = (data) => {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return {
        minAverage: 0,
        maxAverage: 100,
      };
    }
    const averages = data.map((item) => item.model.average_score);
    return {
      minAverage: Math.min(...averages),
      maxAverage: Math.max(...averages),
    };
  }, [data]);
};

// Generate colors for scores
export const useColorGenerator = (minAverage, maxAverage) => {
  return useMemo(() => {
    const colorCache = new Map();
    return (value) => {
      const cached = colorCache.get(value);
      if (cached) return cached;

      const normalizedValue = (value - minAverage) / (maxAverage - minAverage);
      const red = Math.round(255 * (1 - normalizedValue) * 1);
      const green = Math.round(255 * normalizedValue) * 1;
      // const color = `rgba(${red}, ${green}, 0, 1)`;
      const color = `rgba(${red}, 0, ${green}, 1)`;
      colorCache.set(value, color);
      return color;
    };
  }, [minAverage, maxAverage]);
};

// Openness data from BloombergGPT Dataset Leaderboard
const MODEL_OPENNESS = {
  // BloombergGPT Dataset models - 按 MOF 标准分类
  // Closed: 闭源商业模型
  "GPT-4o": "Closed",
  "GPT-5": "Closed",
  "o3-mini": "Closed",
  "o3": "Closed",
  "Gemini 3.1 Flash": "Closed",
  "Grok4": "Closed",
  "Claude 4 Sonnet": "Closed",
  // Class III – Open Model: 开放模型架构、参数、技术报告、评估结果等
  "Llama-3.1-8B-Instruct": "Class III-Open Model",
  "DeepSeek Chat": "Class III-Open Model",
  "Deepseek-V3": "Class III-Open Model", // Map Deepseek-V3 to DeepSeek Chat's classification
  "Llama-3.1-70B-Instruct": "Class III-Open Model",
  "meta-llama/Llama-3.1-70B-Instruct": "Class III-Open Model",
};

const getModelOpenness = (modelName) => {
  return MODEL_OPENNESS[modelName] || "Unclassified";
};

// Process data with boolean standardization
export const useProcessedData = (data, averageMode, visibleColumns, externalScores = {}) => {
  return useMemo(() => {
    // 直接使用硬编码数据创建模型列表
    const modelList = [];

    // 从HARDCODED_SCORES中获取所有模型名称
    const modelNames = new Set();
    Object.values(HARDCODED_SCORES).forEach(categoryData => {
      Object.entries(categoryData).forEach(([modelName, score]) => {
        // 添加所有模型，不管分数是否为0
        modelNames.add(modelName);
      });
    });

    // 为每个模型创建条目
    Array.from(modelNames).forEach((modelName, index) => {
      // 创建硬编码评估数据
      const hardcodedEvaluations = {
        bloomberggpt: getHardcodedScore(modelName, 'bloomberggpt'),
        ie: externalScores.ie?.[modelName] ?? null,
        ta: null,
        qa: null,
        tg: null,
        rm: null,
        fo: null,
        dm: null,
        simple_questions: null,
        legal_consultation: null,
        financial_document: null,
        regulatory_compliance: null,
        xbrl_analytics: null,
      };

      const averageScore = hardcodedEvaluations.bloomberggpt || 0;

      // 获取Openness
      const openness = getModelOpenness(modelName);

      // 创建模型数据
      modelList.push({
        id: `model-${index}`,
        model: {
          name: modelName,
          average_score: averageScore,
          type: "chat", // 统一设为chat类型
          openness: openness, // 添加 openness
        },
        evaluations: hardcodedEvaluations,
        features: {
          is_moe: false,
          is_flagged: false,
          is_highlighted_by_maintainer: false,
          is_merged: false,
          is_not_available_on_hub: false,
        },
        metadata: {
          submission_date: new Date().toISOString(),
        },
        isMissing: false,
      });
    });

    // 根据平均分排序
    modelList.sort((a, b) => {
      if (a.model.average_score === null && b.model.average_score === null)
        return 0;
      if (a.model.average_score === null) return 1;
      if (b.model.average_score === null) return -1;
      return b.model.average_score - a.model.average_score;
    });

    // 添加排名
    return modelList.map((item, index) => ({
      ...item,
      static_rank: index + 1,
    }));
  }, [data, averageMode, visibleColumns, externalScores]);
};

// 辅助函数：从硬编码数据中获取分数
function getHardcodedScore(modelName, category) {
  if (!HARDCODED_SCORES[category]) return null;

  // 尝试精确匹配
  if (HARDCODED_SCORES[category][modelName] !== undefined) {
    return HARDCODED_SCORES[category][modelName];
  }

  // 尝试部分匹配
  for (const key in HARDCODED_SCORES[category]) {
    if (modelName.includes(key) || key.includes(modelName)) {
      return HARDCODED_SCORES[category][key];
    }
  }

  return null;
}

// Common filtering logic
export const useFilteredData = (
  processedData,
  selectedPrecisions,
  selectedTypes,
  paramsRange,
  searchValue,
  selectedBooleanFilters,
  rankingMode,
  pinnedModels = [],
  isOfficialProviderActive = false
) => {
  return useMemo(() => {
    // 由于使用的是硬编码数据，这里直接返回所有数据而不进行过滤
    return processedData.map((item, index) => ({
      ...item,
      dynamic_rank: index + 1,
      rank: rankingMode === "static" ? item.static_rank : index + 1,
      isPinned: pinnedModels.includes(item.id),
    }));
  }, [
    processedData,
    rankingMode,
    pinnedModels,
  ]);
};

// Column visibility management
export const useColumnVisibility = (visibleColumns = []) => {
  // Create secure visibility object
  const columnVisibility = useMemo(() => {
    // Check visible columns
    const safeVisibleColumns = Array.isArray(visibleColumns)
      ? visibleColumns
      : [];

    const visibility = {};
    try {
      safeVisibleColumns.forEach((columnKey) => {
        if (typeof columnKey === "string") {
          visibility[columnKey] = true;
        }
      });
    } catch (error) {
      console.warn("Error in useColumnVisibility:", error);
    }
    return visibility;
  }, [visibleColumns]);

  return columnVisibility;
};
