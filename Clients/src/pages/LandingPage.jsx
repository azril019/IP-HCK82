export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Image Left and Text Right */}
      <div className="bg-base-200">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left: Image */}
            <div className="md:w-1/2">
              <img src="/BG.svg" alt="Job matching illustration" />
            </div>

            {/* Right: Text Content */}
            <div className="md:w-1/2 text-left">
              <h1 className="mb-5 text-4xl md:text-5xl font-bold">
                Temukan Pekerjaan yang Cocok untuk Anda bersama MAKARYA
              </h1>
              <p className="mb-8 text-lg md:text-xl">
                Gunakan teknologi AI untuk menemukan pekerjaan yang sesuai
                dengan keterampilan dan pengalaman Anda.
              </p>
              <a href="/register" className="btn btn-lg custom-button">
                Mulai Sekarang
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="bg-base-200 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Fitur Utama Kami
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="card-title">AI Matching</h2>
                <p>
                  Teknologi AI yang mencocokkan CV Anda dengan pekerjaan yang
                  tepat
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="card-title">Cepat & Mudah</h2>
                <p>Proses aplikasi yang sederhana dan tanggapan cepat</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="card-title">Karir Impian</h2>
                <p>
                  Temukan pekerjaan yang sempurna untuk pengembangan karir Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-button {
          background-color: #6a64f1 !important;
          border: none;
          color: white;
        }
        .custom-button:hover {
          background-color: #5a54d1 !important;
        }
      `}</style>
    </div>
  );
}
