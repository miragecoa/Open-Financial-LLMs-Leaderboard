from dataclasses import dataclass, make_dataclass
from enum import Enum

import pandas as pd

from src.about import Tasks

def fields(raw_class):
    return [v for k, v in raw_class.__dict__.items() if k[:2] != "__" and k[-2:] != "__"]


# These classes are for user facing column names,
# to avoid having to change them all around the code
# when a modif is needed
@dataclass
class ColumnContent:
    name: str
    type: str
    displayed_by_default: bool
    category: str = ""  # New attribute to hold the category
    hidden: bool = False
    never_hidden: bool = False

## Leaderboard columns
auto_eval_column_dict = []

# Model Information
auto_eval_column_dict.append(["model_type_symbol", ColumnContent, ColumnContent("T", "str", True, category="Model Information", never_hidden=True)])
auto_eval_column_dict.append(["model", ColumnContent, ColumnContent("Model", "markdown", True, category="Model Information", never_hidden=True)])

auto_eval_column_dict.append(["average", ColumnContent, ColumnContent("Average ⬆️", "number", True, category="Model Information")])
auto_eval_column_dict.append(["average_IE", ColumnContent, ColumnContent("Average IE ⬆️", "number", True, category="Information Extraction (IE)")])
auto_eval_column_dict.append(["average_TA", ColumnContent, ColumnContent("Average TA ⬆️", "number", True, category="Textual Analysis (TA)")])
auto_eval_column_dict.append(["average_QA", ColumnContent, ColumnContent("Average QA ⬆️", "number", True, category="Question Answering (QA)")])
auto_eval_column_dict.append(["average_TG", ColumnContent, ColumnContent("Average TG ⬆️", "number", True, category="Text Generation (TG)")])
auto_eval_column_dict.append(["average_RM", ColumnContent, ColumnContent("Average RM ⬆️", "number", True, category="Risk Management (RM)")])
auto_eval_column_dict.append(["average_FO", ColumnContent, ColumnContent("Average FO ⬆️", "number", True, category="Forecasting (FO)")])
auto_eval_column_dict.append(["average_DM", ColumnContent, ColumnContent("Average DM ⬆️", "number", True, category="Decision-Making (DM)")])
auto_eval_column_dict.append(["average_Spanish", ColumnContent, ColumnContent("Average Spanish ⬆️", "number", True, category="Spanish")])

auto_eval_column_dict.append(["model_type", ColumnContent, ColumnContent("Type", "str", False, category="Model Information")])
auto_eval_column_dict.append(["architecture", ColumnContent, ColumnContent("Architecture", "str", False, category="Model Information")])
auto_eval_column_dict.append(["weight_type", ColumnContent, ColumnContent("Weight type", "str", False, category="Model Information", hidden=True)])
auto_eval_column_dict.append(["precision", ColumnContent, ColumnContent("Precision", "str", False, category="Model Information")])
auto_eval_column_dict.append(["license", ColumnContent, ColumnContent("Hub License", "str", False, category="Model Information")])
auto_eval_column_dict.append(["params", ColumnContent, ColumnContent("#Params (B)", "number", False, category="Model Information")])
auto_eval_column_dict.append(["likes", ColumnContent, ColumnContent("Hub ❤️", "number", False, category="Model Information")])
auto_eval_column_dict.append(["still_on_hub", ColumnContent, ColumnContent("Available on the hub", "bool", False, category="Model Information")])
auto_eval_column_dict.append(["revision", ColumnContent, ColumnContent("Model sha", "str", False, category="Model Information", hidden=False)])

for task in Tasks:
    auto_eval_column_dict.append([task.name, ColumnContent, ColumnContent(task.value.col_name, "number", False, category=task.value.category)])

# We use make_dataclass to dynamically fill the scores from Tasks
AutoEvalColumn = make_dataclass("AutoEvalColumn", auto_eval_column_dict, frozen=True)

## For the queue columns in the submission tab
@dataclass(frozen=True)
class EvalQueueColumn:  # Queue column
    model = ColumnContent("model", "markdown", True)
    revision = ColumnContent("revision", "str", True)
    private = ColumnContent("private", "bool", True)
    precision = ColumnContent("precision", "str", True)
    weight_type = ColumnContent("weight_type", "str", "Original")
    status = ColumnContent("status", "str", True)

## All the model information that we might need
@dataclass
class ModelDetails:
    name: str
    display_name: str = ""
    symbol: str = "" # emoji


class ModelType(Enum):
    PT = ModelDetails(name="pretrained", symbol="🟢")
    FT = ModelDetails(name="fine-tuned", symbol="🔶")
    IFT = ModelDetails(name="instruction-tuned", symbol="⭕")
    RL = ModelDetails(name="RL-tuned", symbol="🟦")
    Unknown = ModelDetails(name="", symbol="?")

    def to_str(self, separator=" "):
        return f"{self.value.symbol}{separator}{self.value.name}"

    @staticmethod
    def from_str(type):
        if "fine-tuned" in type or "🔶" in type:
            return ModelType.FT
        if "pretrained" in type or "🟢" in type:
            return ModelType.PT
        if "RL-tuned" in type or "🟦" in type:
            return ModelType.RL
        if "instruction-tuned" in type or "⭕" in type:
            return ModelType.IFT
        return ModelType.Unknown

class WeightType(Enum):
    Adapter = ModelDetails("Adapter")
    Original = ModelDetails("Original")
    Delta = ModelDetails("Delta")

class Precision(Enum):
    float16 = ModelDetails("float16")
    bfloat16 = ModelDetails("bfloat16")
    float32 = ModelDetails("float32")
    #qt_8bit = ModelDetails("8bit")
    #qt_4bit = ModelDetails("4bit")
    #qt_GPTQ = ModelDetails("GPTQ")
    Unknown = ModelDetails("?")

    def from_str(precision):
        if precision in ["torch.float16", "float16"]:
            return Precision.float16
        if precision in ["torch.bfloat16", "bfloat16"]:
            return Precision.bfloat16
        if precision in ["float32"]:
            return Precision.float32
        #if precision in ["8bit"]:
        #    return Precision.qt_8bit
        #if precision in ["4bit"]:
        #    return Precision.qt_4bit
        #if precision in ["GPTQ", "None"]:
        #    return Precision.qt_GPTQ
        return Precision.Unknown

# Column selection
COLS = [c.name for c in fields(AutoEvalColumn) if not c.hidden]
TYPES = [c.type for c in fields(AutoEvalColumn) if not c.hidden]
COLS_LITE = [c.name for c in fields(AutoEvalColumn) if c.displayed_by_default and not c.hidden]
TYPES_LITE = [c.type for c in fields(AutoEvalColumn) if c.displayed_by_default and not c.hidden]

EVAL_COLS = [c.name for c in fields(EvalQueueColumn)]
EVAL_TYPES = [c.type for c in fields(EvalQueueColumn)]

BENCHMARK_COLS = [t.value.col_name for t in Tasks]

NUMERIC_INTERVALS = {
    "?": pd.Interval(-1, 0, closed="right"),
    "~1.5": pd.Interval(0, 2, closed="right"),
    "~3": pd.Interval(2, 4, closed="right"),
    "~7": pd.Interval(4, 9, closed="right"),
    "~13": pd.Interval(9, 20, closed="right"),
    "~35": pd.Interval(20, 45, closed="right"),
    "~60": pd.Interval(45, 70, closed="right"),
    "70+": pd.Interval(70, 10000, closed="right"),
}
