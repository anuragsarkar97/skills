#!/usr/bin/env python3
"""Schedule a local macOS notification with launchd."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import os
import plistlib
import re
import shlex
import subprocess
import sys
from pathlib import Path


def parse_time(value: str, now: dt.datetime | None = None) -> dt.datetime:
    now = now or dt.datetime.now().astimezone()
    text = value.strip().lower()

    relative = re.fullmatch(r"in\s+(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs)", text)
    if relative:
        amount = int(relative.group(1))
        unit = relative.group(2)
        if unit.startswith(("hour", "hr")):
            return now + dt.timedelta(hours=amount)
        return now + dt.timedelta(minutes=amount)

    iso_formats = [
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d %I:%M %p",
        "%Y-%m-%d %I %p",
    ]
    for fmt in iso_formats:
        try:
            parsed = dt.datetime.strptime(text.upper(), fmt)
            return parsed.replace(tzinfo=now.tzinfo)
        except ValueError:
            pass

    day_offset = 0
    if "tomorrow" in text:
        day_offset = 1
        text = text.replace("tomorrow", "").strip()
    elif "today" in text:
        text = text.replace("today", "").strip()
    elif "tonight" in text:
        text = text.replace("tonight", "").strip()

    time_match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", text)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2) or "0")
        meridiem = time_match.group(3)

        if meridiem == "pm" and hour != 12:
            hour += 12
        if meridiem == "am" and hour == 12:
            hour = 0
        if not 0 <= hour <= 23 or not 0 <= minute <= 59:
            raise ValueError(f"Invalid time: {value}")

        scheduled = now.replace(hour=hour, minute=minute, second=0, microsecond=0) + dt.timedelta(days=day_offset)
        if scheduled <= now and day_offset == 0:
            raise ValueError(f"Time is in the past: {value}")
        return scheduled

    raise ValueError(f"Could not parse reminder time: {value}")


def apple_string(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def apple_script(title: str, message: str) -> str:
    return f"display notification {apple_string(message)} with title {apple_string(title)}"


def write_files(reminder_id: str, title: str, message: str, scheduled: dt.datetime) -> tuple[Path, Path]:
    base_dir = Path.home() / ".ai-agent-skills" / "reminders"
    script_dir = base_dir / "scripts"
    launch_dir = Path.home() / "Library" / "LaunchAgents"
    script_dir.mkdir(parents=True, exist_ok=True)
    launch_dir.mkdir(parents=True, exist_ok=True)

    script_path = script_dir / f"{reminder_id}.sh"
    plist_path = launch_dir / f"com.ai-agent-skills.reminder.{reminder_id}.plist"

    script = "\n".join(
        [
            "#!/bin/zsh",
            f"/usr/bin/osascript -e {shlex.quote(apple_script(title, message))}",
            f"/bin/launchctl bootout gui/$(id -u) {shlex.quote(str(plist_path))} >/dev/null 2>&1 || true",
            f"/bin/rm -f {shlex.quote(str(plist_path))}",
            f"/bin/rm -f {shlex.quote(str(script_path))}",
            "",
        ]
    )
    script_path.write_text(script)
    script_path.chmod(0o755)

    plist = {
        "Label": f"com.ai-agent-skills.reminder.{reminder_id}",
        "ProgramArguments": [str(script_path)],
        "StartCalendarInterval": {
            "Year": scheduled.year,
            "Month": scheduled.month,
            "Day": scheduled.day,
            "Hour": scheduled.hour,
            "Minute": scheduled.minute,
        },
        "StandardOutPath": str(base_dir / f"{reminder_id}.out.log"),
        "StandardErrorPath": str(base_dir / f"{reminder_id}.err.log"),
    }
    with plist_path.open("wb") as handle:
        plistlib.dump(plist, handle)

    return script_path, plist_path


def schedule(plist_path: Path) -> None:
    uid = os.getuid()
    result = subprocess.run(
        ["/bin/launchctl", "bootstrap", f"gui/{uid}", str(plist_path)],
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "launchctl bootstrap failed")


def main() -> int:
    parser = argparse.ArgumentParser(description="Schedule a local macOS notification reminder.")
    parser.add_argument("--message", required=True, help="Reminder message")
    parser.add_argument("--when", dest="when_text", required=True, help="Reminder time")
    parser.add_argument("--title", default="Reminder", help="Notification title")
    parser.add_argument("--dry-run", action="store_true", help="Parse and print without scheduling")
    args = parser.parse_args()

    if sys.platform != "darwin":
        print("This reminder scheduler only supports macOS.", file=sys.stderr)
        return 1

    message = args.message.strip()
    if not message:
        print("--message cannot be empty", file=sys.stderr)
        return 1

    try:
        scheduled = parse_time(args.when_text)
    except ValueError as error:
        print(str(error), file=sys.stderr)
        return 1

    digest = hashlib.sha256(f"{message}|{scheduled.isoformat()}".encode("utf-8")).hexdigest()[:12]
    reminder_id = f"{scheduled.strftime('%Y%m%d%H%M')}-{digest}"

    if args.dry_run:
        print(f"Reminder id: {reminder_id}")
        print(f"Message: {message}")
        print(f"When: {scheduled.isoformat()}")
        return 0

    try:
        _, plist_path = write_files(reminder_id, args.title, message, scheduled)
        schedule(plist_path)
    except Exception as error:
        print(f"Failed to schedule reminder: {error}", file=sys.stderr)
        return 1

    print(f"Scheduled reminder {reminder_id}")
    print(f"Message: {message}")
    print(f"When: {scheduled.isoformat()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
