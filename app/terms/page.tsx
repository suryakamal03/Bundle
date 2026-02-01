export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#FF9966] to-[#FF5E62] bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Acceptance of Terms</h2>
            <p>
              By accessing and using Bundle, you accept and agree to be bound by the terms and 
              provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Use of Service</h2>
            <p>
              Bundle is a project management platform. You agree to use the service only for lawful 
              purposes and in accordance with these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <p>
              Bundle is provided "as is" without warranties of any kind. We are not liable for any 
              damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service 
              constitutes acceptance of modified terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
