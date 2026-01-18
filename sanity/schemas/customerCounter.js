// sanity/schemas/customerCounter.js
export default {
  name: 'customerCounter',
  title: 'Kundennummer Zähler',
  type: 'document',
  fields: [
    {
      name: 'currentNumber',
      title: 'Aktuelle Nummer',
      type: 'number',
      validation: (Rule) => Rule.required().min(30400),
      initialValue: 30400,
    },
  ],
}