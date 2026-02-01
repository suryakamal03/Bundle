export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#FF9966] to-[#FF5E62] bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
            <p>
              Bundle collects information you provide when creating an account, including your name, 
              email address, and any data you add to your projects and tasks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
            <p>
              We use your information to provide and improve the Bundle service, communicate with you, 
              and ensure the security of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
            <p>
              Your data is stored securely using Firebase and encrypted in transit. We implement 
              industry-standard security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through the app.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
