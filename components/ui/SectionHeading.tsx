type SectionHeadingProps = {
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  title,
  description,
  align = "center"
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "sectionHeading sectionHeadingCenter" : "sectionHeading"}>
      <h2 className="sectionTitle">{title}</h2>
      {description ? <p className="sectionDescription">{description}</p> : null}
    </div>
  );
}
