import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { phase2Api } from "../helpers/http-clients";
import Swal from "sweetalert2";

export default function Preference() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await phase2Api.get("/preference", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setPreferences(response.data);
        console.log(response.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching preferences:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal mengambil data preferensi pengguna.",
        });
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner w-12 h-12 rounded-full border-4 border-t-[#6a64f1] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-[#6a64f1]">
              User Preferences
            </h1>
          </div>

          {!preferences || preferences.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="inline-block p-4 rounded-full bg-[#6a64f1]/10 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[#6a64f1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 mb-6">
                Data preferensi tidak ditemukan. Tambahkan data preferensi anda
                untuk mendapatkan lowongan yang sesuai dengan diri anda.
              </p>
              <Link to="/home/preference/add">
                <button className="custom-button">Tambahkan Preferensi</button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#6a64f1]/10">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#6a64f1]">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#6a64f1]">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#6a64f1]">
                      Degree
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#6a64f1]">
                      Skill
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-[#6a64f1]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {preferences.map((pref) => (
                    <tr key={pref.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {pref.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {pref.job}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {pref.degree}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {pref.skill}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link to={`/home/preference/edit/${pref.id}`}>
                          <button className="custom-button-outline">
                            Edit
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
        .custom-button-outline {
          background-color: transparent;
          border: 1px solid #6a64f1;
          color: #6a64f1;
          padding: 0.375rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .custom-button-outline:hover {
          background-color: rgba(106, 100, 241, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(106, 100, 241, 0.15);
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
