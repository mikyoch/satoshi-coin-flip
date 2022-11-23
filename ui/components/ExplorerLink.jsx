import { useState } from "react";

export default function ExplorerLink({ id, type }) {
  const [showTooltip, setShowTooltip] = useState(false);

  let url = "https://explorer.sui.io/";
  if (type === "object") url += "objects/";
  else if (type === "transaction") url += "transactions/";
  else if (type === "address") url += "addresses/";
  url += `${id}`;
  // what will use see
  const shownId = `${id.slice(0, 5)}...${id.slice(-7, -1)}`;

  return (
    <>
      <span className="bg-black/75 text-white rounded-lg overflow-visible"
        style={
          showTooltip ? { display: "inline" } : { display: "none" }
        }
      >{`${type}#${id}`}</span>
      <div
        onMouseEnter={() => {
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
        className="p-2"
      >
        <a href={url} target="_blank">{`${type}#${shownId}`}</a>
      </div>
    </>
  );
}
