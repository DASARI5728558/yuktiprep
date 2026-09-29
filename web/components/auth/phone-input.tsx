"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function PhoneInput({
  value = "",
  onChange,
  disabled,
  error,
}: PhoneInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove everything except numbers
    const digits = e.target.value.replace(/\D/g, "");

    // Keep only 10 digits
    const mobileNumber = digits.slice(0, 10);

    onChange(mobileNumber);
  };

  const displayValue = () => {
    const val = value ?? "";
    if (val.length <= 5) {
      return val;
    }
    return `${val.slice(0, 5)} ${val.slice(5)}`;
  };

  return (
    <div className="space-y-2">
      <Label
        htmlFor="phone"
        className="text-sm font-medium text-gray-700"
      >
        Login with mobile number
      </Label>

      <div
        className={`flex items-center rounded-xl border bg-gray-50 px-3 transition ${
          focused
            ? "border-teal-500 ring-1 ring-teal-500"
            : error
              ? "border-rose-400"
              : "border-gray-200"
        }`}
      >
        <span className="mr-2 w-12 select-none text-sm text-gray-600">
          🇮🇳 +91
        </span>

        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          placeholder="Enter mobile number"
          value={displayValue()}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          maxLength={11}
          className="h-12 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {error && (
        <p className="text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}