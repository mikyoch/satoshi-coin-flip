import Head from "next/head";

const WebAnalytics = () => {
  return (
    <Head>
      <script
        defer
        data-domain="satoshi-flip.sui.io"
        src="https://plausible.io/js/script.js"
      ></script>
    </Head>
  );
};

export default WebAnalytics;
