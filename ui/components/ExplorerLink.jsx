const ExplorerLink = ({ id, text, type }) => {
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
                    className={`${renderColor()} + pr-1 text-sm capitalize`}
                  >
                    {text ? `${text}:` : `${type}:`}
                  </span>
                  <span className="text-inherit/50 text-sm">{`${id}`}</span>
                </>
              ) : (
                <>
                  <span className={`${renderColor()} + pr-1 capitalize`}>
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
};

export default ExplorerLink;
