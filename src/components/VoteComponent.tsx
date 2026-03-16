import type { Component } from "solid-js";

type VoteButtonProps = {
  label: string;
  disabled: boolean;
  gradient: string;
  onClick: () => void;
};

const VoteButton: Component<VoteButtonProps> = (props) => (
  <button
    disabled={props.disabled}
    onClick={props.onClick}
    onMouseEnter={(e) => {
      if (!props.disabled) {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.3)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
    }}
    style={{
      flex: 1,
      padding: "20px 30px",
      "font-size": "1.5rem",
      background: props.disabled ? "#ccc" : props.gradient,
      border: "none",
      "border-radius": "15px",
      cursor: props.disabled ? "not-allowed" : "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      "box-shadow": "0 4px 15px rgba(0,0,0,0.2)",
      "font-weight": "600",
      color: "#333",
    }}
  >
    {props.label}
  </button>
);

export default VoteButton;
