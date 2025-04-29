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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src="/Logo.png" />
      </div>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Link to={"/home/recommendation"}>
        <button className="btn btn-success mb-4">
          Get Recommendation By AI
        </button>
      </Link>
      <div className="flex flex-wrap gap-4 p-4 justify-center items-center">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
