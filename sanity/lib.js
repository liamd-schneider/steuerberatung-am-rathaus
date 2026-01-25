import { createClient } from "@sanity/client"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Initialize Sanity client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-11-21",
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
})

// Helper function to generate a unique key
export function generateUniqueKey() {
  return Math.random().toString(36).substring(2, 15)
}

export function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

// NEUE SEQUENZIELLE KUNDENNUMMER-GENERIERUNG MIT VALIDIERUNG
export async function generateCustomerNumber() {
  try {
    let counter = await client.fetch(`*[_type == "customerCounter"][0]`)
    
    if (!counter) {
      counter = await client.create({
        _type: "customerCounter",
        currentNumber: 3400
      })
    }
    
    const newNumber = counter.currentNumber
    
    await client
      .patch(counter._id)
      .set({ currentNumber: newNumber + 1 })
      .commit()
    
    return newNumber.toString()
  } catch (error) {
    console.error("Error generating customer number:", error)
    throw new Error("Fehler beim Generieren der Kundennummer")
  }
}

export async function validateAndUpdateHighestCustomerNumber(newCustomerNumber) {
  try {
    const customerNumberInt = parseInt(newCustomerNumber)
    
    if (isNaN(customerNumberInt)) {
      throw new Error("Ungültige Kundennummer")
    }
    
    let counter = await client.fetch(`*[_type == "customerCounter"][0]`)
    
    if (!counter) {
      counter = await client.create({
        _type: "customerCounter",
        currentNumber: Math.max(3400, customerNumberInt + 1)
      })
    } else if (customerNumberInt >= counter.currentNumber) {
      await client
        .patch(counter._id)
        .set({ currentNumber: customerNumberInt + 1 })
        .commit()
    }
    
    return customerNumberInt.toString()
  } catch (error) {
    console.error("Error validating customer number:", error)
    throw new Error("Fehler beim Validieren der Kundennummer")
  }
}

export async function isCustomerNumberTaken(customerNumber, excludeCustomerId = null) {
  try {
    const query = excludeCustomerId 
      ? `*[_type == "userForm" && kundennummer == $customerNumber && _id != $excludeCustomerId][0]`
      : `*[_type == "userForm" && kundennummer == $customerNumber][0]`
    
    const params = excludeCustomerId 
      ? { customerNumber, excludeCustomerId }
      : { customerNumber }
    
    const existing = await client.fetch(query, params)
    return !!existing
  } catch (error) {
    console.error("Error checking customer number:", error)
    throw new Error("Fehler beim Prüfen der Kundennummer")
  }
}

// Parse form text into structured form object
export function parseFormText(formText) {
  if (!formText) return null

  try {
    return JSON.parse(formText)
  } catch {
    const lines = formText.split("\n").filter((line) => line.trim())
    const form = {
      title: lines[0] || "Formular",
      questions: [],
    }

    let currentQuestion = null

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith("FRAGE:")) {
        if (currentQuestion) {
          form.questions.push(currentQuestion)
        }
        currentQuestion = {
          questionText: line.replace("FRAGE:", "").trim(),
          questionType: "text",
          required: false,
          options: [],
        }
      } else if (line.startsWith("TYP:")) {
        if (currentQuestion) {
          currentQuestion.questionType = line.replace("TYP:", "").trim()
        }
      } else if (line.startsWith("PFLICHT:")) {
        if (currentQuestion) {
          currentQuestion.required = line.replace("PFLICHT:", "").trim().toLowerCase() === "ja"
        }
      } else if (line.startsWith("OPTIONEN:")) {
        if (currentQuestion) {
          const options = line
            .replace("OPTIONEN:", "")
            .trim()
            .split(",")
            .map((opt) => opt.trim())
          currentQuestion.options = options
        }
      }
    }

    if (currentQuestion) {
      form.questions.push(currentQuestion)
    }

    return form
  }
}

// Customer management functions
export async function getCustomers() {
  return client.fetch(`
    *[_type == "userForm"] | order(firstName asc) {
      _id,
      firstName,
      lastName,
      email,
      kundennummer,
      passwort,
      isAdmin,
      assignedForms,
      ausgefuellteformulare,
      uploadedFiles,
      category[]-> {
        _id,
        name,
        description,
        parentCategory-> {
          _id,
          name
        }
      }
    }
  `)
}

export async function createCustomer(customerData) {
  try {
    const existingCustomer = await client.fetch(`*[_type == "userForm" && email == $email][0]`, {
      email: customerData.email,
    })

    if (existingCustomer) {
      throw new Error("Ein Kunde mit dieser E-Mail-Adresse existiert bereits")
    }

    let kundennummer
    if (customerData.kundennummer) {
      const isTaken = await isCustomerNumberTaken(customerData.kundennummer)
      if (isTaken) {
        throw new Error("Diese Kundennummer ist bereits vergeben")
      }
      kundennummer = await validateAndUpdateHighestCustomerNumber(customerData.kundennummer)
    } else {
      kundennummer = await generateCustomerNumber()
    }

    const newCustomer = {
      _type: "userForm",
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      passwort: customerData.passwort || generatePassword(),
      kundennummer: kundennummer,
      isAdmin: false,
      assignedForms: [],
      ausgefuellteformulare: [],
      uploadedFiles: [],
      category: [],
    }

    const result = await client.create(newCustomer)

    await createNotification({
      title: "Neuer Kunde erstellt",
      message: `Kunde ${customerData.firstName} ${customerData.lastName} wurde erstellt. Passwort: ${newCustomer.passwort}`,
      type: "customer_created",
      relatedDocumentId: result._id,
      relatedDocumentType: "userForm",
    })

    return result
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

export async function updateCustomer(customerId, customerData) {
  try {
    if (customerData.email) {
      const existingCustomer = await client.fetch(
        `*[_type == "userForm" && email == $email && _id != $customerId][0]`,
        { email: customerData.email, customerId },
      )

      if (existingCustomer) {
        throw new Error("Ein anderer Kunde mit dieser E-Mail-Adresse existiert bereits")
      }
    }

    if (customerData.kundennummer) {
      const isTaken = await isCustomerNumberTaken(customerData.kundennummer, customerId)
      if (isTaken) {
        throw new Error("Diese Kundennummer ist bereits vergeben")
      }
      customerData.kundennummer = await validateAndUpdateHighestCustomerNumber(customerData.kundennummer)
    }

    return await client.patch(customerId).set(customerData).commit()
  } catch (error) {
    console.error("Error updating customer:", error)
    throw error
  }
}

export async function deleteCustomer(customerId) {
  try {
    return await client.delete(customerId)
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw error
  }
}

// Get user's assigned forms
export async function getUserAssignedForms(userId) {
  try {
    const user = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        assignedForms
      }`,
      { userId },
    )

    if (!user?.assignedForms || !Array.isArray(user.assignedForms)) {
      return []
    }

    return user.assignedForms
      .map((formText, index) => {
        const parsedForm = parseFormText(formText)
        if (parsedForm) {
          return {
            _id: `form_${index}`,
            ...parsedForm,
          }
        }
        return null
      })
      .filter(Boolean)
  } catch (error) {
    console.error("Error fetching user forms:", error)
    return []
  }
}

export async function getCompletedForms(userId) {
  try {
    return await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        ausgefuellteformulare,
        uploadedFiles
      }`,
      { userId },
    )
  } catch (error) {
    console.error("Error fetching completed forms:", error)
    return { ausgefuellteformulare: [], uploadedFiles: [] }
  }
}

export async function assignFormTextToUser(userId, formText) {
  try {
    const user = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        assignedForms
      }`,
      { userId },
    )

    if (user?.assignedForms?.includes(formText)) {
      throw new Error("Dieses Formular ist bereits zugewiesen")
    }

    return await client.patch(userId).setIfMissing({ assignedForms: [] }).append("assignedForms", [formText]).commit()
  } catch (error) {
    console.error("Error assigning form:", error)
    throw error
  }
}

export async function removeFormTextFromUser(userId, formIndex) {
  try {
    const user = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        assignedForms
      }`,
      { userId },
    )

    if (!user?.assignedForms) {
      throw new Error("Keine Formulare gefunden")
    }

    const updatedForms = user.assignedForms.filter((_, index) => index !== formIndex)

    return await client.patch(userId).set({ assignedForms: updatedForms }).commit()
  } catch (error) {
    console.error("Error removing form:", error)
    throw error
  }
}

// File upload functions
export async function uploadFileToSanity(file) {
  try {
    if (!file) {
      throw new Error("Keine Datei zum Hochladen bereitgestellt")
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Datei ist zu groß (max. 10MB)")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadedAsset = await client.assets.upload("file", buffer, {
      filename: file.name,
      contentType: file.type,
    })

    return {
      fileId: uploadedAsset._id,
      url: uploadedAsset.url,
      fileName: file.name,
    }
  } catch (error) {
    console.error("Fehler beim Hochladen der Datei zu Sanity:", error)
    throw new Error(`Fehler beim Hochladen der Datei: ${error.message}`)
  }
}

export async function uploadFileAndAssignToUser(userId, file, questionIndex, formId) {
  try {
    const uploadResult = await uploadFileToSanity(file)

    const fileObject = {
      _key: generateUniqueKey(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      formId: formId,
      questionIndex: questionIndex,
      uploadDate: new Date().toISOString(),
      asset: {
        _type: "reference",
        _ref: uploadResult.fileId,
      },
    }

    await client.patch(userId).setIfMissing({ uploadedFiles: [] }).append("uploadedFiles", [fileObject]).commit()

    return {
      ...uploadResult,
      key: fileObject._key,
    }
  } catch (error) {
    console.error("Fehler beim Hochladen und Zuordnen der Datei:", error)
    throw new Error(`Fehler beim Hochladen und Zuordnen der Datei: ${error.message}`)
  }
}

export async function getUserUploadedFiles(userId) {
  try {
    const result = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        uploadedFiles[] {
          _key,
          fileName,
          fileType,
          fileSize,
          formId,
          questionIndex,
          uploadDate,
          "url": asset->url
        }
      }`,
      { userId },
    )

    return result?.uploadedFiles || []
  } catch (error) {
    console.error("Error fetching uploaded files:", error)
    return []
  }
}

export async function submitCompletedForm(userId, form, answers, fileUploads = {}) {
  try {
    const user = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        firstName,
        lastName,
        email,
        kundennummer,
        uploadedFiles[] {
          _key,
          fileName,
          fileType,
          fileSize,
          formId,
          questionIndex,
          "url": asset->url
        }
      }`,
      { userId },
    )

    const uploadedFileRefs = (user.uploadedFiles || []).filter((file) => file.formId === form._id)

    const pdfFile = await generatePDF(form, answers, user, uploadedFileRefs)

    const result = await client
      .patch(userId)
      .setIfMissing({ ausgefuellteformulare: [] })
      .append("ausgefuellteformulare", [
        {
          _type: "file",
          _key: generateUniqueKey(),
          asset: {
            _type: "reference",
            _ref: pdfFile.assetId,
          },
        },
      ])
      .commit()

    await createNotification({
      title: "Formular ausgefüllt",
      message: `Ein Formular wurde von ${user.firstName} ${user.lastName} ausgefüllt: ${form.title || "Formular"}`,
      type: "form_completed",
      relatedDocumentId: userId,
      relatedDocumentType: "userForm",
    })

    return result
  } catch (error) {
    console.error("Fehler beim Einreichen des Formulars:", error)
    throw new Error(`Fehler beim Einreichen des Formulars: ${error.message}`)
  }
}

export async function removeFormAfterCompletion(userId, formIndex) {
  return removeFormTextFromUser(userId, formIndex)
}

// Notification functions
export async function createNotification({ title, message, type, relatedDocumentId, relatedDocumentType }) {
  try {
    return await client.create({
      _type: "notification",
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      relatedDocumentId,
      relatedDocumentType,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function getNotifications() {
  try {
    return await client.fetch(`
      *[_type == "notification"] | order(createdAt desc) {
        _id,
        title,
        message,
        type,
        read,
        createdAt,
        relatedDocumentId,
        relatedDocumentType
      }
    `)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(id) {
  try {
    return await client.patch(id).set({ read: true }).commit()
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const unreadNotifications = await client.fetch(`
      *[_type == "notification" && read == false]._id
    `)

    if (unreadNotifications.length === 0) {
      return { success: true, message: "Keine ungelesenen Benachrichtigungen vorhanden" }
    }

    const transactions = unreadNotifications.map((id) => client.patch(id).set({ read: true }))
    await Promise.all(transactions.map((tx) => tx.commit()))

    return {
      success: true,
      message: `${unreadNotifications.length} Benachrichtigungen als gelesen markiert`,
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Contact inquiry functions
export async function getContactInquiries() {
  try {
    return await client.fetch(`
      *[_type == "contactForm"] | order(timestamp desc) {
        _id,
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        supportNumber,
        status,
        timestamp,
        "fileUrl": file.asset->url
      }
    `)
  } catch (error) {
    console.error("Error fetching contact inquiries:", error)
    return []
  }
}

export async function updateContactInquiryStatus(id, status) {
  try {
    const result = await client.patch(id).set({ status }).commit()

    const inquiry = await client.fetch(
      `*[_type == "contactForm" && _id == $id][0] {
        _id,
        firstName,
        lastName,
        supportNumber
      }`,
      { id },
    )

    if (inquiry) {
      await createNotification({
        title: `Kontaktanfrage Status: ${status}`,
        message: `Status der Anfrage ${inquiry.supportNumber} wurde auf "${status}" geändert.`,
        type: "contact_inquiry",
        relatedDocumentId: id,
        relatedDocumentType: "contactForm",
      })
    }

    return result
  } catch (error) {
    console.error("Error updating inquiry status:", error)
    throw error
  }
}

export async function getAppointments() {
  try {
    return await client.fetch(`*[_type == "appointment"] | order(uhrzeit desc) {
    _id,
    name,
    phone,
    email,
    uhrzeit,
    link
  }`)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return []
  }
}

// ============================================================
// ERWEITERTE KATEGORIE-FUNKTIONEN MIT UNTERKATEGORIEN
// ============================================================

// Hole alle Kategorien mit hierarchischer Struktur
export async function getCategories() {
  try {
    return client.fetch(`*[_type == "category"] | order(name asc) {
      _id,
      name,
      description,
      parentCategory-> {
        _id,
        name
      },
      "subcategories": *[_type == "category" && references(^._id)] {
        _id,
        name,
        description,
        "customerCount": count(*[_type == "userForm" && references(^._id)])
      },
      "customerCount": count(*[_type == "userForm" && references(^._id)])
    }`)
  } catch (error) {
    console.error("Fehler beim Abrufen der Kategorien:", error)
    return []
  }
}

// Hole nur Hauptkategorien (ohne Parent)
export async function getMainCategories() {
  try {
    return client.fetch(`*[_type == "category" && !defined(parentCategory)] | order(name asc) {
      _id,
      name,
      description,
      "subcategories": *[_type == "category" && references(^._id)] | order(name asc) {
        _id,
        name,
        description,
        "customerCount": count(*[_type == "userForm" && references(^._id)])
      },
      "customerCount": count(*[_type == "userForm" && references(^._id)])
    }`)
  } catch (error) {
    console.error("Fehler beim Abrufen der Hauptkategorien:", error)
    return []
  }
}

// Hole Unterkategorien für eine bestimmte Kategorie
export async function getSubcategories(parentCategoryId) {
  try {
    return client.fetch(
      `*[_type == "category" && parentCategory._ref == $parentCategoryId] | order(name asc) {
        _id,
        name,
        description,
        parentCategory-> {
          _id,
          name
        },
        "customerCount": count(*[_type == "userForm" && references(^._id)])
      }`,
      { parentCategoryId }
    )
  } catch (error) {
    console.error("Fehler beim Abrufen der Unterkategorien:", error)
    return []
  }
}

// Erstelle eine neue Kategorie (kann Hauptkategorie oder Unterkategorie sein)
export async function createCategory(name, description = "", parentCategoryId = null) {
  try {
    const newCategory = {
      _type: "category",
      name: name,
      description: description,
    }

    // Füge Referenz zur Elternkategorie hinzu, falls vorhanden
    if (parentCategoryId) {
      newCategory.parentCategory = {
        _type: "reference",
        _ref: parentCategoryId,
      }
    }

    return client.create(newCategory)
  } catch (error) {
    console.error("Fehler beim Erstellen der Kategorie:", error)
    throw new Error(`Fehler beim Erstellen der Kategorie: ${error.message}`)
  }
}

// Aktualisiere eine Kategorie
export async function updateCategory(categoryId, data) {
  try {
    return await client.patch(categoryId).set(data).commit()
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Kategorie:", error)
    throw new Error(`Fehler beim Aktualisieren der Kategorie: ${error.message}`)
  }
}

// Lösche eine Kategorie
export async function deleteCategory(categoryId) {
  try {
    // Prüfe ob Kategorie Unterkategorien hat
    const subcategories = await getSubcategories(categoryId)
    if (subcategories.length > 0) {
      throw new Error("Kategorie kann nicht gelöscht werden, da sie Unterkategorien enthält")
    }

    // Prüfe ob Kunden dieser Kategorie zugeordnet sind
    const customersWithCategory = await client.fetch(
      `*[_type == "userForm" && references($categoryId)]`,
      { categoryId }
    )
    
    if (customersWithCategory.length > 0) {
      throw new Error("Kategorie kann nicht gelöscht werden, da sie Kunden zugeordnet ist")
    }

    return await client.delete(categoryId)
  } catch (error) {
    console.error("Fehler beim Löschen der Kategorie:", error)
    throw error
  }
}

// Weise Kunde einer Kategorie zu
export async function assignCustomerToCategory(customerId, categoryId) {
  try {
    const customer = await client.fetch(
      `*[_type == "userForm" && _id == $customerId][0]{
        category
      }`,
      { customerId },
    )

    if (customer.category && customer.category.some((cat) => cat._ref === categoryId)) {
      return { alreadyAssigned: true }
    }

    return client
      .patch(customerId)
      .setIfMissing({ category: [] })
      .append("category", [{ _type: "reference", _ref: categoryId, _key: generateUniqueKey() }])
      .commit()
  } catch (error) {
    console.error("Fehler beim Zuweisen der Kategorie:", error)
    throw new Error(`Fehler beim Zuweisen der Kategorie: ${error.message}`)
  }
}

// Entferne Kunde aus Kategorie
export async function removeCustomerFromCategory(customerId, categoryId) {
  try {
    const customer = await client.fetch(
      `*[_type == "userForm" && _id == $customerId][0]{
        category
      }`,
      { customerId },
    )

    if (!customer.category) {
      return { notAssigned: true }
    }

    const updatedCategories = customer.category.filter((cat) => cat._ref !== categoryId)

    return client.patch(customerId).set({ category: updatedCategories }).commit()
  } catch (error) {
    console.error("Fehler beim Entfernen aus der Kategorie:", error)
    throw new Error(`Fehler beim Entfernen aus der Kategorie: ${error.message}`)
  }
}

// Hole alle Kunden einer bestimmten Kategorie (inkl. Unterkategorien)
export async function getCustomersByCategory(categoryId, includeSubcategories = false) {
  try {
    if (!includeSubcategories) {
      return client.fetch(
        `*[_type == "userForm" && references($categoryId)] | order(firstName asc) {
          _id,
          firstName,
          lastName,
          email,
          kundennummer,
          category[]-> {
            _id,
            name
          }
        }`,
        { categoryId }
      )
    }

    // Hole auch Kunden aus Unterkategorien
    const subcategories = await getSubcategories(categoryId)
    const allCategoryIds = [categoryId, ...subcategories.map(sub => sub._id)]

    return client.fetch(
      `*[_type == "userForm" && count((category[]._ref)[@ in $categoryIds]) > 0] | order(firstName asc) {
        _id,
        firstName,
        lastName,
        email,
        kundennummer,
        category[]-> {
          _id,
          name,
          parentCategory-> {
            _id,
            name
          }
        }
      }`,
      { categoryIds: allCategoryIds }
    )
  } catch (error) {
    console.error("Fehler beim Abrufen der Kunden nach Kategorie:", error)
    return []
  }
}

// Verschiebe Kategorie zu anderer Elternkategorie oder mache zu Hauptkategorie
export async function moveCategoryToParent(categoryId, newParentCategoryId) {
  try {
    if (newParentCategoryId) {
      // Prüfe ob die neue Elternkategorie nicht die Kategorie selbst oder eine ihrer Unterkategorien ist
      const subcategories = await getSubcategories(categoryId)
      const subcategoryIds = subcategories.map(sub => sub._id)
      
      if (categoryId === newParentCategoryId || subcategoryIds.includes(newParentCategoryId)) {
        throw new Error("Kategorie kann nicht zu sich selbst oder einer ihrer Unterkategorien verschoben werden")
      }

      return await client
        .patch(categoryId)
        .set({
          parentCategory: {
            _type: "reference",
            _ref: newParentCategoryId,
          }
        })
        .commit()
    } else {
      // Entferne Elternkategorie (mache zu Hauptkategorie)
      return await client
        .patch(categoryId)
        .unset(['parentCategory'])
        .commit()
    }
  } catch (error) {
    console.error("Fehler beim Verschieben der Kategorie:", error)
    throw error
  }
}

// Filtere Kunden nach mehreren Kategorien
export async function getCustomersByCategories(categoryIds, matchAll = false) {
  try {
    if (matchAll) {
      // Kunden müssen ALLE Kategorien haben
      return client.fetch(
        `*[_type == "userForm" && count((category[]._ref)[@ in $categoryIds]) == ${categoryIds.length}] | order(firstName asc) {
          _id,
          firstName,
          lastName,
          email,
          kundennummer,
          category[]-> {
            _id,
            name
          }
        }`,
        { categoryIds }
      )
    } else {
      // Kunden müssen MINDESTENS EINE Kategorie haben
      return client.fetch(
        `*[_type == "userForm" && count((category[]._ref)[@ in $categoryIds]) > 0] | order(firstName asc) {
          _id,
          firstName,
          lastName,
          email,
          kundennummer,
          category[]-> {
            _id,
            name
          }
        }`,
        { categoryIds }
      )
    }
  } catch (error) {
    console.error("Fehler beim Filtern der Kunden:", error)
    return []
  }
}