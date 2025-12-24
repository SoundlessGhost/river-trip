"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";

interface ParticipantCount {
  adults: number;
  children: number;
  infants: number;
}

interface FormData {
  fullName: string;
  mobileNumber: string;
  participationType: "single" | "family" | "";
  totalParticipants: string;
  participantBreakdown: ParticipantCount;
  culturalInterest: string[];
  sportsInterest: string;
  contributionAgreement: string;
  sponsorshipAgreement: string;
  volunteerInterest: string;
  paymentReference: string;
  comments: string;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
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
    paymentReference: "",
    comments: "",
  });

  const [showBreakdown, setShowBreakdown] = useState(false);

  const culturalOptions = [
    "গান",
    "আবৃত্তি",
    "নৃত্য",
    "ভাওয়াইয়া / দেশাত্মবোধক গান",
  ];

  const handleParticipationTypeChange = (value: "single" | "family") => {
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

    // Ensure adults count is at least 1
    if (type === "adults" && newValue < 1) return;

    setFormData({
      ...formData,
      participantBreakdown: {
        ...formData.participantBreakdown,
        [type]: newValue,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    alert("ফর্ম সফলভাবে জমা হয়েছে!");
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
      paymentReference: "",
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

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-cyan-700 mb-8">
          বুকিং ফর্ম
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              পূর্ণ নাম <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
              className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-gray-200 focus:ring-1 focus:ring-gray-200 focus:outline-none"
              placeholder="আপনার পূর্ণ নাম লিখুন"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <label
              htmlFor="mobileNumber"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              মোবাইল নম্বর <span className="text-red-500">*</span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData({ ...formData, mobileNumber: e.target.value })
              }
              required
              className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-gray-200 focus:ring-1 focus:ring-gray-200 focus:outline-none"
              placeholder="০১XXXXXXXXX"
            />
          </div>

          {/* Participation Type */}
          <div className="space-y-3">
            <label className="mb-2 block text-sm font-medium text-gray-600">
              অংশগ্রহণের ধরন <span className="text-red-500">*</span>
            </label>
            <RadioGroup
              value={formData.participationType}
              onValueChange={handleParticipationTypeChange}
              className="flex space-x-6"
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="cursor-pointer">
                  একক
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="family" id="family" />
                <Label htmlFor="family" className="cursor-pointer">
                  পরিবারসহ
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Total Participants */}
          <div className="space-y-2">
            <label
              htmlFor="totalParticipants"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              মোট অংশগ্রহণকারী সংখ্যা (নিজসহ){" "}
              <span className="text-red-500">*</span>
            </label>

            <Select
              value={formData.totalParticipants}
              onValueChange={handleTotalParticipantsChange}
              disabled={
                formData.participationType !== "family" ||
                !formData.participationType
              }
              required={formData.participationType === "family"}
            >
              <SelectTrigger className="w-full p-4 rounded-md border border-gray-300 shadow-sm">
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
          </div>

          {/* Participant Breakdown */}
          {/* Participant Breakdown */}
          {showBreakdown &&
            formData.participationType === "family" &&
            formData.totalParticipants && (
              <div className="space-y-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <h3 className="font-semibold text-base text-cyan-800">
                  অংশগ্রহণকারীদের বিস্তারিত
                </h3>

                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">প্রাপ্তবয়স্ক</p>
                    <p className="text-xs text-gray-600">13 বছর এবং তার পরে</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateParticipantCount("adults", false)}
                      disabled={formData.participantBreakdown.adults <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">
                      {formData.participantBreakdown.adults}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateParticipantCount("adults", true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">শিশু</p>
                    <p className="text-xs text-gray-600">৬-১২ বছর</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateParticipantCount("children", false)}
                      disabled={formData.participantBreakdown.children === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">
                      {formData.participantBreakdown.children}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateParticipantCount("children", true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">শিশু</p>
                    <p className="text-xs text-gray-600">৫ বছরের নিচে</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateParticipantCount("infants", false)}
                      disabled={formData.participantBreakdown.infants === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">
                      {formData.participantBreakdown.infants}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateParticipantCount("infants", true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {!isParticipantBreakdownValid() && (
                  <p className="text-sm text-red-600 mt-2">
                    মোট সংখ্যা {formData.totalParticipants} হতে হবে
                  </p>
                )}
              </div>
            )}

          {/* Cultural Interest */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              সাংস্কৃতিক অনুষ্ঠানে অংশগ্রহণে আগ্রহী কি?
            </Label>
            <div className="space-y-2">
              {culturalOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={formData.culturalInterest.includes(option)}
                  />
                  <Label
                    htmlFor={option}
                    className="font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sports Interest */}
          {/* <div className="space-y-3">
            <Label className="text-base font-semibold">
              খেলায় অংশগ্রহণ করতে ইচ্ছুক?
            </Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, sportsInterest: "yes" })
                }
                className={`flex-1 py-3 px-6 border-2 rounded-md font-medium transition-colors ${
                  formData.sportsInterest === "yes"
                    ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                হ্যাঁ
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, sportsInterest: "no" })
                }
                className={`flex-1 py-3 px-6 border-2 rounded-md font-medium transition-colors ${
                  formData.sportsInterest === "no"
                    ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                না
              </button>
            </div>
          </div> */}

          {/* Sports Interest */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              খেলায় অংশগ্রহণ করতে ইচ্ছুক?
            </Label>
            <RadioGroup
              value={formData.sportsInterest}
              onValueChange={(value) =>
                setFormData({ ...formData, sportsInterest: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="sports-yes" />
                <Label
                  htmlFor="sports-yes"
                  className="font-normal cursor-pointer"
                >
                  হ্যাঁ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="sports-no" />
                <Label
                  htmlFor="sports-no"
                  className="font-normal cursor-pointer"
                >
                  না
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Contribution Agreement */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              আনুমানিক অংশগ্রহণ চাঁদা প্রদান করতে সম্মত আছেন কি?
            </Label>
            <RadioGroup
              value={formData.contributionAgreement}
              onValueChange={(value) =>
                setFormData({ ...formData, contributionAgreement: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="contribution-yes" />
                <Label
                  htmlFor="contribution-yes"
                  className="font-normal cursor-pointer"
                >
                  হ্যাঁ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="contribution-no" />
                <Label
                  htmlFor="contribution-no"
                  className="font-normal cursor-pointer"
                >
                  না
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sponsorship Agreement */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              কোনো স্পন্সর বা অনুদান বা উপহার প্রদান করতে সম্মত আছেন কি?
            </Label>
            <RadioGroup
              value={formData.sponsorshipAgreement}
              onValueChange={(value) =>
                setFormData({ ...formData, sponsorshipAgreement: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="sponsorship-yes" />
                <Label
                  htmlFor="sponsorship-yes"
                  className="font-normal cursor-pointer"
                >
                  হ্যাঁ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="sponsorship-no" />
                <Label
                  htmlFor="sponsorship-no"
                  className="font-normal cursor-pointer"
                >
                  না
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Volunteer Interest */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              আয়োজনে স্বেচ্ছাসেবক হিসেবে কাজ করতে আগ্রহী কি?
            </Label>
            <RadioGroup
              value={formData.volunteerInterest}
              onValueChange={(value) =>
                setFormData({ ...formData, volunteerInterest: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="volunteer-yes" />
                <Label
                  htmlFor="volunteer-yes"
                  className="font-normal cursor-pointer"
                >
                  হ্যাঁ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="volunteer-no" />
                <Label
                  htmlFor="volunteer-no"
                  className="font-normal cursor-pointer"
                >
                  না
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Reference */}
          <div className="space-y-2">
            <Label
              htmlFor="paymentReference"
              className="text-base font-semibold"
            >
              Payment Reference/TrxID
            </Label>
            <Input
              id="paymentReference"
              value={formData.paymentReference}
              onChange={(e) =>
                setFormData({ ...formData, paymentReference: e.target.value })
              }
              className="text-base"
              placeholder="পেমেন্ট রেফারেন্স নম্বর লিখুন"
            />
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-base font-semibold">
              মন্তব্য / প্রস্তাব (যদি থাকে)
            </Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              className="text-base min-h-24"
              placeholder="আপনার মন্তব্য বা প্রস্তাব লিখুন"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-6 text-base"
            >
              সাবমিট করুন
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="flex-1 border-cyan-600 text-cyan-600 hover:bg-cyan-50 font-semibold py-6 text-base"
            >
              ক্লিয়ার করুন
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
