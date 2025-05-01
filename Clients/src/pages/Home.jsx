import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import { phase2Api } from "../helpers/http-clients";
import { Link, useNavigate } from "react-router";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await phase2Api.get("/external-data/1", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(
          err.response?.data?.message || "Terjadi kesalahan saat mengambil data"
        );
        navigate("/home/preference");
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <div className="loading-container">
          <img src="/Logo.png" alt="Logo" className="mb-4 w-32" />
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <div className="error-container bg-white p-8 rounded-lg shadow-lg border-l-4 border-custom">
          <h2 className="text-2xl font-bold text-custom mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="btn custom-button mt-4"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 flex-grow">
        <div className="text-center mb-8 mt-8">
          <Link to={"/home/recommendation"}>
            <button className="btn custom-button px-8 py-3">
              Get Recommendation By AI
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .custom-button {
          background-color: #6a64f1 !important;
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        .custom-button:hover {
          background-color: #5a54d1 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(106, 100, 241, 0.3);
        }
        .text-custom {
          color: #6a64f1;
        }
        .border-custom {
          border-color: #6a64f1;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(106, 100, 241, 0.2);
          border-top: 5px solid #6a64f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
