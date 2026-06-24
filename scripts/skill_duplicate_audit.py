#!/usr/bin/env python3
"""Find likely overlapping skills using only the Python standard library."""

import argparse
import difflib
import json
import re
from pathlib import Path


def parse_frontmatter(text, path):
    if not text.startswith("---\n"):
        raise ValueError(f"{path}: missing frontmatter")
    end = text.find("\n---", 4)
    if end == -1:
        raise ValueError(f"{path}: unterminated frontmatter")
    data = {}
    for line in text[4:end].strip().splitlines():
        if not line.strip():
            continue
        key, _, value = line.partition(":")
        data[key.strip()] = value.strip().strip("\"'")
    return data


def tokenize(value):
    return set(re.findall(r"[a-z0-9]+", value.lower()))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", default="skills")
    parser.add_argument("--threshold", type=float, default=0.68)
    parser.add_argument("--fail-threshold", type=float, default=0.9)
    args = parser.parse_args()

    skills = []
    for skill_file in sorted(Path(args.path).glob("*/SKILL.md")):
        text = skill_file.read_text()
        frontmatter = parse_frontmatter(text, skill_file)
        body = re.sub(r"---.*?---", "", text, count=1, flags=re.S)
        words = tokenize(frontmatter.get("description", "") + "\n" + body)
        skills.append(
            {
                "name": frontmatter.get("name", skill_file.parent.name),
                "description": frontmatter.get("description", ""),
                "words": words,
            }
        )

    findings = []
    for left_index, left in enumerate(skills):
        for right in skills[left_index + 1 :]:
            union = left["words"] | right["words"]
            if not union:
                continue
            jaccard = len(left["words"] & right["words"]) / len(union)
            sequence = difflib.SequenceMatcher(
                None, left["description"], right["description"]
            ).ratio()
            score = max(jaccard, sequence)
            if score >= args.threshold:
                findings.append(
                    {
                        "left": left["name"],
                        "right": right["name"],
                        "score": round(score, 3),
                    }
                )

    print(json.dumps({"count": len(findings), "findings": findings}, indent=2))
    if any(finding["score"] >= args.fail_threshold for finding in findings):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
