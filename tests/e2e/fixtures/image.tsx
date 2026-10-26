import React from "react";
export default function Image(
  props: React.ImgHTMLAttributes<HTMLImageElement>,
) {
  // Native image is sufficient for this isolated overlay interaction fixture.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt ?? ""} />;
}
