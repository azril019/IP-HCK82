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

        setRecommendations(response.data.data); // Menyimpan teks dari API ke state
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
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Recommendation from AI</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              className="card card-border bg-base-100 shadow-md animate-pulse"
              key={index}
            >
              <div className="card-body">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-end">
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recommendation from AI</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((data, index) => {
          return (
            <div className="card card-border bg-base-100" key={index}>
              <div className="card-body">
                <h2 className="card-title">{data.title}</h2>
                <h4 className="card-title">{data.company}</h4>
                <p>Deskripsi pekerjaan: {data.description}</p>
                <p>Alasan kecocokan: {data.match_reason}</p>
                <div className="card-actions justify-end">
                  <Link to={data.job_link}>
                    <button className="btn btn-primary">Job Link</button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
