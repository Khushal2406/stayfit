import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-50">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
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

        {/* Features Section */}
        <div className="mt-32 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Stay Fit</h2>
            <p className="mt-4 text-lg text-gray-600">Comprehensive tools to help you achieve your fitness goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Nutrition Tracking */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Nutrition Tracking</h3>
              <p className="text-gray-600">Track your daily calories and macros with our intuitive food logging system. Stay on top of your nutrition goals effortlessly.</p>
            </div>

            {/* Progress Monitoring */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Monitoring</h3>
              <p className="text-gray-600">Watch your progress with detailed charts and analytics. Set goals and track your journey to success.</p>
            </div>

            {/* Goal Setting */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Goal Setting</h3>
              <p className="text-gray-600">Set personalized fitness goals and let our smart system help you achieve them step by step.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-400 py-16 rounded-3xl mb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
                <div className="text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-white/90">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
                <div className="text-4xl font-bold text-white mb-2">1M+</div>
                <div className="text-white/90">Meals Tracked</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
                <div className="text-4xl font-bold text-white mb-2">87%</div>
                <div className="text-white/90">Goal Achievement</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Get started with StayFit in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Account</h3>
              <p className="text-gray-600">Sign up in seconds and set up your personalized fitness profile</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Set Your Goals</h3>
              <p className="text-gray-600">Define your fitness objectives and create an actionable plan</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Track & Improve</h3>
              <p className="text-gray-600">Monitor your progress and adjust your plan as you grow stronger</p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="mt-4 text-lg text-gray-600">Join thousands of satisfied StayFit users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                  JS
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">John Smith</div>
                  <div className="text-sm text-gray-500">Lost 20 lbs in 3 months</div>
                </div>
              </div>
              <p className="text-gray-600">"StayFit made tracking my nutrition and workouts so easy. The weekly progress reports keep me motivated!"</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                  AR
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Amy Rodriguez</div>
                  <div className="text-sm text-gray-500">Fitness enthusiast</div>
                </div>
              </div>
              <p className="text-gray-600">"The goal-setting features and progress tracking have completely transformed my fitness journey."</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                  MK
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Mike Kennedy</div>
                  <div className="text-sm text-gray-500">Marathon runner</div>
                </div>
              </div>
              <p className="text-gray-600">"As an athlete, I love how StayFit helps me maintain my nutrition and track my training progress."</p>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mb-20 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-teal-400 rounded-3xl py-16 px-4">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Your Fitness Journey?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join StayFit today and take the first step towards a healthier, stronger you.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-md bg-white px-8 py-3 text-gray-900 font-medium shadow-lg hover:bg-gray-50 transition-all"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
