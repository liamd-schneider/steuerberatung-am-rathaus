"use client"

import { useState, useEffect } from "react"
import { Phone, Mail, Calendar, Search, X, AlertTriangle } from "lucide-react"
import sanityClient from "@sanity/client"
import { createNotification } from "@/sanity/lib"
import emailjs from "@emailjs/browser"

// Initialize Sanity client
const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-11-21",
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
})

export default function ContactForm() {
  const [showChat, setShowChat] = useState(false)

  const toggleChat = () => {
    setShowChat(!showChat)
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    file: null,
  })

  const [statusQuery, setStatusQuery] = useState({
    supportNumber: "",
    email: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [supportNumber, setSupportNumber] = useState("")
  const [statusResult, setStatusResult] = useState(null)
  const [statusError, setStatusError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState("")

  // E-Mail Konfiguration - gleiche IDs wie im Admin-Dashboard
  const [emailConfig] = useState({
    serviceId: "service_z0bgw1a",
    templateId: "template_y69qige", // Hier können Sie eine separate Template-ID für Kontaktanfragen verwenden
    publicKey: "rTyLRMB6bVblKmGW1",
  })
  const [emailConfigured, setEmailConfigured] = useState(false)

  // Generate a unique support number on component mount
  useEffect(() => {
    const uniqueSupportNumber = `S_${Math.floor(1000000000 + Math.random() * 9000000000)}`
    setSupportNumber(uniqueSupportNumber)
    
    // EmailJS initialisieren
    const savedConfig = localStorage.getItem("emailjs-config")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      setEmailConfigured(true)
      emailjs.init(config.publicKey)
    } else {
      // Fallback zu den Standard-Konfigurationen
      setEmailConfigured(true)
      emailjs.init(emailConfig.publicKey)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (name === "file") {
      setFormData({
        ...formData,
        file: files[0],
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleStatusChange = (e) => {
    const { name, value } = e.target
    setStatusQuery({
      ...statusQuery,
      [name]: value,
    })
  }

  // HTML E-Mail Template für Kontaktanfragen
  const generateContactEmailHTML = (inquiry) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bestätigung Ihrer Kontaktanfrage</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; color: #333333;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td>
        <!-- Header -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #E3DAC9; padding: 20px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                <tr>
                  <td align="left" style="padding: 0 20px;">
                    <h1 style="color: #333333; font-size: 24px; margin: 0;">Steuerberatung am Rathaus</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; font-size: 20px; margin: 0 0 20px 0;">Vielen Dank für Ihre Anfrage</h2>
                    <p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">Sehr geehrte(r) ${inquiry.firstName} ${inquiry.lastName},</p>
                    <p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">wir haben Ihre Kontaktanfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f7f3; border-radius: 6px; margin: 30px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">Ihre Anfrage-Details:</h3>
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Support-Nummer:</td>
                              <td style="color: #333333; font-size: 14px; font-weight: bold; padding: 5px 0;">${inquiry.supportNumber}</td>
                            </tr>
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Datum:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${formatDate(inquiry.timestamp)}</td>
                            </tr>
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Betreff:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${inquiry.subject}</td>
                            </tr>
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0; vertical-align: top;">Nachricht:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${inquiry.message}</td>
                            </tr>
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0; vertical-align: top;">Status:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${inquiry.status}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">Bitte bewahren Sie Ihre Support-Nummer auf. Mit dieser können Sie jederzeit den Status Ihrer Anfrage auf unserer Website überprüfen.</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #E3DAC9; border-radius: 4px;">
                          <a href="https://steuerberatung-am-rathaus.vercel.app/#kontakt" target="_blank" style="display: inline-block; padding: 12px 24px; color: #333333; font-size: 16px; font-weight: bold; text-decoration: none;">Status prüfen</a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 30px 0 0 0;">Mit freundlichen Grüßen,</p>
                    <p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0;">Ihr Team der Steuerberatung am Rathaus</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #747171; padding: 30px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                <tr>
                  <td align="center" style="color: #ffffff; font-size: 14px; padding: 0 20px;">
                    <p style="margin: 0 0 10px 0;">Steuerberatung am Rathaus</p>
                    <p style="margin: 0 0 10px 0;">Kirchhellener Str. 42, 46236 Bottrop</p>
                    <p style="margin: 0 0 10px 0;">Tel: +49 020414066389 | E-Mail: stb-am-rathaus@email.de</p>
                    <p style="margin: 20px 0 0 0; font-size: 12px; color: #E3DAC9;">© 2025 Steuerberatung am Rathaus und Liam Schneider. Alle Rechte vorbehalten.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  // HTML E-Mail Template für Admin-Benachrichtigungen bei Kontaktanfragen
  const generateAdminContactInquiryEmailHTML = (inquiry) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Neue Kontaktanfrage</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; color: #333333;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td>
        <!-- Header -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #E3DAC9; padding: 20px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                <tr>
                  <td align="left" style="padding: 0 20px;">
                    <h1 style="color: #333333; font-size: 24px; margin: 0;">Neue Kontaktanfrage</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; font-size: 20px; margin: 0 0 20px 0;">Neue Kontaktanfrage eingegangen</h2>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f7f3; border-radius: 6px; margin: 30px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">Anfrage-Details:</h3>
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Support-Nummer:</td>
                              <td style="color: #333333; font-size: 14px; font-weight: bold; padding: 5px 0;">${inquiry.supportNumber}</td>
                            </tr>
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Name:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${inquiry.firstName} ${inquiry.lastName}</td>
                            </tr>
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">E-Mail:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${inquiry.email}</td>
                            </tr>
                            ${inquiry.phone ? `
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Telefon:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${inquiry.phone}</td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Betreff:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${inquiry.subject}</td>
                            </tr>
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0; vertical-align: top;">Nachricht:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${inquiry.message}</td>
                            </tr>
                            <tr>
                              <td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Datum:</td>
                              <td style="color: #333333; font-size: 14px; padding: 5px 0;">${formatDate(new Date().toISOString())}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #E3DAC9; border-radius: 4px;">
                          <a href="https://steuerberatung-am-rathaus.vercel.app/admin" target="_blank" style="display: inline-block; padding: 12px 24px; color: #333333; font-size: 16px; font-weight: bold; text-decoration: none;">Zum Admin-Dashboard</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #747171; padding: 30px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                <tr>
                  <td align="center" style="color: #ffffff; font-size: 14px; padding: 0 20px;">
                    <p style="margin: 0 0 10px 0;">Steuerberatung am Rathaus - Admin Benachrichtigung</p>
                    <p style="margin: 20px 0 0 0; font-size: 12px; color: #E3DAC9;">© 2025 Steuerberatung am Rathaus. Alle Rechte vorbehalten.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  // Admin-Benachrichtigungs-E-Mail senden
  const sendAdminNotificationEmail = async (htmlContent, subject) => {
    if (!emailConfigured) {
      console.warn("E-Mail-Service ist nicht konfiguriert")
      return
    }

    try {
      const savedConfig = localStorage.getItem("emailjs-config")
      const config = savedConfig ? JSON.parse(savedConfig) : emailConfig

      // Hole Admin-E-Mail aus localStorage oder verwende eine Standard-E-Mail
      const adminEmail = localStorage.getItem("admin-email") || "stb-am-rathaus@email.de"

      const templateParams = {
        to_email: adminEmail,
        to_name: "Admin",
        from_name: "Steuerberatung am Rathaus System",
        subject: subject,
        html_content: htmlContent,
      }

      await emailjs.send(config.serviceId, config.templateId, templateParams, config.publicKey)

      console.log(`Admin-Benachrichtigung erfolgreich an ${adminEmail} gesendet`)
    } catch (error) {
      console.error("Fehler beim Senden der Admin-Benachrichtigung:", error)
    }
  }

  // E-Mail senden Funktion
  const sendContactConfirmationEmail = async (inquiry) => {
    if (!emailConfigured) {
      console.warn("E-Mail-Service ist nicht konfiguriert")
      return
    }

    try {
      // Konfiguration aus localStorage laden oder Fallback verwenden
      const savedConfig = localStorage.getItem("emailjs-config")
      const config = savedConfig ? JSON.parse(savedConfig) : emailConfig

      const emailHTML = generateContactEmailHTML(inquiry)

      // Template Parameter für EmailJS
      const templateParams = {
        to_email: inquiry.email,
        to_name: `${inquiry.firstName} ${inquiry.lastName}`,
        from_name: "Steuerberatung am Rathaus",
        subject: "Bestätigung Ihrer Kontaktanfrage - Steuerberatung am Rathaus",
        html_content: emailHTML,
        // Zusätzliche Parameter für den Fall, dass das Template diese direkt verwendet
        customer_firstname: inquiry.firstName,
        customer_lastname: inquiry.lastName,
        customer_email: inquiry.email,
        support_number: inquiry.supportNumber,
        inquiry_subject: inquiry.subject,
        inquiry_message: inquiry.message,
        inquiry_status: inquiry.status,
        inquiry_date: new Date(inquiry.timestamp).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      await emailjs.send(config.serviceId, config.templateId, templateParams, config.publicKey)

      console.log(`Bestätigungs-E-Mail erfolgreich an ${inquiry.email} gesendet`)
    } catch (error) {
      console.error("Fehler beim Senden der Bestätigungs-E-Mail:", error)
      // Fehler wird nicht an den Benutzer weitergegeben, da die Hauptfunktion (Anfrage speichern) erfolgreich war
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if required fields are filled  
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.")
      setSuccess("")
      return
    }

    setIsLoading(true)

    try {
      // Handle file upload if present
      let fileUpload = null
      if (formData.file) {
        const fileAsset = await client.assets.upload("file", formData.file)
        fileUpload = fileAsset._id
      }

      // Prepare data for Sanity
      const submissionData = {
        _type: "contactForm",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        supportNumber: supportNumber,
        status: "Offen",
        timestamp: new Date().toISOString(),
      }

      // Add file reference if uploaded
      if (fileUpload) {
        submissionData.file = { _type: "file", asset: { _ref: fileUpload } }
      }

      // Submit to Sanity
      const createdInquiry = await client.create(submissionData)

      // Create notification for the new contact inquiry
      await createNotification(createdInquiry)

      // Send confirmation email
      await sendContactConfirmationEmail({
        ...submissionData,
        _id: createdInquiry._id,
      })

      // Send admin notification email
      if (emailConfigured) {
        const adminEmailHTML = generateAdminContactInquiryEmailHTML({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          supportNumber: supportNumber
        })
        
        await sendAdminNotificationEmail(
          adminEmailHTML,
          `Neue Kontaktanfrage: ${formData.subject}`
        )
      }

      // Show success message and support number
      setSuccess(`Ihre Nachricht wurde erfolgreich versendet. Ihre Support-Nummer: ${supportNumber}. Eine Bestätigungs-E-Mail wurde an ${formData.email} gesendet.`)
      setError("")

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        file: null,
      })

      // Generate a new support number for the next submission
      const newSupportNumber = `S_${Math.floor(1000000000 + Math.random() * 9000000000)}`
      setSupportNumber(newSupportNumber)
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Es gab einen Fehler beim Senden des Formulars.")
      setSuccess("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusCheck = async (e) => {
    e.preventDefault()

    // Validate inputs
    if (!statusQuery.supportNumber || !statusQuery.email) {
      setStatusError("Bitte geben Sie sowohl die Support-Nummer als auch Ihre E-Mail-Adresse ein.")
      setStatusResult(null)
      return
    }

    setIsLoading(true)
    setStatusError("")
    setStatusResult(null)
    setDeleteSuccess("")

    try {
      // Query Sanity for the submission with matching support number and email
      const query = `*[_type == "contactForm" && supportNumber == $supportNumber && email == $email][0]{
        _id,
        firstName,
        lastName,
        email,
        subject,
        status,
        timestamp
      }`

      const params = {
        supportNumber: statusQuery.supportNumber,
        email: statusQuery.email,
      }

      const result = await client.fetch(query, params)

      if (result) {
        setStatusResult(result)
      } else {
        setStatusError("Keine Anfrage mit dieser Support-Nummer und E-Mail-Adresse gefunden.")
      }
    } catch (err) {
      console.error("Error checking status:", err)
      setStatusError("Es gab einen Fehler bei der Statusabfrage.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseResult = () => {
    setStatusResult(null)
    setDeleteSuccess("")
  }

  const handleDeleteRequest = async () => {
    if (!statusResult || !statusResult._id) return

    setIsDeleting(true)
    try {
      // Delete the document from Sanity
      await client.delete(statusResult._id)
      setDeleteSuccess("Ihre Anfrage wurde erfolgreich zurückgezogen.")
      setStatusResult(null)
      setShowConfirmDelete(false)

      // Clear the form after successful deletion
      setStatusQuery({
        supportNumber: "",
        email: "",
      })
    } catch (err) {
      console.error("Error deleting request:", err)
      setStatusError("Es gab einen Fehler beim Zurückziehen der Anfrage.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Translate status for display
  const translateStatus = (status) => {
    const statusMap = {
      offen: "Offen",
      in_bearbeitung: "In Bearbeitung",
      abgeschlossen: "Abgeschlossen",
      wartet_auf_antwort: "Wartet auf Antwort",
      Offen: "Offen",
      "In Bearbeitung": "In Bearbeitung",
      Abgeschlossen: "Abgeschlossen",
    }
    return statusMap[status] || status
  }

  return (
    <section className="py-16 px-6 lg:px-12 bg-[#747171] text-white">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Contact Form */}
        <div>
          <h3 className="text-[#E3DAC9] text-lg mb-2">Kontakt aufnehmen</h3>
          <h2 className="text-white text-3xl lg:text-4xl font-light leading-tight mb-8">
            Haben Sie Fragen? Wir helfen Ihnen gerne weiter.
          </h2>

          {/* Success or Error Message */}
          {error && <div className="mb-4 p-4 bg-red-500 text-white rounded-md">{error}</div>}
          {success && (
            <div className="mb-4 p-4 bg-green-500 text-white rounded-md">
              <p>{success}</p>
              <p className="mt-2 font-medium">
                Bitte speichern Sie diese Nummer, um den aktuellen Status Ihrer Anfrage zu erfragen.
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Vorname"
                className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Nachname"
                className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
                required
              />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Telefonnummer"
              className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
            />

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Betreff"
              className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Ihre Nachricht..."
              rows="5"
              className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
              required
            ></textarea>

            {/* File Upload */}
            <div className="w-full px-4 py-4 rounded-md bg-[rgba(227,218,201,0.1)] text-white">
              <label className="block mb-3 font-medium text-lg">Datei hochladen (optional):</label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#E3DAC9] text-black rounded-md hover:bg-[#d1c3a8] transition disabled:opacity-70"
            >
              {isLoading ? "Wird gesendet..." : "Nachricht senden"}
            </button>
          </form>
        </div>

        {/* Right Side: Contact Information */}
        <div className="lg:ml-[100px] ml-0">
          <h3 className="text-xl font-bold mt-[60px] mb-4">Kontaktieren Sie uns</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-4">
              <Phone className="w-6 h-6 text-[#E3DAC9]" />
              <span>+49 020414066389</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail className="w-6 h-6 text-[#E3DAC9]" />
              <span>stb-am-rathaus@email.de</span>
            </li>
            <li className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-[#E3DAC9]" />
              <div>
                <p>Montag, 08:30–16:00</p>
                <p>Dienstag, 08:30–18:30</p>
                <p>Mittwoch, 09:00–15:00</p>
                <p>Donnerstag, 09:00–15:00</p>
                <p>Freitag, Geschlossen</p>
                <p>Samstag, Geschlossen</p>
                <p>Sonntag, Geschlossen</p>
              </div>
            </li>
          </ul>

          <div className="mt-8">
            <h4 className="text-lg font-bold mb-4">Probieren Sie unseren KI Assistenten</h4>
            <button
              onClick={toggleChat}
              className="px-6 py-2 bg-[#E3DAC9] text-black rounded-md hover:bg-[#d1c3a8] transition"
            >
              Frage stellen
            </button>
          </div>
        </div>
      </div>

      {showChat && (
        <div className="fixed inset-0 bg-[#747171] flex flex-col items-center justify-center z-50 p-4">
          <button
            onClick={toggleChat}
            className="absolute top-4 right-4 bg-[#E3DAC9] rounded-full p-2 transition hover:bg-[#d6cbb7]"
            aria-label="Schließen"
          >
            <X className="w-5 h-5 text-black" />
          </button>
          <button
            onClick={toggleChat}
            className="absolute top-6 left-6 bg-[rgba(227,218,201,0.1)] border-2 border-[#E3DAC9] rounded-md px-4 py-2 transition hover:bg-[#E3DAC9] hover:text-black text-white"
            aria-label="Schließen"
          >
            Zurück
          </button>
          
          <div className="relative bg-white rounded-lg shadow-lg w-[90%] h-[70%] mb-4">
            <iframe
              src="https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/04/08/12/20250408120830-64424DW9.json"
              title="KI Assistent"
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>

          {/* Disclaimer below chat */}
          <div className="bg-yellow-900/30 border border-yellow-600/40 rounded-lg p-4 flex items-start gap-3 max-w-[90%]">
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-100 text-sm">
              <strong>Hinweis:</strong> Der KI-Assistent dient der ersten Orientierung. Es können Fehlinformationen entstehen. 
              Wir übernehmen keine Haftung für die Richtigkeit der Antworten. Für verbindliche Auskünfte kontaktieren Sie uns bitte direkt.
            </p>
          </div>
        </div>
      )}

      {/* Status Check Section */}
      <div className="container mx-auto mt-16 pt-12 border-t border-[#E3DAC9]">
        <h2 className="text-white text-2xl lg:text-3xl font-light leading-tight mb-6">
          Status Ihrer Anfrage überprüfen
        </h2>
        <p className="mb-6">
          Geben Sie Ihre Support-Nummer und die E-Mail-Adresse ein, mit der Sie die Anfrage gestellt haben.
        </p>

        {statusError && <div className="mb-4 p-4 bg-red-500 text-white rounded-md">{statusError}</div>}
        {deleteSuccess && <div className="mb-4 p-4 bg-green-500 text-white rounded-md">{deleteSuccess}</div>}

        <form onSubmit={handleStatusCheck} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            name="supportNumber"
            value={statusQuery.supportNumber}
            onChange={handleStatusChange}
            placeholder="Support-Nummer (z.B. S_1234567890)"
            className="px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
            required
          />
          <input
            type="email"
            name="email"
            value={statusQuery.email}
            onChange={handleStatusChange}
            placeholder="E-Mail-Adresse"
            className="px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#E3DAC9] text-black rounded-md hover:bg-[#d1c3a8] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Search className="w-4 h-4" />
            {isLoading ? "Wird gesucht..." : "Status abfragen"}
          </button>
        </form>

        {statusResult && (
          <div className="p-6 bg-[rgba(227,218,201,0.1)] rounded-md relative">
            {/* Close button */}
            <button
              onClick={handleCloseResult}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[rgba(227,218,201,0.3)] transition"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-4">Anfrage gefunden</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[#E3DAC9] font-medium">Name:</p>
                <p>
                  {statusResult.firstName} {statusResult.lastName}
                </p>
              </div>
              <div>
                <p className="text-[#E3DAC9] font-medium">E-Mail:</p>
                <p>{statusResult.email}</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] font-medium">Betreff:</p>
                <p>{statusResult.subject}</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] font-medium">Eingereicht am:</p>
                <p>{formatDate(statusResult.timestamp)}</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] font-medium">Status:</p>
                <p className="font-bold">{translateStatus(statusResult.status)}</p>
              </div>
            </div>

            {/* Delete request button and confirmation */}
            <div className="mt-6 pt-4 border-t border-[rgba(227,218,201,0.3)]">
              {!showConfirmDelete ? (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Anfrage zurückziehen
                </button>
              ) : (
                <div className="bg-red-900/30 p-4 rounded-md">
                  <p className="mb-3 font-medium">
                    Sind Sie sicher, dass Sie diese Anfrage zurückziehen möchten? Diese Aktion kann nicht rückgängig
                    gemacht werden.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteRequest}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-70"
                    >
                      {isDeleting ? "Wird gelöscht..." : "Ja, zurückziehen"}
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}