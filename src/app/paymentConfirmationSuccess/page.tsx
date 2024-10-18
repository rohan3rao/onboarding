"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  addAdminUser,
  createOrganizationMaster,
  disableMenuInfo,
  getMailCredential,
  saveGST,
  savePAN,
  savePaymentInfo,
  sendLoginInfoMail,
} from "../api_helpers";
import GeneralDetails from "../generalDetails/page";
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
type PlanData = {
  plan: string;
  totalAmount: string;
};
export default function PaymentSuccess() {
  const [profileDetails, setProfileDetails] = useState<OrganisationData | null>(
    null
  );
  const [planDetails, setPlanDetails] = useState<PlanData | null>(null);
  const [saveClientPaymentInfo, setPaymentInfo] = useState<null>(null);
  const [linkIdInfo, setLinkIdInfo] = useState<null>(null);
  const [userIds, setUserIds] = useState<number[]>([]);
  const currentDate = new Date();
  const [orgId, setOrgId] = useState<string | null>(null);
  const formattedDate = currentDate.toISOString().split("T")[0];
  //   const router = useRouter();
  const [companyEmail, setCompanyEmail] = useState("");

  useEffect(() => {
    // Retrieve CompanyInfo from local storage
    const storedCompanyInfo = localStorage.getItem("CompanyInfo");
    const CompanyInfo = storedCompanyInfo
      ? JSON.parse(storedCompanyInfo)
      : null;

    // Safely set the email state if available
    if (CompanyInfo?.email) {
      setCompanyEmail(CompanyInfo.email);
    }


  }, []);

  useEffect(() => {
    const generalDetails = localStorage.getItem("General Details");
    if (generalDetails) {
      setProfileDetails(JSON.parse(generalDetails));
    }
    const featureDetails = localStorage.getItem("formData");
    if (featureDetails) {
      setPlanDetails(JSON.parse(featureDetails));
    }

    const paymentDetails = localStorage.getItem("Payment Status");
    if (paymentDetails) {
      setPaymentInfo(JSON.parse(paymentDetails));
    }

    const linkId = localStorage.getItem("Link Id");
    if (linkId) {
      setLinkIdInfo(JSON.parse(linkId));
    }
  }, []);
  useEffect(() => {
    const fetchDetails = async () => {
      // Retrieve generalDetails and formData from local storage
      const storedDetails = localStorage.getItem("GeneralDetails");
      const generalDetails = storedDetails ? JSON.parse(storedDetails) : null;
      const formData = localStorage.getItem("formData");
      const data = formData ? JSON.parse(formData) : {};
      const getLinkIdInfo = (): any => {
        // Retrieve the item from localStorage
        const linkIdJson = localStorage.getItem("Link Id");

        // Safely parse the JSON if it's not null
        return linkIdJson ? JSON.parse(linkIdJson) : "";
      };

      const linkIdInfo = getLinkIdInfo();
      const sanitizedLinkId = linkIdInfo.replace(/^"|"$/g, "");

      const paymentDetails = localStorage.getItem("Payment Status");
      let paymentStatus = null;

      if (paymentDetails) {
        paymentStatus = JSON.parse(paymentDetails);
      }

      try {
        const userInfo = {
          name: generalDetails?.keyholderName || "",
          panCardNo: generalDetails?.panCardNo || "",
          gstNo: generalDetails?.gstNo || "",

          code: undefined,
          industry_id: "1",
          file: undefined,
          services: [1],
          type_id: 1,
          backgroundColor: null,
          effective_date: formattedDate,
        };

        const response = await createOrganizationMaster(userInfo);

        if (response) {
          const orgId = response.org_id;
          setOrgId(orgId);

          const adminInfo = {
            org_id: JSON.stringify(orgId),
            first_name: generalDetails?.keyholderName || "",
            email: generalDetails?.email || "",
            contact: [
              {
                mobile_no: generalDetails?.phoneNumber || "",
                is_otp: "0",
                is_whatsapp: "0",
              },
              {},
            ],
          };

          const user = await addAdminUser(adminInfo);

          if (user || !user) {
            const getMailInfo = await getMailCredential();

            const mail_users = getMailInfo.mail_users;
            const userIds = mail_users
              .filter((user: any) => user.org_id === orgId)
              .map((user: any) => user.user_id);

            setUserIds(userIds);

            const mailInfo = {
              process_id: "62",
              menu_id: "192",
              user_ids: userIds,
            };

            await sendLoginInfoMail(mailInfo);

          
            ///
            const panInfo = {
              org_id: JSON.stringify(orgId),
              pan_no: generalDetails?.panCardNo || 0,
            };

            localStorage.setItem("PanInfo", JSON.stringify(panInfo));
            console.log("Saving payment info with:", panInfo);

            await savePAN(panInfo);

            ///
            const gstInfo = {
              organization_id: JSON.stringify(orgId),

              gst_no: generalDetails?.gstNo || 0,
            };
            localStorage.setItem("GSTInfo", JSON.stringify(gstInfo));
            console.log("Saving payment info with:", gstInfo);

            await saveGST(gstInfo);
            /////
            const paymentInfo = {
              OrgId: JSON.stringify(orgId),
              BillingCycle: data?.plan || "",
              Amount: data?.totalAmount ? data.totalAmount.toString() : "0",
              Response: paymentStatus,
              linkId: sanitizedLinkId,
              taxableCount: generalDetails?.taxableEmployees || 0,
              nontaxablecount: generalDetails?.nonTaxableEmployees || 0,

              //  panCardNo: generalDetails?.nonTaxableEmployees || 0,
              // gstNo: generalDetails?.nonTaxableEmployees || 0,
            };
            localStorage.setItem("PaymentInfo", JSON.stringify(paymentInfo));
            console.log("Saving payment info with:", paymentInfo);

            await savePaymentInfo(paymentInfo);

            // Disable menu items based on formData (data from localStorage)
            console.log("Calling disableMenuInfo with org_id:", orgId);
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

           // console.log("Disable Menu Payload:", disableMenuPayload);
            await disableMenuInfo(disableMenuPayload); // Pass the payload to disableMenuInfo
            //console.log("disableMenuInfo API call successful");
          }
        }
      
      } catch (error) {
        console.error(
          "Error during organization creation or subsequent calls",
          error
        );
      }
    };

    fetchDetails();
    localStorage.clear()
  }, []);
  
  // Empty dependency array ensures this effect runs only once after the initial render
  // Empty dependency array ensures this runs only once when the component mounts

  // Removed profileDetails dependency

  return (
    <div className="bg p-3 overflow-y-auto d-flex justify-content-center align-items-center">
      <div className="col-sm-12 col-md-12 col-lg-5 col-xl-5">
        <div className="payment-confirmation-card">
          <div className="text-center">
            <div className="font-pop-36 fw-700 dark">Payment Successful</div>
            <div className="font-pop-12 fw-400 gray mt-1">
              Thank you for subscribing to our service{" "}
            </div>
          </div>
          <div className="pt-2 border-0">
            <div className="text-center">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="modal-note font-pop-12">
              Note :The login credentials has sent to an email {companyEmail}
            </div>
          </div>
          <div>
            <div className="font-pop-22 fw-700 mt-4 mb-2">
              Subscription Details
            </div>
            {/* <div className="row">
              <div className="col font-pop-16">Subscription Plan:</div>
              <div className="col font-pop-16 d-flex justify-content-end align-items-center">
                Plan Name
              </div>
            </div> */}
            <div className="row mt-2">
              <div className="col font-pop-16">Subscription Period:</div>
              <div className="col font-pop-16 d-flex justify-content-end align-items-center">
                {planDetails?.plan}
              </div>
            </div>
            <div className="row mt-2">
              <div className="col font-pop-16">Amount Paid:</div>
              <div className="col font-pop-16 fw-700 d-flex justify-content-end align-items-center">
                <i className="bi me-1 bi-currency-rupee"></i>{" "}
                {planDetails?.totalAmount}
              </div>
            </div>
          </div>
          <div className="footer mt-4">
            <div
              className="btn-primary me-3 cursor"
              onClick={() => {
                const externalUrl = "https://resolvepayroll.com/login/";
                window.open(externalUrl, "_blank");
              }}
            >
              Continue
            </div>
            {/* <div className="btn-primary">
                            Download Invoice
                        </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
