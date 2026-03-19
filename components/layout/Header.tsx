import Image from "next/image";
import Link from "next/link";

import { navigation } from "../../data/home";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";

export function Header() {
  return (
    <header className="siteHeader">
      <Container className="headerInner">
        <Link href="/" className="siteLogo">
          <Image
            src="/images/logo.png"
            alt="Easy Lending Today"
            width={160}
            height={44}
            priority
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
          <Button className="headerButton">Check my Options</Button>
        </div>
      </Container>
    </header>
  );
}
