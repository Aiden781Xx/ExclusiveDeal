 export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center animate-fade-in">
          {/* Hero Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block mb-3">Exclusive Deals for</span>
            <span className="gradient-text text-6xl md:text-7xl font-bold">Startups</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Access premium SaaS tools at startup-friendly prices. Cloud, marketing, analytics, and productivity solutions - all in one place.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 mb-12 text-center py-8">
            <div className="animate-slide-up">
              <p className="text-4xl md:text-5xl font-bold text-blue-400">500+</p>
              <p className="text-gray-400 mt-2">Deals Available</p>
            </div>
            <div className="animate-slide-up">
              <p className="text-4xl md:text-5xl font-bold text-purple-400">10K+</p>
              <p className="text-gray-400 mt-2">Startups Benefited</p>
            </div>
            <div className="animate-slide-up">
              <p className="text-4xl md:text-5xl font-bold text-indigo-400">$5M+</p>
              <p className="text-gray-400 mt-2">Savings Generated</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="/register"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started →
            </a>
            <a
              href="/login"
              className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-4 rounded-lg font-bold text-lg transition duration-300"
            >
              Sign In
            </a>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition duration-300 animate-slide-left">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold mb-2">Secure Deals</h3>
              <p className="text-gray-400 text-sm">Verify your startup to unlock exclusive deals</p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition duration-300 animate-slide-up">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Instant Access</h3>
              <p className="text-gray-400 text-sm">Claim deals and get codes immediately</p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-400/50 transition duration-300 animate-slide-right">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold mb-2">Save Money</h3>
              <p className="text-gray-400 text-sm">Up to 70% discount on premium SaaS tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Footer (ONLY ADDITION) */}
      <div className="relative z-10 border-t border-white/10 py-6 text-center text-sm text-gray-400">
        <p className="mb-3 text-gray-300 font-medium">Built by Shivam Sharma</p>

        <div className="flex flex-wrap justify-center gap-5">
          <a
            href="https://github.com/Aiden781Xx"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition underline"
          >
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/shivam-sharma-193226311/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition underline"
          >
            LinkedIn
          </a>

          <a
            href="https://personalshivamglbajaj.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition underline"
          >
            Portfolio
          </a>

          <a
            href="https://wa.me/917505611192"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition underline"
          >
            WhatsApp
          </a>

          <span className="text-gray-500">
            Instagram: @__bhardwaj750
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </main>
  );
}
