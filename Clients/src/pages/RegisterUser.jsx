import { useState } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router";
import { phase2Api } from "../helpers/http-clients";

export default function RegisterUser() {
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
  });
  // Handle input changes for all form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser({
      ...formUser,
      [name]: value,
    });
    setFormPreferences({
      ...formPreferences,
      [name]: value,
    });
  };

  // Move to next step
  const handleNextStep = async (e) => {
    e.preventDefault();

    // Validate step 1 fields
    if (currentStep === 1) {
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
  const handlePrevStep = (e) => {
    e.preventDefault();
    setCurrentStep(1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send data to your backend API
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
    <>
      <div className="formbold-main-wrapper">
        <div className="formbold-form-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="formbold-steps">
              <ul>
                <li
                  className={`formbold-step-menu1 ${
                    currentStep === 1 ? "active" : ""
                  }`}
                >
                  <span>1</span>
                  Sign Up
                </li>
                <li
                  className={`formbold-step-menu2 ${
                    currentStep === 2 ? "active" : ""
                  }`}
                >
                  <span>2</span>
                  Preferences
                </li>
              </ul>
            </div>
            <div
              className={`formbold-form-step-1 ${
                currentStep === 1 ? "active" : ""
              }`}
            >
              <div className="formbold-input-flex">
                <div>
                  <label htmlFor="name" className="formbold-form-label">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Andrio"
                    id="name"
                    className="formbold-form-input"
                    value={formUser.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="formbold-input-flex">
                <div>
                  <label htmlFor="email" className="formbold-form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@mail.com"
                    id="email"
                    className="formbold-form-input"
                    value={formUser.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="formbold-form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="input password"
                    name="password"
                    id="password"
                    className="formbold-form-input"
                    value={formUser.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p style={{ textAlign: "center" }}>
                Sudah punya akun? <Link to={"/login"}>Login</Link>
              </p>
            </div>
            <div
              className={`formbold-form-step-2 ${
                currentStep === 2 ? "active" : ""
              }`}
            >
              <div className="formbold-input-flex">
                <div>
                  <label htmlFor="job" className="formbold-form-label">
                    Job
                  </label>
                  <input
                    type="text"
                    name="job"
                    id="job"
                    className="formbold-form-input"
                    value={formPreferences.job}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="location" className="formbold-form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    className="formbold-form-input"
                    value={formPreferences.location}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="degree" className="formbold-form-label">
                    Degree
                  </label>
                  <input
                    type="text"
                    name="degree"
                    id="degree"
                    className="formbold-form-input"
                    value={formPreferences.degree}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="skill" className="formbold-form-label">
                    Skill
                  </label>
                  <input
                    type="text"
                    name="skill"
                    id="skill"
                    className="formbold-form-input"
                    value={formPreferences.skill}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="formbold-form-btn-wrapper">
              <button
                className={`formbold-back-btn ${
                  currentStep === 2 ? "active" : ""
                }`}
                onClick={handlePrevStep}
                type="button"
              >
                Back
              </button>
              <button
                className="formbold-btn"
                onClick={handleNextStep}
                type="button"
              >
                {currentStep === 1 ? "Next Step" : "Submit"}
                {currentStep === 1 && (
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_1675_1807)">
                      <path
                        d="M10.7814 7.33312L7.20541 3.75712L8.14808 2.81445L13.3334 7.99979L8.14808 13.1851L7.20541 12.2425L10.7814 8.66645H2.66675V7.33312H10.7814Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1675_1807">
                        <rect width={16} height={16} fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "\n  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');\n  * {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n  }\n  body {\n    font-family: \"Inter\", sans-serif;\n  }\n  .formbold-main-wrapper {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    padding: 48px;\n  }\n\n  .formbold-form-wrapper {\n    margin: 0 auto;\n    max-width: 550px;\n    width: 100%;\n    background: white;\n    border: 1px solid #DDE3EC;\n    border-radius: 10px;\n    padding: 30px;\n    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.05);\n  }\n\n  .formbold-steps {\n    padding-bottom: 18px;\n    margin-bottom: 35px;\n    border-bottom: 1px solid #DDE3EC;\n  }\n  .formbold-steps ul {\n    padding: 0;\n    margin: 0;\n    list-style: none;\n    display: flex;\n    gap: 40px;\n  }\n  .formbold-steps li {\n    display: flex;\n    align-items: center;\n    gap: 14px;\n    font-weight: 500;\n    font-size: 16px;\n    line-height: 24px;\n    color: #536387;\n  }\n  .formbold-steps li span {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: #DDE3EC;\n    border-radius: 50%;\n    width: 36px;\n    height: 36px;\n    font-weight: 500;\n    font-size: 16px;\n    line-height: 24px;\n    color: #536387;\n  }\n  .formbold-steps li.active {\n    color: #07074D;;\n  }\n  .formbold-steps li.active span {\n    background: #6A64F1;\n    color: #FFFFFF;\n  }\n\n  .formbold-input-flex {\n    display: flex;\n    gap: 20px;\n    margin-bottom: 22px;\n  }\n  .formbold-input-flex > div {\n    width: 50%;\n  }\n  .formbold-form-input {\n    width: 100%;\n    padding: 13px 22px;\n    border-radius: 5px;\n    border: 1px solid #DDE3EC;\n    background: #FFFFFF;\n    font-weight: 500;\n    font-size: 16px;\n    color: #536387;\n    outline: none;\n    resize: none;\n  }\n  .formbold-form-input:focus {\n    border-color: #6a64f1;\n    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.05);\n  }\n  .formbold-form-label {\n    color: #07074D;\n    font-weight: 500;\n    font-size: 14px;\n    line-height: 24px;\n    display: block;\n    margin-bottom: 10px;\n  }\n\n  .formbold-form-confirm {\n    border-bottom: 1px solid #DDE3EC;\n    padding-bottom: 35px;\n  }\n  .formbold-form-confirm p {\n    font-size: 16px;\n    line-height: 24px;\n    color: #536387;\n    margin-bottom: 22px;\n    width: 75%;\n  }\n  .formbold-form-confirm > div {\n    display: flex;\n    gap: 15px;\n  }\n\n  .formbold-confirm-btn {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    background: #FFFFFF;\n    border: 0.5px solid #DDE3EC;\n    border-radius: 5px;\n    font-size: 16px;\n    line-height: 24px;\n    color: #536387;\n    cursor: pointer;\n    padding: 10px 20px;\n    transition: all .3s ease-in-out;\n  }\n  .formbold-confirm-btn {\n    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.12);\n  }\n  .formbold-confirm-btn.active {\n    background: #6A64F1;\n    color: #FFFFFF;\n  }\n\n  .formbold-form-step-1,\n  .formbold-form-step-2,\n  .formbold-form-step-3 {\n    display: none;\n  }\n  .formbold-form-step-1.active,\n  .formbold-form-step-2.active,\n  .formbold-form-step-3.active {\n    display: block;\n  }\n\n  .formbold-form-btn-wrapper {\n    display: flex;\n    align-items: center;\n    justify-content: flex-end;\n    gap: 25px;\n    margin-top: 25px;\n  }\n  .formbold-back-btn {\n    cursor: pointer;\n    background: #FFFFFF;\n    border: none;\n    color: #07074D;\n    font-weight: 500;\n    font-size: 16px;\n    line-height: 24px;\n    display: none;\n  }\n  .formbold-back-btn.active {\n    display: block;\n  }\n  .formbold-btn {\n    display: flex;\n    align-items: center;\n    gap: 5px;\n    font-size: 16px;\n    border-radius: 5px;\n    padding: 10px 25px;\n    border: none;\n    font-weight: 500;\n    background-color: #6A64F1;\n    color: white;\n    cursor: pointer;\n  }\n  .formbold-btn:hover {\n    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.05);\n  }\n\n",
        }}
      />
    </>
  );
}
