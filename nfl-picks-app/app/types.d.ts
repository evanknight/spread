import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      html: React.DetailedHTMLProps<
        React.HtmlHTMLAttributes<HTMLHtmlElement>,
        HTMLHtmlElement
      >;
      body: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLBodyElement>,
        HTMLBodyElement
      >;
    }
  }
}
