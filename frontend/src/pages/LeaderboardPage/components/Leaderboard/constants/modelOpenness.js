export const MODEL_OPENNESS = {
    "GPT-4o": "Closed",
    "o3-Mini": "Closed",
    "Deepseek-V3": "Class III-Open Model",
    "meta-llama/Llama-4-Scout-17B-16E-Instruct": "Class III-Open Model",
    "meta-llama/Llama-3.1-70B-Instruct": "Class III-Open Model",
    "google/gemma-3-4b-it": "Class III-Open Model",
    "google/gemma-3-27b-it": "Class III-Open Model",
    "Qwen/Qwen2.5-32B-Instruct": "Class III-Open Model",
    "Qwen/Qwen2.5-Omni-7B": "Class III-Open Model",
    "TheFinAI/finma-7b-full": "Class III-Open Model",
    "Duxiaoman-DI/Llama3.1-XuanYuan-FinX1-Preview": "Class III-Open Model",
    "cyberagent/DeepSeek-R1-Distill-Qwen-32B-Japanese": "Class III-Open Model",
    "Trelis/Trelis-Function-Calling-V3-7B": "Class III-Open Model",
    "Trelis/Trelis-Function-Calling-V4-7B": "Class III-Open Model",
    "TheFinAI/FinMA-ES-Bilingual": "Class III-Open Model",
    "TheFinAI/plutus-8B-instruct": "Class III-Open Model",
    // BloombergGPT Dataset models - 按 MOF 标准分类
    // Closed: 闭源商业模型
    "GPT-5": "Closed",
    "o3": "Closed",
    "Gemini 2.5 Flash": "Closed",
    "Grok4": "Closed",
    "Claude 4 Sonnet": "Closed",
    // Class III – Open Model: 开放模型架构、参数、技术报告、评估结果等
    "Llama-3.1-8B-Instruct": "Class III-Open Model",
    "DeepSeek Chat": "Class III-Open Model",
    "Qwen-VL-MAX": "Class III-Open Model",
    "LLaVA-1.6 Vicuna-13B": "Class III-Open Model",
    "Deepseek-VL-7B-Chat": "Class III-Open Model",
    "Whisper-V3": "Class III-Open Model",
    "Qwen2-Audio-7B": "Class III-Open Model",
    "Qwen2-Audio-7B-Instruct": "Class III-Open Model",
    "SALMONN-7B": "Class III-Open Model",
    "SALMONN-13B": "Class III-Open Model"
};

export const getModelOpenness = (modelName) => {
    return MODEL_OPENNESS[modelName] || "Unclassified";
};
