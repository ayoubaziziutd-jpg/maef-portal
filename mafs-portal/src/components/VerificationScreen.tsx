import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { submitApplication } from '../lib/supabase';

interface VerificationScreenProps {
  onSubmit: () => void;
  onBack: () => void;
}

const LEGAL_TEXT = `MOROCCAN AMERICAN FINANCIAL SUPPORT (MAFS)
MEMBERSHIP APPLICATION — LEGAL AGREEMENT & DISCLOSURES

IMPORTANT: PLEASE READ THIS ENTIRE DOCUMENT CAREFULLY BEFORE PROCEEDING.

1. NATURE OF THIS ORGANIZATION
MAFS is a community-based mutual aid organization operating as a fraternal benefit society under applicable state law. MAFS IS NOT AN INSURANCE COMPANY and does not provide insurance products as defined by state or federal law. Benefits provided are discretionary mutual aid payments made by the community pool and are not guaranteed. The term "coverage" used throughout this portal refers to the maximum mutual aid benefit available, not an insurance policy. No "policy" exists. Members receive a Benefit Certificate, not an insurance contract.

2. NOT A SUBSTITUTE FOR INSURANCE
Membership in MAFS does not replace, and should not be treated as a substitute for, health insurance, life insurance, property insurance, or any other form of licensed insurance coverage. Members are strongly encouraged to maintain separate licensed insurance coverage for all insurable risks.

3. BACKGROUND & CREDIT SCREENING AUTHORIZATION
By proceeding with this application, you authorize MAFS to conduct, or engage a third-party consumer reporting agency to conduct, the following checks on your behalf:
  (a) Criminal history background check — including but not limited to felony convictions, fraud, financial crimes, and crimes of moral turpitude. Any criminal history, including that of members of your immediate household sharing the same last name, may render you ineligible for membership.
  (b) Credit and financial screening — including review of your credit report, FICO score, debt-to-income ratio, and public records relating to bankruptcies, judgments, and liens. This screening is used solely to determine your membership tier and estimated contribution level.
  (c) Bankruptcy records check — Applicants currently in active bankruptcy proceedings (Chapter 7, 11, or 13) are ineligible for membership. Prior discharged bankruptcies will be considered in tier determination.

These checks are conducted pursuant to the Fair Credit Reporting Act (FCRA). You have the right to receive a copy of your report and to dispute inaccurate information.

4. ELIGIBILITY REQUIREMENTS
To be eligible for MAFS membership you must:
  • Be at least 18 years of age
  • Reside legally within the United States
  • Pass all background, credit, and bankruptcy checks as described above
  • Not have any active or pending criminal charges related to fraud, theft, or financial crimes
  • Not be currently enrolled in active bankruptcy proceedings
  • Agree to and abide by all community participation expectations

5. TIER DETERMINATION & PRICING
Your membership tier and monthly contribution will be determined by MAFS staff following review of your application and screening reports. Pricing is calculated using actuarial models similar to those employed in the insurance industry, taking into account your age, credit profile, and financial standing. Estimated pricing shown in the calculator is for informational purposes only and does not constitute a binding offer. Final pricing will be communicated upon approval.

6. DISCRETIONARY BENEFITS
All mutual aid payments are discretionary. MAFS reserves the right to deny, reduce, or delay any benefit payment based on available fund reserves, the nature of the claimed event, and compliance with membership terms. Benefit certificates are not legally enforceable contracts.

7. DATA PRIVACY
All personal information, financial data, and screening reports collected during the application process are kept strictly confidential and are accessible only to authorized MAFS staff. Data is not sold or shared with third parties except as required by law or to conduct authorized background checks.

8. COMMUNITY PARTICIPATION
Members are expected to participate in good faith in the community mutual aid system, including timely payment of monthly contributions. Failure to maintain contributions may result in suspension or termination of benefit eligibility without refund of prior contributions.

9. HERITAGE DISCOUNT PROGRAM
Upon approval of membership, members of Moroccan heritage (defined as having at least one parent or grandparent of Moroccan origin, or being married to a person of Moroccan origin) may apply for a heritage discount through their member profile. Supporting documentation will be required and reviewed by MAFS staff. Membership itself is open to all eligible applicants regardless of heritage.

10. ACKNOWLEDGMENT
By checking the box below and submitting this application, you confirm that:
  • You have read and understood this entire agreement
  • All information you provide is accurate and complete to the best of your knowledge
  • You authorize MAFS to conduct the background and credit checks described above
  • You understand that membership approval is not guaranteed and is subject to staff review
  • You agree to be bound by MAFS community participation expectations`;

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onSubmit, onBack }) => {
  const [agreed, setAgreed] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '' });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setScrolledToBottom(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormComplete = form.firstName && form.lastName && form.email && form.address && form.city && form.state && form.zip;

  const handleSubmit = async () => {
    try {
      await submitApplication({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
      });
    } catch {
      // Supabase not yet configured — still proceed for demo purposes
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your membership application has been received. MAFS staff will review your background and credit screening results and notify you of your approval status and tier assignment. This process typically takes 3–5 business days.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm font-medium">You may continue exploring the member portal while your application is under review.</p>
          </div>
          <button onClick={onSubmit} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors">
            Continue to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-emerald-700">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-1">Verification Screen</h2>
            <p className="text-gray-500 text-sm">Read the full agreement below, fill in your details, and submit your application.</p>
          </div>

          {/* Legal Agreement Scroll Box */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Legal Agreement & Disclosures</h3>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-64 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-4 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-mono"
            >
              {LEGAL_TEXT}
            </div>
            {!scrolledToBottom && (
              <div className="flex items-center gap-2 mt-2 text-amber-600 text-xs">
                <AlertCircle size={14} />
                <span>Please scroll to the bottom to read the full agreement before agreeing.</span>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 col-span-2" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 col-span-2" />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Street Address *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 col-span-2" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <div className="flex gap-2">
                <input name="state" value={form.state} onChange={handleChange} placeholder="State *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-1/2" />
                <input name="zip" value={form.zip} onChange={handleChange} placeholder="ZIP *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-1/2" />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Identity Document Upload</h3>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-emerald-500 transition-colors">
              <Upload className="text-gray-400 mb-2" size={24} />
              <span className="text-sm text-gray-500">Click to upload a government-issued ID</span>
              <span className="text-xs text-gray-400 mt-1">(Driver's License, Passport, State ID)</span>
              <input type="file" className="hidden" accept="image/*,.pdf" />
            </label>
          </div>

          {/* Agreement Checkbox */}
          <button
            onClick={() => scrolledToBottom && setAgreed(!agreed)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              agreed ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'
            } ${!scrolledToBottom ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${agreed ? 'bg-emerald-600 border-emerald-600' : 'border-gray-400'}`}>
              {agreed && <CheckCircle2 className="text-white" size={14} />}
            </div>
            <span className="text-sm text-gray-700 font-medium">
              I have read, understood, and agree to the MAFS Legal Agreement & Disclosures above, and I authorize the background, credit, and bankruptcy screening described therein.
            </span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={!agreed || !isFormComplete}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              agreed && isFormComplete ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Submit Application <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationScreen;
