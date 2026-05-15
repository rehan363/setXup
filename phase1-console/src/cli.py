"""Command-line interface for Todo App"""

from typing import Optional

from src.services import TaskStore


class CLI:
    PROMPT = "todo> "

    def __init__(self):
        self.store = TaskStore()
        self.running = True

    def run(self):
        print("Todo App - Phase I")
        print("Type 'help' for commands\n")
        while self.running:
            try:
                user_input = input(self.PROMPT).strip()
                if not user_input:
                    continue
                self.handle_command(user_input)
            except KeyboardInterrupt:
                print("\nUse 'exit' to quit")
            except EOFError:
                break
        print("Goodbye!")

    def handle_command(self, user_input: str):
        parts = user_input.split(maxsplit=1)
        cmd = parts[0].lower()
        args = parts[1] if len(parts) > 1 else None

        if cmd == "add":
            self.cmd_add(args)
        elif cmd == "list":
            self.cmd_list()
        elif cmd == "update":
            self.cmd_update(args)
        elif cmd == "delete":
            self.cmd_delete(args)
        elif cmd == "complete":
            self.cmd_complete(args)
        elif cmd == "help":
            self.cmd_help()
        elif cmd == "exit":
            self.running = False
        else:
            print(f"Unknown command: {cmd}. Type 'help' for available commands.")

    def parse_task_id_args(self, args: Optional[str]) -> tuple[Optional[int], Optional[str]]:
        if not args:
            return None, "Usage: <command> <task_id> [args]"
        parts = args.split(maxsplit=1)
        try:
            task_id = int(parts[0])
        except ValueError:
            return None, f"Invalid task ID: {parts[0]}"
        extra = parts[1] if len(parts) > 1 else None
        return task_id, extra

    def cmd_add(self, args: Optional[str]):
        if not args:
            print("Usage: add <title> [description]")
            return
        parts = args.split(maxsplit=1)
        title = parts[0]
        description = parts[1] if len(parts) > 1 else None
        task, error = self.store.add_task(title, description)
        if error:
            print(f"Error: {error}")
            return
        print(f"✅ Success! Created new task -> [ID: {task.id}] Title: {task.title}")

    def cmd_list(self):
        tasks = self.store.list_tasks()
        if not tasks:
            print("No tasks yet. Add one with 'add <title>'")
            return
        print("Your tasks:")
        for task in tasks:
            print(f"  {task}")

    def cmd_update(self, args: Optional[str]):
        task_id, extra = self.parse_task_id_args(args)
        if task_id is None:
            print(extra)
            return
        if extra is None:
            print("Usage: update <id> <title> [description]")
            return
        parts = extra.split(maxsplit=1)
        title = parts[0]
        description = parts[1] if len(parts) > 1 else None
        task, error = self.store.update_task(task_id, title, description)
        if error:
            print(f"Error: {error}")
            return
        print(f"Updated task {task.id}: {task.title}")

    def cmd_delete(self, args: Optional[str]):
        task_id, error = self.parse_task_id_args(args)
        if task_id is None:
            print(error)
            return
        success, error = self.store.delete_task(task_id)
        if error:
            print(f"Error: {error}")
            return
        print(f"Deleted task {task_id}")

    def cmd_complete(self, args: Optional[str]):
        task_id, error = self.parse_task_id_args(args)
        if task_id is None:
            print(error)
            return
        task, error = self.store.toggle_complete(task_id)
        if error:
            print(f"Error: {error}")
            return
        status = "completed" if task.completed else "pending"
        print(f"Task {task.id}: {task.title} [{status}]")

    def cmd_help(self):
        print("Commands:")
        print("  add <title> [desc]     - Add a new task")
        print("  list               - View all tasks")
        print("  update <id> <title> [desc] - Update a task")
        print("  delete <id>        - Delete a task")
        print("  complete <id>      - Toggle completion")
        print("  help               - Show this help")
        print("  exit               - Quit")


def main():
    CLI().run()


if __name__ == "__main__":
    main()