import { React, useState } from "react";
import { createGame } from "../services/SatoshiAPI";

const NewGameButton = (props) => {
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // @todo: change harcoded values to user defined values
    try {
      let response = await createGame(100, 5000);
      props.callback(response.data.gameId);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-xs">
        { isLoading ? 
        (
        <button className="bg-sui-ocean text-white px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none" disabled>
          Loading...
        </button>
        )
        :
        (
        <form onSubmit={handleSubmit}>
          <div>
            <button
              type="submit"
              className="bg-sui-ocean text-white px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none"
            >
              New game
            </button>
          </div>
        </form>
        )
        }
      </div>
    </>
  );
};

export { NewGameButton };
