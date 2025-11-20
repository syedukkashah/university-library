import React from "react";

const Page = () => {
  return (
    <main className="root-container flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bebas-neue text-5xl font-bold text-light-100">
        Woah, Slow Down There, Speedster!
      </h1>
      <p className="mt-3 max-w-xl text-center text-light-400">
        <b>You've been rate limited :( </b>  <br></br>Looks like you've been a
        little too eager. We've put a temporary pause on your excitement. Chill
        for a bit, and try again shortly  
      </p>
    </main>
  );
};

export default Page;
