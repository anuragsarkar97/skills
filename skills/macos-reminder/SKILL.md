---
name: macos-reminder
description: Schedule local macOS reminders and notifications from natural-language requests such as /remember, remind me, or notify me later. Use when an AI agent should parse a reminder message, confirm the reminder text and time, and create a local macOS notification using launchd without sending data to external services.
---

# macOS Reminder

Use this skill when the user asks the agent to remember something later on macOS. Typical triggers include `/remember`, "remind me", "notify me", "later today", "tonight", "tomorrow", or a concrete time.

This skill schedules local notifications only. Do not send reminder text to external services. The reminder is stored on the user's Mac under `~/.ai-agent-skills/reminders/` and scheduled with launchd.

## Workflow

1. Extract the reminder text and due time from the user request.
2. If either the message or due time is ambiguous, ask one short clarification before scheduling.
3. Convert relative dates carefully using the user's current local date and timezone.
4. Confirm the exact reminder text and local due time before scheduling when the action is potentially surprising.
5. Run `scripts/remind_macos.py --message <text> --when <time>` to schedule the notification.
6. Report the scheduled local time and the reminder id.

## Time Parsing Guidance

The bundled script supports common phrases:

- `10 pm tonight`
- `tomorrow 9am`
- `in 45 minutes`
- `in 2 hours`
- `2026-06-25 22:00`
- `2026-06-25T22:00`

If the user says `tonight` without a time, ask for the time. If the user gives a time that already passed today, clarify unless the phrase says `tomorrow`.

## Script Usage

Dry-run first when interpreting a new phrase:

```bash
python3 skills/macos-reminder/scripts/remind_macos.py --message "Send email to product manager" --when "10 pm tonight" --dry-run
```

Schedule after confirmation:

```bash
python3 skills/macos-reminder/scripts/remind_macos.py --message "Send email to product manager" --when "10 pm tonight"
```

Use `--title` to customize the notification title.

## Safety Checks

- Do not schedule reminders with empty messages.
- Do not silently schedule a past time.
- Do not schedule sensitive reminder text unless the user explicitly asked; macOS notifications may be visible on screen.
- Do not use network services or external calendars.
- If launchd fails, report the plist path and the command that failed.

## Output

When scheduled, respond with:

- Reminder text.
- Local due time.
- Reminder id.
- A short note that the notification is local to this Mac.
