"use client";

import { io, Socket } from "socket.io-client";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { listProjectMessagesRequest, ProjectMessage, SOCKET_BASE_URL } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth-store";
import { Button, Card, Input, PageIntro, Pill } from "../../../../components/ui/primitives";

type JoinAck = { ok: boolean; message?: string };
type SendAck = { ok: boolean; message?: string };

export default function DashboardChatPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const { token, user, hydrate } = useAuthStore();
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!bottomRef.current) {
      return;
    }
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sortedMessages]);

  useEffect(() => {
    if (!token || !projectId) {
      return;
    }

    const authToken = token;
    const currentProjectId = projectId;

    async function loadHistory() {
      setLoading(true);
      setError(null);
      try {
        const data = await listProjectMessagesRequest(authToken, currentProjectId);
        setMessages(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void loadHistory();
  }, [token, projectId]);

  useEffect(() => {
    if (!token || !projectId) {
      return;
    }

    const authToken = token;
    const currentProjectId = projectId;

    const socket = io(SOCKET_BASE_URL, {
      auth: { token: authToken },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("project:join", currentProjectId, (ack: JoinAck) => {
        if (!ack.ok) {
          setError(ack.message ?? "Failed to join project chat room");
        }
      });
    });

    socket.on("project:message:new", (message: ProjectMessage) => {
      if (message.projectId !== currentProjectId) {
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    });

    socket.on("connect_error", () => {
      setError("Unable to connect to live chat socket");
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, projectId]);

  async function onSendMessage(event: FormEvent) {
    event.preventDefault();

    const nextContent = content.trim();
    if (!nextContent || !socketRef.current || !projectId) {
      return;
    }

    setSending(true);
    setError(null);

    socketRef.current.emit(
      "project:message:send",
      {
        projectId,
        content: nextContent,
        fileUrl: fileUrl.trim() || undefined,
      },
      (ack: SendAck) => {
        setSending(false);
        if (!ack.ok) {
          setError(ack.message ?? "Failed to send message");
          return;
        }
        setContent("");
        setFileUrl("");
      },
    );
  }

  function onFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setFileUrl(localPreviewUrl);
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[280px,1fr]">
      <Card>
        <p className="text-sm text-slate-400">Project Chat</p>
        <h1 className="mt-2 text-xl font-semibold">Project {projectId.slice(0, 8)}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Real-time collaboration for escrow-backed delivery. Every message is stored and auditable.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {user?.role ? <Pill text={user.role} /> : null}
          <Button asChild variant="secondary" className="h-8 px-3 text-xs">
            <Link href={`/dashboard/projects/${projectId}`}>Back to Project</Link>
          </Button>
        </div>
      </Card>

      <Card>
        <PageIntro title="Conversation" subtitle="Discuss milestones, upload evidence, and keep client-freelancer communication transparent." />
        {loading ? <p className="mt-3 text-slate-400">Loading message history...</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}

        <div className="mt-3 max-h-[460px] space-y-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          {sortedMessages.length === 0 ? (
            <p className="text-sm text-slate-400">No messages yet. Start the project conversation.</p>
          ) : null}

          {sortedMessages.map((message) => {
            const mine = user?.id === message.senderId;
            return (
              <div
                key={message.id}
                className={`rounded-xl border p-3 ${mine ? "ml-auto border-cyan-500/40 bg-cyan-500/10" : "border-slate-700 bg-slate-900"} max-w-[85%]`}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    {message.sender.name} ({message.sender.role})
                  </span>
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-100">{message.content}</p>
                {message.fileUrl ? (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-cyan-300 underline"
                  >
                    View Uploaded File
                  </a>
                ) : null}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={onSendMessage} className="mt-4 space-y-3">
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your message"
            maxLength={5000}
            required
          />
          <Input
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
            placeholder="Optional file URL"
            type="url"
          />
          <Input type="file" onChange={onFilePicked} />
          <Button type="submit" disabled={sending || !content.trim()}>
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>
    </section>
  );
}
