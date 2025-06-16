// components/Topbar.js
import AuthButton from "./AuthButton";

export default function Topbar() {
  return (
    <header className="w-full bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-white">My App</h1>
      <AuthButton />
    </header>
  );
}