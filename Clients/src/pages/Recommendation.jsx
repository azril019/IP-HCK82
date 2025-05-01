import { useState, useEffect } from "react";
import { phase2Api } from "../helpers/http-clients";
import Swal from "sweetalert2";
import { Link } from "react-router";

export default function Recommendation() {
  const [recommendations, setRecommendations] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await phase2Api.get("/recommendations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        setRecommendations(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal mengambil data rekomendasi dari AI.",
        });
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[#6a64f1] mb-8">
            Rekomendasi Pekerjaan dari AI
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                key={index}
              >
                <div className="p-6">
                  <div className="h-5 bg-[#6a64f1]/10 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-[#6a64f1]/10 rounded w-1/2 mb-6"></div>
                  <div className="h-24 bg-[#6a64f1]/10 rounded mb-4"></div>
                  <div className="h-16 bg-[#6a64f1]/10 rounded mb-4"></div>
                  <div className="flex justify-end mt-4">
                    <div className="h-10 bg-[#6a64f1]/20 rounded w-28"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#6a64f1] mb-8">
          Rekomendasi Pekerjaan dari AI
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((data, index) => (
            <div
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              key={index}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {data.title}
                </h2>
                <h4 className="text-lg font-medium text-[#6a64f1] mb-4">
                  {data.company}
                </h4>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Deskripsi pekerjaan:
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {data.description}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Alasan kecocokan:
                  </p>
                  <p className="text-gray-600 text-sm bg-[#6a64f1]/5 p-2 rounded-md">
                    {data.match_reason}
                  </p>
                </div>

                <div className="flex justify-end mt-4">
                  <Link to={data.job_link}>
                    <button className="custom-button">Lihat Pekerjaan</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .custom-button {
          background-color: #6a64f1;
          border: none;
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .custom-button:hover {
          background-color: #5a54d1;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(106, 100, 241, 0.3);
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
