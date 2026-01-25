"use server"

import { 
  client, 
  generateUniqueKey, 
  generatePassword, 
  generateCustomerNumber,
  validateAndUpdateHighestCustomerNumber,
  isCustomerNumberTaken,
  parseFormText,
  // Kategorie-Funktionen
  getCategories,
  getMainCategories,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  assignCustomerToCategory,
  removeCustomerFromCategory,
  getCustomersByCategory,
  moveCategoryToParent,
  getCustomersByCategories
} from "./lib"
import { revalidatePath } from "next/cache"

// Authentication
export async function loginUser(email, password) {
  try {
    const query = `*[_type == "userForm" && email == $email][0]`
    const userData = await client.fetch(query, { email })

    if (userData && userData.password === password) {
      return { success: true, user: userData }
    } else {
      return { success: false, error: "Ungültige Anmeldeinformationen" }
    }
  } catch (error) {
    console.error("Login failed:", error)
    return { success: false, error: "Anmeldung fehlgeschlagen" }
  }
}

// Customer Management
export async function getCustomers() {
  try {
    return await client.fetch(`
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
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function createCustomer(formData) {
  try {
    const firstName = formData.get("firstName")
    const lastName = formData.get("lastName")
    const email = formData.get("email")
    const kundennummer = formData.get("kundennummer")

    const existingCustomer = await client.fetch(`*[_type == "userForm" && email == $email][0]`, {
      email,
    })

    if (existingCustomer) {
      throw new Error("Ein Kunde mit dieser E-Mail-Adresse existiert bereits")
    }

    let finalKundennummer
    if (kundennummer) {
      const isTaken = await isCustomerNumberTaken(kundennummer)
      if (isTaken) {
        throw new Error("Diese Kundennummer ist bereits vergeben")
      }
      finalKundennummer = await validateAndUpdateHighestCustomerNumber(kundennummer)
    } else {
      finalKundennummer = await generateCustomerNumber()
    }

    const newCustomer = {
      _type: "userForm",
      firstName,
      lastName,
      email,
      passwort: generatePassword(),
      kundennummer: finalKundennummer,
      isAdmin: false,
      assignedForms: [],
      ausgefuellteformulare: [],
      uploadedFiles: [],
      category: [],
    }

    const result = await client.create(newCustomer)
    revalidatePath("/admin")
    return { success: true, customer: result }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { success: false, error: error.message }
  }
}

export async function updateCustomer(customerId, formData) {
  try {
    const firstName = formData.get("firstName")
    const lastName = formData.get("lastName")
    const email = formData.get("email")
    const kundennummer = formData.get("kundennummer")

    const updateData = {
      firstName,
      lastName,
      email,
    }

    if (kundennummer) {
      const isTaken = await isCustomerNumberTaken(kundennummer, customerId)
      if (isTaken) {
        throw new Error("Diese Kundennummer ist bereits vergeben")
      }
      updateData.kundennummer = await validateAndUpdateHighestCustomerNumber(kundennummer)
    }

    const result = await client
      .patch(customerId)
      .set(updateData)
      .commit()

    revalidatePath("/admin")
    return { success: true, customer: result }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteCustomer(customerId) {
  try {
    await client.delete(customerId)
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { success: false, error: error.message }
  }
}

// Form Management
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

export async function assignFormTextToUser(userId, formText) {
  try {
    const result = await client
      .patch(userId)
      .setIfMissing({ assignedForms: [] })
      .append("assignedForms", [formText])
      .commit()

    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error assigning form:", error)
    return { success: false, error: error.message }
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

    if (!user?.assignedForms) return { success: false, error: "No forms found" }

    const updatedForms = user.assignedForms.filter((_, index) => index !== formIndex)

    const result = await client.patch(userId).set({ assignedForms: updatedForms }).commit()
    revalidatePath("/admin")
    revalidatePath("/customer")
    return { success: true, result }
  } catch (error) {
    console.error("Error removing form:", error)
    return { success: false, error: error.message }
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

// Notifications
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

export async function createNotification(data) {
  try {
    const result = await client.create({
      _type: "notification",
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      createdAt: new Date().toISOString(),
      relatedDocumentId: data.relatedDocumentId,
      relatedDocumentType: data.relatedDocumentType,
    })

    revalidatePath("/admin")
    return { success: true, notification: result }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: error.message }
  }
}

export async function markNotificationAsRead(id) {
  try {
    const result = await client.patch(id).set({ read: true }).commit()
    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: error.message }
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

    revalidatePath("/admin")
    return {
      success: true,
      message: `${unreadNotifications.length} Benachrichtigungen als gelesen markiert`,
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error: error.message }
  }
}

// Contact Inquiries
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

    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error updating inquiry status:", error)
    return { success: false, error: error.message }
  }
}

// Appointments
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
// KATEGORIE-ACTIONS MIT UNTERKATEGORIEN
// ============================================================

// Hole alle Kategorien
export async function getAllCategories() {
  try {
    const categories = await getCategories()
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

// Hole nur Hauptkategorien
export async function getMainCategoriesAction() {
  try {
    const mainCategories = await getMainCategories()
    return mainCategories
  } catch (error) {
    console.error("Error fetching main categories:", error)
    return []
  }
}

// Hole Unterkategorien für eine Kategorie
export async function getSubcategoriesAction(parentCategoryId) {
  try {
    const subcategories = await getSubcategories(parentCategoryId)
    return subcategories
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return []
  }
}

// Erstelle neue Kategorie (Haupt- oder Unterkategorie)
export async function createCategoryAction(name, description = "", parentCategoryId = null) {
  try {
    const newCategory = await createCategory(name, description, parentCategoryId)
    revalidatePath("/admin")
    return { success: true, category: newCategory }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: error.message }
  }
}

// Aktualisiere Kategorie
export async function updateCategoryAction(categoryId, data) {
  try {
    const updated = await updateCategory(categoryId, data)
    revalidatePath("/admin")
    return { success: true, category: updated }
  } catch (error) {
    console.error("Error updating category:", error)
    return { success: false, error: error.message }
  }
}

// Lösche Kategorie
export async function deleteCategoryAction(categoryId) {
  try {
    await deleteCategory(categoryId)
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: error.message }
  }
}

// Weise Kunde einer Kategorie zu
export async function assignCustomerToCategoryAction(customerId, categoryId) {
  try {
    const result = await assignCustomerToCategory(customerId, categoryId)
    
    if (result.alreadyAssigned) {
      return { success: false, error: "Kunde ist bereits dieser Kategorie zugeordnet" }
    }

    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error assigning category:", error)
    return { success: false, error: error.message }
  }
}

// Entferne Kunde aus Kategorie
export async function removeCustomerFromCategoryAction(customerId, categoryId) {
  try {
    const result = await removeCustomerFromCategory(customerId, categoryId)
    
    if (result.notAssigned) {
      return { success: false, error: "Kunde ist dieser Kategorie nicht zugeordnet" }
    }

    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error removing from category:", error)
    return { success: false, error: error.message }
  }
}

// Hole Kunden einer Kategorie
export async function getCustomersByCategoryAction(categoryId, includeSubcategories = false) {
  try {
    const customers = await getCustomersByCategory(categoryId, includeSubcategories)
    return customers
  } catch (error) {
    console.error("Error fetching customers by category:", error)
    return []
  }
}

// Verschiebe Kategorie
export async function moveCategoryAction(categoryId, newParentCategoryId) {
  try {
    await moveCategoryToParent(categoryId, newParentCategoryId)
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error moving category:", error)
    return { success: false, error: error.message }
  }
}

// Filtere Kunden nach mehreren Kategorien
export async function getCustomersByMultipleCategoriesAction(categoryIds, matchAll = false) {
  try {
    const customers = await getCustomersByCategories(categoryIds, matchAll)
    return customers
  } catch (error) {
    console.error("Error filtering customers:", error)
    return []
  }
}