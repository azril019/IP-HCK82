import { Link } from "react-router";

export default function JobCard({ job }) {
  return (
    <div className="card" style={{ width: "20rem", height: "15rem" }}>
      <div className="card-body">
        <h5 className="card-title">{job.job_position}</h5>
        <p className="card-text">
          {job.company_name} - {job.job_location}
        </p>
        <Link to={job.company_profile}>
          <button className="card-link btn btn-primary m-2">
            Company Profile link
          </button>
        </Link>
        <Link to={job.job_link}>
          <button className="card-link btn btn-primary">Job link</button>
        </Link>
      </div>
    </div>
  );
}
