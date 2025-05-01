import { useState } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router";
import { phase2Api } from "../helpers/http-clients";

export default function RegisterUser() {
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

  // State to track current step
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // State for form data
  const [formUser, setFormUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [formPreferences, setFormPreferences] = useState({
    job: "",
    location: "",
    degree: "",
    skill: "",
  });

  // Handle input changes for all form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["name", "email", "password"].includes(name)) {
      setFormUser({
        ...formUser,
        [name]: value,
      });
    } else {
      setFormPreferences({
        ...formPreferences,
        [name]: value,
      });
    }
  };

  // Move to next step
  const handleNextStep = async (e) => {
    e.preventDefault();

    // Validate step 1 fields
    if (currentStep === 1) {
      if (localStorage.getItem("access_token")) {
        return setCurrentStep(2);
      }
      try {
        await phase2Api.post("/register", formUser);

        const response = await phase2Api.post("/login", {
          email: formUser.email,
          password: formUser.password,
        });

        localStorage.setItem("access_token", response.data.access_token);
        setCurrentStep(2);
      } catch (error) {
        console.error("🚀 ~ handleSubmit ~ error:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.response?.data?.message || "Terjadi kesalahan!",
        });
      }
    } else {
      // Submit the form
      handleSubmit(e);
    }
  };

  // Go back to previous step
  const handlePrevStep = async (e) => {
    e.preventDefault();
    await phase2Api.delete("/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    localStorage.removeItem("access_token");
    setCurrentStep(1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await phase2Api.post("/preference", formPreferences, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Preferensi berhasil ditambahkan.",
      });
      navigate("/home");
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
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: "url('/BG.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#6a64f1]">
              Create Account
            </h2>
            <p className="mt-2 text-gray-600">
              Complete the steps below to get started
            </p>
          </div>

          <div className="steps-wrapper mb-8">
            <div className="flex justify-between items-center relative">
              <div className={`step-item ${currentStep >= 1 ? "active" : ""}`}>
                <div className="step-counter">1</div>
                <div className="step-name">Sign Up</div>
              </div>

              <div className={`step-item ${currentStep >= 2 ? "active" : ""}`}>
                <div className="step-counter">2</div>
                <div className="step-name">Preferences</div>
              </div>

              <div className="step-divider"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 block mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your full name"
                    className="input-field"
                    value={formUser.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 block mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="example@mail.com"
                    className="input-field"
                    value={formUser.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 block mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Create a password"
                    className="input-field"
                    value={formUser.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex items-center justify-center mt-6">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-[#6a64f1] hover:text-[#5a54d1] transition-colors"
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="job"
                    className="text-sm font-medium text-gray-700 block mb-2"
                  >
                    Job Category
                  </label>
                  <select
                    name="job"
                    id="job"
                    className="select-field"
                    value={formPreferences.job}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a job category</option>
                    {jobCategory.map((job) => (
                      <option key={job} value={job}>
                        {job}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="text-sm font-medium text-gray-700 block mb-2"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    placeholder="Enter your preferred location"
                    className="input-field"
                    value={formPreferences.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="degree"
                    className="text-sm font-medium text-gray-700 block mb-2"
                  >
                    Degree
                  </label>
                  <select
                    name="degree"
                    id="degree"
                    className="select-field"
                    value={formPreferences.degree}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your degree</option>
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
                    name="skill"
                    id="skill"
                    placeholder="Enter your key skills"
                    className="input-field"
                    value={formPreferences.skill}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="custom-button-outline"
                >
                  Back
                </button>
              )}
              {currentStep === 1 && <div></div>}
              <button
                type="button"
                onClick={handleNextStep}
                className="custom-button"
              >
                {currentStep === 1 ? (
                  <span className="flex items-center">
                    Next Step
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                    >
                      <path
                        d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                ) : (
                  "Submit"
                )}
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

        .steps-wrapper {
          padding: 10px 0;
        }

        .step-divider {
          position: absolute;
          top: 25px;
          left: 50px;
          right: 50px;
          height: 2px;
          background: #d1d5db;
          z-index: 1;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .step-counter {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: white;
          border: 2px solid #d1d5db;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .step-name {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .step-item.active .step-counter {
          background: #6a64f1;
          border-color: #6a64f1;
          color: white;
        }

        .step-item.active .step-name {
          color: #6a64f1;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
