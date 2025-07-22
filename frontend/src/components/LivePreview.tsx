import React, { useEffect, useRef, useImperativeHandle, useState } from "react";

type Props = { html: string; css?: string };

const LivePreview = React.forwardRef<HTMLIFrameElement, Props>(
  ({ html, css = "" }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useImperativeHandle(ref, () => iframeRef.current!);

    /* ---  scale to fit width only  ------------------------------------ */
    useEffect(() => {
      const updateScale = () => {
        if (!wrapperRef.current || !sheetRef.current) return;
        const wrapWidth = wrapperRef.current.getBoundingClientRect().width;
        const sheetWidth = sheetRef.current.scrollWidth; // 210 mm
        const factor = Math.min(wrapWidth / sheetWidth, 1);
        setScale(Number(factor.toFixed(3))); // jitter-free
      };

      updateScale();
      window.addEventListener("resize", updateScale);
      const ro = new ResizeObserver(updateScale);
      ro.observe(wrapperRef.current!);
      return () => {
        window.removeEventListener("resize", updateScale);
        ro.disconnect();
      };
    }, []);

    /* ---  rebuild iframe whenever html/css change  -------------------- */
    useEffect(() => {
      const fullHtml = /*html*/ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    /* reset + page look */
    html,body{margin:0;padding:0;overflow-x:hidden;font-size:16px;}
    @page{size:A4 portrait;margin:0;}
    /* visual page boundaries using a repeating gradient */
    body{
      background:
        repeating-linear-gradient(
          to bottom,
          transparent 0,
          transparent calc(297mm - 1px),
          #d0d0d0 calc(297mm - 1px),
          #d0d0d0 297mm
        );
    }
    .resume-sheet{
      width:210mm;            /* A4 width  */
      box-sizing:border-box;
      background:#fff;
      margin:0 auto;
      box-shadow:0 0 4px rgba(0,0,0,.15);
    }
    ${css}
  </style>
  <!-- React & Babel (runs only inside sandbox) -->
  <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div class="resume-sheet"><div id="root"></div></div>
  <script type="text/babel">
    try{ ${html} }
    catch(e){ document.body.innerHTML='<pre style="color:red">'+e+'</pre>'; }
  </script>
</body>
</html>`;
      if (iframeRef.current) {
        iframeRef.current.srcdoc = fullHtml;
      }
    }, [html, css]);

    /* ---  render  ------------------------------------------------------ */
    return (
      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto", // vertical scroll only here
          overflowX: "hidden",
          background: "#1e1e1e",
          position: "relative",
        }}
      >
        <div
          ref={sheetRef}
          style={{
            width: "210mm",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            ref={iframeRef}
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: "210mm",
              minHeight: "297mm", // grows with content
              height: "auto",
              border: "none",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    );
  }
);

export default LivePreview;
