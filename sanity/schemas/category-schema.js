// SANITY SCHEMA FÜR KATEGORIEN MIT UNTERKATEGORIEN
// ===================================================

export default {
  name: "category",
  title: "Kategorie",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Beschreibung",
      type: "text",
    },
    {
      name: "parentCategory",
      title: "Übergeordnete Kategorie",
      type: "reference",
      to: [{ type: "category" }],
      description: "Leer lassen für Hauptkategorie, auswählen für Unterkategorie",
    },
    {
      name: "level",
      title: "Ebene",
      type: "number",
      readOnly: true,
      description: "Wird automatisch berechnet: 0 = Hauptkategorie, 1+ = Unterkategorie",
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      parentName: "parentCategory.name",
    },
    prepare(selection) {
      const { title, subtitle, parentName } = selection
      return {
        title: parentName ? `↳ ${title}` : title,
        subtitle: parentName ? `Unterkategorie von: ${parentName}` : subtitle || "Hauptkategorie",
      }
    },
  },
}