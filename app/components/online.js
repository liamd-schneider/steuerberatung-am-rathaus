"use client"

import { useState } from "react"
import Image from "next/image"
import { Monitor, FileText, Clock, Shield, MessageCircle, Sparkles, AlertTriangle, X } from "lucide-react"
import AppointmentButton from "./button"

export default function OnlineSection() {
  const [showChat, setShowChat] = useState(false)

  const toggleChat = () => {
    setShowChat(!showChat)
  }

  return (
    <section className="py-16 px-4 lg:px-8">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h3 className="text-[#E3DAC9] text-lg mb-2">100% Digital</h3>
          <h2 className="text-white text-3xl lg:text-5xl font-light leading-tight mb-4">
            Ihre Steuerberatung –<br />
            vollständig online
          </h2>
          <p className="text-[#E4E4E4] max-w-2xl mx-auto text-lg">
            Kein Papierkram, keine langen Wartezeiten. Alles digital, effizient und unkompliziert –
            von überall aus zugänglich.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="bg-[rgba(227,218,201,0.1)] rounded-lg p-6 text-center hover:bg-[rgba(227,218,201,0.15)] transition-all">
            <div className="flex justify-center mb-4">
              <div className="bg-[#E3DAC9] rounded-full p-4">
                <Monitor className="h-8 w-8 text-black" />
              </div>
            </div>
            <h3 className="text-white text-xl font-medium mb-3">Persönliches Dashboard</h3>
            <p className="text-[#E4E4E4] text-sm">
              Ihr eigener Zugang mit allen wichtigen Dokumenten und Informationen – jederzeit verfügbar.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[rgba(227,218,201,0.1)] rounded-lg p-6 text-center hover:bg-[rgba(227,218,201,0.15)] transition-all">
            <div className="flex justify-center mb-4">
              <div className="bg-[#E3DAC9] rounded-full p-4">
                <FileText className="h-8 w-8 text-black" />
              </div>
            </div>
            <h3 className="text-white text-xl font-medium mb-3">Automatische Formulare</h3>
            <p className="text-[#E4E4E4] text-sm">
              Formulare werden Ihnen automatisch zugewiesen – ausfüllen, absenden, fertig. Kein Aufwand.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[rgba(227,218,201,0.1)] rounded-lg p-6 text-center hover:bg-[rgba(227,218,201,0.15)] transition-all">
            <div className="flex justify-center mb-4">
              <div className="bg-[#E3DAC9] rounded-full p-4">
                <Clock className="h-8 w-8 text-black" />
              </div>
            </div>
            <h3 className="text-white text-xl font-medium mb-3">Zeitersparnis</h3>
            <p className="text-[#E4E4E4] text-sm">
              Keine Termine vor Ort nötig. Sparen Sie Zeit und erledigen Sie alles bequem von zu Hause.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[rgba(227,218,201,0.1)] rounded-lg p-6 text-center hover:bg-[rgba(227,218,201,0.15)] transition-all">
            <div className="flex justify-center mb-4">
              <div className="bg-[#E3DAC9] rounded-full p-4">
                <Shield className="h-8 w-8 text-black" />
              </div>
            </div>
            <h3 className="text-white text-xl font-medium mb-3">100% Sicher</h3>
            <p className="text-[#E4E4E4] text-sm">
              Ihre Daten sind bei uns in besten Händen – verschlüsselt und DSGVO-konform geschützt.
            </p>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="bg-[#747171] rounded-lg p-8 lg:p-12 mb-8">
          <h3 className="text-white text-2xl lg:text-3xl font-light mb-8 text-center">
            So einfach funktioniert's
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#E3DAC9] rounded-full w-12 h-12 flex items-center justify-center text-black font-bold text-xl mb-4">
                1
              </div>
              <h4 className="text-white text-xl font-medium mb-2">Kostenloses Erstgespräch</h4>
              <p className="text-[#E4E4E4] text-sm">
                Buchen Sie online einen Termin und lernen Sie uns kennen – völlig unverbindlich.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-[#E3DAC9] rounded-full w-12 h-12 flex items-center justify-center text-black font-bold text-xl mb-4">
                2
              </div>
              <h4 className="text-white text-xl font-medium mb-2">Dashboard-Zugang</h4>
              <p className="text-[#E4E4E4] text-sm">
                Sie erhalten Zugang zu Ihrem persönlichen Kunden-Dashboard mit allen Funktionen.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-[#E3DAC9] rounded-full w-12 h-12 flex items-center justify-center text-black font-bold text-xl mb-4">
                3
              </div>
              <h4 className="text-white text-xl font-medium mb-2">Alles erledigt</h4>
              <p className="text-[#E4E4E4] text-sm">
                Wir kümmern uns um den Rest – digital, effizient und ohne Papierkram.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <p className="text-[#E4E4E4] mb-6 text-lg">
            Überzeugen Sie sich selbst von unserer digitalen Steuerberatung
          </p>
          <AppointmentButton
            href="https://cal.meetergo.com/stb-am-rathaus/termin"
            className="mx-auto w-full max-w-[350px]"
          />
          <p className="text-[#E3DAC9] text-sm mt-4">
            ✓ Kostenlos & unverbindlich ✓ Online via Google Meet 
          </p>
        </div>

        {/* AI Chatbot Section */}
        <div className="bg-gradient-to-r mt-[200px] from-[#E3DAC9]/10 to-[#E3DAC9]/5 rounded-lg p-8 lg:p-12 border border-[#E3DAC9]/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-[#E3DAC9]" />
                <h3 className="text-[#E3DAC9] text-lg">KI-Assistent</h3>
              </div>
              <h2 className="text-white text-2xl lg:text-3xl font-light mb-4">
                Schnelle Antworten auf Ihre Fragen
              </h2>
              <p className="text-[#E4E4E4] mb-6">
                Unser intelligenter Chatbot beantwortet Ihre grundlegenden Steuerfragen rund um die Uhr – 
                sofort, präzise und kostenlos.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-[#E3DAC9] rounded-full p-1 mt-1">
                    <MessageCircle className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">24/7 verfügbar</h4>
                    <p className="text-[#E4E4E4] text-sm">Antworten auf Ihre Fragen – wann immer Sie sie brauchen</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-[#E3DAC9] rounded-full p-1 mt-1">
                    <Sparkles className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">KI-gestützt</h4>
                    <p className="text-[#E4E4E4] text-sm">Basierend auf aktuellem Steuerrecht und Fachwissen</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-[#E3DAC9] rounded-full p-1 mt-1">
                    <Clock className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Sofortige Hilfe</h4>
                    <p className="text-[#E4E4E4] text-sm">Keine Wartezeiten – beginnen Sie direkt mit Ihrer Frage</p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-200 text-sm">
                    <strong>Hinweis:</strong> Der KI-Assistent dient der ersten Orientierung. Es können Fehlinformationen entstehen. 
                    Wir übernehmen keine Haftung für die Richtigkeit der Antworten. Für verbindliche Auskünfte kontaktieren Sie uns bitte direkt.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="bg-[#747171] rounded-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-[#E3DAC9] rounded-full p-6">
                  <MessageCircle className="h-12 w-12 text-black" />
                </div>
              </div>
              <h3 className="text-white text-xl font-medium mb-3">
                Haben Sie eine Frage?
              </h3>
              <p className="text-[#E4E4E4] text-sm mb-6">
                Unser KI-Chatbot hilft Ihnen bei grundlegenden Steuerfragen – schnell und unkompliziert.
              </p>
              <button 
                onClick={toggleChat}
                className="w-full bg-[#E3DAC9] text-black py-4 px-6 rounded-lg font-medium hover:bg-[#d6cbb7] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Chat starten
              </button>
              <p className="text-[#E4E4E4] text-xs mt-4">
                Für komplexe Anliegen empfehlen wir ein persönliches Gespräch
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
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
    </section>
  )
}