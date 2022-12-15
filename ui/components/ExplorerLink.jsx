// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

const ExplorerLink = ({ id, text, type, amount }) => {
  let url =
    "https://explorer.sui.io/" +
    `${type === "win" || type === "loss" ? "object" : type}/` +
    `${encodeURIComponent(id)}`;

  const isAddress = type === "address";
  const playerWin = type === "win";
  const playerLoss = type === "loss";
  const isObject = type === "object";

  // Determine result color: red/green for win/loss type objects
  const renderColor = () => {
    if (!isAddress) {
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
        <a href={url} target="_blank" rel="noreferrer">
          {!isAddress ? (
            <>
              {!playerWin && !playerLoss && isObject ? (
                <>
                  <span
                    className={`sm:inline-block hidden ${renderColor()} pr-1 align-bottom text-sm capitalize`}
                  >
                    {text ? `${text}:` : `${type}:`}
                  </span>
                  <span className="inline-block align-bottom text-inherit/50 text-sm max-w-[80vw] truncate">{`${id}`}</span>
                </>
              ) : (
                <>
                  <span
                    className={`${renderColor()} + pr-1 capitalize font-medium align-bottom`}
                  >
                    {`${text}:`}
                  </span>
                  <span className="inline-block align-bottom text-inherit/50 max-w-[35vw] truncate lg2:max-w-[30vw] lg:max-w-[28vw]">
                    {`${id}`}
                  </span>
                  {amount && (
                    <div className="inline-flex items-end bg-gray-dark/10 rounded-full px-2 ml-1">
                      <span
                        className={
                          "text-xs pr-1 font-light " +
                          (Number(amount) < 0 ? "text-amber" : "text-success")
                        }
                      >{`${amount}`}</span>
                      <span className="font-light text-[0.6rem] text-sui-text-light">
                        {" "}
                        MIST
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <span className="text-inherit/50 block mx-auto truncate max-w-[50%] xs:max-w-[80%] sm:max-w-[100%]">{`${text}`}</span>
          )}
        </a>
      </div>
    </>
  );
};

export default ExplorerLink;
