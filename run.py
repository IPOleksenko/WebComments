#!/usr/bin/env python3
import os
import subprocess
import sys

def load_env(dotenv_paths=['env/frontend.env', 'env/backend.env']):
    """
    Loads environment variables from multiple .env files.
    """
    for dotenv_path in dotenv_paths:
        try:
            with open(dotenv_path, encoding='utf-8') as f:
                print(f"Loading: {dotenv_path}")
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#') or '=' not in line:
                        continue
                    key, value = line.split('=', 1)
                    os.environ.setdefault(key.strip(), value.strip())
        except FileNotFoundError:
            print(f"File not found: {dotenv_path}")

load_env()

def run_command(command, cwd):
    """Runs a command in a new terminal window and keeps it open on error."""
    is_windows = sys.platform.startswith("win")
    if is_windows:
        return subprocess.Popen(
            ["cmd", "/k", command],
            cwd=cwd,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        terminal = None
        for term in ["gnome-terminal", "konsole", "xfce4-terminal", "lxterminal", "x-terminal-emulator"]:
            if subprocess.call(f"command -v {term}", shell=True,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0:
                terminal = term
                break
        if not terminal:
            raise RuntimeError("No supported terminal emulator found!")

        return subprocess.Popen(
            f"{terminal} -- bash -c '{command}; echo \"Press Enter to exit...\"; read'", 
            cwd=cwd, 
            shell=True
        )

# Directory paths
backend_path = os.path.abspath("backend")
frontend_path = os.path.abspath("frontend")

# Commands
django_cmd  = "pipenv run python manage.py runserver"
npm_cmd     = "pipenv run npm run dev"

def start_processes():

    django_process      = run_command(django_cmd, backend_path)
    npm_process         = run_command(npm_cmd, frontend_path)

    try:
        npm_process.wait()
    except KeyboardInterrupt:
        print("Stopping servers...")
        for p in (django_process, npm_process):
            p.terminate()
        # Wait for processes to exit, force kill if needed
        for p in (django_process, npm_process):
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                p.kill()

if __name__ == "__main__":
    start_processes()
