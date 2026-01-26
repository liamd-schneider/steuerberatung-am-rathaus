// schemas/customerCounter.js
export const customerCounterSchema = {
  name: "customerCounter",
  title: "Customer Counter",
  type: "document",
  fields: [
    {
      name: "currentNumber",
      type: "number",
      title: "Current Customer Number",
      description: "Die nächste zu verwendende Kundennummer (automatisch inkrementiert)",
      validation: Rule => Rule.required().min(3400)
    }
  ],
  // Verhindere, dass mehrere Counter-Dokumente erstellt werden
  preview: {
    prepare() {
      return {
        title: "Customer Number Counter"
      }
    }
  }
}