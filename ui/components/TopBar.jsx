// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Top Bear component
 * Use: Appears before the main header for extra supporting details
 * i.e. social icons and external links
 */

import GithubSvg from "../public/svg/github.svg";
import ExternalLink from "../public/svg/arrow-up-right.svg";
import MystenLabsIcon from "../public/svg/mystenlabs-icon.svg";
import Social from "./Social";

const TopHeader = () => {
  const article = {
    svg: ExternalLink,
    link: "https://sui.io/resources-sui/",
    text: "Read the project article",
  };

  const github = {
    svg: GithubSvg,
    link: "https://github.com/MystenLabs/satoshi-coin-flip",
    text: "Source code",
  };

  const site = {
    svg: MystenLabsIcon,
    link: "https://mystenlabs.com/",
    text: "Visit Mysten Labs",
  };

  return (
    <div className="bg-ocean-darker px-3.5">
      <div className="py-2.5">
        <div className="flex justify-between items-center flex-wrap flex-col sm:flex-row">
          <div className="flex items-center text-sm text-sui-text-light">
            <Social
              icon={article.svg}
              link={article.link}
              text={article.text}
              revert={true}
            />
          </div>
          <div className="w-full sm:w-auto flex items-center text-sui-text-light text-sm sm:pt-0 pt-2 justify-between sm:pl-0 pl-4">
            <Social icon={github.svg} link={github.link} text={github.text} />
            <Social icon={site.svg} link={site.link} text={site.text} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
