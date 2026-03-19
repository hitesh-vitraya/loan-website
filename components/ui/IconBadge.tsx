type IconBadgeProps = {
  label: string;
};

export function IconBadge({ label }: IconBadgeProps) {
  return <div className="iconBadge">{label}</div>;
}
