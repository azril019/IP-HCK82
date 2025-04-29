export default function LandingPage() {
  return (
    <>
      <style>
        {`
          body {
            background-image: url('/BG.jpg'); 
            background-size: cover; 
            background-position: center; 
            background-repeat: no-repeat; 
            margin: 0; 
            color: #F2EFE7;
          }
          .text-outline {
            text-shadow: 1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
          }
        `}
      </style>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>AI Job Matching</title>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="#">
            AI-Powered Job Matching
          </a>
        </div>
      </nav>
      <div
        className="container text-center mt-16"
        style={{
          marginTop: 560,
          padding: "0 15px",
          maxWidth: "100%",
        }}
      >
        <h1 className="mb-3 text-outline" style={{ fontSize: "3rem" }}>
          Temukan Pekerjaan yang Cocok untuk Anda
        </h1>
        <p className="lead text-outline" style={{ fontSize: "1.5rem" }}>
          Gunakan teknologi AI untuk menemukan pekerjaan yang sesuai dengan
          keterampilan dan pengalaman Anda.
        </p>
        <a
          href="/register"
          className="btn btn-primary btn-lg"
          style={{
            fontSize: "1rem",
            padding: "10px 20px",
          }}
        >
          Mulai Sekarang
        </a>
      </div>
    </>
  );
}
