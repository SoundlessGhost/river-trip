"use client";
import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
// import DownloadCSVButton from "./DownloadCSV";
// import DownloadCSVButton from "./DownloadCSV";

interface ParticipantCount {
  adults: number;
  children: number;
  infants: number;
}

interface FormData {
  email: string;
  fullName: string;
  mobileNumber: string;
  participationType: "single" | "family" | "Guest" | "";
  totalParticipants: string;
  participantBreakdown: ParticipantCount;
}

interface FormErrors {
  email?: string;
  fullName?: string;
  mobileNumber?: string;
  participationType?: string;
  totalParticipants?: string;
}

export default function NadiYatraForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobileNumber: "",
    email: "",
    participationType: "single",
    totalParticipants: "1",
    participantBreakdown: {
      adults: 1,
      children: 0,
      infants: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleParticipationTypeChange = (
    value: "single" | "family" | "Guest"
  ) => {
    setFormData({
      ...formData,
      participationType: value,
      totalParticipants: value === "single" ? "1" : "2",
      participantBreakdown: {
        adults: 1,
        children: 0,
        infants: 0,
      },
    });
    setShowBreakdown(value !== "single");
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

    const totalAmount = calculateTotalAmount();
    const paymentPayload = {
      ...formData,
      amount: totalAmount,
    };

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
        const paymentResponse = result.data;
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
      email: "",
      fullName: "",
      mobileNumber: "",
      participationType: "",
      totalParticipants: "",
      participantBreakdown: {
        adults: 1,
        children: 0,
        infants: 0,
      },
    });
    setShowBreakdown(false);
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
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header - Fully Responsive */}
        <div className="bg-linear-to-r text-center from-emerald-600 to-teal-600 rounded-t-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-white p-1 shadow-md">
              <Image
                src="/rangpur-logo.jpeg"
                alt="রংপুর জেলা সমিতি লোগো"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
          </div>
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

          {/* Email section */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              ইমেইল <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@gmail.com"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none border-gray-300 focus:ring-2 focus:ring-emerald-500 transition text-sm sm:text-base"
            />
          </div>

          {/* Participation Type - Responsive Layout */}
          <div className="space-y-3 mb-4">
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
                  অতিথি
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Participant Breakdown - Responsive */}
          {showBreakdown &&
            (formData.participationType === "family" ||
              formData.participationType === "Guest") &&
            formData.totalParticipants && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="font-semibold text-sm sm:text-base text-cyan-800">
                    অংশগ্রহণকারীদের বিস্তারিত
                  </h3>
                  <div className="bg-emerald-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                    <span className="font-bold text-sm sm:text-base">
                      মোট:{" "}
                      {formData.participantBreakdown.adults +
                        formData.participantBreakdown.children +
                        formData.participantBreakdown.infants}{" "}
                      জন
                    </span>
                  </div>
                </div>

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

          <p className="text-[10px]">
            ( জেলা সমিতির সদস্য হিসেবে অন্তর্ভুক্ত না হলে অতিথি হিসেবে নিবন্ধন
            করুন )
          </p>
          {/* <DownloadCSVButton /> */}

          {/* Total Amount - Responsive */}
          <div className="mt-2 sm:mt-5 p-3 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-200">
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
              type="button"
              onClick={handleSubmit}
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

          <p className="text-xs">
            জেলা সমিতির সদস্য অন্তর্ভুক্তি ফি: সাধারণ সদস্য:{" "}
            <span className="font-bold">১,০০০/- </span> এবং আজীবন সদস্য:{" "}
            <span className="font-bold">১০,০০০/- </span>
          </p>
          <p className="text-xs -mt-4">
            যোগাযোগ: তারিকুল ইসলাম: 01737 097454 এবং মো: মোস্তাকিম খান: 01519
            866666
          </p>
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
    </div>
  );
}
