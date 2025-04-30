import { useState } from "react";
import { useNavigate } from "react-router";
import { phase2Api } from "../helpers/http-clients";
import Swal from "sweetalert2";

export default function AddPreference() {
  const jobCategory = [
    "Accounting",
    "Administrative",
    "Arts and Design",
    "Business Development",
    "Community and Social Services",
    "Consulting",
    "Education",
    "Engineering",
    "Entrepreneurship",
    "Finance",
    "Healthcare Services",
    "Human Resources",
    "Information Technology",
    "Legal",
    "Marketing",
    "Media and Communication",
    "Military and Protective Services",
    "Operations",
    "Product Management",
    "Program and Project Management",
    "Purchasing",
    "Quality Assurance",
    "Real Estate",
    "Research",
    "Sales",
    "Support",
    "Training",
    "Writing and Editing",
  ];

  const degrees = [
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctoral Degree",
    "Professional Degree",
    "High School Diploma",
    "Certificate",
    "Diploma",
    "Other",
  ];

  const [formData, setFormData] = useState({
    location: "",
    job: "",
    degree: "",
    skill: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await phase2Api.post("/preference", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Preferensi berhasil ditambahkan.",
      });
      navigate("/home/preference");
    } catch (error) {
      console.error("Error adding preference:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menambahkan preferensi.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-[#6a64f1] mb-6">
            Tambah Preferensi
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="location"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Masukkan lokasi preferensi"
                required
              />
            </div>

            <div>
              <label
                htmlFor="job"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Job
              </label>
              <select
                id="job"
                name="job"
                value={formData.job}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="">Pilih kategori pekerjaan</option>
                {jobCategory.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="degree"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Degree
              </label>
              <select
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="">Pilih gelar pendidikan</option>
                {degrees.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="skill"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Skill
              </label>
              <input
                type="text"
                id="skill"
                name="skill"
                value={formData.skill}
                onChange={handleChange}
                className="input-field"
                placeholder="Masukkan keterampilan"
                required
              />
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate("/home/preference")}
                className="custom-button-outline"
              >
                Kembali
              </button>
              <button type="submit" className="custom-button">
                Simpan Preferensi
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: #6a64f1;
          box-shadow: 0 0 0 3px rgba(106, 100, 241, 0.15);
        }
        .select-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          appearance: menulist;
        }
        .select-field:focus {
          outline: none;
          border-color: #6a64f1;
          box-shadow: 0 0 0 3px rgba(106, 100, 241, 0.15);
        }
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
          padding: 0.5rem 1.25rem;
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
      `}</style>
    </div>
  );
}
