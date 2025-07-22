// src/pages/EditorPage.tsx
import { useEffect, useState, useRef } from "react";
import type * as Monaco from "monaco-editor";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ResumeEditor from "../components/ResumeEditor";
import LivePreview from "../components/LivePreview";
import html2pdf from "html2pdf.js";
import { Save, Download, Check } from "lucide-react";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const previewRef = useRef<HTMLIFrameElement>(null);
  const jsxEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const cssEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const [html, setHtml] = useState(
    `function Resume() {
  return (
    <div className="resume">
      <h1>Jane Doe</h1>
      <p>Full-Stack Developer</p>
    </div>
  );
}

ReactDOM.render(<Resume />, document.getElementById("root"));`
  );
  const [cssCode, setCssCode] = useState(
    `.resume {
  font-family: 'Georgia', serif;
  padding: 2rem;
}
.resume h1 {
  font-size: 2rem;
}`
  );

  const [activeTab, setActiveTab] = useState<"jsx" | "css" | "preview">("jsx");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (activeTab === "jsx") {
      jsxEditorRef.current?.layout();
    } else if (activeTab === "css") {
      cssEditorRef.current?.layout();
    }
  }, [activeTab]);

  // load existing resume
  useEffect(() => {
    if (!id) return;
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      try {
        const { data } = await api.get<{ html: string; css: string }>(
          `/api/resumes/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHtml(data.html);
        setCssCode(data.css);
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status === 404
        ) {
          navigate("/dashboard");
        }
        console.error(err);
      }
    })();
  }, [id, navigate]);

  const saveResume = async () => {
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      await api.put(
        `/api/resumes/${id}`,
        { html, css: cssCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPdf = async () => {
    const iframe = previewRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const sheet = doc.querySelector(".resume-sheet") as HTMLElement | null;
    if (!sheet) return;

    /* ----- clone the sheet and its <style> ----- */
    const clone = sheet.cloneNode(true) as HTMLElement;
    doc.head
      .querySelectorAll("style,link[rel='stylesheet']")
      .forEach((n) => clone.prepend(n.cloneNode(true)));

    /* ----- wrap it in a zero-margin container ----- */
    const wrapper = document.createElement("div");
    wrapper.style.margin = "0"; // ← kills the default top gap
    wrapper.style.padding = "0";
    wrapper.appendChild(clone);

    clone.style.boxShadow = "none";

    await html2pdf()
      .set({
        filename: "resume.pdf",
        margin: 0,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(wrapper)
      .save();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white font-mono overflow-hidden">
      {/* Top bar with Tabs + Save/Download icons */}
      <div className="flex justify-between items-center bg-[#2d2d2d] px-2 text-sm select-none">
        {/* Tabs */}
        <div className="flex space-x-1">
          {(["jsx", "css", "preview"] as const).map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 border-t border-l border-r rounded-t-sm cursor-pointer ${
                activeTab === tab
                  ? "bg-[#1e1e1e] border-[#3c3c3c] text-white"
                  : "bg-[#2d2d2d] border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab === "jsx" ? "JSX" : tab === "css" ? "CSS" : "Preview"}
            </div>
          ))}
        </div>

        {/* Save + Download Icons */}
        <div className="flex space-x-2">
          <button
            onClick={saveResume}
            aria-label="Save"
            className="group p-2 rounded hover:bg-[#3c3c3c]"
          >
            {saveSuccess ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <Save className="h-5 w-5 text-gray-400 group-hover:text-white" />
            )}
          </button>
          <button
            onClick={downloadPdf}
            aria-label="Download"
            className="group p-2 rounded hover:bg-[#3c3c3c]"
          >
            {downloadSuccess ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <Download className="h-5 w-5 text-gray-400 group-hover:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE: toggled view */}
      <div className="md:hidden flex-1 overflow-hidden relative">
        <div className={activeTab === "jsx" ? "block h-full" : "hidden"}>
          <ResumeEditor
            code={html}
            setCode={setHtml}
            language="javascript"
            editorRef={jsxEditorRef}
          />
        </div>
        <div className={activeTab === "css" ? "block h-full" : "hidden"}>
          <ResumeEditor
            code={cssCode}
            setCode={setCssCode}
            language="css"
            editorRef={cssEditorRef}
          />
        </div>
        <div className={activeTab === "preview" ? "block h-full" : "hidden"}>
          <LivePreview ref={previewRef} html={html} css={cssCode} />
        </div>
      </div>

      {/* DESKTOP: side-by-side */}
      <div className="hidden md:flex flex-1 border-t border-[#3c3c3c]">
        <div className="w-1/3 border-r border-[#3c3c3c]">
          <ResumeEditor
            code={html}
            setCode={setHtml}
            language="javascript"
            editorRef={jsxEditorRef}
          />
        </div>
        <div className="w-1/3 border-r border-[#3c3c3c]">
          <ResumeEditor
            code={cssCode}
            setCode={setCssCode}
            language="css"
            editorRef={cssEditorRef}
          />
        </div>
        <div className="w-1/3 bg-[#1e1e1e] flex justify-center">
          <div className="w-[90%] aspect-[210/297] bg-[#1e1e1e]">
            <LivePreview ref={previewRef} html={html} css={cssCode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
