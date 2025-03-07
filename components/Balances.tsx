import { FC } from "react";
import Image from "next/image";

const Balances: FC = () => {
  return (
    <div className="p-6">
      <div className="tabs flex space-x-8 mb-4">
        <button className="text-black font-bold hover:text-gray-700">My Savings</button>
        <button className="text-gray-400 hover:text-gray-600">Overview</button>
        <button className="text-gray-400 hover:text-gray-600">Account</button>
      </div>
      <div className="balance flex items-center mb-4">
        <Image
          src="/icons/usdc.png"
          alt="Savings Icon"
          width={16}
          height={16}
          className="h-8 w-8 mr-4 object-contain"
        />
        <span className="text-6xl font-bold text-black">12,488.27</span>
      </div>
      <div className="bottom flex space-x-4">
        <button className="bg-black text-white px-6 py-2 rounded-lg flex items-center hover:bg-gray-800">
          Retire Savings
          <Image src="/icons/retire.svg" alt="Lock" width={16} height={16} className="ml-2 h-4 w-4" />
        </button>
        <button className="bg-white text-black border border-gray-300 px-6 py-2 rounded-lg flex items-center hover:bg-gray-100">
          Withdraw Cash
          <Image
            src="/icons/withdraw.svg"
            alt="Withdraw"
            width={16}
            height={16}
            className="ml-2 h-4 w-4"
          />
        </button>
      </div>
    </div>
  );
};

export default Balances;
