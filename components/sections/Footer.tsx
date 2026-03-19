import Image from "next/image";
import Link from "next/link";

import { footerLinks } from "../../data/home";
import { Container } from "../ui/Container";

export function Footer() {
  return (
    <footer id="contact" className="siteFooter">
      <Container className="footerInner">
        <div className="footerTop">
          <div className="footerBrandBlock">
            <div className="footerBrandRow">
              {/* <div className="footerBrandMark">L</div> */}
              <div className="footerBrandTextWrap">
                <div className="footerBrand">LIBERTY</div>
                {/* <div className="footerBrandSub">LENDING WALLET</div> */}
              </div>
            </div>
          </div>

          <div className="footerTrust">
            <Image src="/images/ssl.png" alt="SSL certified" width={115} height={42} />
            <Image src="/images/safe.png" alt="Safe and secure" width={115} height={42} />
          </div>
        </div>

        <p className="footerAddress">447 Broadway, 2nd Floor Suite, #1688, New York 10013</p>

        <div className="footerLinks">
          {footerLinks.map((link) => (
            link.href ? (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ) : (
              <span key={link.label}>{link.label}</span>
            )
          ))}
        </div>

        <p className="footerDisclaimer">
          Easy Lending Today is not a lender and does not make loan or credit decisions. LLW connects consumers with lenders and financial service providers who may offer loans or related financial products. We may receive compensation from lenders or partners for referring your information.Loan approval, rates, terms, and funding times are determined by the lender and may vary based on credit score, loan amount, loan term, and credit history. Lenders may perform a credit check to determine eligibility. Not all applicants will qualify for a loan.Some offers may come from tribal lenders, which operate under tribal and certain federal laws and may offer terms different from state-licensed lenders. Your information may be shared with lenders, lending partners, or other financial service providers and you may receive multiple offers.This service is not available in all states. Residents of Connecticut, New Hampshire, Washington, and Vermont are not eligible to request a loan through this website.Example: A $10,000 loan for 36 months at 10% APR would have a total repayment of $11,616.12. Actual rates may vary but will not exceed 35.99% APR, depending on lender terms and borrower qualifications.Short-term loans are an expensive form of credit and should not be used as a long-term financial solution.

        </p>
        <p className="footerCopyright">
         © 2026 Easy Lending Today. All rights reserved. All trademarks and service marks are the property of their respective owners.
        </p>
        <p className="footerBottomNote">All Rights Reserved</p>
      </Container>
    </footer>
  );
}
