export type ChoiceOption = {
  label: string;
  value: string;
};

export type ApplicationStep =
  | {
      id: "purpose";
      title: string;
      subtitle: string;
      progress: number;
      kind: "purpose";
      options: ChoiceOption[];
    }
  | {
      id: "credit";
      title: string;
      subtitle: string;
      progress: number;
      kind: "credit";
      options: ChoiceOption[];
    }
  | {
      id: "employment";
      title: string;
      subtitle: string;
      progress: number;
      kind: "employment";
      employmentOptions: ChoiceOption[];
      payFrequencyOptions: ChoiceOption[];
    }
  | {
      id: "financial";
      title: string;
      subtitle: string;
      progress: number;
      kind: "financial";
      housingOptions: ChoiceOption[];
    }
  | {
      id: "banking";
      title: string;
      subtitle: string;
      progress: number;
      kind: "banking";
      yesNoOptions: ChoiceOption[];
    }
  | {
      id: "qualifiers";
      title: string;
      subtitle: string;
      progress: number;
      kind: "qualifiers";
      yesNoOptions: ChoiceOption[];
      militaryOptions: ChoiceOption[];
    }
  | {
      id: "debt";
      title: string;
      subtitle: string;
      progress: number;
      kind: "debt";
      options: ChoiceOption[];
    }
  | {
      id: "phone";
      title: string;
      subtitle: string;
      progress: number;
      kind: "phone";
    }
  | {
      id: "identity";
      title: string;
      subtitle: string;
      progress: number;
      kind: "identity";
    }
  | {
      id: "ssn";
      title: string;
      subtitle: string;
      progress: number;
      kind: "ssn";
    }
  | {
      id: "profile";
      title: string;
      subtitle: string;
      progress: number;
      kind: "profile";
    };

export const applicationSteps: ApplicationStep[] = [
  {
    id: "purpose",
    title: "How do you like to spend the money?",
    subtitle: "This helps us find the best match.",
    progress: 10,
    kind: "purpose",
    options: [
      { label: "Auto Purchase", value: "auto" },
      { label: "Credit Card consolidation", value: "credit_card_consolidation" },
      { label: "Debt consolidation", value: "debt_consolidation" },
      { label: "Debt Settlement", value: "debt_settlement" },
      { label: "Education", value: "education" },
      { label: "Home Improvement", value: "home_improvement" },
      { label: "Medical", value: "medical" },
      { label: "Relocation", value: "relocation" },
      { label: "Renewable Energy", value: "renewable_energy" },
      { label: "Small Business", value: "small_business" },
      { label: "Travel", value: "travel" },
      { label: "Wedding", value: "wedding" },
      { label: "Other", value: "other" }
    ]
  },
  {
    id: "credit",
    title: "What is your credit score?",
    subtitle: "Your best estimate is fine.",
    progress: 30,
    kind: "credit",
    options: [
      { label: "Excellent (720+)", value: "excellent" },
      { label: "Good (660-719)", value: "good" },
      { label: "Fair (580-659)", value: "fair" },
      { label: "Poor (Below 580)", value: "poor" },
      { label: "Not sure", value: "not-sure" }
    ]
  },
  {
    id: "employment",
    title: "Employment details",
    subtitle: "This helps lenders assess eligibility.",
    progress: 30,
    kind: "employment",
    employmentOptions: [
      { label: "Employed full-time", value: "full-time" },
      { label: "Employed part-time", value: "part-time" },
      { label: "Self-employed", value: "self-employed" },
      { label: "Benefits / Disability", value: "benefits" },
      { label: "Unemployed", value: "unemployed" }
    ],
    payFrequencyOptions: [
      { label: "Weekly", value: "weekly" },
      { label: "Bi-weekly", value: "bi-weekly" },
      { label: "Twice a month", value: "twice-monthly" },
      { label: "Monthly", value: "monthly" }
    ]
  },
  {
    id: "financial",
    title: "Financial stability",
    subtitle: "Helps lenders determine affordability.",
    progress: 30,
    kind: "financial",
    housingOptions: [
      { label: "Own", value: "own" },
      { label: "Rent", value: "rent" },
      { label: "Living with family", value: "family" }
    ]
  },
  {
    id: "banking",
    title: "Banking information",
    subtitle: "Lenders use this for verification.",
    progress: 30,
    kind: "banking",
    yesNoOptions: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" }
    ]
  },
  {
    id: "qualifiers",
    title: "A few more details",
    subtitle: "Low-risk qualification questions.",
    progress: 30,
    kind: "qualifiers",
    yesNoOptions: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" }
    ],
    militaryOptions: [
      { label: "Active Duty", value: "active-duty" },
      { label: "Veteran", value: "veteran" },
      { label: "Spouse", value: "spouse" },
      { label: "None", value: "none" }
    ]
  },
  {
    id: "debt",
    title: "How much unsecured debt do you have?",
    subtitle: "Current outstanding balances.",
    progress: 30,
    kind: "debt",
    options: [
      { label: "None", value: "none" },
      { label: "Under $5,000", value: "under-5000" },
      { label: "$5,000 - $10,000", value: "5000-10000" },
      { label: "$10,000+", value: "10000-plus" }
    ]
  },
  {
    id: "profile",
    title: "Tell us about yourself",
    subtitle: "So we can send your personalized offers.",
    progress: 30,
    kind: "profile"
  },
  {
    id: "phone",
    title: "What is your phone number?",
    subtitle: "",
    progress: 30,
    kind: "phone"
  },
  {
    id: "identity",
    title: "Identity verification",
    subtitle: "Required to verify eligibility.",
    progress: 30,
    kind: "identity"
  },
  {
    id: "ssn",
    title: "Social Security Number",
    subtitle:
      "We do a soft pull which does not affect your credit score. We use 256-bit SSL technology to encrypt your data.",
    progress: 99,
    kind: "ssn"
  }
];
