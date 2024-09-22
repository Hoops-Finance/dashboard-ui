"use client";

import DetailedInfo from "../../components/DetailedInfo";
import Swap from "../../components/Swap";
/* <DetailedInfo /> */
export default function DetailsViewPage() {
  return (
    <div className="container mx-auto p-4 flex justify-center items-start min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
        <div className="w-full lg:w-1/3 lg:sticky lg:top-20">
          <Swap />
        </div>
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold mb-6">Details</h1>
        </div>
      </div>
    </div>
  );
}
