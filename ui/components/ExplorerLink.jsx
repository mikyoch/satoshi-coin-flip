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
                  <span className="table-cell truncate max-w-[3rem] sm:max-w-[8rem] md:max-w-[12rem] lg:max-w-[18rem] lg2:max-w-[23rem] xl:max-w-[100%] text-inherit/50">{`${id}`}</span>
                  {amount && (
                    <>
                      <span className="text-ocean-darker text-xs"> <b>[</b> </span>
                      <span
                        className={
                          "text-xs " +
                          (Number(amount) < 0 ? "text-amber" : "text-success")
                        }
                      >{`${amount}`}</span>
                      <span className="text-[0.6rem] text-sui-text-light"> MIST</span>
                      <span className="text-ocean-darker text-xs"> <b>]</b></span>
                    </>
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
