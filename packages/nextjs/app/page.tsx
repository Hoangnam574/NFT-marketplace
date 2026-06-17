"use client";

import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col items-center pt-10">
      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-base-100">
        <div className="hero-content flex-col lg:flex-row-reverse gap-12 w-full max-w-7xl">
          {/* Hero Image / Card */}
          <div className="flex-1 w-full max-w-md">
            <div className="card w-full glass shadow-2xl overflow-hidden hover:shadow-cyan-500/20 transition-shadow duration-300">
              <figure className="relative h-[400px]">
                <img
                  src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"
                  alt="Featured NFT"
                  className="object-cover w-full h-full"
                />
              </figure>
              <div className="card-body p-6 bg-gradient-to-b from-transparent to-base-300">
                <h2 className="card-title text-2xl">Cosmic Abstract #01</h2>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold">ArtistName</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-base-content/70">Current Bid</p>
                    <p className="font-bold text-lg">0.5 ETH</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Discover, Collect, & Sell Extraordinary NFTs
            </h1>
            <p className="py-6 text-xl text-base-content/80 max-w-2xl mx-auto lg:mx-0">
              Welcome to the premier decentralized marketplace for digital collectibles. Mint your own assets, trade
              with peers, and build your ultimate collection on Ethereum.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start mt-4">
              <Link
                href="/marketplace"
                className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-transform"
              >
                Explore Market
              </Link>
              <Link
                href="/mint"
                className="btn btn-outline btn-secondary border-2 font-extrabold btn-lg hover:scale-105 transition-transform"
              >
                Create NFT
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 justify-center lg:justify-start mt-12">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-base-content/70">Artworks</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold">5K+</div>
                <div className="text-sm text-base-content/70">Artists</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold">2.5M</div>
                <div className="text-sm text-base-content/70">Volume (ETH)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
