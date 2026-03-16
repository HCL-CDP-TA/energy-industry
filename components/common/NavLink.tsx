import Link from "next/link"

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className="text-[var(--secondary-foreground)] hover:text-[var(--primary)] transition-colors ">
      {children}
    </Link>
  )
}
export default NavLink
