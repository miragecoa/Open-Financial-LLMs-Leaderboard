export const MODEL_OPENNESS = {
    "GPT-4o": "Unclassified",
    "o3-Mini": "Unclassified",
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
    "TheFinAI/FinMA-ES-Bilingual": "Class III-Open Model",
    "TheFinAI/plutus-8B-instruct": "Class III-Open Model",
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
