import {
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  type Component,
} from "solid-js";
import { useAuth } from "../contexts/AuthContext";

const WS_URL = "wss://teaorcoffee.vercel.app";

const Chat: Component = () => {
  const auth = useAuth();
  const [chatMessages, setChatMessages] = createSignal<
    { name: string; message: string }[]
  >([]);
  const [chatInput, setChatInput] = createSignal("");

  let chatSocket: WebSocket | null = null;
  let chatBoxRef: HTMLDivElement | undefined;

  onMount(() => {
    connectChatWebSocket();
  });

  onCleanup(() => {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.close();
    }
  });

  // Auto-scroll to bottom when new messages arrive
  createEffect(() => {
    chatMessages(); // Track changes to messages
    if (chatBoxRef) {
      chatBoxRef.scrollTop = chatBoxRef.scrollHeight;
    }
  });

  const connectChatWebSocket = () => {
    chatSocket = new WebSocket(`${WS_URL}/ws/chat?token=${auth.getToken()}`);

    chatSocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setChatMessages((prev) => [...prev, msg]);
    };

    chatSocket.onerror = () => {
      console.warn("Chat WebSocket error");
    };
  };

  const sendChat = () => {
    if (!chatInput().trim()) return;

    chatSocket?.send(
      JSON.stringify({
        message: chatInput().trim(),
      }),
    );

    setChatInput("");
  };

  return (
    <div class="chat-section">
      <div class="chat-wrapper">
        <h2 class="chat-title">💬 Live Chat</h2>
        <p class="chat-subtitle">
          You are: <strong>{auth.userName()}</strong>
        </p>

        <div class="chat-box" ref={chatBoxRef}>
          {chatMessages().map((msg) => (
            <div class="chat-message">
              <span class="chat-name">{msg.name}:</span>
              <span class="chat-text">{msg.message}</span>
            </div>
          ))}
        </div>

        <div class="chat-input-row">
          <input
            class="chat-input"
            type="text"
            value={chatInput()}
            onInput={(e) => setChatInput(e.currentTarget.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendChat();
            }}
          />
          <button class="chat-send" onClick={sendChat}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
