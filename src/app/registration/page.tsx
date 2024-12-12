/* eslint-disable @next/next/no-img-element */
"use client"; // Ensure client-side rendering

import { useState, useEffect } from "react";
import GeneralDetails from "../generalDetails/page";
import Features from "../features/page";
import Link from "next/link";

export default function Registration() {
  const [stepper, setStepper] = useState({
    generalDetailsStepperStatus: "inactive",
    featuresStepperStatus: "inactive",
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const storedStepper = {
        generalDetailsStepperStatus:
          localStorage.getItem("generalDetailsStepperStatus") || "active",
        featuresStepperStatus:
          localStorage.getItem("featuresStepperStatus") || "inactive",
      };
      setStepper(storedStepper);
    }
  }, [isMounted]);

  const handleNextStep = () => {
    if (stepper.generalDetailsStepperStatus === "active") {
      localStorage.setItem("generalDetailsStepperStatus", "completed");
      localStorage.setItem("featuresStepperStatus", "active");
      setStepper({
        generalDetailsStepperStatus: "completed",
        featuresStepperStatus: "active",
      });
    }
  };

  const handleStepClick = (step) => {
    if (step === "generalDetails") {
      setStepper({
        generalDetailsStepperStatus: "active",
        featuresStepperStatus: "inactive",
      });
      localStorage.setItem("generalDetailsStepperStatus", "active");
      localStorage.setItem("featuresStepperStatus", "inactive");
    } else if (step === "features") {
      setStepper({
        generalDetailsStepperStatus: "completed",
        featuresStepperStatus: "active",
      });
      localStorage.setItem("generalDetailsStepperStatus", "completed");
      localStorage.setItem("featuresStepperStatus", "active");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="bg p-3 overflow-y-auto">
      {stepper.generalDetailsStepperStatus === "active" && (
        <p className="text-black text-center font-pop-18 fw-600">
          Streamline Your Payroll: Register with Ease!
        </p>
      )}
      {stepper.featuresStepperStatus === "active" && (
        <p className="text-black text-center font-pop-18 fw-600">
          Unlock Efficiency: Discover the Power of Advanced Resolvepay
          Features!
        </p>
      )}
      <div className="stepper-wrapper mb-3">
        <div
          className={`stepper-item ${
            stepper.generalDetailsStepperStatus === "active" ||
            stepper.generalDetailsStepperStatus === "completed"
              ? "active"
              : "inactive"
          } cursor`}
          onClick={() => handleStepClick("generalDetails")}
        >
          <div className="step-counter">
            {stepper.generalDetailsStepperStatus === "completed" ? (
              <div className="stepper-completed">
                <img src="/checkmark.svg" alt="Completed" />
              </div>
            ) : (
              <Link href="/registration" className="stepper-link">
                <div
                  className={
                    stepper.generalDetailsStepperStatus === "active"
                      ? "step-number-selected"
                      : "step-number"
                  }
                >
                  1
                </div>
              </Link>
            )}
          </div>
          <div className="step-name font-pop-14 fw-500">General details</div>
        </div>

        <div
          className={`stepper-item ${
            stepper.featuresStepperStatus === "active" ||
            stepper.featuresStepperStatus === "completed"
              ? "active"
              : "inactive"
          } ${
            stepper.featuresStepperStatus === "inactive"
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          onClick={() =>
            stepper.featuresStepperStatus === "active" &&
            handleStepClick("features")
          }
        >
          <div className="step-counter">
            {stepper.featuresStepperStatus === "completed" ? (
              <div className="stepper-completed">
                <img src="/checkmark.svg" alt="Completed" />
              </div>
            ) : (
              <Link href="/registration" className="stepper-link">
                <div
                  className={
                    stepper.featuresStepperStatus === "active"
                      ? "step-number-selected"
                      : "step-number"
                  }
                >
                  2
                </div>
              </Link>
            )}
          </div>
          <div className="step-name font-pop-14 fw-500">Features</div>
        </div>
      </div>
      <div>
        {stepper.generalDetailsStepperStatus === "active" && (
          <GeneralDetails onNext={handleNextStep} />
        )}
        {stepper.featuresStepperStatus === "active" && (
          <Features onNext={handleNextStep}  />
        )}
      </div>
    </div>
  );
}
