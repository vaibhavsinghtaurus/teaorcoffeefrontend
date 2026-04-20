import { createSignal, onCleanup, onMount, type Component } from "solid-js";
import ResultCard from "./ResultCard";
import "./style/teaorcoffeevotes.css";
import Chat from "./Chat";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "https://teaorcoffee.onrender.com";
const WS_URL = "wss://teaorcoffee.onrender.com";

interface OrderDetail {
  name: string;
  tea: number;
  coffee: number;
}

interface OrdersBreakdown {
  orders: OrderDetail[];
  total_tea: number;
  total_coffee: number;
}

const TeaCoffeeVote: Component = () => {
  const auth = useAuth();
  const [votes, setVotes] = createSignal({ tea: 0, coffee: 0 });
  const [hasVoted, setHasVoted] = createSignal(false);
  const [showThankYou, setShowThankYou] = createSignal(false);
  const [myVote, setMyVote] = createSignal<any | null>(null);
  const [ordersBreakdown, setOrdersBreakdown] = createSignal<OrdersBreakdown | null>(null);
  const [connectionError, setConnectionError] = createSignal(false);

  const [drinkType, setDrinkType] = createSignal<"tea" | "coffee">("tea");
  const [amount, setAmount] = createSignal(1);

  let voteSocket: WebSocket | null = null;

  onMount(() => {
    fetchVotes();
    fetchMyVote();
    fetchOrdersBreakdown();
    connectVoteWebSocket();
  });

  onCleanup(() => {
    if (voteSocket && voteSocket.readyState === WebSocket.OPEN) {
      voteSocket.close();
    }
  });

  // -------- Votes --------
  const fetchVotes = async () => {
    try {
      const res = await auth.apiFetch(`${API_URL}/votes`);
      if (!res) return;
      const data = await res.json();
      setVotes(data);
      setConnectionError(false);
    } catch (err) {
      setConnectionError(true);
    }
  };

  const fetchMyVote = async () => {
    try {
      const res = await auth.apiFetch(`${API_URL}/vote/me`);
      if (!res || !res.ok) return;
      const data = await res.json();
      setMyVote(data);
      setHasVoted(true);
    } catch {
      // user has not voted yet
    }
  };

  const fetchOrdersBreakdown = async () => {
    try {
      const res = await auth.apiFetch(`${API_URL}/orders/breakdown`);
      if (!res || !res.ok) return;
      const data = await res.json();
      setOrdersBreakdown(data);
    } catch {
      // ignore
    }
  };

  const connectVoteWebSocket = () => {
    voteSocket = new WebSocket(`${WS_URL}/ws/votes?token=${auth.getToken()}`);

    voteSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setVotes(data);
      fetchOrdersBreakdown();
      setConnectionError(false);
    };

    voteSocket.onerror = () => {
      setConnectionError(true);
    };
  };

  const getMaxAmount = () => (drinkType() === "tea" ? 2 : 1);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const orderAmount = amount();
    const maxAllowed = getMaxAmount();

    if (orderAmount === 0) {
      alert("At least one drink must be ordered");
      return;
    }

    if (orderAmount > maxAllowed) {
      alert(
        `You can order maximum ${maxAllowed} ${drinkType()}${maxAllowed > 1 ? "s" : ""}`,
      );
      return;
    }

    try {
      const res = await auth.apiFetch(`${API_URL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tea: drinkType() === "tea" ? orderAmount : 0,
          coffee: drinkType() === "coffee" ? orderAmount : 0,
        }),
      });

      if (!res) return;

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.detail || "Vote failed");
        return;
      }

      const data = await res.json();
      setVotes(data);
      setHasVoted(true);
      setShowThankYou(true);
      fetchOrdersBreakdown();
      setConnectionError(false);

      setTimeout(() => setShowThankYou(false), 3000);
    } catch (err) {
      setConnectionError(true);
    }
  };

  return (
    <div class="teaorcoffeewrapperwrapper">
      <h1 class="teaorcoffeewrapper">☕ Tea & Coffee Order 🍵</h1>
      <p class="titlequestion">Order your favorite beverages!</p>

      {connectionError() && (
        <div class="connection-error">
          🔒 Please come with your real name to place an order
        </div>
      )}

      {showThankYou() && <div class="thankyou">🙏 Thanks for your order!</div>}

      {/* MAIN FLEX LAYOUT */}
      <div class="main-layout">
        {/* LEFT: Vote Section */}
        <div class="vote-section">
          <form class="voteform" onSubmit={handleSubmit}>
            <div class="form-header">
              <h3>Place Your Order</h3>
              <p>Select your beverage and quantity</p>
            </div>

            <div class="order-inputs-new">
              <div class="form-group">
                <label class="form-label">Beverage Type</label>
                <select
                  class="form-select"
                  value={drinkType()}
                  onInput={(e) => {
                    const type = e.currentTarget.value as "tea" | "coffee";
                    setDrinkType(type);
                    if (type === "coffee" && amount() > 1) {
                      setAmount(1);
                    }
                  }}
                  disabled={hasVoted()}
                >
                  <option value="tea">🍵 Tea (max 2)</option>
                  <option value="coffee">☕ Coffee (max 1)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Quantity</label>
                <input
                  class="form-input"
                  type="number"
                  min="1"
                  max={getMaxAmount()}
                  value={amount()}
                  onInput={(e) => setAmount(Number(e.currentTarget.value))}
                  disabled={hasVoted()}
                  placeholder="1"
                />
              </div>
            </div>

            <div class="order-summary">
              <span class="summary-label">Your order:</span>
              <span class="summary-value">
                {amount()} {drinkType() === "tea" ? "🍵" : "☕"}
              </span>
            </div>

            <button class="submit-button" type="submit" disabled={hasVoted()}>
              {hasVoted() ? "✓ Order Placed" : "Place Order"}
            </button>
          </form>

          <div class="resultwrapper">
            <h2 class="resulttitle">Total Orders (Live)</h2>
            <div class="resultcardwrapper">
              <ResultCard
                emoji="🍵"
                count={votes().tea}
                label="Tea orders"
                color="var(--color-tea-accent)"
              />
              <ResultCard
                emoji="☕"
                count={votes().coffee}
                label="Coffee orders"
                color="var(--color-coffee-accent)"
              />
            </div>
          </div>

          {ordersBreakdown() && (
            <div class="orders-breakdown">
              <h3 class="breakdown-title">📋 Orders Breakdown</h3>
              <div class="breakdown-list">
                {ordersBreakdown()!.orders.map((order) => (
                  <div class="breakdown-item">
                    <span class="breakdown-name">{order.name}</span>
                    <span class="breakdown-orders">
                      {order.tea > 0 && <span class="breakdown-tea">🍵 {order.tea}</span>}
                      {order.coffee > 0 && <span class="breakdown-coffee">☕ {order.coffee}</span>}
                      {order.tea === 0 && order.coffee === 0 && <span class="breakdown-none">No order</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myVote() && (
            <div class="myvote">
              Your order: 🍵 {myVote()!.tea} tea | ☕ {myVote()!.coffee} coffee
            </div>
          )}

          {hasVoted() && (
            <p class="hasvoted">You've already placed an order — thanks! 💙</p>
          )}
        </div>

        {/* RIGHT: Chat Component */}
        <Chat />
      </div>
    </div>
  );
};

export default TeaCoffeeVote;
