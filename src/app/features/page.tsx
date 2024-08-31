// import Image from "next/image";
"use client"; // Add this directive at the top
import "./features.css";
import Image from "next/image";
import flexiblePlanImg from "../../../public/FBP.svg";
import loansImg from "../../../public/Loan & Advances.svg";
import templateImg from "../../../public/templates.svg";
import workflowImg from "../../../public/workflow.svg";
import subContractorImg from "../../../public/sub contract payroll (1).svg";
import overtimeImg from "../../../public/overtime 1.svg";
import yellowWalletImg from "../../../public/yellow wallet with money (1).svg";
import complianceImg from "../../../public/Compliance.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col } from "react-bootstrap";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Registration from "../registration/page";
import {
  confirmPayment,
  disableMenuInfo,
  paymentStatus,
  saveHeadCountInfo,
} from "../api_helpers";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../spinnerComponent/page";
// import LoadingSpinner from "..";
interface FeatureDetailsProps {
  onNext: () => void;
}
type OrganisationData = {
  organisationName: string;
  businessType: string;
  industry: string;
  address1: string;
  address2: string;
  designation: string;
  email: string;
  gstNo: string;
  keyholderName: string;
  nonTaxableEmployees: string;
  panCardNo: string;
  phoneNumber: string;
  taxableEmployees: string;
};
const Features: React.FC<FeatureDetailsProps> = ({
  onNext,
  keyholderName,
  orgId,
}) => {
  const router = useRouter();
  const [profileDetails, setProfileDetails] = useState<OrganisationData | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("Monthly");
  const [isFbp, setIsFbp] = useState(false); // State to track if FBP is selected
  const [isWorkFlow, setIsWorkFlow] = useState(false); // State to track if FBP is selected
  const [isLoans, setIsLoans] = useState(false); // State to track if FBP is selected
  const [isPF, setIsPF] = useState(false); // State to track if FBP is selected
  const [isESI, setIsESI] = useState(false); // State to track if FBP is selected
  const [isMW, setIsMW] = useState(false); // State to track if FBP is selected
  const [isPT, setIsPT] = useState(false); // State to track if FBP is selected
  const [isIT, setIsIT] = useState(false); // State to track if FBP is selected
  const [isLW, setIsLW] = useState(false); // State to track if FBP is selected
  const [isPQ, setIsPerqisites] = useState(false); // State to track if FBP is selected
  const [isComp, setIsComp] = useState(false); // State to track if FBP is selected
  const [isTemp, setIsTemp] = useState(false); // State to track if FBP is selected
  const [isSubCon, setIsSubCon] = useState(false); // State to track if FBP is selected
  const [isOT, setIsOT] = useState(false); // State to track if FBP is selected
  const [isCompliancePlanActive, setIsCompliancePlanActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };
  const getFontWeight = (tabName) => {
    return activeTab === tabName ? "bold" : "normal";
  };

  const handleSwitchChange = (setter) => () => {
    setter((prevState) => !prevState);
    setter(event.target.checked);
    // setIsCompliancePlanActive(!isCompliancePlanActive);
  };
  const handleSwitchChangeComp = (setter) => () => {
    setter((prevState) => !prevState);
    setIsCompliancePlanActive(!isCompliancePlanActive);
  };

  async function getMonthlyAmount() {
    try {
      // Retrieve companyInfo from localStorage
      const companyInfo = JSON.parse(localStorage.getItem("CompanyInfo"));

      if (companyInfo) {
        const taxableCount = parseInt(companyInfo.taxableCount, 10);
        const nontaxablecount = parseInt(companyInfo.nontaxablecount, 10);

        // Construct the payload for headcount
        const headCountPayload = {
          HeadCount: taxableCount + nontaxablecount,
        };

        // Save the headcount info and get the response

        const response = await saveHeadCountInfo(headCountPayload);
        let responseObject;
        if (typeof response == "string") {
          // If response is a JSON string, parse it
          responseObject = JSON.parse(response);
        } else {
          // If response is already an object
          responseObject = response;
        }

        // Extract the pricing from the response
        const monthlyAmount = responseObject?.pricing;

        // Ensure the pricing value is present
        if (monthlyAmount !== undefined && monthlyAmount !== null) {
          return monthlyAmount; // Return the monthly amount for further use
        } else {
          throw new Error("Pricing information not found in response");
        }
      } else {
        throw new Error("CompanyInfo not found in localStorage");
      }
    } catch (error) {
      console.error(
        "Error saving headcount and fetching monthly amount:",
        error
      );
      return null; // Return null or handle the error as needed
    }
  }

  // Call the function and use the result
  getMonthlyAmount().then((monthlyAmount) => {
    if (monthlyAmount !== null) {
      // Use monthlyAmount here
    }
  });

  async function formatMonthlyAmount() {
    const monthlyAmount = await getMonthlyAmount();

    if (monthlyAmount !== null) {
      return parseFloat(monthlyAmount);

      // Use formattedMonthlyAmount as needed
    }
  }

  formatMonthlyAmount();

  function addGst(amount, gstRate) {
    return amount * gstRate;
  }

  // Calculate amounts with discounts
  async function calculateAmounts() {
    try {
      const monthlyAmount = await formatMonthlyAmount();

      if (monthlyAmount !== null && !isNaN(monthlyAmount)) {
        const gstRate = 0.18; // 18%

        const quarterlyAmount = calculateAmount(monthlyAmount * 3, 2); // Quarterly with 2% discount
        const halfYearlyAmount = calculateAmount(monthlyAmount * 6, 5); // Half-Yearly with 5% discount
        const annualAmount = calculateAmount(monthlyAmount * 12, 8); // Annual with 8% discount

        // Add GST to the amounts
        const quarterlyAmountWithGst = addGst(quarterlyAmount, gstRate);
        const halfYearlyAmountWithGst = addGst(halfYearlyAmount, gstRate);
        const annualAmountWithGst = addGst(annualAmount, gstRate);

        return {
          monthlyAmount: monthlyAmount,
          quarterlyAmount: quarterlyAmount,
          halfYearlyAmount: halfYearlyAmount,
          annualAmount: annualAmount,
          quarterlyAmountWithGst: quarterlyAmountWithGst,
          halfYearlyAmountWithGst: halfYearlyAmountWithGst,
          annualAmountWithGst: annualAmountWithGst,
        };
      } else {
      }
    } catch (error) {
      console.error("Error calculating amounts:", error);
    }
  }

  // Execute the calculation function
  calculateAmounts();
  const calculateAmount = (baseAmount, discountPercent) => {
    baseAmount = parseNumber(baseAmount);
    discountPercent = parseNumber(discountPercent);

    // Debug logs to check values

    if (baseAmount === 0 || discountPercent < 0) {
      console.warn(
        "Invalid input: baseAmount or discountPercent is not appropriate."
      );
      return 0;
    }

    const discountAmount = (baseAmount * discountPercent) / 100;

    const finalAmount = baseAmount - discountAmount;

    return finalAmount;
  };

  // Helper function to safely parse a value to a number
  const parseNumber = (value) => {
    const number = parseFloat(value);
    return isNaN(number) ? 0 : number;
  };

  const totalAmount = () => {
    if (activeTab == "Monthly") {
      return (
        amounts.monthlyAmount + addGst(amounts.monthlyAmount, 0.18)
      ).toFixed(2);
    } else if (activeTab == "Quarterly") {
      return (
        amounts.quarterlyAmount + addGst(amounts.quarterlyAmount, 0.18)
      ).toFixed(2);
    } else if (activeTab == "Half-Yearly") {
      return (
        amounts.halfYearlyAmount + addGst(amounts.halfYearlyAmount, 0.18)
      ).toFixed(2);
    } else if (activeTab == "Annual") {
      return (
        amounts.annualAmount + addGst(amounts.annualAmount, 0.18)
      ).toFixed(2);
    }
    return "0.00"; // Default value if no tab is selected
  };

  const handleSubmit = async () => {
    const data = {
      is_fbp: isFbp,
      isWorkFlow: isWorkFlow,
      isLoans: isLoans,
      isPF: isPF,
      isESI: isESI,
      isMW: isMW,
      isPT: isPT,
      isIT: isIT,
      isLW: isLW,
      isPQ: isPQ,
      isTemp: isTemp,
      isOT: isOT,
      isSubCon: isSubCon,
      isComp: isComp,
      totalAmount: parseFloat(totalAmount()),
      plan: activeTab,
      // Include other form data as necessary
    };
    // Your API call logic here
    localStorage.setItem("formData", JSON.stringify(data));

    const getProfileDetails = () => {
      const profileDetails = localStorage.getItem("GeneralDetails");
      return profileDetails ? JSON.parse(profileDetails) : {};
    };

    // Retrieve profile details
    const profileDetails = getProfileDetails();
    const payload = {
      customer_details: {
        customer_phone: profileDetails?.phoneNumber,
        customer_email: profileDetails?.email,
        customer_name: profileDetails?.keyholderName,
      },
      link_notify: {
        send_sms: false,
        send_email: false,
      },
      link_id: "",
      link_amount: data.totalAmount,
      link_currency: "INR",
      link_purpose: "subscribe",
    };

    try {
      setLoading(true);
      const response = await confirmPayment(payload);

      if (response) {
        const link_url = response.link_url;
        const link_id = response.link_id;

        if (link_url) {
          window.open(link_url, "_blank");
        }

        if (link_id) {
          const checkPaymentStatus = async () => {
            try {
              const payment_status = await paymentStatus(link_id);

              if (
                payment_status.link_status == "PAID" ||
                payment_status.link_status == "FAILED"
              ) {
                setTimeout(() => clearInterval(intervalId));
                setLoading(false);
              }

              if (payment_status.link_status == "PAID") {
                localStorage.setItem(
                  "Payment Status",
                  JSON.stringify(payment_status)
                );
                const storedPaymentInfo = JSON.parse(
                  localStorage.getItem("PaymentInfo")
                );

                localStorage.setItem("Link Id", JSON.stringify(link_id));

                // Determine the enabled and disabled arrays
                const DisabledMenuIds = [];

                if (data.is_fbp) {
                  DisabledMenuIds.push(
                    58,
                    59,
                    60,
                    116,
                    117,
                    119,
                    120,
                    555,
                    556,
                    557,
                    559,
                    560,
                    558
                  );
                }
                if (data.isLoans) {
                  DisabledMenuIds.push(78, 167, 168, 169, 170, 565, 566);
                }
                if (data.isPQ) {
                  DisabledMenuIds.push(25, 65, 108, 525, 526);
                }
                if (data.isWorkFlow) {
                  DisabledMenuIds.push(17, 50);
                }
                if (data.isOT) {
                  DisabledMenuIds.push(77);
                }
                if (data.isTemp) {
                  DisabledMenuIds.push(524);
                }

                // Assuming these are always disabled

                const disableMenuPayload = {
                  DisabledMenuIds,
                  OrgId: orgId,
                };

                // Call disableMenuInfo API
                try {
                  await disableMenuInfo(disableMenuPayload);
                  console.log("Menu settings updated successfully.");
                } catch (error) {
                  console.error("Error updating menu settings:", error);
                }

                router.push("/paymentConfirmationSuccess");
                await disableMenuInfo(disableMenuPayload);
              }

              if (payment_status.link_status == "FAILED") {
                router.push("/paymentConfirmationFailure");
              }
            } catch (error) {
              setLoading(false);
              console.error("Error checking payment status:", error);
            }
          };

          const intervalId = setInterval(checkPaymentStatus, 10000);
        } else {
          console.error("link_id is missing in the response");
        }
      } else {
        console.error("Response is undefined");
      }
    } catch (error) {
      setLoading(false);
      console.error(
        "Error during payment confirmation or status check:",
        error
      );
    }
  };
  const [amounts, setAmounts] = useState({
    quarterlyAmount: 0,
    monthlyAmount: 0,
    halfYearlyAmount: 0,
    annualAmount: 0,
    quarterlyAmountWithGst: 0,
    halfYearlyAmountWithGst: 0,
    annualAmountWithGst: 0,
  });
  useEffect(() => {
    const getAmounts = async () => {
      const calculatedAmounts = await calculateAmounts();
      if (calculatedAmounts) {
        setAmounts(calculatedAmounts);
      }
    };

    getAmounts();
  }, []);
  const formatNumber = (number) => {
    const num = parseFloat(number);
    if (isNaN(num)) return "0.00"; // Return a default value if the input is not a number

    // Convert number to string and split into integer and decimal parts
    let [integerPart, decimalPart] = num.toFixed(2).split(".");

    // Add commas to the integer part
    let lastThreeDigits = integerPart.slice(-3);
    let otherDigits = integerPart.slice(0, -3);

    if (otherDigits !== "") {
      lastThreeDigits = "," + lastThreeDigits;
    }

    integerPart =
      otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThreeDigits;

    // Combine integer part and decimal part
    return `${integerPart}.${decimalPart}`;
  };
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCompanyInfo = localStorage.getItem("CompanyInfo");
      if (storedCompanyInfo) {
        setCompanyInfo(JSON.parse(storedCompanyInfo));
      }
    }
  }, []);
  // Assuming companyInfo is an object with taxableCount and nontaxablecount properties

  // Safely retrieve taxableCount and nontaxablecount, defaulting to 0 if they are null/undefined
  const taxableCount = Number(companyInfo?.taxableCount ?? 0);
  const nontaxablecount = Number(companyInfo?.nontaxablecount ?? 0);

  // Calculate the sum of taxableCount and nontaxablecount
  const total = taxableCount + nontaxablecount;

  // Check if the total is greater than or equal to 500
  const shouldShowPricingSummary = total >= 500;

  const [keyHolderName, setKeyHolderName] = useState("Valued Customer");
  useEffect(() => {
    // Retrieve companyInfo from localStorage
    const companyInfo = JSON.parse(localStorage.getItem("CompanyInfo"));

    // Safely access keyHolder name from companyInfo and update state
    if (companyInfo?.keyholder_name) {
      setKeyHolderName(companyInfo.keyholder_name);
    }
  }, []);

  return (
    <div className="bg p-3">
      {loading && (
        <LoadingSpinner text="Processing your payment. Do not close or refresh your page..." />
      )}
      <div className="main-card-section">
        {shouldShowPricingSummary ? (
          <div className="custom-message">
            <p>Dear {keyHolderName},</p>
            <p>
              We understand that managing a large enterprise like yours comes
              with its own set of complex challenges, particularly when it comes
              to payroll, compliance, and organizational efficiency.
            </p>
            <p>
              Your organization's unique needs require tailored solutions. We'd
              love to learn more about the specific pain points you're facing in
              these areas.
            </p>
            <p>
              Our Payroll Customer team is ready to discuss your requirements
              and explore how we can provide a customized solution to address
              your enterprise's specific needs.
            </p>
            <p>
              Would you be available for a brief call to discuss this further?
            </p>
            <p>Best regards, </p>
            <p>Resolvepay Team</p>
          </div>
        ) : (
          <div className="row">
            <div className="col-sm-12 col-md-12 col-lg-7 col-xl-7">
              <div className="card-container">
                <div className="row">
                  <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="fea-card">
                      <div>
                        <Image
                          src={flexiblePlanImg}
                          alt="Flexible Plan"
                          className="card-image"
                        />
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between font-pop-14 dark fw-600">
                          Flexible Benefit plan
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"
                              onChange={handleSwitchChange(setIsFbp)}
                            />
                          </div>
                        </div>
                        <div className="font-pop-12 fw-400 mt-1">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit sed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="fea-card">
                      <div>
                        <Image
                          src={workflowImg}
                          alt="Flexible Plan"
                          className="card-image"
                        />
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between font-pop-14 dark fw-600">
                          WorkFlows
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"
                              onChange={handleSwitchChange(setIsWorkFlow)}
                            />
                          </div>
                        </div>
                        <div className="font-pop-12 fw-400 mt-1">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit sed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="fea-card">
                      <div>
                        <Image
                          src={yellowWalletImg}
                          alt="Flexible Plan"
                          className="card-image"
                        />
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between font-pop-14 dark fw-600">
                          Perquisites
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"
                              onChange={handleSwitchChange(setIsPerqisites)}
                            />
                          </div>
                        </div>
                        <div className="font-pop-12 fw-400 mt-1">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit sed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="fea-card">
                      <div>
                        <Image
                          src={overtimeImg}
                          alt="Flexible Plan"
                          className="card-image"
                        />
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between font-pop-14 dark fw-600">
                          Overtime
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"
                              onChange={handleSwitchChange(setIsOT)}
                            />
                          </div>
                        </div>
                        <div className="font-pop-12 fw-400 mt-1">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit sed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="fea-card">
                      <div>
                        <Image
                          src={overtimeImg}
                          alt="Flexible Plan"
                          className="card-image"
                        />
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between font-pop-14 dark fw-600">
                          Loan's & Advances
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"
                              onChange={handleSwitchChange(setIsLoans)}
                            />
                          </div>
                        </div>
                        <div className="font-pop-12 fw-400 mt-1">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit sed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="fea-card">
                      <div>
                        <Image
                          src={yellowWalletImg}
                          alt="Flexible Plan"
                          className="card-image"
                        />
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between font-pop-14 dark fw-600">
                          Sub Contractor Payroll
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"
                              onChange={handleSwitchChange(setIsSubCon)}
                            />
                          </div>
                        </div>
                        <div className="font-pop-12 fw-400 mt-1">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit sed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="fea-card">
                      <div>
                        <Image
                          src={complianceImg}
                          alt="Flexible Plan"
                          className="card-image"
                        />
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between font-pop-14 dark fw-600">
                          Compliance plan
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"
                              onChange={handleSwitchChangeComp(setIsComp)}
                            />
                          </div>
                        </div>
                        <div className="font-pop-12 fw-400 mt-1">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit sed
                        </div>
                        {isCompliancePlanActive && (
                          <div className="mt-2">
                            <div className="font-pop-12 mb-2 d-flex justify-content-between">
                              <label>Provident Fund</label>
                              <input
                                type="checkbox"
                                checked={isPF}
                                onChange={() => setIsPF(!isPF)}
                              />
                            </div>
                            <div className="font-pop-12 d-flex justify-content-between">
                              <label>ESI</label>
                              <input
                                type="checkbox"
                                checked={isESI}
                                onChange={() => setIsESI(!isESI)}
                              />
                            </div>
                            <div className="font-pop-12 d-flex justify-content-between">
                              <label>Income Tax</label>
                              <input
                                type="checkbox"
                                checked={isIT}
                                onChange={() => setIsIT(!isIT)}
                              />
                            </div>
                            <div className="font-pop-12 mb-2 d-flex justify-content-between">
                              <label>Professional Tax</label>
                              <input
                                type="checkbox"
                                checked={isPT}
                                onChange={() => setIsPT(!isPT)}
                              />
                            </div>
                            <div className="font-pop-12 mb-2 d-flex justify-content-between">
                              <label>Labour Welfare Act</label>
                              <input
                                type="checkbox"
                                checked={isLW}
                                onChange={() => setIsLW(!isLW)}
                              />
                            </div>
                            <div className="font-pop-12 mb-2 d-flex justify-content-between">
                              <label>Minimum Wages</label>
                              <input
                                type="checkbox"
                                checked={isMW}
                                onChange={() => setIsMW(!isMW)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="fea-card">
                      <div>
                        <Image
                          src={overtimeImg}
                          alt="Flexible Plan"
                          className="card-image"
                        />
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between font-pop-14 dark fw-600">
                          Templates & Policies
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"
                              onChange={handleSwitchChange(setIsTemp)}
                            />
                          </div>
                        </div>
                        <div className="font-pop-12 fw-400 mt-1">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit sed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Repeat the same corrections for the other cards */}
              </div>
            </div>
            <div className="out-right col-sm-12 col-md-12 col-lg-5 col-xl-5">
              <div className="right-section">
                <div className="row d-flex justify-content-between font-pop-18 fw-600 dark mb-2 mt-2">
                  <div className="col">Pricing Summary</div>
                  <div className="col">
                    <span
                      className="font-pop-12 dark fw-500"
                      style={{ marginLeft: "160px" }}
                    >
                      ( Values in ₹ )
                    </span>
                  </div>
                </div>

                <div className="price">
                  <div className="row d-flex justify-content-between font-pop-14 fw-500 blue mb-2">
                    <div className="col">Basic Subscription</div>
                    <div className="col">
                      <span
                        className="discount-pill font-pop-12 dark fw-500"
                        style={{ marginLeft: "183px" }}
                      >
                        Popular
                      </span>
                    </div>
                  </div>

                  <div>
                    <ul className="nav nav-pills nav-pill-pills">
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "Monthly" ? "active" : ""
                          }`}
                          aria-current="page"
                          onClick={() => handleTabClick("Monthly")}
                        >
                          Monthly
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "Quarterly" ? "active" : ""
                          }`}
                          onClick={() => handleTabClick("Quarterly")}
                        >
                          Quarterly
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "Half-Yearly" ? "active" : ""
                          }`}
                          onClick={() => handleTabClick("Half-Yearly")}
                        >
                          Half-Yearly
                        </a>
                      </li>
                      <li className="nav-item nav-annual">
                        <a
                          className={`nav-link ${
                            activeTab === "Annual" ? "active" : ""
                          }`}
                          style={{ marginRight: "35px" }}
                          onClick={() => handleTabClick("Annual")}
                        >
                          Annual
                        </a>
                      </li>
                    </ul>

                    <div className="row">
                      <div className="col"></div>
                      <div className="col">
                        <span className="discount-pill font-pop-12 dark fw-500">
                          2%-Off
                        </span>
                      </div>
                      <div className="col">
                        <span className="discount-pill discount-pills font-pop-12 dark fw-500">
                          5%-Off
                        </span>
                      </div>
                      <div className="col">
                        <span className="discount-pill discount-pills-one font-pop-12 dark fw-500">
                          8%-Off
                        </span>
                      </div>
                    </div>

                    <div className="row mt-3 amount-period">
                      <div
                        className="col d-flex justify-content-center"
                        style={{ fontWeight: getFontWeight("Monthly") }}
                      >
                        {formatNumber(
                          Math.round(amounts.monthlyAmount).toFixed(2)
                        )}
                      </div>
                      <div
                        className="col d-flex justify-content-center q-amount"
                        style={{ fontWeight: getFontWeight("Quarterly") }}
                      >
                        {formatNumber(
                          Math.round(amounts.quarterlyAmount).toFixed(2)
                        )}
                      </div>
                      <div
                        className="col d-flex justify-content-center hy-amount"
                        style={{ fontWeight: getFontWeight("Half-Yearly") }}
                      >
                        {formatNumber(
                          Math.round(amounts.halfYearlyAmount).toFixed(2)
                        )}
                      </div>
                      <div
                        className="col d-flex justify-content-center ay-amount"
                        style={{ fontWeight: getFontWeight("Annual") }}
                      >
                        {formatNumber(
                          Math.round(amounts.annualAmount).toFixed(2)
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-pop-14 fw-500 blue mt-4 mb-2">
                      Optional Features
                    </div>

                    <div className="mt-2 d-flex flex-wrap">
                      <div className="font-pop-12 fw-400 gray">
                        {isFbp ||
                        isLoans ||
                        isPQ ||
                        isOT ||
                        isESI ||
                        isIT ||
                        isWorkFlow ||
                        isMW ||
                        isPF ||
                        isESI ||
                        isIT ||
                        isLW ||
                        isPT
                          ? null
                          : ""}
                      </div>
                      <div className="mt-2 d-flex flex-wrap pill-feature">
                        {isFbp && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            FBP
                          </span>
                        )}
                        {isPQ && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            Perquisites
                          </span>
                        )}
                        {isLoans && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            L & A
                          </span>
                        )}
                        {isWorkFlow && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            WorkFlows
                          </span>
                        )}
                        {isOT && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            Overtime
                          </span>
                        )}
                        {isSubCon && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            SCP
                          </span>
                        )}
                        {isTemp && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            Templates
                          </span>
                        )}
                        {isPF && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            PF
                          </span>
                        )}
                        {isESI && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            ESI
                          </span>
                        )}
                        {isIT && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            IT
                          </span>
                        )}
                        {isPT && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            PT
                          </span>
                        )}
                        {isLW && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            LWA
                          </span>
                        )}
                        {isMW && (
                          <span className="optional-pil square-pill font-pop-14 dark fw-500">
                            MW
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-pop-14 fw-500 blue mt-4 mb-2">
                      Base Pricing
                    </div>

                    <div className="row">
                      {activeTab === "Monthly" && (
                        <div className="row">
                          <div className="col font-pop-14">Monthly</div>
                          <div className="col font-pop-12 d-flex justify-content-end align-items-center">
                            <i className="bi me-1 bi"></i>{" "}
                            {formatNumber(
                              Math.round(amounts.monthlyAmount).toFixed(2)
                            )}
                          </div>
                        </div>
                      )}
                      {activeTab === "Quarterly" && (
                        <div className="row">
                          <div className="col font-pop-14">Quarterly</div>
                          <div className="col font-pop-12 d-flex justify-content-end align-items-center">
                            <i className="bi me-1 bi"></i>{" "}
                            {formatNumber(
                              Math.round(amounts.quarterlyAmount).toFixed(2)
                            )}
                          </div>
                        </div>
                      )}
                      {activeTab === "Half-Yearly" && (
                        <div className="row">
                          <div className="col font-pop-14">Half-Yearly</div>
                          <div className="col font-pop-12 d-flex justify-content-end align-items-center">
                            <i className="bi me-1 bi"></i>{" "}
                            {formatNumber(
                              Math.round(amounts.halfYearlyAmount).toFixed(2)
                            )}
                          </div>
                        </div>
                      )}
                      {activeTab === "Annual" && (
                        <div className="row">
                          <div className="col font-pop-14">Annual</div>
                          <div className="col font-pop-12 d-flex justify-content-end align-items-center">
                            <i className="bi me-1 bi"></i>{" "}
                            {formatNumber(
                              Math.round(amounts.annualAmount).toFixed(2)
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row mt-2">
                    <div className="row">
                      <div className="col font-pop-14">GST 18%</div>
                      <div className="col font-pop-12 d-flex justify-content-end align-items-center">
                        {activeTab === "Monthly" &&
                          formatNumber(addGst(amounts.monthlyAmount, 0.18))}
                        {activeTab === "Quarterly" &&
                          formatNumber(addGst(amounts.quarterlyAmount, 0.18))}
                        {activeTab === "Half-Yearly" &&
                          formatNumber(addGst(amounts.halfYearlyAmount, 0.18))}
                        {activeTab === "Annual" &&
                          formatNumber(addGst(amounts.annualAmount, 0.18))}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col font-pop-14 fw-600">Total Amount</div>
                      <div className="col font-pop-14 fw-700 right-align">
                        <i className="bi me-1 "></i>
                        {activeTab === "Monthly" &&
                          formatNumber(
                            amounts.monthlyAmount +
                              addGst(amounts.monthlyAmount, 0.18)
                          )}
                        {activeTab === "Quarterly" &&
                          formatNumber(
                            amounts.quarterlyAmount +
                              addGst(amounts.quarterlyAmount, 0.18)
                          )}
                        {activeTab === "Half-Yearly" &&
                          formatNumber(
                            amounts.halfYearlyAmount +
                              addGst(amounts.halfYearlyAmount, 0.18)
                          )}
                        {activeTab === "Annual" &&
                          formatNumber(
                            amounts.annualAmount +
                              addGst(amounts.annualAmount, 0.18)
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 d-flex justify-content-center">
                    <button
                      type="button"
                      className="font-pop-18  primary-btn"
                      onClick={handleSubmit}
                    >
                      Make Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Features;
