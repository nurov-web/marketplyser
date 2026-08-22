"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type Conv = {
  id: string;
  user: { firstName: string; lastName: string };
  seller: { shopName: string };
  messages: { content: string }[];
};

type Msg = {
  id: string;
  content: string;
  senderId: string;
  sender: { firstName: string };
};

function ChatInner() {
  const { user } = useAuth();
  const params = useSearchParams();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState(params.get("c") || "");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  async function loadConvs() {
    const d = await api<{ items: Conv[] }>("/api/messages");
    setConvs(d.items);
    if (!active && d.items[0]) setActive(d.items[0].id);
  }

  async function loadMsgs(id: string) {
    const d = await api<{ messages: Msg[] }>(`/api/messages/${id}`);
    setMessages(d.messages);
  }

  useEffect(() => {
    loadConvs().catch(() => {});
  }, []);

  useEffect(() => {
    if (active) loadMsgs(active).catch(() => {});
    const t = setInterval(() => {
      if (active) loadMsgs(active).catch(() => {});
    }, 4000);
    return () => clearInterval(t);
  }, [active]);

  async function send() {
    if (!text.trim() || !active) return;
    await api("/api/messages", { method: "POST", body: JSON.stringify({ conversationId: active, content: text }) });
    setText("");
    loadMsgs(active);
  }

  return (
    <div className="container-n grid min-h-[70vh] gap-4 py-6 md:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl bg-white p-3 shadow-soft">
        {convs.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`mb-1 w-full rounded-xl p-3 text-left text-sm ${active === c.id ? "bg-accent-50" : "hover:bg-muted"}`}
          >
            <p className="font-medium">{c.seller.shopName}</p>
            <p className="truncate text-xs text-slate-500">{c.messages[0]?.content}</p>
          </button>
        ))}
        {!convs.length && <p className="p-4 text-sm text-slate-500">Чат нест</p>}
      </aside>
      <section className="flex flex-col rounded-2xl bg-white p-4 shadow-soft">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.senderId === user?.id ? "ml-auto bg-ink text-white" : "bg-slate-100"}`}>
              {m.content}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Паём..." onKeyDown={(e) => e.key === "Enter" && send()} />
          <button className="btn-primary" onClick={send}>Фирист</button>
        </div>
      </section>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatInner />
    </Suspense>
  );
}
