export type NavItem = {
  label: string;
  href: string;
};

export type StepItem = {
  title: string;
  description: string;
  icon: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FooterLinkItem = {
  label: string;
  href?: string;
};

export const navigation: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact-us" }
];

export const steps: StepItem[] = [
  {
    title: "Fill out our easy form in less than two minutes.",
    description: "Share a few details about your financing needs and submit once.",
    icon: "01"
  },
  {
    title: "If you qualified then review and sign the loan documents.",
    description: "Compare available offers and move forward with the right match.",
    icon: "02"
  },
  {
    title: "Get your funds as soon as the next business day.",
    description: "Once approved, your lender can fund quickly without extra friction.",
    icon: "03"
  }
];

export const features: FeatureItem[] = [
  {
    title: "Multiple Lenders, One Place",
    description:
      "Connect with dozens of trusted lenders nationwide. Check your options and choose what works best for you.",
    icon: "ML"
  },
  {
    title: "Get Money Fast",
    description:
      "Apply in minutes and see offers quickly. Many customers can access funds as soon as the next business day.",
    icon: "GF"
  },
  {
    title: "Bank-Level Security",
    description:
      "Your information is protected with strong encryption and security standards designed for sensitive data.",
    icon: "BS"
  },
  {
    title: "Bad Credit? No Problem",
    description:
      "We work with lenders who look beyond a single score, helping more borrowers see real options.",
    icon: "BC"
  },
  {
    title: "Money for Any Purpose",
    description:
      "Use your funds for debt, emergencies, home repairs, moving costs, or other planned expenses.",
    icon: "MP"
  },
  {
    title: "Simple Online Process",
    description:
      "Everything happens online, from application to approval, so you can complete the process anywhere.",
    icon: "SP"
  }
];

export const faqs: FaqItem[] = [
  {
    question: "Are there any hidden fees?",
    answer:
      "No. Bad Credit is fully transparent. You’ll see all applicable fees upfront, and we strive to keep costs low or free where possible."
  },
  {
    question: "How Soon Can A Personal Loan Or Cash Advance Be Made Available?",
    answer:
      "The time it takes to process a loan and transfer or ACH funds into an individual's account varies with each loan company, and also depends on the financial institution where the customer has their bank account. However, approved individuals can often receive their loan as soon as the next business day after approval."
  },
  {
    question: "How Much Can I Receive?",
    answer:
      "Qualified loan amounts can vary and are based on personal eligibility. Approved loan amounts can range between $100 to $40,000."
  },
  {
    question: "What Are Personal Loans Or Installment Loans?",
    answer:
      "Personal and/or installment loans typically range between $100 and $40,000. They can be used for many different purposes. Personal loans are commonly called installment loans because they are typically paid back in monthly or bi-monthly installments over an extended period of time. They can be a convenient alternative to bank loans or high-interest credit cards, with online loan request forms and no-hassle automated repayment."
  }
];

export const footerLinks: FooterLinkItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Unsubscribe",
    href: "https://www.tinyspacetab.com/o-htpv-h92-8363f1334a3cd5a646a9f9865e83bfde"
  },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Condition", href: "/terms-and-condition" },
  { label: "Advertiser Disclosure", href: "/advertiser-disclosure" },
  { label: "Personal Loan Notice", href: "/personal-loan-notice" },
  { label: "Do not sell my personal information", href: "/do-not-sell-my-personal-information" }
];
