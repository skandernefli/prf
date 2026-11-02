import type { ComponentType, SVGProps } from "react";
import {
  AcmeInvoiceSvg,
  BowlstoryOrderConfirmationSvg,
  BowlstoryOrderMessageSvg,
  HarborInvoiceRejectedSvg,
  NorthridgeInvoiceVerifiedSvg,
  RiverInvoiceSvg,
} from "@/components/portfolio/reference-svgs";

export type InlineReferenceSvgName =
  | "acme-invoice"
  | "river-invoice"
  | "northridge-invoice-verified"
  | "harbor-invoice-rejected"
  | "bowlstory-order-message"
  | "bowlstory-order-confirmation";

type InlineReferenceSvgProps = {
  name: InlineReferenceSvgName;
};

const referenceSvgs: Record<
  InlineReferenceSvgName,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  "acme-invoice": AcmeInvoiceSvg,
  "river-invoice": RiverInvoiceSvg,
  "northridge-invoice-verified": NorthridgeInvoiceVerifiedSvg,
  "harbor-invoice-rejected": HarborInvoiceRejectedSvg,
  "bowlstory-order-message": BowlstoryOrderMessageSvg,
  "bowlstory-order-confirmation": BowlstoryOrderConfirmationSvg,
};

export function InlineReferenceSvg({ name }: InlineReferenceSvgProps) {
  const Svg = referenceSvgs[name];

  return (
    <span>
      <Svg />
    </span>
  );
}
