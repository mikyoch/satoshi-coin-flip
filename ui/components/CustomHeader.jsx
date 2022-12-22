import Head from "next/head";
import React from "react";
import WebAnalytics from "./WebAnalystics";

const CustomHeader = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Time-locked Satoshi Coin Flip</title>
      </Head>
      <WebAnalytics />
    </React.Fragment>
  );
};

export default CustomHeader;
