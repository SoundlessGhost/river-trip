"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { MakePaymentResponse } from "shurjopay-js";
import { AlertCircle, CheckCircle2, Minus, Plus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ParticipantCount {
  adults: number;
  children: number;
  infants: number;
}

interface FormData {
  fullName: string;
  mobileNumber: string;
  participationType: "single" | "family" | "Guest" | "";
  totalParticipants: string;
  participantBreakdown: ParticipantCount;
  culturalInterest: string[];
  sportsInterest: string;
  contributionAgreement: string;
  sponsorshipAgreement: string;
  volunteerInterest: string;
  comments: string;
}

interface FormErrors {
  fullName?: string;
  mobileNumber?: string;
  participationType?: string;
  totalParticipants?: string;
}

export default function NadiYatraForm2() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobileNumber: "",
    participationType: "single",
    totalParticipants: "1",
    participantBreakdown: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    culturalInterest: [],
    sportsInterest: "",
    contributionAgreement: "",
    sponsorshipAgreement: "",
    volunteerInterest: "",
    comments: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const culturalOptions: string[] = [
    "গান",
    "আবৃত্তি",
    "নৃত্য",
    "ভাওয়াইয়া / লোকসংগীত",
    "অন্যান্য",
  ];

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

  const handleParticipationTypeChange = (
    value: "single" | "family" | "Guest"
  ) => {
    setFormData({
      ...formData,
      participationType: value,
      totalParticipants: value === "single" ? "1" : "",
      participantBreakdown: {
        adults: 1,
        children: 0,
        infants: 0,
      },
    });
    setShowBreakdown(false);
  };

  const handleTotalParticipantsChange = (value: string) => {
    setFormData({
      ...formData,
      totalParticipants: value,
    });
    setShowBreakdown(true);
  };

  const updateParticipantCount = (
    type: keyof ParticipantCount,
    increment: boolean
  ) => {
    const currentValue = formData.participantBreakdown[type];
    const newValue = increment
      ? currentValue + 1
      : Math.max(0, currentValue - 1);

    if (type === "adults" && newValue < 1) return;

    setFormData({
      ...formData,
      participantBreakdown: {
        ...formData.participantBreakdown,
        [type]: newValue,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newErrors: FormErrors = {};

    if (
      (formData.participationType === "family" ||
        formData.participationType === "Guest") &&
      !isParticipantBreakdownValid()
    ) {
      newErrors.totalParticipants = "মোট অংশগ্রহণকারীদের সংখ্যা মিলছে না।";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const totalAmount = calculateTotalAmount();

    const paymentPayload = {
      ...formData,
      sportsInterest: formData.sportsInterest || "না",
      contributionAgreement: formData.contributionAgreement || "না",
      sponsorshipAgreement: formData.sponsorshipAgreement || "না",
      volunteerInterest: formData.volunteerInterest || "না",
      amount: totalAmount,
    };

    console.log(paymentPayload);

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const paymentResponse: MakePaymentResponse = result.data;
        window.location.href = paymentResponse.checkout_url;
      } else {
        setError(result.error || "Payment initiation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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

  const handleClear = () => {
    setFormData({
      fullName: "",
      mobileNumber: "",
      participationType: "",
      totalParticipants: "",
      participantBreakdown: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      culturalInterest: [],
      sportsInterest: "",
      contributionAgreement: "",
      sponsorshipAgreement: "",
      volunteerInterest: "",
      comments: "",
    });
    setShowBreakdown(false);
  };

  const isParticipantBreakdownValid = () => {
    const total =
      formData.participantBreakdown.adults +
      formData.participantBreakdown.children +
      formData.participantBreakdown.infants;
    return total === parseInt(formData.totalParticipants || "0");
  };

  const calculateTotalAmount = () => {
    const { adults, children, infants } = formData.participantBreakdown;
    let adultPrice = 0;
    let childPrice = 0;
    let infantPrice = 0;

    if (formData.participationType === "Guest") {
      adultPrice = 1500;
      childPrice = 800;
      infantPrice = 0;
    } else {
      adultPrice = 1000;
      childPrice = 800;
      infantPrice = 0;
    }

    const totalAmount =
      adults * adultPrice + children * childPrice + infants * infantPrice;

    return totalAmount;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-4 sm:py-8 px-3 sm:px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header - Fully Responsive */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 rounded-t-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            নদী যাত্রা ২০২৬
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base md:text-lg">
            আয়োজনকৃতঃ রংপুর জেলা সমিতি, ঢাকা
          </p>
          <p className="text-emerald-100 mt-1 sm:mt-2 text-xs sm:text-sm">
            তারিখঃ ১৭ জানুয়ারি ২০২৬ (শনিবার)
          </p>
          <p className="text-emerald-100 text-xs sm:text-sm">
            নদী মেঘনার জলরাশিতে শেকড়ের মিলনমেলা
          </p>
          <p className="text-emerald-200 font-semibold mt-2 sm:mt-3 text-sm sm:text-base">
            সদস্য অংশগ্রহণ ফরম
          </p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              পূর্ণ নাম <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none border-gray-300 focus:ring-2 focus:ring-emerald-500 transition text-sm sm:text-base"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              মোবাইল নম্বর <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none border-gray-300 focus:ring-2 focus:ring-emerald-500 transition text-sm sm:text-base"
            />
          </div>

          {/* Participation Type - Responsive Layout */}
          <div className="space-y-3">
            <Label className="text-sm sm:text-base font-semibold">
              অংশগ্রহণের ধরন <span className="text-red-500">*</span>
            </Label>

            <RadioGroup
              value={formData.participationType}
              onValueChange={handleParticipationTypeChange}
              className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label
                  htmlFor="single"
                  className="cursor-pointer text-sm sm:text-base"
                >
                  একক <span className="text-xs">( রংপুর )</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="family" id="family" />
                <Label
                  htmlFor="family"
                  className="cursor-pointer text-sm sm:text-base"
                >
                  পরিবারসহ <span className="text-xs">( রংপুর )</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Guest" id="Guest" />
                <Label
                  htmlFor="Guest"
                  className="cursor-pointer text-sm sm:text-base"
                >
                  অথিতি
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Total Participants */}
          <div className="space-y-2">
            <Label
              htmlFor="totalParticipants"
              className="text-sm sm:text-base font-semibold"
            >
              মোট অংশগ্রহণকারী সংখ্যা (নিজসহ){" "}
              <span className="text-red-500">*</span>
            </Label>

            <Select
              value={formData.totalParticipants}
              onValueChange={handleTotalParticipantsChange}
              disabled={formData.participationType === "single"}
              required={
                formData.participationType === "family" ||
                formData.participationType === "Guest"
              }
            >
              <SelectTrigger className="w-full p-3 sm:p-4 rounded-md border border-gray-300 shadow-sm text-sm sm:text-base">
                <SelectValue placeholder="নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.totalParticipants && (
              <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
                {errors.totalParticipants}
              </p>
            )}
          </div>

          {/* Participant Breakdown - Responsive */}
          {showBreakdown &&
            (formData.participationType === "family" ||
              formData.participationType === "Guest") &&
            formData.totalParticipants && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <h3 className="font-semibold text-sm sm:text-base text-cyan-800">
                  অংশগ্রহণকারীদের বিস্তারিত
                </h3>

                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      প্রাপ্তবয়স্ক
                    </p>
                    <p className="text-xs text-gray-600">13 বছর এবং তার পরে</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                      onClick={() => updateParticipantCount("adults", false)}
                      disabled={formData.participantBreakdown.adults <= 1}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                      {formData.participantBreakdown.adults}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                      onClick={() => updateParticipantCount("adults", true)}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm sm:text-base">শিশু</p>
                    <p className="text-xs text-gray-600">৬-১২ বছর</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                      onClick={() => updateParticipantCount("children", false)}
                      disabled={formData.participantBreakdown.children === 0}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                      {formData.participantBreakdown.children}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                      onClick={() => updateParticipantCount("children", true)}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm sm:text-base">শিশু</p>
                    <p className="text-xs text-gray-600">৫ বছরের নিচে</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                      onClick={() => updateParticipantCount("infants", false)}
                      disabled={formData.participantBreakdown.infants === 0}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                      {formData.participantBreakdown.infants}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                      onClick={() => updateParticipantCount("infants", true)}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* Cultural Interest - Responsive */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">
              সাংস্কৃতিক অনুষ্ঠানে অংশগ্রহণে আগ্রহী কি?
            </label>
            <div className="space-y-2">
              {culturalOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleCheckboxChange(option)}
                  className={`flex items-center p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.culturalInterest.includes(option)
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center ${
                      formData.culturalInterest.includes(option)
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.culturalInterest.includes(option) && (
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    )}
                  </div>
                  <span className="ml-2 sm:ml-3 text-gray-700 text-sm sm:text-base">
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sports Interest */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">
              খেলায় অংশগ্রহণ করতে ইচ্ছুক?
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() => handleRadioChange("sportsInterest", option)}
                  className={`flex items-center p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.sportsInterest === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.sportsInterest === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.sportsInterest === option && (
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-2 sm:ml-3 text-gray-700 text-sm sm:text-base">
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contribution Agreement */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">
              আনুমানিক অংশগ্রহণে টাকা প্রদান করতে সম্মত আছেন কি?
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() =>
                    handleRadioChange("contributionAgreement", option)
                  }
                  className={`flex items-center p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.contributionAgreement === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.contributionAgreement === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.contributionAgreement === option && (
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-2 sm:ml-3 text-gray-700 text-sm sm:text-base">
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsorship Agreement */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">
              কোনো স্পন্সর বা অনুদান বা উপহার প্রদান করতে সম্মত আছেন কি?{" "}
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() =>
                    handleRadioChange("sponsorshipAgreement", option)
                  }
                  className={`flex items-center p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.sponsorshipAgreement === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.sponsorshipAgreement === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.sponsorshipAgreement === option && (
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-2 sm:ml-3 text-gray-700 text-sm sm:text-base">
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer Interest */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">
              আয়োজনে স্বেচ্ছাসেবক হিসেবে কাজ করতে আগ্রহী কি?
            </label>
            <div className="space-y-2">
              {["হ্যাঁ", "না"].map((option) => (
                <div
                  key={option}
                  onClick={() => handleRadioChange("volunteerInterest", option)}
                  className={`flex items-center p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.volunteerInterest === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:bg-emerald-50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.volunteerInterest === option
                        ? "border-emerald-600"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.volunteerInterest === option && (
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-600"></div>
                    )}
                  </div>
                  <span className="ml-2 sm:ml-3 text-gray-700 text-sm sm:text-base">
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              মতামত / প্রত্যাশা (যদি থাকে)
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none text-sm sm:text-base"
              placeholder="আপনার উত্তর"
            />
          </div>

          {/* Total Amount - Responsive */}
          <div className="mt-6 sm:mt-10 p-3 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
              মোট পরিমাণ
            </h4>
            <p className="text-gray-700 text-lg sm:text-xl font-bold ">
              টাকার পরিমাণ: {calculateTotalAmount()} টাকা
            </p>
          </div>

          {/* Submit Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-linear-to-r cursor-pointer from-emerald-600 to-teal-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition transform hover:scale-105 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 border-2 cursor-pointer border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700 text-sm sm:text-base"
            >
              ফর্ম মুছুন
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mt-4 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm">
          <p>© ২০২৬ রংপুর জেলা সমিতি, ঢাকা</p>
        </div>
      </div>
    </form>
  );
}
