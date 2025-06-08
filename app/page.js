import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <main className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Transform Your Life with</span>
            <span className="block bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              StayFit
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your journey to a healthier lifestyle starts here. Track your workouts, set goals, and stay motivated with our comprehensive fitness platform.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/signup"
              className="rounded-md bg-gradient-to-r from-blue-500 to-teal-400 px-8 py-3 text-white font-medium shadow-lg hover:from-blue-600 hover:to-teal-500 transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-white px-8 py-3 text-gray-900 font-medium shadow-lg hover:bg-gray-50 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
