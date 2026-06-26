"use client";

import { useEffect, useRef } from "react";

interface TelegramLoginWidgetProps {
  botName: string;
  authUrl: string;
}

export default function TelegramLoginWidget({ botName, authUrl }: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Очищаем контейнер, если скрипт уже был добавлен (при StrictMode)
    containerRef.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", authUrl);
    script.setAttribute("data-request-access", "write");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [botName, authUrl]);

  return <div ref={containerRef} className="flex justify-center" />;
}
