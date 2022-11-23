import React, { Component } from "react";
import "../styles/globals.css";

// Components
import { Header } from "../components/Header";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <div className="App h-screen flex flex-col items-center justify-center bg-faint-blue">
        Main content here
      </div>
    </>
  );
}

export default MyApp;
