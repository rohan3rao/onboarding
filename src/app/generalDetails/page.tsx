"use client";
import { useEffect, useState } from "react";
import "./generalDetails.css";
import {
  getBusinessType,
  getIndustryType,
  saveCompanyInfo,
  saveHeadCountInfo,
  saveValidateInfo,
} from "../api_helpers";
import { Modal, Button } from "react-bootstrap";

interface GeneralDetailsProps {
  onNext: () => void;
}

interface FormData {
  organisationName: string;
  businessType: string;
  industry: string;
  taxableEmployees: string;
  nonTaxableEmployees: string;
  panCardNo: string;
  gstNo: string;
  keyholderName: string;
  designation: string;
  email: string;
  phoneNumber: string;
  address1: string;
  address2: string;
}
const panPattern = /^([A-Z]){5}([0-9]){4}([A-Z]){1}?$/; // PAN pattern
const GeneralDetails: React.FC<GeneralDetailsProps> = ({ onNext }) => {
  const [formData, setFormData] = useState<FormData>({
    organisationName: "",
    businessType: "",
    industry: "",
    taxableEmployees: "",
    nonTaxableEmployees: "",
    panCardNo: "",
    gstNo: "",
    keyholderName: "",
    designation: "",
    email: "",
    phoneNumber: "",
    address1: "",
    address2: "",
  });
  // const panPattern = "/^([A-Z]){3}[P]{1}([A-Z]){1}([0-9]){4}([A-Z]){1}?$/"
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [businessType, setBusinessType] = useState<any[]>([]);
  const [industry, setIndustry] = useState<any[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem("GeneralDetails");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    const fetchBusinessAndIndustry = async () => {
      try {
        const businessInfo = await getBusinessType();
        const industryInfo = await getIndustryType();

        setBusinessType(businessInfo.organization_info);
        setIndustry(industryInfo.industry_info);
      } catch (error) {
       
      }
    };
    fetchBusinessAndIndustry();
  }, []);

  useEffect(() => {
   
  }, [businessType, industry]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "organisationName":
        return value ? "" : "Organisation Name is required";
      case "businessType":
        return value ? "" : "Business Type is required";
      case "industry":
        return value ? "" : "Industry is required";
      case "taxableEmployees":
        return value && !isNaN(Number(value))
          ? ""
          : "Number of Taxable Employees must be a number";
      case "nonTaxableEmployees":
        return value && !isNaN(Number(value))
          ? ""
          : "Number of Non-Taxable Employees must be a number";
      case "panCardNo":
        // return value ? "" : "PAN is required";
        return panPattern.test(value) ? "" : "Invalid PAN format";
      case "keyholderName":
        return value ? "" : "Keyholder Name is required";
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "A valid Email is required";
      case "gstNo":
        const gstPattern =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!value) {
          // GST is not required, so no error if empty
          return "";
        }
        // If there is a value, check the pattern
        return gstPattern.test(value) ? "" : "A valid GST No is required";
      case "phoneNumber":
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(value) ? "" : "Phone Number must be 10 digits";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedFormData = { ...prevFormData, [name]: value };
      return updatedFormData;
    });
    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    let valid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) valid = false;
      newErrors[key as keyof FormData] = error;
    });

    setErrors(newErrors);
    return valid;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (validate()) {
      if (isSubmitting) return; // Prevent submission if already submitting

      setIsSubmitting(true); // Set submitting state to true

      // Store the general details in local storage
      localStorage.setItem("GeneralDetails", JSON.stringify(formData));
   
      const companyInfo = {
        organizationName: formData.organisationName,
        taxableCount: formData.taxableEmployees, // Ensure it's an integer if needed
        nontaxablecount: formData.nonTaxableEmployees,
        keyholder_name: formData.keyholderName,
        designation: formData.designation,
        email: formData.email,
        phone: formData.phoneNumber,
        address1: formData.address1,
        address2: formData.address2,
        is_active: false,
      };

      const companyInfoPayload = {
        organization_name: formData.organisationName,
        pan_no: formData.panCardNo,
        gst_no: formData.gstNo,
        email: formData.email,
        phone: formData.phoneNumber,
      };

      // Calculate the total headcount once
      const totalHeadCount =
        parseInt(companyInfo.taxableCount, 10) +
        parseInt(companyInfo.nontaxablecount, 10);

      const HeadCountPayload = {
        HeadCount: totalHeadCount,
      };

      try {
        // Call saveValidateInfo,saveHeadCountInfo and saveCompanyInfo sequentially
        const response1 = await saveValidateInfo(companyInfoPayload);
        if (response1.success === false) {
          setErrorMessage(response1.message); // Set the error message from the response
          setErrorModalVisible(true);

          response1.message;
        } else {
          const response = await saveHeadCountInfo(HeadCountPayload);

          // Check if the response is a string and needs parsing
          let abc;
          if (typeof response === "string") {
            abc = JSON.parse(response); // Parse the JSON string into an object
          } else {
            abc = response; // If it's already an object, no need to parse
          }

          // Now you can safely access the 'pricing' property
          const pricing = abc.pricing;
          await saveCompanyInfo(companyInfo);

          // Store the company info in local storage after successful API calls
          localStorage.setItem("CompanyInfo", JSON.stringify(companyInfo));
          localStorage.setItem("HeadcountInfo", JSON.stringify(pricing));

          // Proceed to the next step
          onNext();
        }
      } catch (error) {
      
      } finally {
        setIsSubmitting(false); // Reset submitting state
      }
    }
  };

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseModal = () => {
    setErrorModalVisible(false);
  };

  return (
    <div className="custom-card container px-4">
      <div>
        
        <form>
       
          <div className="font-pop-16 fw-600 mb-3 dark">
            Business Information
          </div>
          <Modal show={errorModalVisible} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "red", fontWeight: "bold" }}>
              Error!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{errorMessage}</p>
          </Modal.Body>
        </Modal>
          <div className="row">
            <div className="col-4">
              <div className="form-group mb-3">
                <label
                  htmlFor="organisationName"
                  className="font-pop-14 fw-400 dark"
                >
                  Organisation Name <span className="mandatory">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="organisationName"
                  name="organisationName"
                  value={formData.organisationName}
                  onChange={handleChange}
                  placeholder="Enter the Organisation name"
                  autoComplete="off"
                />
                {errors.organisationName && (
                  <span className="error">{errors.organisationName}</span>
                )}
              </div>
            </div>
            <div className="col-4">
              <div className="form-group mb-3">
                <label
                  htmlFor="businessType"
                  className="font-pop-14 fw-400 dark"
                >
                  Business Type <span className="mandatory">*</span>
                </label>
                <div className="custom-select-wrapper">
                  <select
                    className="form-control drop custom-select"
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    autoComplete="off"
                  >
                    <option value="" disabled className="choose">
                      Choose
                    </option>
                    {businessType.map((type: any, index) => (
                      <option key={index} value={type?.name}>
                        {type?.name}
                      </option>
                    ))}
                    {/* Add more options as needed */}
                  </select>
                </div>
                {errors.businessType && (
                  <span className="error">{errors.businessType}</span>
                )}
              </div>
            </div>
            <div className="col-4">
              <div className="form-group mb-3">
                <label htmlFor="industry" className="font-pop-14 fw-400 dark">
                  Industry <span className="mandatory">*</span>
                </label>
                <div className="custom-select-wrapper">
                  <select
                    className="form-control drop custom-select"
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    autoComplete="off"
                  >
                    <option value="" disabled className="choose">
                      Choose
                    </option>
                    {industry.map((type: any, index) => (
                      <option key={index} value={type?.name}>
                        {type?.name}
                      </option>
                    ))}
                    {/* Add more options as needed */}
                  </select>
                </div>
                {errors.industry && (
                  <span className="error">{errors.industry}</span>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <div className="form-group mb-3">
                <label className="font-pop-14 fw-400 dark">
                  Number of Employees <span className="mandatory">*</span>
                </label>
                <div className="row">
                  <div className="col">
                    <div className="input-container-taxable">
                      <input
                        type="text"
                        className="form-control"
                        id="taxableEmployees"
                        name="taxableEmployees"
                        value={formData.taxableEmployees}
                        onChange={handleChange}
                        placeholder=" "
                        autoComplete="off"
                      />
                      <span className="label">Taxable:</span>
                    </div>
                    {errors.taxableEmployees && (
                      <span className="error">{errors.taxableEmployees}</span>
                    )}
                  </div>
                  <div className="col">
                    <div className="input-container-non-taxable">
                      <input
                        type="text"
                        className="form-control"
                        id="nonTaxableEmployees"
                        name="nonTaxableEmployees"
                        value={formData.nonTaxableEmployees}
                        onChange={handleChange}
                        placeholder=" "
                        autoComplete="off"
                      />
                      <span className="label">Non-Taxable:</span>
                    </div>
                    {errors.nonTaxableEmployees && (
                      <span className="error">
                        {errors.nonTaxableEmployees}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="form-group mb-3">
                <label htmlFor="panCardNo" className="font-pop-14 fw-400 dark">
                  PAN <span className="mandatory">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="panCardNo"
                  name="panCardNo"
                  value={formData.panCardNo}
                  onChange={handleChange}
                  placeholder="Enter the PAN"
                  autoComplete="off"
                />
                {errors.panCardNo && (
                  <span className="error">{errors.panCardNo}</span>
                )}
              </div>
            </div>
            <div className="col-4">
              <div className="form-group mb-3">
                <label htmlFor="gstNo" className="font-pop-14 fw-400 dark">
                  GST
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="gstNo"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleChange}
                  placeholder="Enter GST No"
                  autoComplete="off"
                />
                {errors.gstNo && <span className="error">{errors.gstNo}</span>}
              </div>
            </div>
          </div>
          <div className="font-pop-16 fw-600 mb-3 dark">
            Contact Information
          </div>
          <div className="row">
            <div className="col-4">
              <div className="form-group mb-3">
                <label
                  htmlFor="keyholderName"
                  className="font-pop-14 fw-400 dark"
                >
                  Keyholder Name <span className="mandatory">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="keyholderName"
                  name="keyholderName"
                  value={formData.keyholderName}
                  onChange={handleChange}
                  placeholder="Enter the Keyholder name"
                  autoComplete="off"
                />
                {errors.keyholderName && (
                  <span className="error">{errors.keyholderName}</span>
                )}
              </div>
            </div>
            <div className="col-4">
              <div className="form-group mb-3">
                <label
                  htmlFor="designation"
                  className="font-pop-14 fw-400 dark"
                >
                  Designation
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter the Designation"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="col-4">
              <div className="form-group mb-3">
                <label htmlFor="email" className="font-pop-14 fw-400 dark">
                  Email <span className="mandatory">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter the Email"
                  autoComplete="off"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <div className="form-group mb-3">
                <label htmlFor="phoneNo" className="font-pop-14 fw-400 dark">
                  Phone Number <span className="mandatory">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="phoneNo"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter the Phone Number"
                  autoComplete="off"
                />
                {errors.phoneNumber && (
                  <span className="error">{errors.phoneNumber}</span>
                )}
              </div>
            </div>
            <div className="col-4">
              <div className="form-group mb-3">
                <label htmlFor="address1" className="font-pop-14 fw-400 dark">
                  Address 1
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address1"
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  placeholder="Enter the Address 1"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="col-4">
              <div className="form-group mb-3">
                <label htmlFor="address2" className="font-pop-14 fw-400 dark">
                  Address 2
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address2"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  placeholder="Enter the Address 2"
                  autoComplete="off"
                />
                <label className="font-pop-12 grey">
                  *city, state & Zipcode
                </label>
              </div>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 d-flex flex-column align-items-center">
              <button
                type="button"
                className="font-pop-16 general-info-btn"
                onClick={handleSubmit}
              >
                Continue
              </button>
              <p className="text-center font-pop-8 fw-400">
                By Signing up to Resolve Pay, means you agree to our Privacy
                Policy and Terms of Service
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralDetails;
