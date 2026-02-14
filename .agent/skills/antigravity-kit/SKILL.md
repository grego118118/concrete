---
name: Antigravity Kit
description: The core operating procedures and workflows for the Antigravity agent, ensuring high-quality autonomous execution.
---

# Antigravity Kit

## Overview
This kit provides the standard operating procedures for complex coding tasks.

## Agentic Workflow
1.  **Task Boundary**: Always start with `task_boundary` to define the unit of work.
2.  **Planning**: Create an `implementation_plan.md` artifact.
    - Define goals.
    - List files to modify/create/delete.
    - Verification plan.
    - **Request User Review** via `notify_user` before major execution.
3.  **Execution**:
    - Update `task.md` checklist.
    - Execute changes atomically.
    - Maintain existing code aesthetics.
4.  **Verification**:
    - Create `walkthrough.md` with proof of work (screenshots/logs).
    - Run tests or visual verification.

## Artifact Standards
- **Markdown**: Use GFM.
- **Alerts**: Use `> [!NOTE]` etc. for emphasis.
- **Carousels**: Use carousels for sequential data/screenshots.
- **Paths**: Always use absolute paths for file links.

## Communication
- Be proactive but careful.
- Ask clarifying questions if requirements are vague.
- Use "Step-by-step" reasoning.

## Best Practices
- **Safety First**: Don't delete data without confirmation.
- **Tools**: Use `ripgrep` for search, `view_file_outline` for exploring.
- **Errors**: Read errors carefully; don't blindly retry.
