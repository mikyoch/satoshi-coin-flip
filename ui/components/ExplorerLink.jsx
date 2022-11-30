// import { useState } from "react";

export default function ExplorerLink({ id, text, type }) {
  // const [showTooltip, setShowTooltip] = useState(false);

  let url = "https://explorer.sui.io/";
  // if (type === "object") url += "objects/";
  // else if (type === "transaction") url += "transactions/";
  // else if (type === "address") url += "addresses/";

  // adding an else just to be able to show `won#gameId`
  // else url += "objects/";
  url += `${type}/`;
  url += `${encodeURIComponent(id)}`;
  // what will user see
  const isAddress = type === "address";
  const playerWin = type === "win";
  const playerLoss = type === "loss";
  const isObject = type === "object";


  const renderColor = () => {
    if (!isAddress && !isObject) {
      if (playerLoss) {
        return "text-failure";
      } else if (playerWin) {
        return "text-success";
      }
    }
    return "text-sui-ocean";
  };

  return (
    <>
      <div className="first-of-type:text-sui-sky text-sui-text-light">
        <a href={url} target="_blank" referrer="noreferrer">
          {!isAddress ? (
            <>
              {!playerWin && !playerLoss && isObject ? (
                <>
                  <span className={`${renderColor()} + pr-1 text-sm`}>
                    {`${text}:`}
                  </span>
                  <span className="text-inherit/50 text-sm">{`${id}`}</span>
                </>
              ) : (
                <>
                  <span className={`${renderColor()} + pr-1`}>
                    {`${text}:`}
                  </span>
                  <span className="text-inherit/50">{`${id}`}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-inherit/50">{`${text}`}</span>
          )}
        </a>
      </div>
    </>
  );
}
