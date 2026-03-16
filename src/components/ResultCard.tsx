import type { Component } from "solid-js";
import "./style/resultcard.css";

type ResultCardProps = {
  emoji: string;
  count: number;
  label: string;
  color: string;
};

const ResultCard: Component<ResultCardProps> = (props) => (
  <div class="resultcardcontainer">
    <div style={{ "font-size": "2.5rem", "margin-bottom": "10px" }}>
      {props.emoji}
    </div>
    <div
      style={{ "font-size": "2rem", "font-weight": "bold", color: props.color }}
    >
      {props.count}
    </div>
    <div class="resultcard-label">{props.label}</div>
  </div>
);

export default ResultCard;
