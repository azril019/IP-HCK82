import { Link } from "react-router";

export default function JobCard({ job }) {
  return (
    <div className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden h-full">
      <div className="card-body p-6 flex flex-col h-full">
        <h5 className="card-title text-xl font-bold text-custom mb-2">
          {job.job_position}
        </h5>
        <p className="card-text text-gray-700 mb-4">
          {job.company_name} - {job.job_location}
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <Link to={job.company_profile} className="w-full">
            <button className="card-link w-full btn custom-button-outline">
              Company Profile
            </button>
          </Link>
          <Link to={job.job_link} className="w-full">
            <button className="card-link w-full btn custom-button">
              Job Details
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .text-custom {
          color: #6a64f1;
        }
        .custom-button {
          background-color: #6a64f1 !important;
          border: none;
          color: white;
          transition: all 0.3s ease;
          text-transform: none;
          font-weight: 500;
        }
        .custom-button:hover {
          background-color: #5a54d1 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(106, 100, 241, 0.3);
        }
        .custom-button-outline {
          background-color: transparent !important;
          border: 1px solid #6a64f1;
          color: #6a64f1;
          transition: all 0.3s ease;
          text-transform: none;
          font-weight: 500;
        }
        .custom-button-outline:hover {
          background-color: rgba(106, 100, 241, 0.1) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(106, 100, 241, 0.15);
        }
      `}</style>
    </div>
  );
}
