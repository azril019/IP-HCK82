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
    return <p>Loading...</p>;
  }

  if (!preferences || preferences.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">User Preferences</h1>
        <Link to="/home/preference/add">
          <button className="btn btn-success mb-4">Add Preference</button>
        </Link>
        <p>
          Data preferensi tidak ditemukan. Tambahkan data preferensi anda untuk
          mendapatkan lowongan yang sesuai dengan diri anda.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Preferences</h1>
      <Link to="/home/preference/add">
        <button className="btn btn-success mb-4">Add Preference</button>
      </Link>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Job</th>
            <th className="border px-4 py-2">Degree</th>
            <th className="border px-4 py-2">Skill</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {preferences.map((pref) => (
            <tr key={pref.id} className="text-center border-t">
              <td className="border px-4 py-2">{pref.location}</td>
              <td className="border px-4 py-2">{pref.job}</td>
              <td className="border px-4 py-2">{pref.degree}</td>
              <td className="border px-4 py-2">{pref.skill}</td>
              <td className="border px-4 py-2">
                <Link to={`/home/preference/edit/${pref.id}`}>
                  <button className="btn btn-primary m-2">Edit</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
