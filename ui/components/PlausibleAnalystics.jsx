import Head from "next/head";

const PlausibleAnalytics = () => {
  return (
    <div>
      <Head>
        <script
          defer
          data-domain="satoshi-flip.sui.io"
          src="https://plausible.io/js/script.js"
        ></script>
      </Head>
    </div>
  );
};

export default PlausibleAnalytics;
