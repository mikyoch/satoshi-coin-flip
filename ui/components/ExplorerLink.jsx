// import { useState } from "react";

export default function ExplorerLink({ id, type }) {
  // const [showTooltip, setShowTooltip] = useState(false);

  let url = "https://explorer.sui.io/";
  if (type === "object") url += "objects/";
  else if (type === "transaction") url += "transactions/";
  else if (type === "address") url += "addresses/";
  // adding an else just to be able to show `won#gameId`
  else url +="objects/";
  url += `${encodeURIComponent(id)}`;
  // what will use see
  const shownId = `${id.slice(0, 5)}...${id.slice(-7)}`;

  return (
    <>
      <div>
        <a href={url} target="_blank">{`${type}#${shownId}`}</a>
      </div>
    </>
  );
}
