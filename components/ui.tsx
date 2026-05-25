import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ChildrenProps = {
  children?: ReactNode;
  className?: string;
};

export function Eyebrow({ children, className }: ChildrenProps) {
  return <div className={cn("eyebrow", className)}>{children}</div>;
}

export function Panel({ children, className, ...props }: ChildrenProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("panel", className)} {...props}>
      {children}
    </div>
  );
}

export function Section({ children, className, id }: ChildrenProps & { id?: string }) {
  return (
    <section className={cn("section", className)} id={id}>
      {children}
    </section>
  );
}

export function PageShell({ children, className }: ChildrenProps) {
  return <main className={cn("shell section page-hero", className)}>{children}</main>;
}

export function SectionHeader({ eyebrow, title, children, action }: ChildrenProps & { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2>{title}</h2>
      </div>
      {action ?? (children ? <p>{children}</p> : null)}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: ChildrenProps & { eyebrow?: string; title: string }) {
  return (
    <section data-reveal>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1>{title}</h1>
      {children ? <p className="lead page-lead">{children}</p> : null}
    </section>
  );
}

export function Tag({ children, className }: ChildrenProps) {
  return <span className={cn("pill", className)}>{children}</span>;
}

type ButtonVariant = "primary" | "secondary";

export function ButtonLink({ href, children, variant = "secondary", className }: ChildrenProps & { href: string; variant?: ButtonVariant }) {
  return (
    <Link className={cn("btn", variant, className)} href={href}>
      {children}
    </Link>
  );
}

export function Button({ children, variant = "secondary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button className={cn("btn", variant, className)} {...props}>
      {children}
    </button>
  );
}

export function FormField({
  label,
  wide,
  children
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("field", wide && "wide")}>
      <label>{label}</label>
      {children}
    </div>
  );
}

export function TextInput({ label, wide, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; wide?: boolean }) {
  return (
    <FormField label={label} wide={wide}>
      <input {...props} />
    </FormField>
  );
}

export function TextArea({ label, wide, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; wide?: boolean }) {
  return (
    <FormField label={label} wide={wide}>
      <textarea {...props} />
    </FormField>
  );
}
