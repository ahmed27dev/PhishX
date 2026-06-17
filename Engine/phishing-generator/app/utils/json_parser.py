import json
import re


def parse_llm_json(raw_output: str) -> dict:
    raw_output = raw_output.strip()

    # 1️⃣ Try normal parse
    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        pass

    # 2️⃣ Extract JSON block
    start = raw_output.find("{")
    end = raw_output.rfind("}") + 1

    if start != -1 and end != -1:
        json_block = raw_output[start:end]

        # 🔥 CRITICAL FIX: escape ALL raw newlines inside quotes
        json_block = re.sub(
            r'("body"\s*:\s*")(.*?)(")',
            lambda m: m.group(1) + m.group(2).replace("\n", "\\n") + m.group(3),
            json_block,
            flags=re.DOTALL
        )

        try:
            return json.loads(json_block)
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Invalid JSON returned by LLM: {raw_output}")