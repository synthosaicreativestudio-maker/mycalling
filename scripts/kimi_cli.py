#!/usr/bin/env python3
"""
Kimi K3 Terminal Assistant CLI
Запуск:
    python3 scripts/kimi_cli.py
    или
    python3 scripts/kimi_cli.py "Ваш вопрос"
"""

import os
import sys
from pathlib import Path

# Загрузка .env.local если переменная не установлена
def load_env_local():
    if os.getenv("MOONSHOT_API_KEY"):
        return
    env_local = Path(__file__).resolve().parent.parent / ".env.local"
    if env_local.exists():
        with open(env_local, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("MOONSHOT_API_KEY="):
                    val = line.split("=", 1)[1].strip("\"'")
                    os.environ["MOONSHOT_API_KEY"] = val
                    break

load_env_local()

api_key = os.getenv("MOONSHOT_API_KEY")
if not api_key:
    print("❌ Ошибка: Переменная MOONSHOT_API_KEY не найдена в окружении или .env.local")
    sys.exit(1)

try:
    from openai import OpenAI
except ImportError:
    print("❌ Ошибка: Пакет openai не установлен. Выполните: pip install openai")
    sys.exit(1)

client = OpenAI(
    api_key=api_key,
    base_url="https://api.moonshot.ai/v1",
)

def ask_kimi(messages, reasoning_effort="max"):
    stream = client.chat.completions.create(
        model="kimi-k3",
        messages=messages,
        reasoning_effort=reasoning_effort,
        stream=True,
    )
    full_response = ""
    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            print(delta.content, end="", flush=True)
            full_response += delta.content
    print("\n")
    return full_response

def main():
    # Одноразовый запрос из аргументов командной строки
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
        print("🤖 Kimi K3: ", end="", flush=True)
        try:
            ask_kimi([{"role": "user", "content": prompt}])
        except Exception as e:
            print(f"\n❌ Ошибка API: {e}")
        return

    # Интерактивный режим
    print("🤖 Kimi K3 CLI запущен. Введите ваш запрос (или 'exit' для выхода).\n")
    messages = []

    while True:
        try:
            user_input = input("\033[1;34mВы:\033[0m ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "выход"]:
                print("👋 До свидания!")
                break

            messages.append({"role": "user", "content": user_input})
            print("\033[1;32mKimi K3:\033[0m ", end="", flush=True)
            
            response = ask_kimi(messages)
            messages.append({"role": "assistant", "content": response})

        except KeyboardInterrupt:
            print("\n👋 Сеанс завершен.")
            break
        except Exception as e:
            print(f"\n❌ Ошибка API: {e}\n")

if __name__ == "__main__":
    main()
