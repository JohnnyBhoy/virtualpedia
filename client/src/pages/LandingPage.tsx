import React from 'react';
import { FaStethoscope, FaClock, FaBookOpen, FaLock, FaGoogle, FaHeartbeat, FaChild, FaSyringe } from 'react-icons/fa';
import GuestChatWidget from '../components/GuestChatWidget';

const LandingPage: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaStethoscope className="text-blue-600 text-2xl" />
            <span className="font-bold text-xl text-gray-900">VirtualPedia</span>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="hidden sm:inline-flex items-center space-x-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FaGoogle className="text-sm" />
            <span>Sign In Free</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-green-100">
            🩺 Free Online Pediatric Health Guide
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Your Child's Health,<br />
            <span className="text-blue-600">Answered with Care</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ask Dr. Pedia — a knowledgeable pediatric health guide available 24/7. Get warm, reliable answers about your little one's health, growth, and wellbeing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-lg"
            >
              <FaGoogle className="text-red-500 text-xl" />
              <span>Sign in with Google</span>
            </button>
            <span className="text-gray-400 text-sm">or try 5 free questions below</span>
          </div>
          <p className="mt-4 text-sm text-gray-400">100% Free · No credit card · No appointments</p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { icon: '👨‍👩‍👧', label: 'Trusted by Parents' },
            { icon: '📚', label: 'Evidence-Based Guidance' },
            { icon: '🔒', label: 'Private & Secure' },
            { icon: '💬', label: 'Available 24/7' },
            { icon: '🆓', label: 'Completely Free' },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <span className="text-xl">{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why Parents Love VirtualPedia</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">Your go-to free resource for child health questions</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaClock className="text-blue-600 text-3xl" />,
                title: 'Available 24/7',
                desc: 'Get answers to your child\'s health questions any time — midnight fever worries, early morning rashes, no appointment needed.',
              },
              {
                icon: <FaBookOpen className="text-blue-600 text-3xl" />,
                title: 'Trusted Pediatric Knowledge',
                desc: 'Dr. Pedia covers fevers, vaccinations, milestones, nutrition, newborn care, sleep, teething, and hundreds of common parenting concerns.',
              },
              {
                icon: <FaLock className="text-blue-600 text-3xl" />,
                title: 'Private and Secure',
                desc: 'Your conversations stay private. We never share your data or your child\'s information with third parties.',
              },
            ].map(f => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-5">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics covered */}
      <section className="py-20 px-4 bg-indigo-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Can You Ask Dr. Pedia?</h2>
          <p className="text-gray-500 mb-12 text-lg">Common topics parents ask about every day</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { icon: <FaHeartbeat />, label: 'Fever & Temperature' },
              { icon: <FaSyringe />, label: 'Vaccines & Shots' },
              { icon: <FaChild />, label: 'Growth Milestones' },
              { icon: '🍼', label: 'Breastfeeding' },
              { icon: '😴', label: 'Sleep & Routine' },
              { icon: '🤧', label: 'Colds & Coughs' },
              { icon: '🍎', label: 'Nutrition & Food' },
              { icon: '🦷', label: 'Teething' },
              { icon: '🩹', label: 'Rashes & Skin' },
              { icon: '👂', label: 'Ear Infections' },
              { icon: '🚽', label: 'Potty Training' },
              { icon: '❤️', label: 'When to Go to ER' },
            ].map((t) => (
              <div key={t.label} className="bg-white rounded-xl px-4 py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-blue-500 text-xl">{typeof t.icon === 'string' ? t.icon : t.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Sign In Free', desc: 'Use your Google account to sign in securely with one click — no registration form, no credit card.' },
              { step: '2', title: 'Ask Your Question', desc: 'Type or speak your question about your child\'s health to Dr. Pedia, just like messaging a trusted doctor.' },
              { step: '3', title: 'Get Caring Guidance', desc: 'Receive warm, evidence-based answers right away — with reminders to see a real doctor when needed.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-lg">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <FaStethoscope className="text-5xl mx-auto mb-6 text-blue-200" />
          <h2 className="text-3xl font-bold mb-4">Start Talking to Dr. Pedia — It's Free</h2>
          <p className="text-blue-100 mb-8 text-lg">Join parents who trust VirtualPedia for fast, caring pediatric guidance any time of day.</p>
          <button
            onClick={handleGoogleLogin}
            className="inline-flex items-center space-x-3 bg-white text-blue-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-blue-50 transition-colors text-lg"
          >
            <FaGoogle className="text-red-500 text-xl" />
            <span>Get Started — 100% Free</span>
          </button>
          <p className="mt-4 text-blue-200 text-sm">No credit card · No appointments · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaStethoscope className="text-blue-400" />
            <span className="text-white font-semibold text-lg">VirtualPedia</span>
          </div>
          <p className="text-sm mb-2">Free Online Pediatric Health Guide for Parents & Caregivers</p>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            VirtualPedia provides general pediatric health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a licensed pediatrician for your child's health concerns.
          </p>
          <p className="text-xs mt-4 text-gray-600">© {new Date().getFullYear()} VirtualPedia. All rights reserved.</p>
        </div>
      </footer>

      {/* Guest Chatbot Widget — floating bottom-right */}
      <GuestChatWidget />
    </div>
  );
};

export default LandingPage;
