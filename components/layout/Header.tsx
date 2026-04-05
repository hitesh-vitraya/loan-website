"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { navigation } from "../../data/home";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="siteHeader">
      <Container className="headerInner">
        <Link href="/" className="siteLogo" onClick={closeMobileMenu}>
          <img
            src="/images/logo.png"
            alt="Easy Lending Today"
            className="siteLogoImage"
          />
        </Link>

        <div className="headerActions">
          <nav aria-label="Primary navigation">
            <ul className="navList">
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <Button href="/#request-now" className="headerButton">
            Check my Options
          </Button>
        </div>

        <button
          type="button"
          className={`mobileMenuButton${isMobileMenuOpen ? " is-open" : ""}`}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </Container>

      {isMobileMenuOpen ? (
        <>
          <div
            className="mobileMenuBackdrop is-open"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          <div
            id="mobile-navigation"
            className="mobileMenuPanel is-open"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            style={{ display: "block", opacity: 1, pointerEvents: "auto" }}
          >
            <div className="mobileMenuPanelInner">
              <div className="mobileMenuTopRow">
                <p className="mobileMenuEyebrow">Quick Navigation</p>
                <button
                  type="button"
                  className="mobileMenuClose"
                  onClick={closeMobileMenu}
                  aria-label="Close navigation menu"
                >
                  <span />
                  <span />
                </button>
              </div>

              <nav aria-label="Mobile navigation">
                <ul className="mobileNavList">
                  {navigation.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} onClick={closeMobileMenu}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <Button href="/#request-now" className="mobileMenuCta" onClick={closeMobileMenu}>
                Check my Options
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
