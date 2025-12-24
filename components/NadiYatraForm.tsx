"use client";
import React, { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormData {
  fullName: string;
  mobile: string;
  participationType: string;
  totalParticipants: string;
  haveChildren: string;
  childrenAge: string;
  culturalInterest: string[];
  wantSports: string;
  supportProgram: string;
  giftDonation: string;
  volunteer: string;
  paymentRef: string;
  comments: string;
}

interface FormErrors {
  fullName?: string;
  mobile?: string;
  participationType?: string;
  totalParticipants?: string;
  paymentRef?: string;
}

export default function NadiYatraForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobile: "",
    participationType: "",
    totalParticipants: "",
    haveChildren: "",
    childrenAge: "",
    culturalInterest: [],
    wantSports: "",
    supportProgram: "",
    giftDonation: "",
    volunteer: "",
    paymentRef: "",
    comments: "",
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const countOptions: string[] = [
    "১",
    "২",
    "৩",
    "৪",
    "৫",
    "৬",
    "৭",
    "৮",
    "৯",
    "১০",
  ];

  const culturalOptions: string[] = [
    "গান",
    "আবৃত্তি",
    "নৃত্য",
    "ভাওয়াইয়া / লোকসংগীত",
    "অন্যান্য",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRadioChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      culturalInterest: prev.culturalInterest.includes(value)
        ? prev.culturalInterest.filter((item) => item !== value)
        : [...prev.culturalInterest, value],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "পূর্ণ নাম আবশ্যক";
    if (!formData.mobile.trim()) newErrors.mobile = "মোবাইল নম্বর আবশ্যক";
    if (!formData.participationType)
      newErrors.participationType = "অংশগ্রহণের ধরন নির্বাচন করুন";
    if (!formData.totalParticipants)
      newErrors.totalParticipants = "সংখ্যা নির্বাচন করুন";
    if (!formData.paymentRef.trim())
      newErrors.paymentRef = "Payment Reference আবশ্যক";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    console.log("Form submitted:", formData);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: "",
        mobile: "",
        participationType: "",
        totalParticipants: "",
        haveChildren: "",
        childrenAge: "",
        culturalInterest: [],
        wantSports: "",
        supportProgram: "",
        giftDonation: "",
        volunteer: "",
        paymentRef: "",
        comments: "",
      });
    }, 3000);
  };

  const handleClear = () => {
    setFormData({
      fullName: "",
      mobile: "",
      participationType: "",
      totalParticipants: "",
      haveChildren: "",
      childrenAge: "",
      culturalInterest: [],
      wantSports: "",
      supportProgram: "",
      giftDonation: "",
      volunteer: "",
      paymentRef: "",
      comments: "",
    });
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            সফলভাবে জমা হয়েছে!
          </h2>
          <p className="text-gray-600">
            আপনার নিবন্ধন সম্পন্ন হয়েছে। ধন্যবাদ!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 rounded-t-2xl p-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-3">নদী যাত্রা ২০২৬</h1>
          <p className="text-emerald-50 text-lg">
            আয়োজনকৃতঃ রংপুর জেলা সমিতি, ঢাকা
          </p>
          <p className="text-emerald-100 mt-2">
            তারিখঃ ১৭ জানুয়ারি ২০২৬ (শনিবার)
          </p>
          <p className="text-emerald-100">
            নদী মেঘনার জলরাশিতে শেকড়ের মিলনমেলা
          </p>
          <p className="text-emerald-200 font-semibold mt-3">
            সদস্য অংশগ্রহণ ফরম
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-8 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              পূর্ণ নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="আপনার উত্তর"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.fullName}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              মোবাইল নম্বর <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.mobile ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="আপনার উত্তর"
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.mobile}
              </p>
            )}
          </div>

          {/* Attendee Type */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              অংশগ্রহণের ধরন <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {["একক", "পরিবারসহ"].map((option) => (
                <div
                  key={option}
                  onClick={() => handleRadioChange("participationType", option)}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.participationType === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.participationType === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.participationType === option && (
                      <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">{option}</span>
                </div>
              ))}
            </div>
            {errors.participationType && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.participationType}
              </p>
            )}
          </div>

          {/* Total Count */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              মোট অংশগ্রহণকারী সংখ্যা (নিজসহ){" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="totalParticipants"
              value={formData.totalParticipants}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition appearance-none bg-white ${
                errors.totalParticipants ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">বাছুন</option>
              {countOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            {errors.totalParticipants && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.totalParticipants}
              </p>
            )}
          </div>

          {/* Has Shirt */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              শিশু আছে কি?
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() => handleRadioChange("haveChildren", option)}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.haveChildren === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.haveChildren === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.haveChildren === option && (
                      <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shirt Reason */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              শিশু থাকলে বয়স?
            </label>
            <input
              type="text"
              name="childrenAge"
              value={formData.childrenAge}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="আপনার উত্তর"
            />
          </div>

          {/* Cultural Interest */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              সাংস্কৃতিক অনুষ্ঠানে অংশগ্রহণে আগ্রহী কি?
            </label>
            <div className="space-y-2">
              {culturalOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleCheckboxChange(option)}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.culturalInterest.includes(option)
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.culturalInterest.includes(option)
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.culturalInterest.includes(option) && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Want Sports */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              খেলায় অংশগ্রহণ করতে ইচ্ছুক?
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() => handleRadioChange("wantSports", option)}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.wantSports === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.wantSports === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.wantSports === option && (
                      <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support Program */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              আনুমানিক অংশগ্রহণে টাকা প্রদান করতে সম্মত আছেন কি?
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() => handleRadioChange("supportProgram", option)}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.supportProgram === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.supportProgram === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.supportProgram === option && (
                      <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gift Donation */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              কোনো স্পন্সর বা অনুদান বা উপহার প্রদান করতে সম্মত আছেন কি?{" "}
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() => handleRadioChange("giftDonation", option)}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.giftDonation === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.giftDonation === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.giftDonation === option && (
                      <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              আয়োজনে স্বেচ্ছাসেবক হিসেবে কাজ করতে আগ্রহী কি?
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() => handleRadioChange("volunteer", option)}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.volunteer === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.volunteer === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.volunteer === option && (
                      <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Payment Reference/TrxID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="paymentRef"
              value={formData.paymentRef}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.paymentRef ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="আপনার উত্তর"
            />
            {errors.paymentRef && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.paymentRef}
              </p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              মতামত / প্রত্যাশা (যদি থাকে)
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
              placeholder="আপনার উত্তর"
            />
          </div>

          {/* Payment Info Box */}
          <div className="bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              পেমেন্ট তথ্য
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">বিকাশ নম্বর:</span> 01794951003
              </p>
              <p>
                <span className="font-semibold">নগদ নম্বর:</span> 016254578414
              </p>
              <p>
                <span className="font-semibold">রকেট নম্বর:</span> 01235468795
              </p>
              <p className="text-sm text-amber-700 mt-3">
                * পেমেন্ট করার পর Transaction ID এই ফর্মে প্রদান করুন
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition transform hover:scale-105 shadow-lg"
            >
              জমা দিন
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
            >
              ফর্ম মুছুন
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>© ২০২৬ রংপুর জেলা সমিতি, ঢাকা</p>
        </div>
      </div>
    </div>
  );
}
