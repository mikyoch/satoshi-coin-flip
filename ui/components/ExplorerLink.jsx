// import { useState } from "react";

export default function ExplorerLink({ id, type }) {
  // const [showTooltip, setShowTooltip] = useState(false);

  let url = "https://explorer.sui.io/";
  if (type === "object") url += "objects/";
  else if (type === "transaction") url += "transactions/";
  else if (type === "address") url += "addresses/";
  // adding an else just to be able to show `won#gameId`
  else url += "objects/";
  url += `${encodeURIComponent(id)}`;
  // what will user see
  const shownId = `${id.slice(0, 5)}...${id.slice(-7)}`;
  const isAddress = type === "address";

  return (
    <>
      <div className="first-of-type:text-sui-sky text-sui-text-light">
        <a href={url} target="_blank">
          {!isAddress && (
            <span className="text-sui-ocean pr-1">
              {`${type.charAt(0).toUpperCase() + type.slice(1)}:`}
            </span>
          )}

          <span className="text-inherit/50">{`${shownId}`}</span>
        </a>
      </div>
    </>
  );
}
