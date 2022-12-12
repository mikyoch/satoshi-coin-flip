/**
 * Footer component
 */
import MystenLabsIcon from "../public/svg/mystenlabs-icon.svg";
import MystenLabs from "../public/svg/mystenlabs.svg";
import ExternalLink from "../public/svg/arrow-up-right.svg";
import Social from "./Social";

const Footer = () => {
  const getYear = () => {
    return new Date().getFullYear();
  };

  const article = {
    svg: ExternalLink,
    link: "https://sui.io/resources-sui/",
    text: "Read the project article",
  };

  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-between bg-sui-ocean-dark p-3.5">
      <div className="flex items-stretch py-3">
        <span className="text-white/60 h-[15px] w-8">
          <MystenLabsIcon />
        </span>
        <span className="text-white/60 h-[22px] w-32 ml-3">
          <MystenLabs />
        </span>
        <span className="text-white/40 h-[22px] text-[10px] ml-2">
          Copyright © {getYear()}, Mysten Labs, Inc.
        </span>
      </div>
      <div className="text-xs text-center lg:text-right text-white/50">
        <p className="lg:py-0 py-2">
          This is a demo to present a fair method to use Sui blockchain in order
          to conduct a 50/50 chance coin flip game.{" "}
        </p>
        <p className="flex pt-2 justify-center lg:justify-end underline decoration-white/10 underline-offset-4">
          <Social
            icon={article.svg}
            link={article.link}
            text={article.text}
            revert={true}
          />
        </p>
      </div>
    </div>
  );
};

export default Footer;
