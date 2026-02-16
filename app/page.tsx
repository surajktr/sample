"use client"

import { useEffect, useRef, useState } from "react"
import html2pdf from "html2pdf.js"
import { Button } from "@/components/ui/button"

interface Question {
  question_en: string
  question_hi: string
  answer: string
  extra_details: string
  extra_details_speech_script: string
  image_data_url: string | null
}

interface CurrentAffairsData {
  date: string
  data: Question[]
}

export default function Home() {
  const [data, setData] = useState<CurrentAffairsData | null>(null)
  const [loading, setLoading] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  // Load JSON data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/current-affairs-data.json")
        const jsonData = await response.json()
        setData(jsonData)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [])

  const generatePDF = async () => {
    if (!pdfRef.current) return

    setLoading(true)
    try {
      const element = pdfRef.current.cloneNode(true) as HTMLElement

      // Remove all Tailwind classes and apply inline styles instead
      const removeUnsupportedClasses = (el: Element) => {
        const allElements = el.querySelectorAll("*")
        allElements.forEach((elem) => {
          const classList = Array.from(elem.classList)
          classList.forEach((cls) => {
            elem.classList.remove(cls)
          })
        })
      }

      removeUnsupportedClasses(element)

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `Current-Affairs-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              animation: "spin 1s linear infinite",
              borderRadius: "50%",
              height: "48px",
              width: "48px",
              borderTop: "4px solid #3b82f6",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ color: "#6b7280" }}>Loading current affairs data...</p>
        </div>
      </div>
    )
  }

  // Split questions into pages (10 per page)
  const questionsPerPage = 10
  const pages = []
  for (let i = 0; i < data.data.length; i += questionsPerPage) {
    pages.push(data.data.slice(i, i + questionsPerPage))
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f9ff", padding: "32px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>
            Current Affairs PDF Generator
          </h1>
          <p style={{ color: "#4b5563", marginBottom: "24px" }}>Date: {data.date}</p>
          <Button
            onClick={generatePDF}
            disabled={loading}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "8px 32px",
              borderRadius: "8px",
              fontWeight: "600",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>

        {/* PDF Preview */}
        <div ref={pdfRef} style={{ backgroundColor: "white" }}>
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              style={{
                pageBreakAfter: "always",
                width: "210mm",
                height: "297mm",
                margin: "0 auto",
                padding: "32px",
                boxSizing: "border-box",
                borderBottom: "4px solid #d1d5db",
              }}
            >
              {/* Page Header */}
              <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #2563eb" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "4px" }}>
                  Current Affairs
                </h2>
                <p style={{ fontSize: "12px", color: "#4b5563" }}>
                  Date: {data.date} | Page {pageIndex + 1}
                </p>
              </div>

              {/* Questions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {page.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    style={{
                      borderLeft: "4px solid #3b82f6",
                      paddingLeft: "16px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    {/* Question Number */}
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#2563eb", marginBottom: "4px" }}>
                      Q{pageIndex * questionsPerPage + qIndex + 1}
                    </div>

                    {/* English Question */}
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                      {question.question_en}
                    </p>

                    {/* Hindi Question */}
                    <p style={{ fontSize: "14px", color: "#374151", marginBottom: "8px", fontStyle: "italic" }}>
                      {question.question_hi}
                    </p>

                    {/* Answer */}
                    <div
                      style={{ backgroundColor: "#dbeafe", padding: "8px", borderRadius: "4px", marginBottom: "8px" }}
                    >
                      <p style={{ fontSize: "14px", fontWeight: "bold", color: "#1e3a8a" }}>
                        Answer: {question.answer}
                      </p>
                    </div>

                    {/* Image if available */}
                    {question.image_data_url && (
                      <div style={{ marginBottom: "8px" }}>
                        <img
                          src={question.image_data_url || "/placeholder.svg"}
                          alt={`Question ${qIndex + 1}`}
                          style={{
                            width: "100%",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}

                    {/* Extra Details */}
                    <p style={{ fontSize: "12px", color: "#4b5563", lineHeight: "1.4" }}>
                      {question.extra_details.split("\n").slice(0, 2).join(" ")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Page Footer */}
              <div
                style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #d1d5db", textAlign: "center" }}
              >
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  Page {pageIndex + 1} of {pages.length}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Info */}
        <div
          style={{
            marginTop: "32px",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <p style={{ fontSize: "14px", color: "#374151" }}>
            Total Questions: <span style={{ fontWeight: "bold" }}>{data.data.length}</span> | Total Pages:{" "}
            <span style={{ fontWeight: "bold" }}>{pages.length}</span> | Questions per Page:{" "}
            <span style={{ fontWeight: "bold" }}>{questionsPerPage}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
