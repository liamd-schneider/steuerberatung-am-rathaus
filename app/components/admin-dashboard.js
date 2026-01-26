"use client"

import { useState, useEffect, useRef } from "react"
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  assignFormTextToUser,
  removeFormTextFromUser,
  getUserAssignedForms,
  getCompletedForms,
  getUserUploadedFiles,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getContactInquiries,
  updateContactInquiryStatus,
  getAppointments,
  getCategories,
  createCategory,
  assignCustomerToCategory,
  removeCustomerFromCategory,
  generatePassword,
} from "@/sanity/lib"
import { PREDEFINED_FORMS } from "@/sanity/predefined-forms"
import emailjs from "@emailjs/browser"
import {
  getAllCategories,
  getMainCategoriesAction,
  getSubcategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  assignCustomerToCategoryAction,
  removeCustomerFromCategoryAction,
  getCustomersByCategoryAction,
  moveCategoryAction,
} from "@/sanity/actions"

export default function AdminDashboard({ onLogout }) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null)
const [selectedSubcategoryFilters, setSelectedSubcategoryFilters] = useState([])
const [includeSubcategoriesInFilter, setIncludeSubcategoriesInFilter] = useState(false)
const [availableSubcategoriesForFilter, setAvailableSubcategoriesForFilter] = useState([])

  const [categories, setCategories] = useState([])
const [mainCategories, setMainCategories] = useState([])
const [selectedCategory, setSelectedCategory] = useState(null)
const [selectedSubcategories, setSelectedSubcategories] = useState([])

// Kategorie-Modals
const [showCategoryModal, setShowCategoryModal] = useState(false)
const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
const [showMoveCategoryModal, setShowMoveCategoryModal] = useState(false)

// Kategorie-Formulardaten
const [newCategoryName, setNewCategoryName] = useState("")
const [newCategoryDescription, setNewCategoryDescription] = useState("")
const [parentCategoryForNew, setParentCategoryForNew] = useState(null)
const [editingCategory, setEditingCategory] = useState(null)
const [movingCategory, setMovingCategory] = useState(null)

// Kategorie-Zuweisung
const [showAssignCategoryModal, setShowAssignCategoryModal] = useState(false)
const [customerToAssignCategory, setCustomerToAssignCategory] = useState(null)
const [showCategoryDetails, setShowCategoryDetails] = useState(null)

// Filter
const [categoryFilter, setCategoryFilter] = useState("all")

  const [activeTab, setActiveTab] = useState("customers")
  const [customers, setCustomers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [contactInquiries, setContactInquiries] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState(null)
  const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  kundennummer: "", // HINZUGEFÜGT: Kundennummer-Feld
})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedCustomerForms, setSelectedCustomerForms] = useState([])
  const [completedForms, setCompletedForms] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [newFormText, setNewFormText] = useState("")

  const [selectedInquiry, setSelectedInquiry] = useState(null)

  const [customerFilter, setCustomerFilter] = useState("all")
 

  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailCustomer, setEmailCustomer] = useState(null)
  const [testEmailAddress, setTestEmailAddress] = useState("")
  const [showTestEmailModal, setShowTestEmailModal] = useState(false)

  const [previewForm, setPreviewForm] = useState(null)
  const [showFormPreview, setShowFormPreview] = useState(false)
  const [formAnswers, setFormAnswers] = useState({})
  // Füge diese Funktionen und States zu deinem AdminDashboard hinzu:

// 1. Erweitere die States (am Anfang der Komponente):
const [showPartnerFields, setShowPartnerFields] = useState(false)
const [numberOfChildren, setNumberOfChildren] = useState(0)
const formTopRef = useRef(null)

const [fileUploads, setFileUploads] = useState({})
useEffect(() => {
  if (selectedCategoryFilter) {
    const category = categories.find(c => c._id === selectedCategoryFilter)
    if (category && category.subcategories) {
      setAvailableSubcategoriesForFilter(category.subcategories)
    } else {
      setAvailableSubcategoriesForFilter([])
    }
  } else {
    setAvailableSubcategoriesForFilter([])
    setSelectedSubcategoryFilters([])
  }
}, [selectedCategoryFilter, categories])

// Handler für Unterkategorie-Auswahl
const handleSubcategoryFilterToggle = (subcategoryId) => {
  setSelectedSubcategoryFilters(prev => {
    if (prev.includes(subcategoryId)) {
      return prev.filter(id => id !== subcategoryId)
    } else {
      return [...prev, subcategoryId]
    }
  })
}
const handleResetCategoryFilter = () => {
  setSelectedCategoryFilter(null)
  setSelectedSubcategoryFilters([])
  setIncludeSubcategoriesInFilter(false)
}

// 2. Füge die createDynamicQuestionLabel Funktion hinzu:
const createDynamicQuestionLabel = (key) => {
  const cleanKey = key.startsWith("question_") ? key.replace("question_", "") : key

  const questionTemplates = {
    // Arbeitsverhältnisse (job)
    job: {
      base: [
        "Name des Arbeitgebers",
        "Ausgeübte Tätigkeit",
        "Anschrift der Arbeitsstätte (Straße, PLZ, Ort)",
        "Beginn des Arbeitsverhältnisses",
        "Ende des Arbeitsverhältnisses (optional)",
        "Lohnsteuerbescheinigung vorhanden?",
        "Gab es Unterbrechungen (z. B. Krankengeld, KUG)?",
        "Falls Ja: Art und Zeitraum",
      ],
      werbung: [
        "Werbungskosten-Pauschale von 1.230 € nutzen?",
        "Hat der Arbeitgeber eine erste Tätigkeitsstätte bestimmt?",
        "Arbeitstage pro Woche (durchschnittlich)",
        "Sonstiges (Arbeitstage)",
        "Tatsächliche Arbeitstage im Jahr",
        "Einfache Entfernung zur Arbeitsstätte (in km)",
        "Beförderungsmittel",
      ],
      fort: [
        "Bezeichnung der Fortbildung",
        "Zeitraum",
        "Teilnahmegebühren (€)",
        "Fahrtkosten: Entfernung (km)",
        "Beförderungsmittel",
        "Verpflegungsmehraufwand",
        "Übernachtungskosten (€)",
        "Arbeitgebererstattung erfolgt?",
        "Falls Ja, Details",
        "Upload: Teilnahme, Belege etc.",
      ],
      reise: [
        "Zweck der Reise",
        "Abreise",
        "Rückreise",
        "Ziel / Einsatzort",
        "Fahrtkosten",
        "Verpflegungsmehraufwand",
        "Übernachtungskosten (€)",
        "Mahlzeiten gestellt?",
        "Anzahl gestellter Mahlzeiten",
        "Arbeitgebererstattung erfolgt?",
        "Falls Ja, Details",
        "Upload: Belege, Abrechnungen",
      ],
      zusatz: [
        "Arbeitsmittel (Bezeichnung, Kaufpreis, Jahr)",
        "Arbeitszimmer / Homeoffice",
        "Homeoffice (Tage)",
        "Arbeitszimmer vorhanden",
        "Telefon / Internet beruflich genutzt (Anteil oder Betrag)",
        "Gewerkschafts-/Verbandsbeiträge",
        "Steuerberatungskosten für Vorjahr",
        "Berufskleidung / Reinigungskosten",
      ],
      upload: [
        "Upload – Lohnsteuerbescheinigung(en)",
        "Upload – Fortbildungsnachweise",
        "Upload – Reisekostenbelege",
        "Upload – Nachweise für Werbungskosten",
      ],
      freitext: ["Besondere Konstellationen, berufliche Wechsel, Auslandstätigkeit o. Ä."],
    },

    // Kinder
    child: [
      "Name des Kindes",
      "Geburtsdatum des Kindes",
      "Steuer-ID des Kindes",
      "Abweichender Elternteil (Name, Geburtsdatum, Anschrift)",
      "Kindergeldbezug",
      "Schwerbehinderung / Pflegegrad beim Kind?",
      "Upload: Schwerbehinderung / Pflegegrad Nachweis",
      "Alleinerziehend",
      "Angabe zur Beantragung des Entlastungsbetrags",
      "Volljähriges Kind in Ausbildung / Studium",
      "Angabe zur Wohnsituation",
    ],

    // Partner
    partner: [
      "Anrede des Ehepartners",
      "Vorname des Ehepartners",
      "Nachname des Ehepartners",
      "Geburtsdatum des Ehepartners",
      "Beruf / Tätigkeit des Ehepartners",
      "Steuer-ID des Ehepartners",
      "Telefon des Ehepartners",
      "Nationalität des Ehepartners",
      "Religion des Ehepartners",
      "E-Mail-Adresse des Ehepartners",
      "Schwerbehinderung / Pflegegrad beim Ehepartner?",
    ],

    // Kapitalerträge
    kapital: {
      base: [
        "Name des Kreditinstituts / der Plattform",
        "Art der Erträge",
        "Wurden Kapitalerträge nach §43a EStG einbehalten?",
        "Liegt eine Jahressteuerbescheinigung vor?",
        "Wurde ein Freistellungsauftrag gestellt?",
        "Höhe des Freistellungsauftrags (in €)",
        "Wurden Verluste bescheinigt / verrechnet?",
        "Upload: Jahressteuerbescheinigung",
      ],
      weitere: [
        "Handelt es sich um Kapitalerträge aus dem Ausland?",
        "Falls Ja: Land, Art der Erträge und Höhe",
        "Upload: Steuerbescheinigung / Ertragsnachweis",
        "Zinsen aus privat vergebenen Darlehen erhalten?",
        "Darlehensnehmer",
        "Höhe der Zinserträge (in €)",
        "Besteht ein schriftlicher Darlehensvertrag?",
        "Upload: Darlehensvertrag / Zinsnachweis",
      ],
    },

    // Veräußerungsgeschäfte
    veraeusserung: {
      base: [
        "Art des Wirtschaftsguts",
        "Sonstiges (Art des Wirtschaftsguts)",
        "Datum Anschaffung",
        "Datum Veräußerung",
        "Veräußerungserlös (€)",
        "Anschaffungskosten + Nebenkosten (€)",
        "Wertsteigerungsmaßnahmen / Renovierungen durchgeführt?",
        "Vermittlungsgebühren / Notarkosten gezahlt?",
        "Wurde das Objekt selbst genutzt?",
        "Zeitraum Eigennutzung",
        "Upload: Kaufvertrag, Verkaufsunterlagen, Kostenbelege",
      ],
    },

    // Krypto
    krypto: {
      base: ["Name der Plattform / Wallet", "Upload: vollständige Transaktionslisten, Reports"],
    },

    // Immobilien/Miete
    miete: {
      grunddaten: [
        "Handelt es sich um eine erstmalige Vermietung / Neuanschaffung?",
        "Kaufpreis (€)",
        "Notarkosten (€)",
        "Grundbuchkosten (€)",
        "Maklerprovision (€)",
        "Weitere Erwerbsnebenkosten (€)",
        "Anschaffungsnahe Herstellungskosten (€)",
        "Baujahr des Gebäudes",
        "Gesamtfläche des Objekts (m²)",
        "Wohnfläche der Einheit (m²)",
        "Anzahl / Art Stellplätze",
        "Anzahl Stellplätze",
        "Aktuelle AfA-Bemessungsgrundlage (€)",
        "Bisherige Abschreibungen insgesamt (€)",
        "Einheitswert-Aktenzeichen (Grundsteuer)",
        "Anschaffungs- oder Fertigstellungszeitpunkt",
        "Wurde die Immobilie im VZ veräußert?",
      ],
      objekt: [
        "Objektbezeichnung",
        "Objektart",
        "Eigentumsverhältnis",
        "Miteigentumsanteil (%)",
        "Straße",
        "PLZ / Ort",
      ],
      nutzung: [
        "Anzahl vermieteter Einheiten",
        "Nutzung durch",
        "Miete entspricht ortsüblicher Miete?",
        "Leerstand im VZ?",
        "Dauer & Grund des Leerstands",
      ],
      einnahmen: [
        "Bezeichnung der Einheit / Lage",
        "Wohnfläche (m²)",
        "Mieteinnahmen ohne Umlagen (€)",
        "Umlagen (Nebenkosten) (€)",
        "Wurden Kautionen mit Forderungen verrechnet?",
        "Einnahmen aus Garagen / Stellplätzen (€)",
        "Einnahmen aus Werbeflächen (€)",
        "Kurzzeitvermietung (z. B. Airbnb)?",
        "Upload: Mietverträge, Einnahmenübersicht, Kontoauszüge",
      ],
      werbungskosten: [
        "AfA-Bemessungsgrundlage (€)",
        "Abschreibungssatz (%)",
        "Individueller Satz (%)",
        "Zeitraum der Abschreibung – von",
        "Zeitraum der Abschreibung – bis",
        "Anzahl Finanzierungsverträge",
        "Upload: Darlehensverträge, Zinsnachweise",
        "Erhaltungsaufwand Beschreibung",
        "Erhaltungsaufwand Betrag (€)",
        "Sofort abzugsfähig?",
        "Upload: Handwerkerrechnung / Zahlungsnachweis",
        "Hausgeldzahlungen (€)",
        "Instandhaltungsrücklage (€)",
        "Upload: Hausgeldabrechnung aktuelles Jahr & Vorjahr",
        "Fahrtkosten zur Immobilie (€)",
        "Verwaltungskosten / Hausmeister / Sonstiges",
        "Upload: Nachweise für Werbungskosten",
      ],
    },

    // Unterhalt gezahlt
    unterhalt: ["Empfänger", "Verwandtschaftsverhältnis", "Betrag (€)", "Besteht Anspruch auf Anlage U?"],

    // Unterhalt bezogen
    bezogen: ["Betrag (€)"],

    // Betreuungskosten
    betreuung: [
      "Anzahl Kinder mit Betreuungskosten",
      "Gesamtkosten (€)",
      "Arbeitgeberzuschuss enthalten?",
      "Anteil privat gezahlt (€)",
      "Upload: Rechnungen, Nachweise, Bescheinigungen",
    ],

    // Gesundheitskosten
    gesund: [
      "Art der Aufwendung",
      "Betrag gesamt (€)",
      "Wurden Zuschüsse (z. B. durch Krankenkasse, Pflegeversicherung) gezahlt?",
      "Upload: Arztrechnungen, Zuzahlungsübersichten, Bescheide",
    ],

    // Spenden, Riester, etc.
    spende: [
      "Gesamtbetrag",
      "Spendenempfänger / Organisation(en)",
      "Wurden Zuwendungsbestätigungen eingereicht?",
      "Upload Spendenbescheinigung",
    ],

    riester: ["Versicherungsnummer / Zulagenstelle", "Anbieter / Vertragsart", "Jahresbeitrag"],

    zrente: ["Anbieter / Vertragsart", "Jahresbeitrag"],

    // Renten und Pensionen
    rente: {
      base: [
        "Art der Leistung",
        "Rentenzahlende Stelle / Versicherungsträger",
        "Beginn der Rentenzahlung",
        "Rentenbetrag im Veranlagungszeitraum",
        "Steuerbescheinigung der Rentenstelle vorhanden?",
        "Upload: Rentenbezugsmitteilung / Leistungsnachweis / Steuerbescheinigung",
      ],
      weitere: [
        "Wurde im laufenden Jahr eine Einmalzahlung oder Nachzahlung geleistet?",
        "Betrag und Anlass",
        "Wurde eine Rückzahlung oder Kürzung vorgenommen?",
        "Betrag und Grund",
        "Besteht Anspruch auf Versorgungsfreibetrag / Werbungskosten-Pauschale?",
        "Besteht eine ausländische Besteuerung?",
        "Falls ja: In welchem Land?",
        "Besteht ein Doppelbesteuerungsabkommen (DBA)?",
        "Upload: ausländische Rentenbescheide, Steuerbescheinigungen",
      ],
      sonstiges: ["Sonstiges / Hinweise", "Weitere Hinweise zur Rentenversteuerung"],
    },

    // Selbstständige/Freiberufliche Tätigkeit
    selbststaendig: {
      allgemein: [
        "Art der Tätigkeit",
        "Sonstiges (Art der Tätigkeit)",
        "Bezeichnung des Unternehmens / der Praxis",
        "Beginn der Tätigkeit",
        "Wurde die Tätigkeit im VZ beendet?",
        "Firmenanschrift (Straße, PLZ, Ort)",
        "Telefonnummer / geschäftliche E-Mail",
        "Geschäftliche Bankverbindung",
        "Betriebsstättenfinanzamt",
        "Steuernummer",
        "Besteht eine Eintragung im Handelsregister?",
        "Besteht Bilanzierungspflicht?",
        "Betriebsstätte vorhanden?",
        "USt-IdNr. (falls vorhanden)",
        "Umsatzbesteuerung",
        "Wurde ISt-Versteuerung beantragt?",
        "Genehmigung des Finanzamts vorhanden?",
        "Abgabefrist für USt-Voranmeldungen",
        "Werden Mitarbeiter beschäftigt?",
        "Weitere Infos zu Mitarbeitern",
        "Unternehmernummer der Berufsgenossenschaft",
        "Wurden Betriebsprüfungen durchgeführt (Finanzamt / Rentenversicherung)?",
        "Weitere steuerliche Regelungen / Genehmigungen",
        "§13b UStG (Reverse Charge) anwendbar?",
        "Freistellungsbescheinigung vorhanden?",
        "Weitere behördliche Genehmigungen / Sonderregelungen",
      ],
      gesellschaft: [
        "Gesellschaftsform",
        "Gesellschaftsvertrag vorhanden?",
        "Name und Steuernummer der Gesellschaft",
      ],
      ergaenzend: [
        "Wurde ein oder mehrere Firmenfahrzeuge genutzt?",
        "Art der Nutzung",
        "Wurde ein Homeoffice genutzt?",
        "Bestand die Tätigkeit bereits in Vorjahren?",
        "Letzte Gewinnermittlung bzw. Bilanz",
        "Aufstellung des Anlagevermögens",
        "Kontenblätter der Finanzbuchhaltung",
        "Gab es Corona-Hilfen oder sonstige Fördermittel im Veranlagungszeitraum?",
        "Art und Betrag",
        "Sonstige relevante Hinweise",
      ],
    },

    stellungnahme: ["Beschreibung des konkreten Falls"],
  }

  // Parse the key to extract components
  const keyParts = cleanKey.split("_")

  if (keyParts.length < 2) {
    return cleanKey.replace(/_/g, " ")
  }

  const [category, instanceOrSubcategory, subcategoryOrIndex, ...rest] = keyParts

  // Handle different key patterns
  if (questionTemplates[category]) {
    const template = questionTemplates[category]

    // Simple array template
    if (Array.isArray(template)) {
      const index = Number.parseInt(instanceOrSubcategory)
      if (!isNaN(index) && template[index]) {
        return template[index]
      }
    }

    // Complex object template
    else if (typeof template === "object") {
      const instance = Number.parseInt(instanceOrSubcategory)
      const subcategory = subcategoryOrIndex
      const index = Number.parseInt(rest[0])

      if (!isNaN(instance) && template[subcategory] && Array.isArray(template[subcategory])) {
        const questionIndex = !isNaN(index) ? index : 0
        if (template[subcategory][questionIndex]) {
          return `${template[subcategory][questionIndex]} (${category.toUpperCase()} ${instance + 1})`
        }
      }
    }
  }

  // Special cases
  if (cleanKey.includes("_sonstiges")) {
    return cleanKey.replace(/_sonstiges$/, " (Sonstiges)").replace(/_/g, " ")
  }

  if (cleanKey.includes("_zeitraum")) {
    return cleanKey.replace(/_zeitraum$/, " (Zeitraum)").replace(/_/g, " ")
  }

  // Fallback
  return cleanKey.replace(/_/g, " ")
}

// 3. Ersetze die aktuelle renderFormField Funktion komplett mit der erweiterten Version
// Die renderFormField Funktion aus dem Customer Dashboard übernehmen
// (Die vollständige Funktion ist zu lang für diese Antwort, aber sie ist identisch mit der aus dem Customer Dashboard)

// 4. Füge die useEffect Hooks hinzu für dynamische Felder:
useEffect(() => {
  const familienstandKey = Object.keys(formAnswers).find((key) =>
    previewForm?.questions?.some((q, i) => `question_${i}` === key && q.questionText === "Familienstand"),
  )

  if (familienstandKey) {
    const selected = formAnswers[familienstandKey]
    setShowPartnerFields(selected === "verheiratet")
  }

  const kinderKey = Object.keys(formAnswers).find((key) =>
    previewForm?.questions?.some((q, i) => `question_${i}` === key && q.questionText.includes("Anzahl Kinder")),
  )

  if (kinderKey) {
    const selected = Number.parseInt(formAnswers[kinderKey])
    setNumberOfChildren(isNaN(selected) ? 0 : selected)
  }
}, [formAnswers, previewForm])

  

  const [emailConfig, setEmailConfig] = useState({
    serviceId: "service_z0bgw1a",
    templateId: "template_278agrk",
    publicKey: "rTyLRMB6bVblKmGW1",
  })
  const [showEmailConfigModal, setShowEmailConfigModal] = useState(false)
  const [emailConfigured, setEmailConfigured] = useState(false)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const savedConfig = localStorage.getItem("emailjs-config")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      setEmailConfig(config)
      setEmailConfigured(true)
      emailjs.init(config.publicKey)
    }
  }, [])

  const fetchData = async () => {
  setIsLoading(true)
  try {
    const [customersData, appointmentsData, inquiriesData, notificationsData, categoriesData, mainCategoriesData] = 
      await Promise.all([
        getCustomers(),
        getAppointments(),
        getContactInquiries(),
        getNotifications(),
        getAllCategories(),
        getMainCategoriesAction(),
      ])

    setCustomers(customersData || [])
    setAppointments(appointmentsData || [])
    setContactInquiries(inquiriesData || [])
    setNotifications(notificationsData || [])
    setCategories(categoriesData || [])
    setMainCategories(mainCategoriesData || [])
  } catch (error) {
    console.error("Error fetching data:", error)
    setError("Fehler beim Laden der Daten")
  } finally {
    setIsLoading(false)
  }
}

const handleCreateMainCategory = async () => {
  if (!newCategoryName.trim()) {
    setError("Bitte geben Sie einen Kategorienamen ein")
    return
  }

  try {
    const result = await createCategoryAction(newCategoryName, newCategoryDescription, null)
    if (result.success) {
      setSuccess("Hauptkategorie erfolgreich erstellt")
      setNewCategoryName("")
      setNewCategoryDescription("")
      setShowCategoryModal(false)
      fetchData()
    } else {
      setError(result.error)
    }
  } catch (error) {
    setError(`Fehler beim Erstellen der Kategorie: ${error.message}`)
  }
}

// Erstelle Unterkategorie
const handleCreateSubcategory = async () => {
  if (!newCategoryName.trim()) {
    setError("Bitte geben Sie einen Namen ein")
    return
  }

  if (!parentCategoryForNew) {
    setError("Bitte wählen Sie eine übergeordnete Kategorie")
    return
  }

  try {
    const result = await createCategoryAction(
      newCategoryName, 
      newCategoryDescription, 
      parentCategoryForNew
    )
    if (result.success) {
      setSuccess("Unterkategorie erfolgreich erstellt")
      setNewCategoryName("")
      setNewCategoryDescription("")
      setParentCategoryForNew(null)
      setShowSubcategoryModal(false)
      fetchData()
    } else {
      setError(result.error)
    }
  } catch (error) {
    setError(`Fehler beim Erstellen der Unterkategorie: ${error.message}`)
  }
}
const handleEditCategory = (category) => {
  setEditingCategory(category)
  setNewCategoryName(category.name)
  setNewCategoryDescription(category.description || "")
  setShowEditCategoryModal(true)
}

const handleSaveEditCategory = async () => {
  if (!newCategoryName.trim()) {
    setError("Bitte geben Sie einen Namen ein")
    return
  }

  try {
    const result = await updateCategoryAction(editingCategory._id, {
      name: newCategoryName,
      description: newCategoryDescription,
    })
    
    if (result.success) {
      setSuccess("Kategorie erfolgreich aktualisiert")
      setNewCategoryName("")
      setNewCategoryDescription("")
      setEditingCategory(null)
      setShowEditCategoryModal(false)
      fetchData()
    } else {
      setError(result.error)
    }
  } catch (error) {
    setError(`Fehler beim Aktualisieren: ${error.message}`)
  }
}

// Lösche Kategorie
const handleDeleteCategory = async (categoryId) => {
  if (!window.confirm("Sind Sie sicher, dass Sie diese Kategorie löschen möchten?")) {
    return
  }

  try {
    const result = await deleteCategoryAction(categoryId)
    if (result.success) {
      setSuccess("Kategorie erfolgreich gelöscht")
      fetchData()
    } else {
      setError(result.error)
    }
  } catch (error) {
    setError(`Fehler beim Löschen: ${error.message}`)
  }
}

// Verschiebe Kategorie
const handleMoveCategory = (category) => {
  setMovingCategory(category)
  setShowMoveCategoryModal(true)
}

const handleSaveMoveCategory = async (newParentId) => {
  try {
    const result = await moveCategoryAction(movingCategory._id, newParentId)
    if (result.success) {
      setSuccess("Kategorie erfolgreich verschoben")
      setMovingCategory(null)
      setShowMoveCategoryModal(false)
      fetchData()
    } else {
      setError(result.error)
    }
  } catch (error) {
    setError(`Fehler beim Verschieben: ${error.message}`)
  }
}

// Zeige Kategorie-Details mit Kunden
const handleShowCategoryDetails = async (category, includeSubcats = false) => {
  try {
    const customersInCategory = await getCustomersByCategoryAction(category._id, includeSubcats)
    setShowCategoryDetails({
      ...category,
      customers: customersInCategory,
      includesSubcategories: includeSubcats
    })
  } catch (error) {
    setError(`Fehler beim Laden der Details: ${error.message}`)
  }
}

// Kategorie zuweisen
const handleAssignCategory = async (categoryId) => {
  try {
    const result = await assignCustomerToCategoryAction(customerToAssignCategory, categoryId)
    if (result.success) {
      setSuccess("Kunde erfolgreich der Kategorie zugeordnet")
      fetchData()
    } else {
      setError(result.error)
    }
    setShowAssignCategoryModal(false)
    setCustomerToAssignCategory(null)
  } catch (error) {
    setError(`Fehler beim Zuordnen: ${error.message}`)
  }
}

// Kategorie entfernen
const handleRemoveFromCategory = async (customerId, categoryId) => {
  try {
    const result = await removeCustomerFromCategoryAction(customerId, categoryId)
    if (result.success) {
      setSuccess("Kunde erfolgreich aus der Kategorie entfernt")
      fetchData()
    } else {
      setError(result.error)
    }
  } catch (error) {
    setError(`Fehler beim Entfernen: ${error.message}`)
  }
}

  const fetchNotifications = async () => {
    try {
      const notificationsData = await getNotifications()
      setNotifications(notificationsData || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsCreating(true)

    try {
      const generatedPassword = generatePassword()
      const customerDataWithPassword = {
        ...formData,
        passwort: generatedPassword,
      }

      const result = await createCustomer(customerDataWithPassword)
      await sendWelcomeEmail({ ...customerDataWithPassword, ...result })
      setSuccess(`Kunde erfolgreich erstellt und E-Mail gesendet. Passwort: ${generatedPassword}`)
      setFormData({ firstName: "", lastName: "", email: "" })
      fetchData()
    } catch (error) {
      setError(`Fehler beim Erstellen des Kunden: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateCustomer = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsEditing(true)

    try {
      await updateCustomer(currentCustomer._id, formData)
      setSuccess("Kunde erfolgreich aktualisiert")
      setCurrentCustomer(null)
      setFormData({ firstName: "", lastName: "", email: "" })
      fetchData()
    } catch (error) {
      setError(`Fehler beim Aktualisieren des Kunden: ${error.message}`)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Kunden löschen möchten?")) {
      try {
        await deleteCustomer(customerId)
        setSuccess("Kunde erfolgreich gelöscht")
        fetchData()
      } catch (error) {
        setError(`Fehler beim Löschen des Kunden: ${error.message}`)
      }
    }
  }

const handleEditCustomer = (customer) => {
  setCurrentCustomer(customer)
  setFormData({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    kundennummer: customer.kundennummer || "", // HINZUGEFÜGT
  })
}

  const handleCancelEdit = () => {
  setCurrentCustomer(null)
  setFormData({ 
    firstName: "", 
    lastName: "", 
    email: "",
    kundennummer: "" // HINZUGEFÜGT
  })
}

  const handleAssignForm = async (customerId) => {
    setSelectedCustomer(customerId)
    setShowAssignForm(true)

    try {
      const [assignedForms, completedData, uploadedFilesData] = await Promise.all([
        getUserAssignedForms(customerId),
        getCompletedForms(customerId),
        getUserUploadedFiles(customerId),
      ])

      setSelectedCustomerForms(assignedForms || [])
      setCompletedForms(completedData?.ausgefuellteformulare || [])
      setUploadedFiles(uploadedFilesData || [])
    } catch (error) {
      setError(`Fehler beim Laden der Formulardaten: ${error.message}`)
    }
  }

  const handleAssignPredefinedForm = async (formText) => {
    try {
      await assignFormTextToUser(selectedCustomer, formText)
      setSuccess("Formular erfolgreich zugewiesen")

      const assignedForms = await getUserAssignedForms(selectedCustomer)
      setSelectedCustomerForms(assignedForms || [])
    } catch (error) {
      setError(`Fehler beim Zuweisen des Formulars: ${error.message}`)
    }
  }

  const handleAssignCustomForm = async () => {
    if (!newFormText.trim()) {
      setError("Bitte geben Sie einen Formulartext ein")
      return
    }

    try {
      await assignFormTextToUser(selectedCustomer, newFormText)
      setSuccess("Benutzerdefiniertes Formular erfolgreich zugewiesen")
      setNewFormText("")

      const assignedForms = await getUserAssignedForms(selectedCustomer)
      setSelectedCustomerForms(assignedForms || [])
    } catch (error) {
      setError(`Fehler beim Zuweisen des benutzerdefinierten Formulars: ${error.message}`)
    }
  }

  const handleRemoveForm = async (formIndex) => {
    try {
      await removeFormTextFromUser(selectedCustomer, formIndex)
      setSuccess("Formular erfolgreich entfernt")

      const assignedForms = await getUserAssignedForms(selectedCustomer)
      setSelectedCustomerForms(assignedForms || [])
    } catch (error) {
      setError(`Fehler beim Entfernen des Formulars: ${error.message}`)
    }
  }

  const handleCloseAssignForm = () => {
    setShowAssignForm(false)
    setSelectedCustomer(null)
    setSelectedCustomerForms([])
    setCompletedForms([])
    setUploadedFiles([])
    setNewFormText("")
  }

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry)
  }

  const handleCloseInquiry = () => {
    setSelectedInquiry(null)
  }

  const handleUpdateInquiryStatus = async (inquiryId, status) => {
    try {
      await updateContactInquiryStatus(inquiryId, status)
      setSuccess("Status erfolgreich aktualisiert")
      fetchData()
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status })
      }
    } catch (error) {
      setError(`Fehler beim Aktualisieren des Status: ${error.message}`)
    }
  }

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead()
      if (result.success) {
        setSuccess(result.message)
        fetchNotifications()
      }
    } catch (error) {
      setError(`Fehler beim Markieren der Benachrichtigungen: ${error.message}`)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Bitte geben Sie einen Kategorienamen ein")
      return
    }

    try {
      await createCategory(newCategoryName)
      setSuccess("Kategorie erfolgreich erstellt")
      setNewCategoryName("")
      setShowCategoryModal(false)
      fetchData()
    } catch (error) {
      setError(`Fehler beim Erstellen der Kategorie: ${error.message}`)
    }
  }

 

 

  const handleSaveEmailConfig = () => {
    if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
      setError("Bitte füllen Sie alle E-Mail-Konfigurationsfelder aus")
      return
    }

    localStorage.setItem("emailjs-config", JSON.stringify(emailConfig))
    setEmailConfigured(true)
    setShowEmailConfigModal(false)
    emailjs.init(emailConfig.publicKey)
    setSuccess("E-Mail-Konfiguration gespeichert")
  }

  const generateEmailHTML = (customer) => {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Ihr Kundenkonto - Steuerberatung am Rathaus</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; color: #333333;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
<tr>
<td>
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
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td align="center" style="padding: 40px 0;">
<table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
<tr>
<td style="padding: 40px 30px;">
<h2 style="color: #333333; font-size: 20px; margin: 0 0 20px 0;">Ihr Kundenkonto</h2>
<p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">Sehr geehrte/r ${customer.firstName} ${customer.lastName},</p>
<p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">Ihr Kundenkonto wurde soeben von unserem Administrator eingerichtet. Über die folgende Plattform haben Sie nun die Möglichkeit, Ihre Unterlagen und alle benötigten Informationen bequem hochzuladen:</p>
<table border="0" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
<tr>
<td style="background-color: #E3DAC9; border-radius: 4px; text-align: center;">
<a href="https://steuerberatung-am-rathaus.vercel.app/login" target="_blank" style="display: inline-block; padding: 12px 30px; color: #333333; font-size: 16px; font-weight: bold; text-decoration: none;">Anmelden</a>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f7f3; border-radius: 6px; margin: 30px 0;">
<tr>
<td style="padding: 20px;">
<h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">Ihre Zugangsdaten:</h3>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">E-Mail:</td>
<td style="color: #333333; font-size: 14px; font-weight: bold; padding: 5px 0;">${customer.email}</td>
</tr>
<tr>
<td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Passwort:</td>
<td style="color: #333333; font-size: 14px; padding: 5px 0;">${customer.passwort}</td>
</tr>
<tr>
<td width="150" style="color: #747171; font-size: 14px; padding: 5px 0;">Kundennummer:</td>
<td style="color: #333333; font-size: 14px; padding: 5px 0;">${customer.kundennummer}</td>
</tr>
</table>
</td>
</tr>
</table>
<p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">Bitte nutzen Sie die Ihnen zugesandten Zugangsdaten, um sich einzuloggen. Bei Fragen stehen wir Ihnen selbstverständlich jederzeit zur Verfügung.</p>
<table border="0" cellpadding="0" cellspacing="0">
<tr>
<td style="background-color: #E3DAC9; border-radius: 4px;">
<a href="https://steuerberatung-am-rathaus.vercel.app/#kontakt" target="_blank" style="display: inline-block; padding: 12px 24px; color: #333333; font-weight: bold; text-decoration: none;">Kontakt</a>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #747171; padding: 30px 0;">
<tr>
<td align="center">
<table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
<tr>
<td align="center" style="color: #ffffff; font-size: 14px; padding: 0 20px;">
<p style="margin: 0 0 10px 0;">Steuerberatung am Rathaus</p>
<p style="margin: 0 0 10px 0;">Rathausplatz 1, 12345 Musterstadt</p>
<p style="margin: 0 0 10px 0;">Tel: +49 020414066389 | E-Mail: stb-am-rathaus@email.de</p>
<p style="margin: 20px 0 0 0; font-size: 12px; color: #E3DAC9;">©2025 Steuerberatung am Rathaus und Liam Schneider. Alle Rechte vorbehalten.</p>
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

  const sendWelcomeEmail = async (customer) => {
    if (!emailConfigured) {
      setError("E-Mail-Service ist nicht konfiguriert")
      return
    }

    try {
      const emailHTML = generateEmailHTML(customer)

      const templateParams = {
        to_email: customer.email,
        to_name: `${customer.firstName} ${customer.lastName}`,
        from_name: "Steuerberatung am Rathaus",
        subject: "Ihr Kundenkonto - Steuerberatung am Rathaus",
        html_content: emailHTML,
        customer_firstname: customer.firstName,
        customer_lastname: customer.lastName,
        customer_email: customer.email,
        customer_password: customer.passwort,
        customer_number: customer.kundennummer,
      }

      await emailjs.send(emailConfig.serviceId, emailConfig.templateId, templateParams, emailConfig.publicKey)

      setSuccess(`Willkommens-E-Mail erfolgreich an ${customer.email} gesendet`)
      setShowEmailModal(false)
    } catch (error) {
      console.error("E-Mail Fehler:", error)
      setError(`Fehler beim Senden der E-Mail: ${error.message}`)
    }
  }

  const sendTestEmail = async () => {
    if (!emailConfigured) {
      setError("E-Mail-Service ist nicht konfiguriert")
      return
    }

    if (!testEmailAddress.trim()) {
      setError("Bitte geben Sie eine E-Mail-Adresse ein")
      return
    }

    try {
      const testCustomer = {
        firstName: "Max",
        lastName: "Mustermann",
        email: testEmailAddress,
        passwort: "Test123!",
        kundennummer: "KD12345",
      }

      const emailHTML = generateEmailHTML(testCustomer)

      const templateParams = {
        to_email: testEmailAddress,
        to_name: "Test User",
        from_name: "Steuerberatung am Rathaus",
        subject: "Test E-Mail - Steuerberatung am Rathaus",
        html_content: emailHTML,
        customer_firstname: testCustomer.firstName,
        customer_lastname: testCustomer.lastName,
        customer_email: testCustomer.email,
        customer_password: testCustomer.passwort,
        customer_number: testCustomer.kundennummer,
      }

      await emailjs.send(emailConfig.serviceId, emailConfig.templateId, templateParams, emailConfig.publicKey)

      setSuccess(`Test-E-Mail erfolgreich an ${testEmailAddress} gesendet`)
      setShowTestEmailModal(false)
      setTestEmailAddress("")
    } catch (error) {
      console.error("Test E-Mail Fehler:", error)
      setError(`Fehler beim Senden der Test-E-Mail: ${error.message}`)
    }
  }

  const handleSendWelcomeEmail = async (customer) => {
    await sendWelcomeEmail(customer)
  }

  const handleSendTestEmail = async () => {
    await sendTestEmail()
  }

  const handlePreviewForm = (form) => {
    setPreviewForm(form)
    setShowFormPreview(true)
    setFormAnswers({})
    setShowPartnerFields(false)
    setNumberOfChildren(0)
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }

  const handleCloseFormPreview = () => {
    setShowFormPreview(false)
    setPreviewForm(null)
    setFormAnswers({})
    setShowPartnerFields(false)
    setNumberOfChildren(0)
  }

  const handleInputChange = (e, index, type = "text", question = null) => {
    const { name, value, checked, files } = e.target

    if (type === "checkbox") {
      setFormAnswers((prev) => {
        const currentValues = prev[`question_${index}`] || []
        if (checked) {
          return { ...prev, [`question_${index}`]: [...currentValues, value] }
        } else {
          return { ...prev, [`question_${index}`]: currentValues.filter((v) => v !== value) }
        }
      })
    } else if (type === "file") {
      if (files && files.length > 0) {
        const file = files[0]
        setFormAnswers((prev) => ({ ...prev, [`file_${index}`]: file }))
      }
    } else {
      setFormAnswers((prev) => ({ ...prev, [`question_${index}`]: value }))
    }

    if (question && question.questionText === "Familienstand") {
      setShowPartnerFields(value === "verheiratet")
    }

    if (question && question.questionText === "Anzahl Kinder") {
      const count = Number.parseInt(value) || 0
      setNumberOfChildren(count)
    }
  }

  const getAnswer = (key) => formAnswers[`question_${key}`] || formAnswers[key]

  const renderFormField = (question, index) => {
    if (!question) return null

    switch (question.questionType) {
      case "text":
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
            {/* SEPA-Zustimmung unter Kontoinhaber */}
            {question.questionText === "Kontoinhaber" && (
              <div className="mt-4 space-y-2">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="sepa_zustimmung"
                    name="sepa_zustimmung"
                    checked={formAnswers.sepa_zustimmung || false}
                    onChange={(e) =>
                      setFormAnswers((prev) => ({
                        ...prev,
                        sepa_zustimmung: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-[#E3DAC9] border-gray-700 bg-[rgba(227,218,201,0.1)]"
                  />
                  <label htmlFor="sepa_zustimmung" className="ml-3 text-sm text-white">
                    Ich erteile ein SEPA-Lastschriftmandat.
                  </label>
                </div>
                <a
                  href="/pdfs/sepa-mandat.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E3DAC9] underline text-sm"
                >
                  SEPA-Mandat herunterladen (PDF)
                </a>
              </div>
            )}
          </div>
        )

      case "email":
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="email"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "date":
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "number":
        // Handle dynamic number fields with improved logic
        if (
          question.questionText === "Anzahl der Arbeitsverhältnisse" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numJobs = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              {/* Anzahl-Eingabe */}
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {/* Dynamisch pro Arbeitgeber */}
              {Array.from({ length: numJobs }).map((_, jobIdx) => {
                const prefix = `job_${jobIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={jobIdx} className="space-y-6 border-t border-gray-700 pt-6 pb-8">
                    <h3 className="text-white text-lg font-bold">Arbeitsverhältnis {jobIdx + 1}</h3>

                    {/* Basisdaten Arbeitgeber */}
                    {[
                      { questionText: "Name des Arbeitgebers", questionType: "text" },
                      { questionText: "Ausgeübte Tätigkeit", questionType: "text" },
                      { questionText: "Anschrift der Arbeitsstätte (Straße, PLZ, Ort)", questionType: "text" },
                      { questionText: "Beginn des Arbeitsverhältnisses", questionType: "date" },
                      {
                        questionText: "Ende des Arbeitsverhältnisses (optional)",
                        questionType: "date",
                        required: false,
                      },
                      {
                        questionText: "Lohnsteuerbescheinigung vorhanden?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Gab es Unterbrechungen (z. B. Krankengeld, KUG)?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                    ].map((q, i) => renderFormField({ ...q, required: q.required !== false }, `${prefix}_base_${i}`))}

                    {getAnswer("base_6") === "Ja" &&
                      renderFormField(
                        { questionText: "Falls Ja: Art und Zeitraum", questionType: "text", required: true },
                        `${prefix}_base_7`,
                      )}

                    {/* Werbungskosten-Pauschale Frage */}
                    {renderFormField(
                      {
                        questionText: "Werbungskosten-Pauschale von 1.230 € nutzen?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: true,
                      },
                      `${prefix}_werbung_pauschale`,
                    )}

                    {/* Nur bei "Nein" weitere Werbungskosten abfragen */}
                    {getAnswer("werbung_pauschale") === "Nein" && (
                      <div className="space-y-4 border-t border-gray-600 pt-4">
                        <h4 className="text-white font-semibold">Werbungskosten</h4>
                        {[
                          {
                            questionText: "Hat der Arbeitgeber eine erste Tätigkeitsstätte bestimmt?",
                            questionType: "multipleChoice",
                            options: ["Ja", "Nein", "Unbekannt"],
                          },
                          {
                            questionText: "Arbeitstage pro Woche (durchschnittlich)",
                            questionType: "multipleChoice",
                            options: ["5", "6", "Sonstiges"],
                          },
                          {
                            questionText: "Tatsächliche Arbeitstage im Jahr",
                            questionType: "number",
                          },
                          {
                            questionText: "Einfache Entfernung zur Arbeitsstätte (in km)",
                            questionType: "number",
                          },
                          {
                            questionText: "Beförderungsmittel",
                            questionType: "checkbox",
                            options: [
                              "Eigener PKW",
                              "Dienstwagen (Privatnutzung?)",
                              "ÖPNV",
                              "Fahrrad / zu Fuß",
                              "gemischt",
                            ],
                          },
                        ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_werbung_${i}`))}

                        {/* Sonstiges Feld bei Arbeitstage */}
                        {getAnswer("werbung_1") === "Sonstiges" &&
                          renderFormField(
                            { questionText: "Bitte angeben (Sonstiges)", questionType: "text", required: true },
                            `${prefix}_werbung_sonstiges`,
                          )}
                      </div>
                    )}

                    {/* Reisen */}
                    {renderFormField(
                      {
                        questionText: "Gab es Reisen?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: true,
                      },
                      `${prefix}_reise_flag`,
                    )}
                    {getAnswer("reise_flag") === "Ja" && (
                      <>
                        {renderFormField(
                          { questionText: "Anzahl der Reisen", questionType: "number", required: true },
                          `${prefix}_reise_count`,
                        )}
                        {Array.from({ length: Number.parseInt(getAnswer("reise_count") || 0) }).map((_, i) => (
                          <div key={i} className="space-y-4 border-t border-gray-600 pt-4">
                            <h4 className="text-white font-semibold">Reise {i + 1}</h4>
                            {[
                              { questionText: "Zweck der Reise", questionType: "text" },
                              { questionText: "Abreise", questionType: "date" },
                              { questionText: "Rückreise", questionType: "date" },
                              { questionText: "Ziel / Einsatzort", questionType: "text" },
                              {
                                questionText: "Fahrtkosten",
                                questionType: "checkbox",
                                options: ["PKW", "Dienstwagen", "ÖPNV"],
                              },
                              {
                                questionText: "Verpflegungsmehraufwand",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              { questionText: "Übernachtungskosten", questionType: "number" },
                              {
                                questionText: "Mahlzeiten gestellt?",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              {
                                questionText: "Arbeitgebererstattung erfolgt?",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              {
                                questionText: "Upload: Belege, Abrechnungen",
                                questionType: "fileUpload",
                                required: false,
                              },
                            ].map((q, j) =>
                              renderFormField(
                                { ...q, required: q.questionType !== "fileUpload" },
                                `${prefix}_reise_${i}_${j}`,
                              ),
                            )}

                            {/* Anzahl Mahlzeiten bei "Ja" */}
                            {getAnswer(`reise_${i}_7`) === "Ja" &&
                              renderFormField(
                                {
                                  questionText: "Anzahl gestellter Mahlzeiten",
                                  questionType: "number",
                                  required: true,
                                },
                                `${prefix}_reise_${i}_mahlzeiten_anzahl`,
                              )}

                            {/* Details bei Arbeitgebererstattung */}
                            {getAnswer(`reise_${i}_8`) === "Ja" &&
                              renderFormField(
                                { questionText: "Falls Ja, Details", questionType: "text", required: true },
                                `${prefix}_reise_${i}_erstattung_details`,
                              )}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Fortbildungen */}
                    {renderFormField(
                      {
                        questionText: "Gab es Fortbildungen?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: true,
                      },
                      `${prefix}_fort_flag`,
                    )}
                    {getAnswer("fort_flag") === "Ja" && (
                      <>
                        {renderFormField(
                          { questionText: "Anzahl der Fortbildungen", questionType: "number", required: true },
                          `${prefix}_fort_count`,
                        )}
                        {Array.from({ length: Number.parseInt(getAnswer("fort_count") || 0) }).map((_, i) => (
                          <div key={i} className="space-y-4 border-t border-gray-600 pt-4">
                            <h4 className="text-white font-semibold">Fortbildung {i + 1}</h4>
                            {[
                              { questionText: "Bezeichnung der Fortbildung", questionType: "text" },
                              { questionText: "Zeitraum", questionType: "text" },
                              { questionText: "Teilnahmegebühren (€)", questionType: "number" },
                              { questionText: "Fahrtkosten: Entfernung (km)", questionType: "number" },
                              {
                                questionText: "Beförderungsmittel",
                                questionType: "checkbox",
                                options: ["PKW", "ÖPNV"],
                              },
                              {
                                questionText: "Verpflegungsmehraufwand",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              { questionText: "Übernachtungskosten (€)", questionType: "number" },
                              {
                                questionText: "Arbeitgebererstattung erfolgt?",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              {
                                questionText: "Upload: Teilnahme, Belege etc.",
                                questionType: "fileUpload",
                                required: false,
                              },
                            ].map((q, j) =>
                              renderFormField(
                                { ...q, required: q.questionType !== "fileUpload" },
                                `${prefix}_fort_${i}_${j}`,
                              ),
                            )}

                            {/* Details bei Arbeitgebererstattung */}
                            {getAnswer(`fort_${i}_7`) === "Ja" &&
                              renderFormField(
                                { questionText: "Falls Ja, Details", questionType: "text", required: true },
                                `${prefix}_fort_${i}_details`,
                              )}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Weitere Werbungskosten - IMMER anzeigen, unabhängig von Pauschale */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h4 className="text-white font-semibold">Weitere Werbungskosten</h4>
                      {[
                        { questionText: "Arbeitsmittel (Bezeichnung, Kaufpreis, Jahr)", questionType: "text" },
                        {
                          questionText: "Arbeitszimmer / Homeoffice",
                          questionType: "multipleChoice",
                          options: ["Homeoffice", "Arbeitszimmer vorhanden"],
                        },
                        {
                          questionText: "Telefon / Internet beruflich genutzt (Anteil oder Betrag)",
                          questionType: "text",
                        },
                        { questionText: "Gewerkschafts-/Verbandsbeiträge", questionType: "number" },
                        { questionText: "Steuerberatungskosten für Vorjahr", questionType: "number" },
                        { questionText: "Berufskleidung / Reinigungskosten", questionType: "number" },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_zusatz_${i}`))}

                      {/* Homeoffice Tage bei entsprechender Auswahl */}
                      {getAnswer("zusatz_1") === "Homeoffice" &&
                        renderFormField(
                          { questionText: "Homeoffice (Tage)", questionType: "number", required: true },
                          `${prefix}_zusatz_homeoffice_tage`,
                        )}
                    </div>

                    {/* Freitext / Besonderheiten */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h4 className="text-white font-semibold">Freitext / Besonderheiten</h4>
                      {renderFormField(
                        {
                          questionText: "Besondere Konstellationen, berufliche Wechsel, Auslandstätigkeit o. Ä.",
                          questionType: "textarea",
                          required: false,
                        },
                        `${prefix}_freitext_0`,
                      )}
                    </div>

                    {/* Uploads */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h4 className="text-white font-semibold">Uploads (optional)</h4>
                      {[
                        { questionText: "Upload – Lohnsteuerbescheinigung(en)", questionType: "fileUpload" },
                        { questionText: "Upload – Fortbildungsnachweise", questionType: "fileUpload" },
                        { questionText: "Upload – Reisekostenbelege", questionType: "fileUpload" },
                        { questionText: "Upload – Nachweise für Werbungskosten", questionType: "fileUpload" },
                      ].map((q, i) => renderFormField({ ...q, required: false }, `${prefix}_upload_${i}`))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Kapitalvermögen (Formular 4)
        if (
          question.questionText === "Anzahl der Institute / Depots mit Kapitalerträgen" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numKapital = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numKapital }).map((_, kapitalIdx) => {
                const prefix = `kapital_${kapitalIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={kapitalIdx} className="space-y-4 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Institut/Depot {kapitalIdx + 1}</h4>

                    {[
                      { questionText: "Name des Kreditinstituts / der Plattform", questionType: "text" },
                      {
                        questionText: "Art der Erträge",
                        questionType: "multipleChoice",
                        options: ["Zinsen", "Dividenden", "Ausschüttungen", "Sonstige"],
                      },
                      {
                        questionText: "Wurden Kapitalerträge nach §43a EStG einbehalten?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Liegt eine Jahressteuerbescheinigung vor?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Wurde ein Freistellungsauftrag gestellt?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Wurden Verluste bescheinigt / verrechnet?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Upload: Jahressteuerbescheinigung",
                        questionType: "fileUpload",
                        required: false,
                      },
                    ].map((q, i) =>
                      renderFormField({ ...q, required: q.questionType !== "fileUpload" }, `${prefix}_base_${i}`),
                    )}

                    {/* Höhe des Freistellungsauftrags bei "Ja" */}
                    {getAnswer("base_4") === "Ja" &&
                      renderFormField(
                        {
                          questionText: "Höhe des Freistellungsauftrags (in €)",
                          questionType: "number",
                          required: true,
                        },
                        `${prefix}_freistellung_hoehe`,
                      )}

                    {/* Weitere Angaben */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h5 className="text-white font-semibold">Weitere Angaben</h5>
                      {[
                        {
                          questionText: "Handelt es sich um Kapitalerträge aus dem Ausland?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                        {
                          questionText: "Zinsen aus privat vergebenen Darlehen erhalten?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_weitere_${i}`))}

                      {/* Ausland Details */}
                      {getAnswer("weitere_0") === "Ja" && (
                        <>
                          {renderFormField(
                            {
                              questionText: "Falls Ja: Land, Art der Erträge und Höhe",
                              questionType: "text",
                              required: true,
                            },
                            `${prefix}_ausland_details`,
                          )}
                          {renderFormField(
                            {
                              questionText: "Upload: Steuerbescheinigung / Ertragsnachweis",
                              questionType: "fileUpload",
                              required: false,
                            },
                            `${prefix}_ausland_upload`,
                          )}
                        </>
                      )}

                      {/* Darlehen Details */}
                      {getAnswer("weitere_1") === "Ja" && (
                        <>
                          {renderFormField(
                            { questionText: "Darlehensnehmer", questionType: "text", required: true },
                            `${prefix}_darlehen_nehmer`,
                          )}
                          {renderFormField(
                            { questionText: "Höhe der Zinserträge (in €)", questionType: "number", required: true },
                            `${prefix}_darlehen_hoehe`,
                          )}
                          {renderFormField(
                            {
                              questionText: "Besteht ein schriftlicher Darlehensvertrag?",
                              questionType: "multipleChoice",
                              options: ["Ja", "Nein"],
                              required: true,
                            },
                            `${prefix}_darlehen_vertrag`,
                          )}
                          {renderFormField(
                            {
                              questionText: "Upload: Darlehensvertrag / Zinsnachweis",
                              questionType: "fileUpload",
                              required: false,
                            },
                            `${prefix}_darlehen_upload`,
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Veräußerungsgeschäfte (Formular 4)
        if (
          question.questionText === "Anzahl der privaten Veräußerungsgeschäfte (§23 EStG)" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numVeraeusserung = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numVeraeusserung }).map((_, verIdx) => {
                const prefix = `veraeusserung_${verIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={verIdx} className="space-y-4 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Veräußerungsgeschäft {verIdx + 1}</h4>

                    {[
                      {
                        questionText: "Art des Wirtschaftsguts",
                        questionType: "multipleChoice",
                        options: ["Immobilie", "Wertpapiere", "Sonstiges"],
                      },
                      { questionText: "Datum Anschaffung", questionType: "date" },
                      { questionText: "Datum Veräußerung", questionType: "date" },
                      { questionText: "Veräußerungserlös (€)", questionType: "number" },
                      { questionText: "Anschaffungskosten + Nebenkosten (€)", questionType: "number" },
                      {
                        questionText: "Wurden Wertsteigerungsmaßnahmen / Renovierungen durchgeführt?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Wurden Vermittlungsgebühren / Notarkosten gezahlt?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Wurde das Objekt selbst genutzt?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Upload: Kaufvertrag, Verkaufsunterlagen, Kostenbelege",
                        questionType: "fileUpload",
                        required: false,
                      },
                    ].map((q, i) =>
                      renderFormField({ ...q, required: q.questionType !== "fileUpload" }, `${prefix}_base_${i}`),
                    )}

                    {/* Sonstiges Feld bei Art des Wirtschaftsguts */}
                    {getAnswer("base_0") === "Sonstiges" &&
                      renderFormField(
                        { questionText: "Sonstiges (Art des Wirtschaftsguts)", questionType: "text", required: true },
                        `${prefix}_sonstiges`,
                      )}

                    {/* Zeitraum bei Eigennutzung */}
                    {getAnswer("base_7") === "Ja" &&
                      renderFormField(
                        { questionText: "Zeitraum der Eigennutzung", questionType: "text", required: true },
                        `${prefix}_eigennutzung_zeitraum`,
                      )}
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Krypto-Plattformen (Formular 4)
        if (
          question.questionText === "Anzahl Krypto-Plattformen / Wallets mit Transaktionen" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numKrypto = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numKrypto }).map((_, kryptoIdx) => {
                const prefix = `krypto_${kryptoIdx}`

                return (
                  <div key={kryptoIdx} className="space-y-4 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Krypto-Plattform/Wallet {kryptoIdx + 1}</h4>

                    {[
                      { questionText: "Name der Plattform / Wallet", questionType: "text" },
                      {
                        questionText: "Upload: vollständige Transaktionslisten, Reports",
                        questionType: "fileUpload",
                        required: false,
                      },
                    ].map((q, i) =>
                      renderFormField({ ...q, required: q.questionType !== "fileUpload" }, `${prefix}_base_${i}`),
                    )}
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Vermietung (Formular 5)
        if (
          question.questionText === "Anzahl wirtschaftlicher Einheiten (Wohnungen / Häuser / Einheiten)" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numMiete = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numMiete }).map((_, mieteIdx) => {
                const prefix = `miete_${mieteIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={mieteIdx} className="space-y-6 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Immobilie {mieteIdx + 1}</h4>

                    {/* 1. Grunddaten zum Objekt */}
                    <div className="space-y-4">
                      <h5 className="text-white font-semibold">1. Grunddaten zum Objekt</h5>
                      {[
                        {
                          questionText: "Handelt es sich um eine erstmalige Vermietung / Neuanschaffung?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_grunddaten_${i}`))}

                      {/* Bei erstmaliger Vermietung weitere Felder */}
                      {getAnswer("grunddaten_0") === "Ja" && (
                        <>
                          {[
                            { questionText: "Kaufpreis (€)", questionType: "number" },
                            { questionText: "Notarkosten (€)", questionType: "number" },
                            { questionText: "Grundbuchkosten (€)", questionType: "number" },
                            { questionText: "Maklerprovision (€)", questionType: "number" },
                            { questionText: "Weitere Erwerbsnebenkosten (€)", questionType: "number" },
                            { questionText: "Anschaffungsnahe Herstellungskosten (€)", questionType: "number" },
                            { questionText: "Baujahr des Gebäudes", questionType: "number" },
                            { questionText: "Gesamtfläche des Objekts (m²)", questionType: "number" },
                            { questionText: "Wohnfläche der Einheit (m²)", questionType: "number" },
                            {
                              questionText: "Anzahl / Art Stellplätze",
                              questionType: "checkbox",
                              options: ["Garage", "Tiefgarage", "Außenstellplatz"],
                            },
                          ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_grunddaten_neu_${i}`))}

                          {/* Anzahl Stellplätze */}
                          {(getAnswer("grunddaten_neu_9") || []).length > 0 &&
                            renderFormField(
                              { questionText: "Anzahl Stellplätze", questionType: "number", required: true },
                              `${prefix}_stellplaetze_anzahl`,
                            )}
                        </>
                      )}

                      {/* Bei Bestandsimmobilie */}
                      {getAnswer("grunddaten_0") === "Nein" && (
                        <>
                          {[
                            { questionText: "Aktuelle AfA-Bemessungsgrundlage (€)", questionType: "number" },
                            { questionText: "Bisherige Abschreibungen insgesamt (€)", questionType: "number" },
                            { questionText: "Einheitswert-Aktenzeichen (Grundsteuer)", questionType: "text" },
                            { questionText: "Anschaffungs- oder Fertigstellungszeitpunkt", questionType: "date" },
                            {
                              questionText: "Wurde die Immobilie im VZ veräußert?",
                              questionType: "multipleChoice",
                              options: ["Ja", "Nein"],
                            },
                          ].map((q, i) =>
                            renderFormField({ ...q, required: true }, `${prefix}_grunddaten_bestand_${i}`),
                          )}
                        </>
                      )}

                      {/* Allgemeine Objektdaten */}
                      {[
                        { questionText: "Objektbezeichnung", questionType: "text" },
                        {
                          questionText: "Objektart",
                          questionType: "multipleChoice",
                          options: ["Einfamilienhaus", "Eigentumswohnung", "Mehrfamilienhaus", "Sonstiges"],
                        },
                        {
                          questionText: "Eigentumsverhältnis",
                          questionType: "multipleChoice",
                          options: ["Alleineigentum", "Miteigentum"],
                        },
                        { questionText: "Straße", questionType: "text" },
                        { questionText: "PLZ/Ort", questionType: "text" },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_objekt_${i}`))}

                      {/* Sonstiges bei Objektart */}
                      {getAnswer("objekt_1") === "Sonstiges" &&
                        renderFormField(
                          { questionText: "Sonstiges (Objektart)", questionType: "text", required: true },
                          `${prefix}_objekt_sonstiges`,
                        )}

                      {/* Miteigentumsanteil */}
                      {getAnswer("objekt_2") === "Miteigentum" &&
                        renderFormField(
                          { questionText: "Miteigentumsanteil (%)", questionType: "number", required: true },
                          `${prefix}_miteigentum_anteil`,
                        )}
                    </div>

                    {/* 2. Nutzung & Mieterstruktur */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h5 className="text-white font-semibold">2. Nutzung & Mieterstruktur</h5>
                      {[
                        { questionText: "Anzahl vermieteter Einheiten", questionType: "number" },
                        {
                          questionText: "Nutzung durch",
                          questionType: "checkbox",
                          options: ["fremde Mieter", "Angehörige", "zeitweise selbst genutzt"],
                        },
                        {
                          questionText: "Leerstand im VZ?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_nutzung_${i}`))}

                      {/* Bei Angehörigen */}
                      {(getAnswer("nutzung_1") || []).includes("Angehörige") &&
                        renderFormField(
                          {
                            questionText: "Miete entspricht ortsüblicher Miete?",
                            questionType: "multipleChoice",
                            options: ["Ja", "Nein"],
                            required: true,
                          },
                          `${prefix}_angehoerige_miete`,
                        )}

                      {/* Bei Leerstand */}
                      {getAnswer("nutzung_2") === "Ja" &&
                        renderFormField(
                          { questionText: "Dauer & Grund des Leerstands", questionType: "text", required: true },
                          `${prefix}_leerstand_details`,
                        )}
                    </div>

                    {/* 3. Einnahmen */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h5 className="text-white font-semibold">3. Einnahmen</h5>
                      <p className="text-sm text-gray-300">Pro Einheit bitte folgende Angaben:</p>
                      {[
                        { questionText: "Bezeichnung der Einheit / Lage im Objekt", questionType: "text" },
                        { questionText: "Wohnfläche (in m²)", questionType: "number" },
                        { questionText: "Mieteinnahmen ohne Umlagen (Zufluss im VZ) (€)", questionType: "number" },
                        { questionText: "Umlagen (Nebenkosten) (€)", questionType: "number" },
                        {
                          questionText: "Wurden Kautionen mit offenen Forderungen verrechnet?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                        { questionText: "Einnahmen aus Garagen / Stellplätzen (€)", questionType: "number" },
                        { questionText: "Einnahmen aus Werbeflächen (€)", questionType: "number" },
                        {
                          questionText:
                            "Wird die Einheit ganz oder teilweise kurzfristig (z. B. über Airbnb) vermietet?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                        {
                          questionText: "Upload: Mietverträge, Einnahmenübersicht, Kontoauszüge",
                          questionType: "fileUpload",
                          required: false,
                        },
                      ].map((q, i) =>
                        renderFormField(
                          { ...q, required: q.questionType !== "fileUpload" },
                          `${prefix}_einnahmen_${i}`,
                        ),
                      )}
                    </div>

                    {/* 4. Werbungskosten */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h5 className="text-white font-semibold">4. Werbungskosten</h5>

                      {/* a) Abschreibungen (AfA) */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">a) Abschreibungen (AfA)</h6>
                        {[
                          { questionText: "AfA-Bemessungsgrundlage (€)", questionType: "number" },
                          {
                            questionText: "Abschreibungssatz",
                            questionType: "multipleChoice",
                            options: ["2%", "2,5%", "3%", "individuell"],
                          },
                          { questionText: "Zeitraum der Abschreibung im VZ: von", questionType: "date" },
                          { questionText: "Zeitraum der Abschreibung im VZ: bis", questionType: "date" },
                        ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_afa_${i}`))}

                        {/* Individueller Satz */}
                        {getAnswer("afa_1") === "individuell" &&
                          renderFormField(
                            { questionText: "Individueller Satz (%)", questionType: "number", required: true },
                            `${prefix}_afa_individuell`,
                          )}
                      </div>

                      {/* b) Schuldzinsen & Geldbeschaffungskosten */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">b) Schuldzinsen & Geldbeschaffungskosten</h6>
                        {renderFormField(
                          { questionText: "Anzahl Finanzierungsverträge", questionType: "number", required: true },
                          `${prefix}_finanzierung_anzahl`,
                        )}
                        {renderFormField(
                          {
                            questionText: "Upload: Darlehensverträge, Zinsnachweise",
                            questionType: "fileUpload",
                            required: false,
                          },
                          `${prefix}_finanzierung_upload`,
                        )}
                      </div>

                      {/* c) Erhaltungsaufwendungen */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">c) Erhaltungsaufwendungen</h6>
                        {[
                          { questionText: "Beschreibung", questionType: "text" },
                          { questionText: "Betrag (€)", questionType: "number" },
                          {
                            questionText: "Sofort abzugsfähig?",
                            questionType: "multipleChoice",
                            options: ["Ja", "Nein (Verteilung über Jahre)"],
                          },
                          {
                            questionText: "Upload: Handwerkerrechnung, Zahlungsnachweis",
                            questionType: "fileUpload",
                            required: false,
                          },
                        ].map((q, i) =>
                          renderFormField(
                            { ...q, required: q.questionType !== "fileUpload" },
                            `${prefix}_erhaltung_${i}`,
                          ),
                        )}
                      </div>

                      {/* d) Laufende Betriebskosten */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">d) Laufende Betriebskosten</h6>
                        <p className="text-sm text-gray-300">
                          Grundsteuer, Straßenreinigung / Müll / Wasser / Abwasser, Gebäudeversicherung /
                          Haftpflichtversicherung, Schornsteinfeger / Heizung / Warmwasser / Wartung
                        </p>
                        {renderFormField(
                          { questionText: "Weitere Werbungskosten", questionType: "text", required: false },
                          `${prefix}_betriebskosten`,
                        )}
                      </div>

                      {/* e) Bei Eigentümergemeinschaften */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">e) Bei Eigentümergemeinschaften</h6>
                        {[
                          { questionText: "Hausgeldzahlungen (€)", questionType: "number" },
                          { questionText: "Instandhaltungsrücklage (€)", questionType: "number" },
                          {
                            questionText: "Upload: vollständige Hausgeldabrechnung aktuelles Jahr & Vorjahr",
                            questionType: "fileUpload",
                            required: false,
                          },
                        ].map((q, i) =>
                          renderFormField(
                            { ...q, required: q.questionType !== "fileUpload" },
                            `${prefix}_hausgeld_${i}`,
                          ),
                        )}
                      </div>

                      {/* f) Weitere Werbungskosten */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">f) Weitere Werbungskosten</h6>
                        {[
                          { questionText: "Fahrtkosten zur Immobilie (€)", questionType: "number" },
                          { questionText: "Verwaltungskosten / Hausmeister / Sonstiges", questionType: "text" },
                          {
                            questionText: "Upload: Nachweise für alle geltend gemachten Ausgaben",
                            questionType: "fileUpload",
                            required: false,
                          },
                        ].map((q, i) =>
                          renderFormField(
                            { ...q, required: q.questionType !== "fileUpload" },
                            `${prefix}_weitere_werbung_${i}`,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle other number fields
        if (question.questionText === "Anzahl Kinder" && Number(formAnswers[`question_${index}`]) > 0) {
          const numberOfChildren = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              {/* Original Frage */}
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  name={`question_${index}`}
                  id={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  required={question.required}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                />
              </div>

              {/* Dynamische Kinderfelder */}
              {Array.from({ length: numberOfChildren }).map((_, i) => {
                const prefix = `child_${i}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={i} className="space-y-4 border-t border-b border-gray-700 pt-4 pb-4">
                    <h4 className="text-white font-semibold">Kind {i + 1}</h4>
                    {[
                      { questionText: "Name des Kindes", questionType: "text", required: true },
                      { questionText: "Geburtsdatum des Kindes", questionType: "date", required: true },
                      { questionText: "Steuer-ID des Kindes", questionType: "text", required: true },
                      {
                        questionText: "Abweichender Elternteil (Name, Geburtsdatum, Anschrift)",
                        questionType: "text",
                        required: false,
                      },
                      {
                        questionText: "Kindergeldbezug",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: false,
                      },
                      {
                        questionText: "Schwerbehinderung / Pflegegrad beim Kind?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: false,
                      },
                      {
                        questionText: "Alleinerziehend",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: false,
                      },
                      {
                        questionText: "Volljähriges Kind in Ausbildung / Studium",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: false,
                      },
                    ].map((q, idx) => renderFormField(q, `${prefix}_${idx}`))}

                    {/* Upload bei Schwerbehinderung */}
                    {getAnswer("5") === "Ja" &&
                      renderFormField(
                        {
                          questionText: "Upload: Schwerbehinderung / Pflegegrad Nachweis",
                          questionType: "fileUpload",
                          required: false,
                        },
                        `${prefix}_schwerbehinderung_upload`,
                      )}

                    {/* Entlastungsbetrag bei Alleinerziehend */}
                    {getAnswer("6") === "Ja" &&
                      renderFormField(
                        {
                          questionText: "Angabe zur Beantragung des Entlastungsbetrags",
                          questionType: "text",
                          required: false,
                        },
                        `${prefix}_entlastungsbetrag`,
                      )}

                    {/* Wohnsituation bei volljährigem Kind */}
                    {getAnswer("7") === "Ja" &&
                      renderFormField(
                        {
                          questionText: "Angabe zur Wohnsituation",
                          questionType: "multipleChoice",
                          options: ["bei den Eltern", "auswärtig"],
                          required: false,
                        },
                        `${prefix}_wohnsituation`,
                      )}
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Renten/Pensionen (Formular 6) - ENHANCED VERSION
        if (
          question.questionText === "Anzahl der empfangenen Renten/Pensionen" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numRenten = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numRenten }).map((_, renteIdx) => {
                const prefix = `rente_${renteIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={renteIdx} className="space-y-4 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Rente/Pension {renteIdx + 1}</h4>

                    {/* Basis-Rentenangaben */}
                    {[
                      {
                        questionText: "Art der Leistung",
                        questionType: "multipleChoice",
                        options: [
                          "Gesetzliche Altersrente",
                          "Rente wegen Erwerbsminderung",
                          "Hinterbliebenenrente (Witwen-/Waisenrente)",
                          "Betriebsrente / Werksrente",
                          "Pension (z. B. öffentlicher Dienst)",
                          "Rente aus berufsständischer Versorgung",
                          "Ausländische Rente",
                          "Sonstiges",
                        ],
                        required: true,
                      },
                      { questionText: "Rentenzahlende Stelle / Versicherungsträger", questionType: "text" },
                      { questionText: "Beginn der Rentenzahlung", questionType: "date" },
                      { questionText: "Rentenbetrag im Veranlagungszeitraum (€)", questionType: "number" },
                      {
                        questionText: "Steuerbescheinigung der Rentenstelle vorhanden?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Upload: Rentenbezugsmitteilung / Leistungsnachweis",
                        questionType: "fileUpload",
                        required: false,
                      },
                    ].map((q, i) =>
                      renderFormField({ ...q, required: q.questionType !== "fileUpload" }, `${prefix}_base_${i}`),
                    )}

                    {/* Weitere Rentenangaben */}
                    <div className="space-y-4 pt-4 border-t border-gray-600">
                      <h5 className="text-white font-semibold">Weitere Angaben</h5>

                      {/* Einmalzahlung/Nachzahlung */}
                      {renderFormField(
                        {
                          questionText: "Wurde im laufenden Jahr eine Einmalzahlung oder Nachzahlung geleistet?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                          required: true,
                        },
                        `${prefix}_einmalzahlung`,
                      )}

                      {getAnswer("einmalzahlung") === "Ja" && (
                        <>
                          {renderFormField(
                            { questionText: "Betrag und Anlass", questionType: "text", required: true },
                            `${prefix}_einmalzahlung_details`,
                          )}
                        </>
                      )}

                      {/* Rückzahlung/Kürzung */}
                      {renderFormField(
                        {
                          questionText: "Wurde eine Rückzahlung oder Kürzung vorgenommen?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                          required: true,
                        },
                        `${prefix}_rueckzahlung`,
                      )}

                      {getAnswer("rueckzahlung") === "Ja" && (
                        <>
                          {renderFormField(
                            { questionText: "Betrag und Grund", questionType: "text", required: true },
                            `${prefix}_rueckzahlung_details`,
                          )}
                        </>
                      )}

                      {/* Versorgungsfreibetrag */}
                      {renderFormField(
                        {
                          questionText: "Besteht Anspruch auf Versorgungsfreibetrag / Werbungskosten-Pauschale?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein", "Unklar"],
                          required: true,
                        },
                        `${prefix}_versorgungsfreibetrag`,
                      )}

                      {/* Ausländische Besteuerung */}
                      {renderFormField(
                        {
                          questionText: "Besteht eine ausländische Besteuerung?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                          required: true,
                        },
                        `${prefix}_ausland_besteuerung`,
                      )}

                      {getAnswer("ausland_besteuerung") === "Ja" && (
                        <>
                          {renderFormField(
                            { questionText: "Falls ja: In welchem Land?", questionType: "text", required: true },
                            `${prefix}_ausland_land`,
                          )}

                          {renderFormField(
                            {
                              questionText: "Besteht ein Doppelbesteuerungsabkommen (DBA)?",
                              questionType: "multipleChoice",
                              options: ["Ja", "Nein", "Unklar"],
                              required: true,
                            },
                            `${prefix}_dba`,
                          )}
                        </>
                      )}

                      {/* Sonstiges/Hinweise */}
                      <div className="space-y-4 border-t border-gray-600 pt-4">
                        <h6 className="text-white font-semibold">Sonstiges / Hinweise</h6>
                        {renderFormField(
                          {
                            questionText: "Weitere Hinweise zur Rentenversteuerung",
                            questionType: "textarea",
                            required: false,
                          },
                          `${prefix}_hinweise`,
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Selbstständige/Freiberufliche Tätigkeit (Formular 7) - ENHANCED
        if (question.questionText === "Selbstständige/Freiberufliche Tätigkeit vorhanden?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-6">
              {/* Basis Multiple Choice */}
              {renderBaseMultipleChoice()}

              {/* Allgemeine Angaben */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Allgemeine Angaben</h4>

                {/* Art der Tätigkeit */}
                {renderFormField(
                  {
                    questionText: "Art der Tätigkeit",
                    questionType: "multipleChoice",
                    options: ["Freiberuflich", "Gewerbebetrieb", "Sonstige"],
                    required: true,
                  },
                  `selbststaendig_allgemein_0`,
                )}

                {/* Sonstiges Feld bei Art der Tätigkeit */}
                {(formAnswers[`question_selbststaendig_allgemein_0`] || formAnswers[`selbststaendig_allgemein_0`]) ===
                  "Sonstige" &&
                  renderFormField(
                    { questionText: "Sonstiges (Art der Tätigkeit)", questionType: "text", required: true },
                    `selbststaendig_allgemein_sonstiges`,
                  )}

                {/* Weitere allgemeine Felder */}
                {[
                  { questionText: "Bezeichnung des Unternehmens / der Praxis", questionType: "text" },
                  { questionText: "Beginn der Tätigkeit", questionType: "date" },
                  {
                    questionText: "Wurde die Tätigkeit im VZ beendet?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Firmenanschrift (Straße, PLZ, Ort)", questionType: "text" },
                  { questionText: "Telefonnummer / geschäftliche E-Mail", questionType: "text" },
                  { questionText: "Geschäftliche Bankverbindung", questionType: "text" },
                  { questionText: "Betriebsstättenfinanzamt", questionType: "text" },
                  { questionText: "Steuernummer", questionType: "text" },
                  {
                    questionText: "Besteht eine Eintragung im Handelsregister?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Besteht Bilanzierungspflicht?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Betriebsstätte vorhanden?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "USt-IdNr. (falls vorhanden)", questionType: "text", required: false },
                  {
                    questionText: "Umsatzbesteuerung",
                    questionType: "multipleChoice",
                    options: ["Kleinunternehmerregelung (§19 UStG)", "Regelbesteuerung"],
                  },
                  {
                    questionText: "Wurde ISt-Versteuerung beantragt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Abgabefrist für USt-Voranmeldungen",
                    questionType: "multipleChoice",
                    options: ["monatlich", "vierteljährlich", "jährlich"],
                  },
                  {
                    questionText: "Werden Mitarbeiter beschäftigt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                ].map((q, i) =>
                  renderFormField({ ...q, required: q.required !== false }, `selbststaendig_allgemein_${i + 1}`),
                )}

                {/* ISt-Versteuerung Genehmigung */}
                {(formAnswers[`question_selbststaendig_allgemein_14`] || formAnswers[`selbststaendig_allgemein_14`]) ===
                  "Ja" &&
                  renderFormField(
                    {
                      questionText: "Genehmigung des Finanzamts vorhanden?",
                      questionType: "multipleChoice",
                      options: ["Ja", "Nein"],
                      required: true,
                    },
                    `selbststaendig_ist_genehmigung`,
                  )}

                {/* Mitarbeiter Details */}
                {(formAnswers[`question_selbststaendig_allgemein_16`] || formAnswers[`selbststaendig_allgemein_16`]) ===
                  "Ja" &&
                  renderFormField(
                    { questionText: "Weitere Infos zu Mitarbeitern", questionType: "text", required: true },
                    `selbststaendig_mitarbeiter_details`,
                  )}

                {/* Weitere Felder */}
                {[
                  { questionText: "Unternehmernummer der Berufsgenossenschaft", questionType: "text" },
                  {
                    questionText: "Wurden Betriebsprüfungen durchgeführt (Finanzamt / Rentenversicherung)?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Weitere steuerliche Regelungen / Genehmigungen", questionType: "text" },
                  {
                    questionText: "§13b UStG (Reverse Charge) anwendbar?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Freistellungsbescheinigung vorhanden?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Weitere behördliche Genehmigungen / Sonderregelungen", questionType: "text" },
                ].map((q, i) =>
                  renderFormField({ ...q, required: q.required !== false }, `selbststaendig_weitere_${i}`),
                )}
              </div>

              {/* Bei Personengesellschaften */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Bei Personengesellschaften</h4>
                {[
                  { questionText: "Gesellschaftsform", questionType: "text" },
                  {
                    questionText: "Gesellschaftsvertrag vorhanden?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Name und Steuernummer der Gesellschaft", questionType: "text" },
                ].map((q, i) => renderFormField({ ...q, required: false }, `selbststaendig_gesellschaft_${i}`))}
              </div>

              {/* Ergänzende Angaben */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Ergänzende Angaben</h4>

                {/* Firmenfahrzeuge */}
                {renderFormField(
                  {
                    questionText: "Wurde ein oder mehrere Firmenfahrzeuge genutzt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                    required: true,
                  },
                  `selbststaendig_fahrzeuge`,
                )}

                {(formAnswers[`question_selbststaendig_fahrzeuge`] || formAnswers[`selbststaendig_fahrzeuge`]) ===
                  "Ja" &&
                  renderFormField(
                    {
                      questionText: "Art der Nutzung",
                      questionType: "multipleChoice",
                      options: ["1%-Regelung", "Fahrtenbuch"],
                      required: true,
                    },
                    `selbststaendig_fahrzeuge_art`,
                  )}

                {/* Weitere ergänzende Felder */}
                {[
                  {
                    questionText: "Bestand die Tätigkeit bereits in Vorjahren?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Gab es Corona-Hilfen oder sonstige Fördermittel im Veranlagungszeitraum?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                ].map((q, i) => renderFormField({ ...q, required: true }, `selbststaendig_ergaenzend_${i}`))}

                {/* Bei Vorjahren */}
                {(formAnswers[`question_selbststaendig_ergaenzend_0`] || formAnswers[`selbststaendig_ergaenzend_0`]) ===
                  "Ja" && (
                  <div className="space-y-2 border-l-4 border-blue-500 pl-4">
                    <p className="text-white text-sm">Falls ja, bitte folgende Unterlagen bereitstellen:</p>
                    {[
                      "Letzte Gewinnermittlung bzw. Bilanz",
                      "Aufstellung des Anlagevermögens",
                      "Kontenblätter der Finanzbuchhaltung",
                    ].map((label, i) => (
                      <p key={i} className="text-gray-300 text-sm">
                        • {label}
                      </p>
                    ))}
                  </div>
                )}

                {/* Bei Corona-Hilfen */}
                {(formAnswers[`question_selbststaendig_ergaenzend_1`] || formAnswers[`selbststaendig_ergaenzend_1`]) ===
                  "Ja" &&
                  renderFormField(
                    { questionText: "Art und Betrag", questionType: "text", required: true },
                    `selbststaendig_corona_details`,
                  )}

                {/* Sonstige Hinweise */}
                {renderFormField(
                  { questionText: "Sonstige relevante Hinweise", questionType: "textarea", required: false },
                  `selbststaendig_hinweise`,
                )}
              </div>
            </div>
          )
        }

        // Default number input
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index, "number", question)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "textarea":
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              name={`question_${index}`}
              id={`question_${index}`}
              rows={4}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "checkbox":
        // Handle Einkunftsarten as multiple selection
        if (question.questionText === "Einkunftsarten") {
          return (
            <div key={index} className="space-y-2">
              <fieldset>
                <legend className="block text-sm font-medium text-white mb-2">
                  {question.questionText}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </legend>
                <div className="space-y-2">
                  {question.options &&
                    question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          id={`question_${index}_option_${optionIndex}`}
                          name={`question_${index}_option_${optionIndex}`}
                          type="checkbox"
                          value={option}
                          checked={(formAnswers[`question_${index}`] || []).includes(option)}
                          onChange={(e) => handleInputChange(e, index, "checkbox")}
                          className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9] border-gray-700 rounded bg-[rgba(227,218,201,0.1)]"
                        />
                        <label
                          htmlFor={`question_${index}_option_${optionIndex}`}
                          className="ml-3 block text-sm text-white"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                </div>
              </fieldset>
            </div>
          )
        }

        return (
          <div key={index} className="space-y-2">
            <fieldset>
              <legend className="block text-sm font-medium text-white mb-2">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </legend>
              <div className="space-y-2">
                {question.options &&
                  question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        id={`question_${index}_option_${optionIndex}`}
                        name={`question_${index}_option_${optionIndex}`}
                        type="checkbox"
                        value={option}
                        checked={(formAnswers[`question_${index}`] || []).includes(option)}
                        onChange={(e) => handleInputChange(e, index, "checkbox")}
                        className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9] border-gray-700 rounded bg-[rgba(227,218,201,0.1)]"
                      />
                      <label
                        htmlFor={`question_${index}_option_${optionIndex}`}
                        className="ml-3 block text-sm text-white"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
              </div>
            </fieldset>
          </div>
        )

      case "multipleChoice":
        const selectedOption = formAnswers[`question_${index}`]
        const isFamilyStatus = question.questionText === "Familienstand"
        const requiresUpload =
          question.questionText.toLowerCase().includes("schwerbehinderung") ||
          question.questionText.toLowerCase().includes("kirchenaustritt")

        const partnerQuestions = [
          {
            questionText: "Anrede des Ehepartners",
            questionType: "multipleChoice",
            options: ["Herr", "Frau", "Divers"],
            required: true,
          },
          { questionText: "Vorname des Ehepartners", questionType: "text", required: true },
          { questionText: "Nachname des Ehepartners", questionType: "text", required: true },
          { questionText: "Geburtsdatum des Ehepartners", questionType: "date", required: true },
          { questionText: "Beruf / Tätigkeit des Ehepartners", questionType: "text", required: true },
          { questionText: "Steuer-ID des Ehepartners", questionType: "text", required: true },
          { questionText: "Telefon des Ehepartners", questionType: "text", required: true },
          { questionText: "Nationalität des Ehepartners", questionType: "text", required: true },
          { questionText: "Religion des Ehepartners", questionType: "text", required: false },
          { questionText: "E-Mail-Adresse des Ehepartners", questionType: "text", required: false },
          {
            questionText: "Schwerbehinderung / Pflegegrad beim Ehepartner?",
            questionType: "multipleChoice",
            options: ["Ja", "Nein"],
            required: true,
          },
        ]

        const renderBaseMultipleChoice = () => (
          <fieldset>
            <legend className="block text-sm font-medium text-white mb-2">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </legend>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center">
                  <input
                    id={`question_${index}_option_${optionIndex}`}
                    name={`question_${index}`}
                    type="radio"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => handleInputChange(e, index, "multipleChoice", question)}
                    required={question.required}
                    className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9] border-gray-700 bg-[rgba(227,218,201,0.1)]"
                  />
                  <label htmlFor={`question_${index}_option_${optionIndex}`} className="ml-3 block text-sm text-white">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        )

        // Handle conditional fields for various question types
        if (question.questionText === "Riestervertrag vorhanden?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Versicherungsnummer / Zulagenstelle", questionType: "text", required: true },
                `riester_0`,
              )}
              {renderFormField(
                { questionText: "Anbieter / Vertragsart", questionType: "text", required: true },
                `riester_1`,
              )}
              {renderFormField({ questionText: "Jahresbeitrag", questionType: "number", required: true }, `riester_2`)}
            </div>
          )
        }

        if (
          question.questionText === 'Sonstige Altersvorsorge (z. B. Basisrente / "Rürup")' &&
          selectedOption === "Ja"
        ) {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Anbieter / Vertragsart", questionType: "text", required: true },
                `zrente_0`,
              )}
              {renderFormField({ questionText: "Jahresbeitrag", questionType: "number", required: true }, `zrente_1`)}
            </div>
          )
        }

        if (question.questionText === "Haben Sie im betreffenden Jahr Spenden gezahlt?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField({ questionText: "Gesamtbetrag", questionType: "number", required: true }, `spende_0`)}
              {renderFormField(
                { questionText: "Spendenempfänger / Organisation(en)", questionType: "text", required: true },
                `spende_1`,
              )}
              {renderFormField(
                {
                  questionText: "Wurden Zuwendungsbestätigungen eingereicht?",
                  questionType: "multipleChoice",
                  options: ["Ja", "Nein"],
                  required: true,
                },
                `spende_2`,
              )}
              {renderFormField(
                { questionText: "Upload Spendenbescheinigung", questionType: "fileUpload", required: true },
                `spende_3`,
              )}
            </div>
          )
        }

        // Handle Unterhalt gezahlt
        if (question.questionText === "Haben Sie Unterhalt gezahlt?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField({ questionText: "Empfänger", questionType: "text", required: true }, `unterhalt_0`)}
              {renderFormField(
                { questionText: "Verwandtschaftsverhältnis", questionType: "text", required: true },
                `unterhalt_1`,
              )}
              {renderFormField({ questionText: "Betrag (€)", questionType: "number", required: true }, `unterhalt_2`)}
              {renderFormField(
                {
                  questionText: "Besteht Anspruch auf Anlage U?",
                  questionType: "multipleChoice",
                  options: ["Ja", "Nein"],
                  required: true,
                },
                `unterhalt_3`,
              )}
            </div>
          )
        }

        // Handle Unterhalt bezogen
        if (question.questionText === "Haben Sie Unterhalt bezogen?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField({ questionText: "Betrag (€)", questionType: "number", required: true }, `bezogen_0`)}
            </div>
          )
        }

        // Handle Betreuungskosten
        if (question.questionText === "Betreuungskosten (Kindergarten, Tagesmutter, Hort)" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Anzahl Kinder mit Betreuungskosten", questionType: "number", required: true },
                `betreuung_0`,
              )}
              {renderFormField(
                { questionText: "Gesamtkosten (€)", questionType: "number", required: true },
                `betreuung_1`,
              )}
              {renderFormField(
                {
                  questionText: "Arbeitgeberzuschuss enthalten?",
                  questionType: "multipleChoice",
                  options: ["Ja", "Nein"],
                  required: true,
                },
                `betreuung_2`,
              )}
              {renderFormField(
                { questionText: "Anteil privat gezahlt (€)", questionType: "number", required: true },
                `betreuung_3`,
              )}
              {renderFormField(
                {
                  questionText: "Upload: Rechnungen, Nachweise, Bescheinigungen",
                  questionType: "fileUpload",
                  required: false,
                },
                `betreuung_4`,
              )}
            </div>
          )
        }

        // Handle Gesundheitskosten
        if (
          question.questionText ===
            "Haben Sie im Veranlagungszeitraum Krankheits-, Pflege-, Pflegeheim-, Kurkosten oder andere hohe Belastungen getragen?" &&
          selectedOption === "Ja"
        ) {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Art der Aufwendung", questionType: "text", required: true },
                `gesund_0`,
              )}
              {renderFormField(
                { questionText: "Betrag gesamt (€)", questionType: "number", required: true },
                `gesund_1`,
              )}
              {renderFormField(
                {
                  questionText: "Wurden Zuschüsse (z. B. durch Krankenkasse, Pflegeversicherung) gezahlt?",
                  questionType: "multipleChoice",
                  options: ["Ja", "Nein"],
                  required: true,
                },
                `gesund_2`,
              )}
              {renderFormField(
                {
                  questionText: "Upload: Arztrechnungen, Zuzahlungsübersichten, Bescheide",
                  questionType: "fileUpload",
                  required: false,
                },
                `gesund_3`,
              )}
            </div>
          )
        }

        // Handle Stellungnahme
        if (
          question.questionText === "Möchten Sie zu einem konkreten Fall eine Stellungnahme abgeben?" &&
          selectedOption === "Ja"
        ) {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Beschreibung des konkreten Falls", questionType: "textarea", required: true },
                `stellungnahme_0`,
              )}
            </div>
          )
        }

        // Handle Selbstständige/Freiberufliche Tätigkeit (Formular 7)
        if (question.questionText === "Selbstständige/Freiberufliche Tätigkeit vorhanden?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-6">
              {/* Basis Multiple Choice */}
              {renderBaseMultipleChoice()}

              {/* Allgemeine Angaben */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Allgemeine Angaben</h4>

                {/* Art der Tätigkeit */}
                {renderFormField(
                  {
                    questionText: "Art der Tätigkeit",
                    questionType: "multipleChoice",
                    options: ["Freiberuflich", "Gewerbebetrieb", "Sonstige"],
                    required: true,
                  },
                  `selbststaendig_allgemein_0`,
                )}

                {/* Weitere allgemeine Felder */}
                {[
                  { questionText: "Bezeichnung des Unternehmens / der Praxis", questionType: "text" },
                  { questionText: "Beginn der Tätigkeit", questionType: "date" },
                  {
                    questionText: "Wurde die Tätigkeit im VZ beendet?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Firmenanschrift (Straße, PLZ, Ort)", questionType: "text" },
                  { questionText: "Telefonnummer / geschäftliche E-Mail", questionType: "text" },
                  { questionText: "Geschäftliche Bankverbindung", questionType: "text" },
                  { questionText: "Betriebsstättenfinanzamt", questionType: "text" },
                  { questionText: "Steuernummer", questionType: "text" },
                  {
                    questionText: "Besteht eine Eintragung im Handelsregister?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Besteht Bilanzierungspflicht?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Betriebsstätte vorhanden?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "USt-IdNr. (falls vorhanden)", questionType: "text", required: false },
                  {
                    questionText: "Umsatzbesteuerung",
                    questionType: "multipleChoice",
                    options: ["Kleinunternehmerregelung (§19 UStG)", "Regelbesteuerung"],
                  },
                  {
                    questionText: "Wurde ISt-Versteuerung beantragt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Abgabefrist für USt-Voranmeldungen",
                    questionType: "multipleChoice",
                    options: ["monatlich", "vierteljährlich", "jährlich"],
                  },
                  {
                    questionText: "Werden Mitarbeiter beschäftigt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                ].map((q, i) =>
                  renderFormField({ ...q, required: q.required !== false }, `selbststaendig_allgemein_${i + 1}`),
                )}
              </div>

              {/* Ergänzende Angaben */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Ergänzende Angaben zur steuerlichen Erfassung</h4>
                {[
                  {
                    questionText: "Wurde ein oder mehrere Firmenfahrzeuge genutzt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Wurde ein Homeoffice genutzt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Bestand die Tätigkeit bereits in Vorjahren?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Gab es Corona-Hilfen oder sonstige Fördermittel im Veranlagungszeitraum?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Sonstige relevante Hinweise", questionType: "textarea", required: false },
                ].map((q, i) =>
                  renderFormField({ ...q, required: q.required !== false }, `selbststaendig_ergaenzend_${i}`),
                )}
              </div>
            </div>
          )
        }

        // Standard MultipleChoice-Rendering
        return (
          <div key={index} className="space-y-2">
            <fieldset>
              <legend className="block text-sm font-medium text-white mb-2">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </legend>
              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center">
                    <input
                      id={`question_${index}_option_${optionIndex}`}
                      name={`question_${index}`}
                      type="radio"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => handleInputChange(e, index, "multipleChoice", question)}
                      required={question.required}
                      className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9] border-gray-700 bg-[rgba(227,218,201,0.1)]"
                    />
                    <label
                      htmlFor={`question_${index}_option_${optionIndex}`}
                      className="ml-3 block text-sm text-white"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Dynamischer Datei-Upload falls "Ja" */}
            {requiresUpload &&
              selectedOption === "Ja" &&
              renderFormField(
                {
                  questionText: "Bitte Nachweis hochladen",
                  questionType: "fileUpload",
                  required: true,
                },
                `${index}_upload`,
              )}

            {/* Ehepartnerfelder direkt bei Familienstand */}
            {isFamilyStatus && selectedOption === "verheiratet" && (
              <div className="space-y-4 border-t border-b border-gray-700 pt-4 pb-4">
                <h4 className="text-white font-semibold">Angaben zum Ehepartner</h4>
                {partnerQuestions.map((q, idx) => renderFormField(q, `partner_${idx}`))}
              </div>
            )}
          </div>
        )

      case "fileUpload":
        return (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <label
              htmlFor={`file_${index}`}
              className="inline-block cursor-pointer px-4 py-2 bg-[#E3DAC9] text-black rounded-md font-medium hover:bg-[#E3DAC9]/80 transition"
            >
              Datei auswählen
              <input
                type="file"
                name={`file_${index}`}
                id={`file_${index}`}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleInputChange(e, index, "file")}
                className="hidden"
              />
            </label>
            {fileUploads[`file_${index}`] && (
              <p className="text-xs text-[#E3DAC9] mt-1">Datei ausgewählt: {fileUploads[`file_${index}`].name}</p>
            )}
          </div>
        )

      default:
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )
    }
  }

 const filteredCustomers = customers.filter((customer) => {
  // Basis-Filter (unverändert)
  if (categoryFilter === "with_forms") {
    if (!customer.assignedForms || customer.assignedForms.length === 0) return false
  }
  if (categoryFilter === "without_forms") {
    if (customer.assignedForms && customer.assignedForms.length > 0) return false
  }
  if (categoryFilter === "completed_forms") {
    if (!customer.ausgefuellteformulare || customer.ausgefuellteformulare.length === 0) return false
  }

  // ERWEITERTE KATEGORIEFILTER-LOGIK
  if (selectedCategoryFilter) {
    if (!customer.category || customer.category.length === 0) return false
    
    const customerCategoryIds = customer.category.map(cat => cat._id)
    
    // Fall 1: Spezifische Unterkategorien ausgewählt
    if (selectedSubcategoryFilters.length > 0) {
      // Kunde muss mindestens eine der gewählten Unterkategorien haben
      return selectedSubcategoryFilters.some(subId => customerCategoryIds.includes(subId))
    }
    
    // Fall 2: "Inkl. Unterkategorien" aktiviert (alle Unterkategorien)
    if (includeSubcategoriesInFilter) {
      const categoryToCheck = categories.find(c => c._id === selectedCategoryFilter)
      const subcategoryIds = categoryToCheck?.subcategories?.map(s => s._id) || []
      const allIds = [selectedCategoryFilter, ...subcategoryIds]
      
      return customerCategoryIds.some(id => allIds.includes(id))
    }
    
    // Fall 3: Nur Hauptkategorie (direkte Zuordnung)
    return customerCategoryIds.includes(selectedCategoryFilter)
  }

  return true
})

  const unreadNotifications = notifications.filter((n) => !n.read)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-[#E3DAC9] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTestEmailModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
            >
              Test E-Mail
            </button>
            <button
              onClick={() => setShowEmailConfigModal(true)}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black ${
                emailConfigured ? "bg-green-200 hover:bg-green-300" : "bg-yellow-200 hover:bg-yellow-300"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]`}
            >
              {emailConfigured ? "E-Mail ✓" : "E-Mail Setup"}
            </button>
            <div className="relative">
              <button
                onClick={() => setActiveTab("notifications")}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
              >
                Benachrichtigungen
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: "customers", label: "Kunden" },
              { key: "forms", label: "Formular-Vorschau" },
              { key: "appointments", label: "Termine" },
              { key: "inquiries", label: "Kontaktanfragen" },
              { key: "notifications", label: "Benachrichtigungen" },
              { key: "categories", label: "Kategorien" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? "border-[#E3DAC9] text-[#E3DAC9]"
                    : "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.key === "notifications" && unreadNotifications.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-900 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div>
                <p className="text-sm text-white">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-900 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div>
                <p className="text-sm text-white">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* FORMULAR-VORSCHAU TAB */}
        {activeTab === "forms" && (
          <div className="space-y-6">
            {showFormPreview && previewForm ? (
              <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg" ref={formTopRef}>
                <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg leading-6 font-medium text-white">
                      Vorschau: {previewForm.title}
                    </h2>
                    <button
                      onClick={handleCloseFormPreview}
                      className="inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                    >
                      Schließen
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
                  <div className="space-y-6">
                    {previewForm.questions && previewForm.questions.length > 0 ? (
                      previewForm.questions.map((question, index) => renderFormField(question, index))
                    ) : (
                      <div className="text-white">Keine Fragen in diesem Formular</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                  <h2 className="text-lg leading-6 font-medium text-white">Vordefinierte Formulare</h2>
                  <p className="mt-1 max-w-2xl text-sm text-white">
                    Klicken Sie auf ein Formular, um die Vorschau anzuzeigen
                  </p>
                </div>
                <div className="border-t border-gray-700">
                  <ul className="divide-y divide-gray-700">
                    {PREDEFINED_FORMS.map((form, idx) => {
                      const parsedForm = JSON.parse(form.text.split('\n')[0].includes('{') ? form.text : `{"title":"${form.title}","questions":[]}`)
                      const questionCount = form.text.split('FRAGE:').length - 1
                      
                      return (
                        <li key={idx} className="px-4 py-5 sm:px-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg leading-6 font-medium text-white">{form.title}</h3>
                              <p className="mt-1 text-sm text-gray-300">{questionCount} Fragen</p>
                            </div>
                            <button
                              onClick={() => {
                                const lines = form.text.split('\n').filter(line => line.trim())
                                const parsedFormData = {
                                  title: form.title,
                                  questions: []
                                }
                                
                                let currentQuestion = null
                                for (let i = 0; i < lines.length; i++) {
                                  const line = lines[i].trim()
                                  
                                  if (line.startsWith('FRAGE:')) {
                                    if (currentQuestion) {
                                      parsedFormData.questions.push(currentQuestion)
                                    }
                                    currentQuestion = {
                                      questionText: line.replace('FRAGE:', '').trim(),
                                      questionType: 'text',
                                      required: false,
                                      options: []
                                    }
                                  } else if (line.startsWith('TYP:') && currentQuestion) {
                                    currentQuestion.questionType = line.replace('TYP:', '').trim()
                                  } else if (line.startsWith('PFLICHT:') && currentQuestion) {
                                    currentQuestion.required = line.replace('PFLICHT:', '').trim().toLowerCase() === 'ja'
                                  } else if (line.startsWith('OPTIONEN:') && currentQuestion) {
                                    currentQuestion.options = line.replace('OPTIONEN:', '').trim().split(',').map(opt => opt.trim())
                                  }
                                }
                                
                                if (currentQuestion) {
                                  parsedFormData.questions.push(currentQuestion)
                                }
                                
                                handlePreviewForm(parsedFormData)
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                            >
                              Vorschau
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
  <div className="space-y-6">
    {/* Customer Creation Form */}
    <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
        <h2 className="text-lg leading-6 font-medium text-white">
          {currentCustomer ? "Kunde bearbeiten" : "Neuen Kunden erstellen"}
        </h2>
        <p className="mt-1 text-sm text-white">
          {!currentCustomer && "Das Passwort wird automatisch generiert. Die Kundennummer kann manuell vergeben oder automatisch generiert werden."}
        </p>
      </div>
      <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
        <form onSubmit={currentCustomer ? handleUpdateCustomer : handleCreateCustomer}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white">
                Vorname
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white">
                Nachname
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                E-Mail
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
              />
            </div>
            {/* NEUES FELD: Kundennummer */}
            <div>
              <label htmlFor="kundennummer" className="block text-sm font-medium text-white">
                Kundennummer {!currentCustomer && <span className="text-gray-400">(optional)</span>}
              </label>
              <input
                type="text"
                name="kundennummer"
                id="kundennummer"
                value={formData.kundennummer}
                onChange={(e) => setFormData({ ...formData, kundennummer: e.target.value })}
                placeholder={!currentCustomer ? "Wird automatisch generiert" : ""}
                className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
              />
              {!currentCustomer && (
                <p className="mt-1 text-xs text-gray-400">
                  Leer lassen für automatische Vergabe
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              type="submit"
              disabled={isCreating || isEditing}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9] disabled:opacity-50"
            >
              {currentCustomer
                ? isEditing
                  ? "Wird aktualisiert..."
                  : "Aktualisieren"
                : isCreating
                  ? "Wird erstellt..."
                  : "Erstellen"}
            </button>
            {currentCustomer && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex justify-center py-2 px-4 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
              >
                Abbrechen
              </button>
            )}
          </div>
        </form>
      </div>
    </div>

          {/* Customer Filters - ERWEITERTE VERSION */}
<div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
  <div className="px-4 py-5 sm:px-6">
    <div className="space-y-4">
      {/* Zeile 1: Basis-Filter */}
      <div className="flex flex-wrap gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
        >
          <option value="all">Alle Kunden</option>
          <option value="with_forms">Mit zugewiesenen Formularen</option>
          <option value="without_forms">Ohne zugewiesene Formulare</option>
          <option value="completed_forms">Mit ausgefüllten Formularen</option>
        </select>
        
        <select
          value={selectedCategoryFilter || ""}
          onChange={(e) => {
            setSelectedCategoryFilter(e.target.value || null)
            setSelectedSubcategoryFilters([])
            setIncludeSubcategoriesInFilter(false)
          }}
          className="bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
        >
          <option value="">Alle Kategorien</option>
          {mainCategories.map((category) => (
            <option key={category._id} value={category._id}>
              📁 {category.name} ({category.customerCount || 0})
            </option>
          ))}
        </select>
        
        {selectedCategoryFilter && (
          <button
            onClick={handleResetCategoryFilter}
            className="inline-flex items-center px-3 py-2 border border-red-700 text-sm font-medium rounded-md text-red-400 bg-red-900/20 hover:bg-red-900/40"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Zeile 2: Unterkategorie-Optionen (nur wenn Hauptkategorie gewählt) */}
      {selectedCategoryFilter && availableSubcategoriesForFilter.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <div className="space-y-3">
            {/* Option 1: Alle Unterkategorien einbeziehen */}
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={includeSubcategoriesInFilter && selectedSubcategoryFilters.length === 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setIncludeSubcategoriesInFilter(true)
                    setSelectedSubcategoryFilters([])
                  } else {
                    setIncludeSubcategoriesInFilter(false)
                  }
                }}
                className="h-4 w-4 text-[#E3DAC9] border-gray-700 bg-[rgba(227,218,201,0.1)] rounded"
              />
              <span className="ml-2 text-sm font-medium">
                Alle Unterkategorien einbeziehen ({availableSubcategoriesForFilter.length})
              </span>
            </label>

            {/* Option 2: Spezifische Unterkategorien wählen */}
            {!includeSubcategoriesInFilter && (
              <div className="ml-6 space-y-2">
                <p className="text-sm text-gray-400 font-medium mb-2">
                  Oder spezifische Unterkategorien wählen:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableSubcategoriesForFilter.map((subcat) => (
                    <label
                      key={subcat._id}
                      className="flex items-center text-white bg-[rgba(227,218,201,0.05)] px-3 py-2 rounded border border-gray-700 hover:bg-[rgba(227,218,201,0.1)] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubcategoryFilters.includes(subcat._id)}
                        onChange={() => handleSubcategoryFilterToggle(subcat._id)}
                        className="h-4 w-4 text-[#E3DAC9] border-gray-700 bg-[rgba(227,218,201,0.1)] rounded"
                      />
                      <span className="ml-2 text-sm flex-1">
                        ↳ {subcat.name}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#E3DAC9]/30 text-white">
                        {subcat.customerCount || 0}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Aktive Filter-Anzeige */}
            {selectedSubcategoryFilters.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-700 rounded-md p-3">
                <p className="text-sm text-blue-200 mb-2">
                  Aktive Unterkategorien-Filter ({selectedSubcategoryFilters.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSubcategoryFilters.map((subId) => {
                    const subcat = availableSubcategoriesForFilter.find(s => s._id === subId)
                    return subcat ? (
                      <span
                        key={subId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900 text-blue-200"
                      >
                        {subcat.name}
                        <button
                          onClick={() => handleSubcategoryFilterToggle(subId)}
                          className="ml-1 text-blue-400 hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zeile 3: Filter-Status-Anzeige */}
      {selectedCategoryFilter && (
        <div className="bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">Aktiver Filter:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-[#E3DAC9] text-black font-medium">
                {mainCategories.find(c => c._id === selectedCategoryFilter)?.name}
              </span>
              {includeSubcategoriesInFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900 text-green-200">
                  + Alle Unterkategorien
                </span>
              )}
              {selectedSubcategoryFilters.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900 text-blue-200">
                  + {selectedSubcategoryFilters.length} Unterkategorie(n)
                </span>
              )}
            </div>
            <span className="text-sm text-gray-400">
              {filteredCustomers.length} Kunde(n) gefunden
            </span>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

            {/* Customer List */}
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h2 className="text-lg leading-6 font-medium text-white">Kundenliste</h2>
                <p className="mt-1 max-w-2xl text-sm text-white">
                  {filteredCustomers.length} von {customers.length} Kunden
                </p>
              </div>
              <div className="border-t border-gray-700">
                {isLoading ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Kunden gefunden</div>
                ) : (
                  <ul className="divide-y divide-gray-700">
                    {filteredCustomers.map((customer) => (
                      <li key={customer._id} className="px-4 py-5 sm:px-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg leading-6 font-medium text-white">
                                {customer.firstName} {customer.lastName}
                              </h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditCustomer(customer)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                                >
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => handleAssignForm(customer._id)}
                                  className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                                >
                                  Formulare
                                </button>
                                <button
                                  onClick={() => {
                                    setEmailCustomer(customer)
                                    setShowEmailModal(true)
                                  }}
                                  className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                                >
                                  E-Mail
                                </button>
                                <button
                                  onClick={() => {
                                    setCustomerToAssignCategory(customer._id)
                                    setShowAssignCategoryModal(true)
                                  }}
                                  className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                                >
                                  Kategorie
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(customer._id)}
                                  className="inline-flex items-center px-3 py-1 border border-red-700 text-xs font-medium rounded text-red-400 bg-red-900/20 hover:bg-red-900/40"
                                >
                                  Löschen
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-white">
  <div>
    <span className="font-medium">E-Mail:</span> {customer.email}
  </div>
  <div>
    <span className="font-medium">Kundennummer:</span> 
    <span className="ml-1 px-2 py-1 bg-[#E3DAC9]/20 rounded text-[#E3DAC9]">
      {customer.kundennummer}
    </span>
  </div>
  <div>
    <span className="font-medium">Passwort:</span> {customer.passwort || "Nicht gesetzt"}
  </div>
  <div>
    <span className="font-medium">Zugewiesene Formulare:</span>{" "}
    {customer.assignedForms ? customer.assignedForms.length : 0}
  </div>
  <div>
    <span className="font-medium">Ausgefüllte Formulare:</span>{" "}
    {customer.ausgefuellteformulare ? customer.ausgefuellteformulare.length : 0}
  </div>
</div>
                            {customer.category && customer.category.length > 0 && (
                              <div className="mt-2">
                                <span className="font-medium text-white">Kategorien:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {customer.category.map((category) => (
                                    <span
                                      key={category._id}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E3DAC9] text-black"
                                    >
                                      {category.name}
                                      <button
                                        onClick={() => handleRemoveFromCategory(customer._id, category._id)}
                                        className="ml-1 text-red-600 hover:text-red-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rest of the component remains the same... */}
        {/* Form Assignment Modal */}
        {showAssignForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Formulare verwalten</h3>
                  <button onClick={handleCloseAssignForm} className="text-gray-400 hover:text-white">
                    <span className="sr-only">Schließen</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Predefined Forms */}
                  <div>
                    <h4 className="text-md font-medium text-white mb-3">Vordefinierte Steuerformulare</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {PREDEFINED_FORMS.map((form, index) => (
                        <div key={index} className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700">
                          <h5 className="text-sm font-medium text-white mb-2">{form.title}</h5>
                          <button
                            onClick={() => handleAssignPredefinedForm(form.text)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                          >
                            Zuweisen
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Form */}
                  <div>
                    <h4 className="text-md font-medium text-white mb-3">Benutzerdefiniertes Formular</h4>
                    <textarea
                      value={newFormText}
                      onChange={(e) => setNewFormText(e.target.value)}
                      placeholder="Formulartext eingeben..."
                      rows={10}
                      className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                    />
                    <button
                      onClick={handleAssignCustomForm}
                      className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                    >
                      Benutzerdefiniertes Formular zuweisen
                    </button>
                  </div>
                </div>

                {/* Assigned Forms */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-white mb-3">Zugewiesene Formulare</h4>
                  {selectedCustomerForms.length === 0 ? (
                    <p className="text-gray-400">Keine Formulare zugewiesen</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCustomerForms.map((form, index) => (
                        <div
                          key={index}
                          className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700 flex justify-between items-center"
                        >
                          <span className="text-white">{form.title}</span>
                          <button
                            onClick={() => handleRemoveForm(index)}
                            className="inline-flex items-center px-3 py-1 border border-red-700 text-xs font-medium rounded text-red-400 bg-red-900/20 hover:bg-red-900/40"
                          >
                            Entfernen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Forms */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-white mb-3">Ausgefüllte Formulare</h4>
                  {completedForms.length === 0 ? (
                    <p className="text-gray-400">Keine ausgefüllten Formulare</p>
                  ) : (
                    <div className="space-y-2">
                      {completedForms.map((completed, index) => (
                        <div
                          key={index}
                          className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700 flex justify-between items-center"
                        >
                          <span className="text-white">Ausgefülltes Formular {index + 1}</span>
                          <a
                            href={`https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${completed.asset._ref.replace("file-", "").replace("-pdf", ".pdf")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                          >
                            PDF öffnen
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Uploaded Files */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-white mb-3">Hochgeladene Dateien</h4>
                  {uploadedFiles.length === 0 ? (
                    <p className="text-gray-400">Keine Dateien hochgeladen</p>
                  ) : (
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file._key}
                          className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700 flex justify-between items-center"
                        >
                          <div>
                            <span className="text-white">{file.fileName}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({new Date(file.uploadDate).toLocaleDateString("de-DE")})
                            </span>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                          >
                            Öffnen
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Assignment Modal */}
        {showAssignCategoryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Kategorie zuweisen</h3>
                  <button
                    onClick={() => {
                      setShowAssignCategoryModal(false)
                      setCustomerToAssignCategory(null)
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <span className="sr-only">Schließen</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleAssignCategory(category._id)}
                      className="w-full text-left px-4 py-2 bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md text-white hover:bg-[rgba(227,218,201,0.2)]"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the tabs remain the same... */}
        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
              <h2 className="text-lg leading-6 font-medium text-white">Termine</h2>
            </div>
            <div className="border-t border-gray-700">
              {isLoading ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
              ) : appointments.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Termine vorhanden</div>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {appointments.map((appointment) => (
                    <li key={appointment._id} className="px-4 py-5 sm:px-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-white">{appointment.name}</h3>
                          <p className="mt-1 text-sm text-gray-300">
                            {appointment.email} • {appointment.phone}
                          </p>
                          <p className="mt-1 text-sm text-[#E3DAC9]">
                            {new Date(appointment.uhrzeit).toLocaleString("de-DE")}
                          </p>
                        </div>
                        {appointment.link && (
                          <a
                            href={appointment.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                          >
                            Meeting beitreten
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Contact Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
              <h2 className="text-lg leading-6 font-medium text-white">Kontaktanfragen</h2>
            </div>
            <div className="border-t border-gray-700">
              {isLoading ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
              ) : contactInquiries.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Kontaktanfragen vorhanden</div>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {contactInquiries.map((inquiry) => (
                    <li key={inquiry._id} className="px-4 py-5 sm:px-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg leading-6 font-medium text-white">
                              {inquiry.firstName} {inquiry.lastName}
                            </h3>
                            <div className="flex space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  inquiry.status === "offen"
                                    ? "bg-yellow-900 text-yellow-200"
                                    : inquiry.status === "in_bearbeitung"
                                      ? "bg-blue-900 text-blue-200"
                                      : "bg-green-900 text-green-200"
                                }`}
                              >
                                {inquiry.status === "offen"
                                  ? "Offen"
                                  : inquiry.status === "in_bearbeitung"
                                    ? "In Bearbeitung"
                                    : "Abgeschlossen"}
                              </span>
                              <button
                                onClick={() => handleViewInquiry(inquiry)}
                                className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white">
                            <div>
                              <span className="font-medium">E-Mail:</span> {inquiry.email}
                            </div>
                            <div>
                              <span className="font-medium">Telefon:</span> {inquiry.phone || "Nicht angegeben"}
                            </div>
                            <div>
                              <span className="font-medium">Support-Nr:</span> {inquiry.supportNumber}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-white">Betreff:</span>
                            <p className="text-gray-300">{inquiry.subject}</p>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-white">Datum:</span>
                            <span className="text-[#E3DAC9] ml-2">
                              {new Date(inquiry.timestamp).toLocaleString("de-DE")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Inquiry Detail Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Kontaktanfrage Details</h3>
                  <button onClick={handleCloseInquiry} className="text-gray-400 hover:text-white">
                    <span className="sr-only">Schließen</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-white">Name:</span>
                      <p className="text-gray-300">
                        {selectedInquiry.firstName} {selectedInquiry.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-white">Support-Nummer:</span>
                      <p className="text-gray-300">{selectedInquiry.supportNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white">E-Mail:</span>
                      <p className="text-gray-300">{selectedInquiry.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white">Telefon:</span>
                      <p className="text-gray-300">{selectedInquiry.phone || "Nicht angegeben"}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-white">Betreff:</span>
                    <p className="text-gray-300">{selectedInquiry.subject}</p>
                  </div>

                  <div>
                    <span className="font-medium text-white">Nachricht:</span>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>

                  {selectedInquiry.fileUrl && (
                    <div>
                      <span className="font-medium text-white">Anhang:</span>
                      <a
                        href={selectedInquiry.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-[#E3DAC9] hover:underline"
                      >
                        Datei öffnen
                      </a>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-white">Datum:</span>
                    <p className="text-gray-300">{new Date(selectedInquiry.timestamp).toLocaleString("de-DE")}</p>
                  </div>

                  <div>
                    <span className="font-medium text-white">Status ändern:</span>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleUpdateInquiryStatus(selectedInquiry._id, "offen")}
                        className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded text-sm hover:bg-yellow-800"
                      >
                        Offen
                      </button>
                      <button
                        onClick={() => handleUpdateInquiryStatus(selectedInquiry._id, "in_bearbeitung")}
                        className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-sm hover:bg-blue-800"
                      >
                        In Bearbeitung
                      </button>
                      <button
                        onClick={() => handleUpdateInquiryStatus(selectedInquiry._id, "abgeschlossen")}
                        className="px-3 py-1 bg-green-900 text-green-200 rounded text-sm hover:bg-green-800"
                      >
                        Abgeschlossen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-white">Benachrichtigungen</h2>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={handleMarkAllNotificationsAsRead}
                  className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                >
                  Alle als gelesen markieren
                </button>
              )}
            </div>
            <div className="border-t border-gray-700">
              {isLoading ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Benachrichtigungen vorhanden</div>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={`px-4 py-5 sm:px-6 ${!notification.read ? "bg-[rgba(227,218,201,0.05)]" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg leading-6 font-medium text-white">{notification.title}</h3>
                            {!notification.read && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E3DAC9] text-black">
                                Neu
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-300">{notification.message}</p>
                          <p className="mt-1 text-xs text-[#E3DAC9]">
                            {new Date(notification.createdAt).toLocaleString("de-DE")}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkNotificationAsRead(notification._id)}
                            className="ml-4 inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                          >
                            Als gelesen markieren
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
  <div className="space-y-6">
    {/* Kategorie-Aktionen */}
    <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
        <h2 className="text-lg leading-6 font-medium text-white">Kategorien verwalten</h2>
      </div>
      <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
          >
            + Hauptkategorie
          </button>
          <button
            onClick={() => setShowSubcategoryModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
          >
            + Unterkategorie
          </button>
        </div>
      </div>
    </div>

    {/* Hierarchische Kategorienanzeige */}
    <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
        <h2 className="text-lg leading-6 font-medium text-white">
          Kategoriestruktur ({categories.length} Kategorien)
        </h2>
      </div>
      <div className="border-t border-gray-700">
        {isLoading ? (
          <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
        ) : mainCategories.length === 0 ? (
          <div className="px-4 py-5 sm:px-6 text-center text-white">
            Keine Kategorien vorhanden
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {mainCategories.map((category) => (
              <li key={category._id} className="px-4 py-5 sm:px-6">
                {/* Hauptkategorie */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg leading-6 font-bold text-white">
                        📁 {category.name}
                      </h3>
                      <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E3DAC9] text-black">
                        {category.customerCount || 0} Kunde(n)
                      </span>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                          {category.subcategories.length} Unterkategorie(n)
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="mt-1 text-sm text-gray-300">{category.description}</p>
                    )}

                    {/* Aktionen für Hauptkategorie */}
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleShowCategoryDetails(category, false)}
                        className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                      >
                        Kunden anzeigen
                      </button>
                      <button
                        onClick={() => handleShowCategoryDetails(category, true)}
                        className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                      >
                        Inkl. Unterkategorien
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="inline-flex items-center px-3 py-1 border border-red-700 text-xs font-medium rounded text-red-400 bg-red-900/20 hover:bg-red-900/40"
                      >
                        Löschen
                      </button>
                    </div>

                    {/* Unterkategorien */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="mt-4 ml-6 space-y-3 border-l-2 border-gray-600 pl-4">
                        {category.subcategories.map((subcat) => (
                          <div key={subcat._id} className="bg-[rgba(227,218,201,0.05)] p-3 rounded">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="text-md font-medium text-white">
                                    ↳ {subcat.name}
                                  </h4>
                                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E3DAC9]/50 text-black">
                                    {subcat.customerCount || 0} Kunde(n)
                                  </span>
                                </div>
                                {subcat.description && (
                                  <p className="mt-1 text-xs text-gray-400">{subcat.description}</p>
                                )}
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => handleShowCategoryDetails(subcat, false)}
                                  className="inline-flex items-center px-2 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                                >
                                  Kunden
                                </button>
                                <button
                                  onClick={() => handleEditCategory(subcat)}
                                  className="inline-flex items-center px-2 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                                >
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => handleMoveCategory(subcat)}
                                  className="inline-flex items-center px-2 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                                >
                                  Verschieben
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(subcat._id)}
                                  className="inline-flex items-center px-2 py-1 border border-red-700 text-xs font-medium rounded text-red-400 bg-red-900/20 hover:bg-red-900/40"
                                >
                                  Löschen
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
)}
      </main>
      {/* E-Mail Modal */}
      {showEmailModal && emailCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Willkommens-E-Mail senden</h3>
                <button
                  onClick={() => {
                    setShowEmailModal(false)
                    setEmailCustomer(null)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">Schließen</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white">Willkommens-E-Mail senden an:</p>
                  <p className="text-[#E3DAC9] font-medium">
                    {emailCustomer.firstName} {emailCustomer.lastName}
                  </p>
                  <p className="text-gray-300">{emailCustomer.email}</p>
                </div>

                <div className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700">
                  <p className="text-sm text-white">Die E-Mail enthält:</p>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1">
                    <li>• Zugangsdaten (E-Mail und Passwort)</li>
                    <li>• Kundennummer</li>
                    <li>• Link zur Anmeldung</li>
                    <li>• Kontaktinformationen</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSendWelcomeEmail(emailCustomer)}
                    className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                  >
                    E-Mail senden
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailModal(false)
                      setEmailCustomer(null)
                    }}
                    className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test E-Mail Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Test E-Mail senden</h3>
                <button
                  onClick={() => {
                    setShowTestEmailModal(false)
                    setTestEmailAddress("")
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">Schließen</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="testEmail" className="block text-sm font-medium text-white mb-2">
                    E-Mail-Adresse für Test
                  </label>
                  <input
                    type="email"
                    id="testEmail"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSendTestEmail}
                    className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                  >
                    Test senden
                  </button>
                  <button
                    onClick={() => {
                      setShowTestEmailModal(false)
                      setTestEmailAddress("")
                    }}
                    className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-Mail Konfiguration Modal - Vereinfacht */}
      {showEmailConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">E-Mail Service Konfiguration</h3>
                <button onClick={() => setShowEmailConfigModal(false)} className="text-gray-400 hover:text-white">
                  <span className="sr-only">Schließen</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[rgba(227,218,201,0.1)] p-4 rounded border border-gray-700">
                  <h4 className="text-white font-medium mb-2">EmailJS Setup Anleitung:</h4>
                  <ol className="text-sm text-gray-300 space-y-1">
                    <li>
                      1. Gehen Sie zu{" "}
                      <a
                        href="https://emailjs.com"
                        target="_blank"
                        className="text-[#E3DAC9] hover:underline"
                        rel="noreferrer"
                      >
                        emailjs.com
                      </a>{" "}
                      und erstellen Sie ein kostenloses Konto
                    </li>
                    <li>2. Erstellen Sie einen E-Mail Service (Gmail, Outlook, etc.)</li>
                    <li>
                      3. Erstellen Sie ein neues E-Mail Template mit folgenden Variablen:
                      <br />
                      <code className="text-xs bg-gray-700 px-1 rounded">
                        {`{{to_email}}, {{to_name}}, {{from_name}}, {{subject}}, {{html_content}}`}
                      </code>
                    </li>
                    <li>4. Kopieren Sie Service ID, Template ID und Public Key hierher</li>
                  </ol>
                </div>

                <div>
                  <label htmlFor="serviceId" className="block text-sm font-medium text-white mb-2">
                    Service ID
                  </label>
                  <input
                    type="text"
                    id="serviceId"
                    value={emailConfig.serviceId}
                    onChange={(e) => setEmailConfig({ ...emailConfig, serviceId: e.target.value })}
                    placeholder="service_xxxxxxx"
                    className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                  />
                </div>

                <div>
                  <label htmlFor="templateId" className="block text-sm font-medium text-white mb-2">
                    Template ID
                  </label>
                  <input
                    type="text"
                    id="templateId"
                    value={emailConfig.templateId}
                    onChange={(e) => setEmailConfig({ ...emailConfig, templateId: e.target.value })}
                    placeholder="template_xxxxxxx"
                    className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                  />
                </div>

                <div>
                  <label htmlFor="publicKey" className="block text-sm font-medium text-white mb-2">
                    Public Key
                  </label>
                  <input
                    type="text"
                    id="publicKey"
                    value={emailConfig.publicKey}
                    onChange={(e) => setEmailConfig({ ...emailConfig, publicKey: e.target.value })}
                    placeholder="xxxxxxxxxxxxxxx"
                    className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveEmailConfig}
                    className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                  >
                    Konfiguration speichern
                  </button>
                  <button
                    onClick={() => setShowEmailConfigModal(false)}
                    className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCategoryModal && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
      <div className="mt-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Hauptkategorie erstellen</h3>
          <button
            onClick={() => {
              setShowCategoryModal(false)
              setNewCategoryName("")
              setNewCategoryDescription("")
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Name *</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="z.B. Privatkunden"
              className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Beschreibung</label>
            <textarea
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Optionale Beschreibung"
              rows={3}
              className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateMainCategory}
              className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
            >
              Erstellen
            </button>
            <button
              onClick={() => {
                setShowCategoryModal(false)
                setNewCategoryName("")
                setNewCategoryDescription("")
              }}
              className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Unterkategorie erstellen Modal */}
{showSubcategoryModal && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
      <div className="mt-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Unterkategorie erstellen</h3>
          <button
            onClick={() => {
              setShowSubcategoryModal(false)
              setNewCategoryName("")
              setNewCategoryDescription("")
              setParentCategoryForNew(null)
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Übergeordnete Kategorie *</label>
            <select
              value={parentCategoryForNew || ""}
              onChange={(e) => setParentCategoryForNew(e.target.value || null)}
              className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            >
              <option value="">Wählen Sie eine Kategorie</option>
              {mainCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Name *</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="z.B. Selbstständige"
              className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Beschreibung</label>
            <textarea
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Optionale Beschreibung"
              rows={3}
              className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateSubcategory}
              className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
            >
              Erstellen
            </button>
            <button
              onClick={() => {
                setShowSubcategoryModal(false)
                setNewCategoryName("")
                setNewCategoryDescription("")
                setParentCategoryForNew(null)
              }}
              className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Kategorie bearbeiten Modal */}
{showEditCategoryModal && editingCategory && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
      <div className="mt-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Kategorie bearbeiten</h3>
          <button
            onClick={() => {
              setShowEditCategoryModal(false)
              setEditingCategory(null)
              setNewCategoryName("")
              setNewCategoryDescription("")
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Name *</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Beschreibung</label>
            <textarea
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              rows={3}
              className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSaveEditCategory}
              className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
            >
              Speichern
            </button>
            <button
              onClick={() => {
                setShowEditCategoryModal(false)
                setEditingCategory(null)
                setNewCategoryName("")
                setNewCategoryDescription("")
              }}
              className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Kategorie verschieben Modal */}
{showMoveCategoryModal && movingCategory && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
      <div className="mt-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Kategorie verschieben</h3>
          <button
            onClick={() => {
              setShowMoveCategoryModal(false)
              setMovingCategory(null)
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Verschiebe "{movingCategory.name}" zu einer anderen Kategorie oder mache sie zur Hauptkategorie.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleSaveMoveCategory(null)}
              className="w-full text-left px-4 py-2 bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md text-white hover:bg-[rgba(227,218,201,0.2)]"
            >
              → Zur Hauptkategorie machen
            </button>
            {mainCategories
              .filter(cat => cat._id !== movingCategory._id)
              .map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleSaveMoveCategory(cat._id)}
                  className="w-full text-left px-4 py-2 bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md text-white hover:bg-[rgba(227,218,201,0.2)]"
                >
                  → Unter "{cat.name}"
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Kategorie-Details Modal */}
{showCategoryDetails && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-gray-800">
      <div className="mt-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">{showCategoryDetails.name}</h3>
            <p className="text-sm text-gray-400">
              {showCategoryDetails.includesSubcategories 
                ? "Inkl. Unterkategorien" 
                : "Nur direkte Zuordnung"}
            </p>
          </div>
          <button
            onClick={() => setShowCategoryDetails(null)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-white">
            {showCategoryDetails.customers.length} Kunde(n) in dieser Kategorie
          </p>
          {showCategoryDetails.customers.length > 0 ? (
            <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
              {showCategoryDetails.customers.map((customer) => (
                <li key={customer._id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{customer.email}</p>
                      {customer.category && customer.category.length > 1 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {customer.category.map(cat => (
                            <span key={cat._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#E3DAC9]/30 text-white">
                              {cat.parentCategory && `${cat.parentCategory.name} / `}{cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Keine Kunden in dieser Kategorie</p>
          )}
        </div>
      </div>
    </div>
  </div>
)}

{/* Kategorie-Zuweisung Modal (angepasst für Hierarchie) */}
{showAssignCategoryModal && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
      <div className="mt-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Kategorie zuweisen</h3>
          <button
            onClick={() => {
              setShowAssignCategoryModal(false)
              setCustomerToAssignCategory(null)
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mainCategories.map((category) => (
            <div key={category._id} className="space-y-2">
              <button
                onClick={() => handleAssignCategory(category._id)}
                className="w-full text-left px-4 py-2 bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md text-white hover:bg-[rgba(227,218,201,0.2)] font-medium"
              >
                📁 {category.name}
              </button>
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="ml-6 space-y-1">
                  {category.subcategories.map((subcat) => (
                    <button
                      key={subcat._id}
                      onClick={() => handleAssignCategory(subcat._id)}
                      className="w-full text-left px-3 py-1.5 bg-[rgba(227,218,201,0.05)] border border-gray-700 rounded-md text-gray-300 hover:bg-[rgba(227,218,201,0.1)] text-sm"
                    >
                      ↳ {subcat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  )
}