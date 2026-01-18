"use client"

import Image from "next/image"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import AppointmentButton from "./button"

export default function ServicesSection() {
  const [isOpen, setIsOpen] = useState(false)

  const additionalServices = [
    "Erstellung sämtlicher Steuererklärungen für Privatpersonen, Freiberufler und Unternehmer",
    "Finanzbuchhaltung und Lohnbuchhaltung",
    "Erbschaft- und Schenkungsteuer-Erklärungen",
    "Grenzüberschreitende Sachverhalte, die im Inland der Besteuerung unterliegen",
    "Nacherklärung von Einkünften",
    "Klassische betriebswirtschaftliche und steuerliche Unternehmensberatung",
    "Vertretung gegenüber dem Finanzamt, inkl.: Sämtlicher Anträge (Fristverlängerungen, Stundung, Anpassung von Vorauszahlungen etc.) Einspruchs- und Klageverfahren",
  ]

  const toggleCollapsible = () => {
    setIsOpen(!isOpen)
  }

  return (
    <section className="py-16 px-4 lg:px-8">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left side - Title */}
          <div>
            <h3 className="text-[#E3DAC9] text-lg mb-2">Unsere Leistungen</h3>
            <h2 className="text-white text-3xl lg:text-4xl font-light leading-tight">
              Wir stehen an Ihrer Seite -<br />
              Effizient & digital
            </h2>
          </div>

          {/* Right side - CTA */}
          <div className="flex flex-col justify-center lg:items-end">
            <p className="text-[#E4E4E4] mb-4 max-w-md">
              Vereinbaren Sie ein kostenloses Erstgespräch und entdecken Sie, wie wir Sie unterstützen können.
            </p>

            <AppointmentButton
              href="https://cal.meetergo.com/stb-am-rathaus/termin"
              className="w-full max-w-[300px] lg:-translate-x-[150px] -translate-x-[0px]"
            />
          </div>
        </div>

        {/* Services Grid - First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Service Card 1 */}
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/airbnb.png"
              alt="Vermietung und Verpachtung"
              width={400}
              height={600}
              className="w-full h-48 object-cover object-[center_90%]"
            />
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#E3DAC9] p-4">
              <h3 className="font-medium text-black mb-2">Vermietung und Verpachtung</h3>
              <p className="text-sm text-black opacity-[74%]">
                Langfristige Vermietung oder Kurzzeitvermietung (z.B. airbnb) - wir begleiten Sie auf Ihrem Weg.
              </p>
            </div>
          </div>

          {/* Service Card 2 */}
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/eur.jpg"
              alt="Einnahmenüberschussrechnung"
              width={400}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#E3DAC9] p-4">
              <h3 className="font-medium text-text-black mb-2">Einnahmenüberschussrechnung (EÜR)</h3>
              <p className="text-sm text-black opacity-[74%]">
                Vertrauen Sie auf unsere Expertise und erledigen Sie Ihre Steuererklärung stressfrei.
              </p>
            </div>
          </div>

          {/* Service Card 3 */}
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/handshake.jpg"
              alt="Kleinunternehmerregelung"
              width={400}
              height={300}
              className="w-full h-48 object-cover object-[center_90%]"
            />
            <div className="absolute inset-0 bg-black opacity-60 "></div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#E3DAC9] p-4">
              <h3 className="font-medium text-text-black mb-2">Kleinunternehmerregelung</h3>
              <p className="text-sm text-black opacity-[74%]">
                Wir kümmern uns um den perfekten Start für Ihr Kleinunternehmen – einfach und zuverlässig!
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid - Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Service Card 4 */}
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/handwerk.jpg"
              alt="Existenzgründerberatung"
              width={400}
              height={300}
              className="w-full h-48 object-cover object-[center_50%]"
            />
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#E3DAC9] p-4">
              <h3 className="font-medium text-black mb-2">Existenzgründerberatung</h3>
              <p className="text-sm text-black opacity-[74%]">
                Existenzgründung einfach gemacht - wir kümmern uns um Sie, insbesondere auch bei nebenberuflicher
                Selbstständigkeit.
              </p>
            </div>
          </div>

          {/* Service Card 5 */}
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/rentner2.jpg"
              alt="Steuererklärungen für Rentner"
              width={400}
              height={300}
              className="w-full h-48 object-cover object-[center_40%]"
            />
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#E3DAC9] p-4">
              <h3 className="font-medium text-black mb-2">Steuererklärungen für Rentner</h3>
              <p className="text-sm text-black opacity-[74%]">
               Steuererklärungen für Rentner einfach gemacht - <br />entspannt durch die Steuererklärung.
              </p>
            </div>
          </div>
        </div>

        {/* More Services Button with Collapsible Content */}
        <div className="w-full">
          <button
            onClick={toggleCollapsible}
            className="flex rounded-t-lg items-center justify-between bg-[#E3DAC9] text-black py-3 px-6 w-full hover:bg-[#d6cbb7] transition-colors"
          >
            <span className="font-medium">Weitere Leistungen</span>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {/* Collapsible content */}
          <div
            className={`bg-[#E3DAC9]/90 rounded-b-lg overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="divide-y divide-gray-300/50">
              {additionalServices.map((service, index) => (
                <div key={index} className="p-4 text-black hover:bg-[#d6cbb7] transition-colors">
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
