import subprocess
import sys
import os

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Error: {e.stderr.strip()}"

def check_health():
    print("--- UV Health Check ---")
    
    # Check uv installation
    version = run_command("uv --version")
    print(f"UV Version: {version}")
    
    # Check venv
    if os.path.exists(".venv"):
        print("Virtual Environment: FOUND (.venv)")
    else:
        print("Virtual Environment: MISSING")
    
    # Check pyproject.toml
    if os.path.exists("pyproject.toml"):
        print("pyproject.toml: FOUND")
    else:
        print("pyproject.toml: MISSING")
    
    # Check lockfile
    if os.path.exists("uv.lock"):
        print("uv.lock: FOUND")
    else:
        print("uv.lock: MISSING (Run 'uv sync' or 'uv lock')")

if __name__ == "__main__":
    check_health()
